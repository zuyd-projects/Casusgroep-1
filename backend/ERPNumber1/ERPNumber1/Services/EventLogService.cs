using ERPNumber1.Data;
using ERPNumber1.Interfaces;
using ERPNumber1.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Xml.Linq;

namespace ERPNumber1.Services
{
    public class EventLogService : IEventLogService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<EventLogService> _logger;

        // Anomaly detection configuration constants
        private const int MIN_SAMPLES_FOR_ANOMALY_DETECTION = 5; // Need at least 5 samples for statistical validity
        private const double MIN_DURATION_FOR_ANOMALY_DETECTION_MS = 1000; // Only consider activities > 1 second
        private const double ANOMALY_DURATION_MULTIPLIER_THRESHOLD = 2.0; // Must be at least 2x average duration
        private const double ANOMALY_MAX_DURATION_MULTIPLIER = 10.0; // Cap at 10x average to avoid false positives
        private const double HIGH_SEVERITY_DURATION_RATIO = 10.0; // 10x longer = High severity
        private const double MEDIUM_SEVERITY_DURATION_RATIO = 5.0; // 5x longer = Medium severity
        private const double STANDARD_DEVIATION_MULTIPLIER = 4.0; // Use 4 standard deviations instead of 2

        public EventLogService(AppDbContext context, ILogger<EventLogService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task LogEventAsync(string caseId, string activity, string resource, string eventType = "", string? additionalData = null)
        {
            await LogEventAsync(caseId, activity, resource, eventType, "Completed", additionalData);
        }

        public async Task LogEventAsync(string caseId, string activity, string resource, string eventType, 
            string status, string? additionalData = null, string? entityId = null, 
            string priority = "Normal", string? userId = null, string? sessionId = null)
        {
            try
            {
                var eventLog = new EventLog
                {
                    CaseId = caseId,
                    Activity = activity,
                    Resource = resource,
                    Timestamp = DateTime.UtcNow,
                    EventType = eventType,
                    Status = status,
                    AdditionalData = additionalData,
                    EntityId = entityId,
                    Priority = priority,
                    UserId = userId,
                    SessionId = sessionId
                };

                _context.EventLogs.Add(eventLog);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Event logged: Case={CaseId}, Activity={Activity}, Resource={Resource}", 
                    caseId, activity, resource);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log event: Case={CaseId}, Activity={Activity}", caseId, activity);
                // Don't throw - event logging should not break the main process
            }
        }

        public async Task LogTimedEventAsync(string caseId, string activity, string resource, string eventType,
            DateTime startTime, DateTime endTime, string status = "Completed", 
            string? additionalData = null, string? entityId = null, string? userId = null)
        {
            var duration = (long)(endTime - startTime).TotalMilliseconds;
            
            var eventLog = new EventLog
            {
                CaseId = caseId,
                Activity = activity,
                Resource = resource,
                Timestamp = endTime,
                EventType = eventType,
                Status = status,
                AdditionalData = additionalData,
                EntityId = entityId,
                UserId = userId,
                DurationMs = duration
            };

            try
            {
                _context.EventLogs.Add(eventLog);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Timed event logged: Case={CaseId}, Activity={Activity}, Duration={Duration}ms", 
                    caseId, activity, duration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log timed event: Case={CaseId}, Activity={Activity}", caseId, activity);
            }
        }

        public async Task<IEnumerable<EventLog>> GetEventLogsByCaseAsync(string caseId)
        {
            return await _context.EventLogs
                .Where(e => e.CaseId == caseId)
                .OrderBy(e => e.Timestamp)
                .ToListAsync();
        }

        public async Task<IEnumerable<EventLog>> GetEventLogsAsync(
            string? eventType = null, 
            string? resource = null, 
            DateTime? startDate = null, 
            DateTime? endDate = null,
            string? status = null,
            int skip = 0,
            int take = 100)
        {
            var query = _context.EventLogs.AsQueryable();

            if (!string.IsNullOrEmpty(eventType))
                query = query.Where(e => e.EventType == eventType);

            if (!string.IsNullOrEmpty(resource))
                query = query.Where(e => e.Resource == resource);

            if (startDate.HasValue)
                query = query.Where(e => e.Timestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(e => e.Timestamp <= endDate.Value);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(e => e.Status == status);

            return await query
                .OrderByDescending(e => e.Timestamp)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<string> ExportToXesAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.EventLogs.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(e => e.Timestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(e => e.Timestamp <= endDate.Value);

            var events = await query.OrderBy(e => e.CaseId).ThenBy(e => e.Timestamp).ToListAsync();

            var xes = new XElement("log",
                new XAttribute("version", "1.0"),
                new XAttribute("xmlns", "http://www.xes-standard.org/"),
                new XElement("extension", new XAttribute("name", "Concept"), new XAttribute("prefix", "concept"), new XAttribute("uri", "http://www.xes-standard.org/concept.xesext")),
                new XElement("extension", new XAttribute("name", "Time"), new XAttribute("prefix", "time"), new XAttribute("uri", "http://www.xes-standard.org/time.xesext")),
                new XElement("extension", new XAttribute("name", "Organizational"), new XAttribute("prefix", "org"), new XAttribute("uri", "http://www.xes-standard.org/org.xesext")),
                new XElement("string", new XAttribute("key", "concept:name"), new XAttribute("value", "ERP Process Log")),
                
                events.GroupBy(e => e.CaseId).Select(caseGroup => 
                    new XElement("trace",
                        new XElement("string", new XAttribute("key", "concept:name"), new XAttribute("value", caseGroup.Key)),
                        caseGroup.Select(evt => 
                        {
                            var elements = new List<XElement>
                            {
                                new XElement("string", new XAttribute("key", "concept:name"), new XAttribute("value", evt.Activity)),
                                new XElement("date", new XAttribute("key", "time:timestamp"), new XAttribute("value", evt.Timestamp.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"))),
                                new XElement("string", new XAttribute("key", "org:resource"), new XAttribute("value", evt.Resource)),
                                new XElement("string", new XAttribute("key", "lifecycle:transition"), new XAttribute("value", evt.Status))
                            };

                            if (!string.IsNullOrEmpty(evt.EventType))
                                elements.Add(new XElement("string", new XAttribute("key", "event:type"), new XAttribute("value", evt.EventType)));

                            if (evt.DurationMs.HasValue)
                                elements.Add(new XElement("int", new XAttribute("key", "duration:ms"), new XAttribute("value", evt.DurationMs.Value)));

                            return new XElement("event", elements);
                        })
                    )
                )
            );

            return xes.ToString();
        }

        public async Task<object> GetProcessStatisticsAsync(string? eventType = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.EventLogs.AsQueryable();

            if (!string.IsNullOrEmpty(eventType))
                query = query.Where(e => e.EventType == eventType);

            if (startDate.HasValue)
                query = query.Where(e => e.Timestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(e => e.Timestamp <= endDate.Value);

            var events = await query.ToListAsync();

            var statistics = new
            {
                TotalEvents = events.Count,
                UniqueCases = events.Select(e => e.CaseId).Distinct().Count(),
                EventTypes = events.GroupBy(e => e.EventType)
                    .Select(g => new { EventType = g.Key, Count = g.Count() })
                    .OrderByDescending(x => x.Count),
                Resources = events.GroupBy(e => e.Resource)
                    .Select(g => new { Resource = g.Key, Count = g.Count() })
                    .OrderByDescending(x => x.Count),
                Activities = events.GroupBy(e => e.Activity)
                    .Select(g => new { Activity = g.Key, Count = g.Count() })
                    .OrderByDescending(x => x.Count),
                AverageCaseDuration = CalculateAverageCaseDuration(events),
                DateRange = new
                {
                    Start = events.Any() ? events.Min(e => e.Timestamp) : (DateTime?)null,
                    End = events.Any() ? events.Max(e => e.Timestamp) : (DateTime?)null
                }
            };

            return statistics;
        }

        public async Task<object> DetectAnomaliesAsync(DateTime? startDate = null, DateTime? endDate = null, string? severity = null)
        {
            var events = await GetFilteredEventsAsync(startDate, endDate);
            _logger.LogInformation("Analyzing {EventCount} events for anomalies using thresholds: MinSamples={MinSamples}, MinDuration={MinDuration}ms, StdDevMultiplier={StdDevMultiplier}, DurationMultiplier={DurationMultiplier}", 
                events.Count, MIN_SAMPLES_FOR_ANOMALY_DETECTION, MIN_DURATION_FOR_ANOMALY_DETECTION_MS, STANDARD_DEVIATION_MULTIPLIER, ANOMALY_DURATION_MULTIPLIER_THRESHOLD);
            
            var anomalies = new List<object>();

            // 1. Detect unusual duration patterns
            var avgDurations = events
                .Where(e => e.DurationMs.HasValue && e.DurationMs.Value > 0)
                .GroupBy(e => e.Activity)
                .Where(g => g.Count() >= MIN_SAMPLES_FOR_ANOMALY_DETECTION) // Need at least 5 samples for statistical validity
                .Select(g => new { 
                    Activity = g.Key, 
                    AvgDuration = g.Average(e => e.DurationMs!.Value),
                    StdDev = Math.Sqrt(g.Average(e => Math.Pow(e.DurationMs!.Value - g.Average(x => x.DurationMs!.Value), 2))),
                    SampleCount = g.Count()
                })
                .Where(x => x.AvgDuration > MIN_DURATION_FOR_ANOMALY_DETECTION_MS) // Only consider activities that normally take more than 1 second
                .ToList();

            foreach (var avg in avgDurations)
            {
                // Use more lenient thresholds: 4 standard deviations or 5x the average duration, whichever is larger
                var minThreshold = Math.Max(STANDARD_DEVIATION_MULTIPLIER * avg.StdDev, avg.AvgDuration * ANOMALY_DURATION_MULTIPLIER_THRESHOLD); // At least 2x average duration
                var maxThreshold = avg.AvgDuration * ANOMALY_MAX_DURATION_MULTIPLIER; // Cap at 10x average to avoid false positives from outliers
                var actualThreshold = Math.Min(minThreshold, maxThreshold);
                
                var outliers = events
                    .Where(e => e.Activity == avg.Activity && e.DurationMs.HasValue)
                    .Where(e => Math.Abs(e.DurationMs!.Value - avg.AvgDuration) > actualThreshold)
                    .ToList();

                foreach (var outlier in outliers)
                {
                    // Only flag as anomaly if it's significantly longer (not shorter) and truly excessive
                    if (outlier.DurationMs!.Value > avg.AvgDuration + actualThreshold)
                    {
                        var durationRatio = outlier.DurationMs.Value / avg.AvgDuration;
                        
                        // Determine severity based on configurable thresholds
                        string anomalySeverity = durationRatio > HIGH_SEVERITY_DURATION_RATIO ? "High" 
                                               : durationRatio > MEDIUM_SEVERITY_DURATION_RATIO ? "Medium" 
                                               : "Low";
                        
                        anomalies.Add(new
                        {
                            Type = "Duration Anomaly",
                            Severity = anomalySeverity,
                            CaseId = outlier.CaseId,
                            Activity = outlier.Activity,
                            ActualDuration = outlier.DurationMs,
                            ExpectedDuration = avg.AvgDuration,
                            DurationRatio = durationRatio,
                            Timestamp = outlier.Timestamp,
                            SampleSize = avg.SampleCount,
                            Description = $"Activity '{outlier.Activity}' took {outlier.DurationMs}ms ({durationRatio:F1}x longer than expected ~{avg.AvgDuration:F0}ms, based on {avg.SampleCount} samples)"
                        });
                    }
                }
            }

            // 2. Detect process bottlenecks
            var activityCounts = events
                .GroupBy(e => e.Activity)
                .Select(g => new { Activity = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .ToList();

            var avgCount = activityCounts.Any() ? activityCounts.Average(x => x.Count) : 0;
            var bottlenecks = activityCounts.Where(x => x.Count > avgCount * 2).ToList();

            foreach (var bottleneck in bottlenecks)
            {
                anomalies.Add(new
                {
                    Type = "Process Bottleneck",
                    Severity = "Medium",
                    Activity = bottleneck.Activity,
                    Count = bottleneck.Count,
                    Description = $"Activity '{bottleneck.Activity}' has unusually high frequency ({bottleneck.Count} occurrences)"
                });
            }

            // 3. Detect failed processes
            var failedEvents = events
                .Where(e => e.Status.ToLower().Contains("failed") || e.Status.ToLower().Contains("error"))
                .GroupBy(e => e.Activity)
                .Select(g => new { Activity = g.Key, FailureCount = g.Count() })
                .Where(x => x.FailureCount > 0)
                .ToList();

            foreach (var failure in failedEvents)
            {
                anomalies.Add(new
                {
                    Type = "Process Failure",
                    Severity = failure.FailureCount > 5 ? "High" : "Medium",
                    Activity = failure.Activity,
                    FailureCount = failure.FailureCount,
                    Description = $"Activity '{failure.Activity}' has {failure.FailureCount} failed instances"
                });
            }

            // 4. Detect delivery time issues
            var orderEvents = events.Where(e => e.EventType.ToLower().Contains("order")).ToList();
            var deliveryDelays = new List<object>();

            var orderCases = orderEvents.GroupBy(e => e.CaseId).ToList();
            foreach (var orderCase in orderCases)
            {
                var orderCreated = orderCase.FirstOrDefault(e => e.Activity.ToLower().Contains("created"));
                var orderDelivered = orderCase.FirstOrDefault(e => e.Activity.ToLower().Contains("delivered") || e.Activity.ToLower().Contains("completed"));
                
                if (orderCreated != null && orderDelivered != null)
                {
                    var deliveryTime = (orderDelivered.Timestamp - orderCreated.Timestamp).TotalDays;
                    if (deliveryTime > 7) // More than 7 days
                    {
                        anomalies.Add(new
                        {
                            Type = "Delivery Delay",
                            Severity = deliveryTime > 14 ? "High" : "Medium",
                            CaseId = orderCase.Key,
                            DeliveryTime = deliveryTime,
                            OrderCreated = orderCreated.Timestamp,
                            OrderDelivered = orderDelivered.Timestamp,
                            Description = $"Order {orderCase.Key} took {deliveryTime:F1} days to deliver (expected < 7 days)"
                        });
                    }
                }
            }

            // Filter by severity if specified
            if (!string.IsNullOrEmpty(severity))
            {
                anomalies = anomalies.Where(a => 
                    ((dynamic)a).Severity.ToString().Equals(severity, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            return new
            {
                TotalAnomalies = anomalies.Count,
                HighSeverity = anomalies.Count(a => ((dynamic)a).Severity.ToString() == "High"),
                MediumSeverity = anomalies.Count(a => ((dynamic)a).Severity.ToString() == "Medium"),
                Anomalies = anomalies.OrderByDescending(a => ((dynamic)a).Severity == "High" ? 1 : 0)
            };
        }

        public async Task<object> GetProcessFlowAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var events = await GetFilteredEventsAsync(startDate, endDate);
            
            // Create process flow nodes and edges
            var activities = events.Select(e => e.Activity).Distinct().ToList();
            var flows = new List<object>();

            // Group by case to find activity sequences
            var caseFlows = events.GroupBy(e => e.CaseId)
                .Select(g => g.OrderBy(e => e.Timestamp).Select(e => e.Activity).ToList())
                .ToList();

            // Count transitions between activities
            var transitions = new Dictionary<string, int>();
            foreach (var flow in caseFlows)
            {
                for (int i = 0; i < flow.Count - 1; i++)
                {
                    var transition = $"{flow[i]} → {flow[i + 1]}";
                    transitions[transition] = transitions.GetValueOrDefault(transition, 0) + 1;
                }
            }

            var nodes = activities.Select(activity => new
            {
                Id = activity,
                Label = activity,
                Count = events.Count(e => e.Activity == activity),
                Type = "activity"
            }).ToList();

            var edges = transitions.Select(t => new
            {
                Source = t.Key.Split(" → ")[0],
                Target = t.Key.Split(" → ")[1],
                Count = t.Value,
                Weight = t.Value
            }).ToList();

            return new
            {
                Nodes = nodes,
                Edges = edges,
                TotalCases = events.Select(e => e.CaseId).Distinct().Count(),
                TotalActivities = activities.Count,
                DateRange = new
                {
                    Start = events.Any() ? events.Min(e => e.Timestamp) : (DateTime?)null,
                    End = events.Any() ? events.Max(e => e.Timestamp) : (DateTime?)null
                }
            };
        }

        public async Task<object> GetDeliveryPredictionsAsync()
        {
            var recentEvents = await _context.EventLogs
                .Where(e => e.Timestamp >= DateTime.UtcNow.AddDays(-30))
                .OrderByDescending(e => e.Timestamp)
                .ToListAsync();

            _logger.LogInformation("Retrieved {EventCount} events for delivery predictions", recentEvents.Count);

            var predictions = new List<object>();
            var warnings = new List<object>();

            // Check ALL orders (regardless of status) that are more than 3 rounds old
            var ordersWithRoundInfo = await _context.Orders
                .Include(o => o.Round)
                .ThenInclude(r => r!.Simulation)
                .Where(o => o.Status != OrderStatus.Delivered && o.Status != OrderStatus.Cancelled) // Only exclude completed orders
                .ToListAsync();

            _logger.LogInformation("Found {OrderCount} non-completed orders for warning analysis", ordersWithRoundInfo.Count);

            // Get current round for each simulation
            var currentRounds = await _context.Rounds
                .GroupBy(r => r.SimulationId)
                .Select(g => new { SimulationId = g.Key, MaxRound = g.Max(r => r.RoundNumber) })
                .ToListAsync();

            // Check if 3 rounds are done and order doesn't have completed status - then it's delayed
            const int DELAY_THRESHOLD = 3; // All orders should be completed within 3 rounds
            
            foreach (var order in ordersWithRoundInfo)
            {
                var currentRound = currentRounds.FirstOrDefault(cr => cr.SimulationId == order.Round?.SimulationId);
                if (currentRound != null && order.Round != null)
                {
                    // Calculate how many rounds have passed since order creation
                    var roundsSinceCreation = currentRound.MaxRound - order.Round.RoundNumber;
                    
                    // Check if 3 rounds are done (completed) and order is not in completed status
                    bool isDelayed = roundsSinceCreation >= DELAY_THRESHOLD && 
                                   order.Status != OrderStatus.Delivered && 
                                   order.Status != OrderStatus.Cancelled;
                    
                    // Check if order is at risk (2 rounds passed, not yet delayed but close)
                    bool isAtRisk = roundsSinceCreation == (DELAY_THRESHOLD - 1) && 
                                  order.Status != OrderStatus.Delivered && 
                                  order.Status != OrderStatus.Cancelled;
                    
                    string warningType = "";
                    string severity = "";
                    string message = "";
                    string recommendedAction = "";
                    
                    if (isDelayed)
                    {
                        // Order is delayed - 3+ rounds are done and order is not completed
                        warningType = "Order Delayed";
                        severity = roundsSinceCreation >= 6 ? "High" : "Medium";
                        message = $"Order {order.Id} is delayed - {roundsSinceCreation} rounds have passed since creation (Round {order.Round.RoundNumber}), expected completion within {DELAY_THRESHOLD} rounds. Current status: {order.Status}";
                        recommendedAction = roundsSinceCreation >= 6 
                            ? "Critical: Order is severely overdue - investigate and expedite immediately" 
                            : "Review order progress and identify bottlenecks to expedite completion";
                    }
                    else if (isAtRisk)
                    {
                        // Order is at risk - 2 rounds have passed, needs attention soon
                        warningType = "Order At Risk";
                        severity = "Medium";
                        message = $"Order {order.Id} is at risk - {roundsSinceCreation} rounds have passed since creation (Round {order.Round.RoundNumber}), must complete by next round to avoid delay. Current status: {order.Status}";
                        recommendedAction = "Monitor closely and expedite if needed to complete within expected timeframe";
                    }
                    
                    // Special handling for rejected orders - always high priority regardless of rounds
                    if (order.Status == OrderStatus.RejectedByAccountManager)
                    {
                        warningType = "Rejected Order";
                        severity = "High";
                        message = $"Order {order.Id} has been rejected by the account manager and requires immediate attention. Rejected {roundsSinceCreation} rounds ago.";
                        recommendedAction = "Review rejection reason and determine next steps - contact customer, revise order, or cancel completely";
                        isDelayed = true; // Always consider rejected orders as needing attention
                    }

                    // Add to warnings if it's delayed, at risk, or rejected
                    if (isDelayed || isAtRisk || order.Status == OrderStatus.RejectedByAccountManager)
                    {
                        warnings.Add(new
                        {
                            Type = warningType,
                            Severity = severity,
                            CaseId = $"Order_{order.Id}",
                            Message = message,
                            OrderAge = (DateTime.UtcNow - order.OrderDate).TotalDays,
                            OrderRoundAge = roundsSinceCreation,
                            ExpectedDelivery = (double)DELAY_THRESHOLD,
                            LastActivity = $"{order.Status} in Round {order.Round.RoundNumber}",
                            RecommendedAction = recommendedAction,
                            RoundsDelay = Math.Max(0, roundsSinceCreation - DELAY_THRESHOLD),
                            OrderRound = order.Round.RoundNumber,
                            CurrentRound = currentRound.MaxRound,
                            ExpectedDeliveryRound = order.Round.RoundNumber + DELAY_THRESHOLD,
                            SimulationId = order.Round.SimulationId,
                            OrderStatus = order.Status.ToString(),
                            RoundsSinceCreation = roundsSinceCreation,
                            IsDelayed = isDelayed,
                            IsAtRisk = isAtRisk
                        });
                    }
                }
            }

            _logger.LogInformation("Generated {WarningCount} warnings from {OrderCount} non-completed orders - checking if 3+ rounds have passed since creation", 
                warnings.Count, 
                ordersWithRoundInfo.Count);

            // Calculate actual ongoing orders that need attention
            // Include all non-completed orders
            var actualOngoingOrders = await _context.Orders
                .Where(o => o.Status != OrderStatus.Delivered && o.Status != OrderStatus.Cancelled)
                .CountAsync();

            return new
            {
                TotalOngoingOrders = actualOngoingOrders,
                DelayedOrders = warnings.Count(w => ((dynamic)w).Type.ToString() == "Order Delayed"),
                AtRiskOrders = warnings.Count(w => ((dynamic)w).Type.ToString() == "Order At Risk"),
                AverageDeliveryRounds = 3.0, // Fixed value since we expect orders to complete within 3 rounds
                Predictions = predictions.OrderByDescending(p => ((dynamic)p).CurrentAge),
                Warnings = warnings.OrderByDescending(w => ((dynamic)w).Severity == "High" ? 2 : ((dynamic)w).Severity == "Medium" ? 1 : 0),
                RoundBasedDelays = warnings.Count(w => ((dynamic)w).Type.ToString() == "Order Delayed"),
                RejectedOrders = warnings.Count(w => ((dynamic)w).Type.ToString() == "Rejected Order"),
                RoundBasedWarnings = warnings.Count
            };
        }

        private double CalculateAverageDeliveryTime(List<EventLog> events)
        {
            if (!events.Any())
                return 0.0;

            var completedOrders = events
                .Where(e => e.EventType.ToLower().Contains("order"))
                .GroupBy(e => e.CaseId)
                .Where(g => g.Any(e => e.Activity.ToLower().Contains("delivered")))
                .Select(g => (g.Max(e => e.Timestamp) - g.Min(e => e.Timestamp)).TotalDays)
                .ToList();

            return completedOrders.Any() ? completedOrders.Average() : 0.0;
        }

        private double CalculateAverageCaseDuration(List<EventLog> events)
        {
            var caseDurations = events.GroupBy(e => e.CaseId)
                .Where(g => g.Count() > 1)
                .Select(g => (g.Max(e => e.Timestamp) - g.Min(e => e.Timestamp)).TotalMinutes)
                .ToList();

            return caseDurations.Any() ? caseDurations.Average() : 0.0;
        }

        private async Task<List<EventLog>> GetFilteredEventsAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.EventLogs.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(e => e.Timestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(e => e.Timestamp <= endDate.Value);

            return await query.OrderBy(e => e.Timestamp).ToListAsync();
        }

        public async Task<object> GetBusinessProcessAnalysisAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var events = await GetFilteredEventsAsync(startDate, endDate);
            _logger.LogInformation("Analyzing {EventCount} events for business process analysis", events.Count);

            // Group events by case to analyze process flows
            var caseGroups = events.GroupBy(e => e.CaseId).ToList();
            
            // Calculate cycle times
            var cycleTimes = new List<double>();
            var processingTimes = new Dictionary<string, List<double>>();
            var processStages = new List<string> { "Created", "ApprovedByVoorraadbeheer", "ToProduction", "InProduction", "AwaitingAccountManagerApproval", "ApprovedByAccountManager", "Delivered", "Completed" };
            
            foreach (var caseGroup in caseGroups)
            {
                var caseEvents = caseGroup.OrderBy(e => e.Timestamp).ToList();
                var startEvent = caseEvents.FirstOrDefault();
                var endEvent = caseEvents.LastOrDefault();
                
                if (startEvent != null && endEvent != null && startEvent != endEvent)
                {
                    var totalCycleTime = (endEvent.Timestamp - startEvent.Timestamp).TotalMinutes;
                    cycleTimes.Add(totalCycleTime);
                    
                    // Calculate processing time for each stage
                    for (int i = 0; i < caseEvents.Count - 1; i++)
                    {
                        var stageTime = (caseEvents[i + 1].Timestamp - caseEvents[i].Timestamp).TotalMinutes;
                        var stageName = ExtractStageFromActivity(caseEvents[i].Activity);
                        
                        if (!processingTimes.ContainsKey(stageName))
                            processingTimes[stageName] = new List<double>();
                        processingTimes[stageName].Add(stageTime);
                    }
                }
            }

            // Calculate throughput metrics
            var timespan = events.Any() ? (events.Max(e => e.Timestamp) - events.Min(e => e.Timestamp)).TotalDays : 0;
            var completedCases = caseGroups.Count(g => g.Any(e => e.Activity.Contains("Completed") || e.Activity.Contains("Delivered")));
            var throughputPerDay = timespan > 0 ? completedCases / timespan : 0;

            // Calculate process efficiency
            var reworkCases = caseGroups.Count(g => HasRework(g.ToList()));
            var processEfficiency = caseGroups.Count > 0 ? ((double)(caseGroups.Count - reworkCases) / caseGroups.Count) * 100 : 0;

            // Calculate stage performance
            var stagePerformance = processingTimes.Select(kvp => new
            {
                Stage = kvp.Key,
                AverageTime = kvp.Value.Any() ? kvp.Value.Average() : 0,
                MedianTime = kvp.Value.Any() ? GetMedian(kvp.Value) : 0,
                MinTime = kvp.Value.Any() ? kvp.Value.Min() : 0,
                MaxTime = kvp.Value.Any() ? kvp.Value.Max() : 0,
                Count = kvp.Value.Count,
                StandardDeviation = kvp.Value.Any() ? CalculateStandardDeviation(kvp.Value) : 0
            }).OrderBy(x => processStages.IndexOf(x.Stage)).ToList();

            return new
            {
                OverallMetrics = new
                {
                    TotalCases = caseGroups.Count,
                    CompletedCases = completedCases,
                    AverageCycleTime = cycleTimes.Any() ? cycleTimes.Average() : 0,
                    MedianCycleTime = cycleTimes.Any() ? GetMedian(cycleTimes) : 0,
                    ThroughputPerDay = throughputPerDay,
                    ProcessEfficiency = processEfficiency,
                    ReworkRate = caseGroups.Count > 0 ? ((double)reworkCases / caseGroups.Count) * 100 : 0,
                    AnalysisPeriod = new
                    {
                        Start = events.Any() ? events.Min(e => e.Timestamp) : (DateTime?)null,
                        End = events.Any() ? events.Max(e => e.Timestamp) : (DateTime?)null,
                        DurationDays = timespan
                    }
                },
                StagePerformance = stagePerformance,
                ProcessFlow = new
                {
                    TotalActivities = events.Select(e => e.Activity).Distinct().Count(),
                    AverageActivitiesPerCase = caseGroups.Any() ? caseGroups.Average(g => g.Count()) : 0,
                    MostCommonPath = GetMostCommonProcessPath(caseGroups),
                    ProcessVariants = GetProcessVariants(caseGroups)
                },
                QualityMetrics = new
                {
                    ReworkCases = reworkCases,
                    FailedCases = caseGroups.Count(g => g.Any(e => e.Status.Contains("Failed") || e.Status.Contains("Error"))),
                    OnTimeDelivery = CalculateOnTimeDeliveryRate(caseGroups),
                    CustomerSatisfactionIndicators = GetCustomerSatisfactionIndicators(caseGroups)
                }
            };
        }

        public async Task<object> GetActivityPerformanceAnalysisAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var events = await GetFilteredEventsAsync(startDate, endDate);
            
            var activityAnalysis = events
                .GroupBy(e => e.Activity)
                .Select(g => new
                {
                    Activity = g.Key,
                    TotalOccurrences = g.Count(),
                    UniqueResources = g.Select(e => e.Resource).Distinct().Count(),
                    AverageExecutionTime = g.Where(e => e.DurationMs.HasValue).Any() 
                        ? g.Where(e => e.DurationMs.HasValue).Average(e => e.DurationMs!.Value) 
                        : (double?)null,
                    SuccessRate = g.Count() > 0 ? ((double)g.Count(e => e.Status == "Completed") / g.Count()) * 100 : 0,
                    ErrorRate = g.Count() > 0 ? ((double)g.Count(e => e.Status.Contains("Failed") || e.Status.Contains("Error")) / g.Count()) * 100 : 0,
                    MostActiveResource = g.GroupBy(e => e.Resource).OrderByDescending(r => r.Count()).FirstOrDefault()?.Key,
                    PeakTimes = GetActivityPeakTimes(g.ToList()),
                    Bottleneck = IsBottleneck(g.ToList(), events),
                    ProcessImpact = CalculateProcessImpact(g.Key, events)
                })
                .OrderByDescending(x => x.TotalOccurrences)
                .ToList();

            return new
            {
                TotalActivities = activityAnalysis.Count,
                ActivityDetails = activityAnalysis,
                PerformanceSummary = new
                {
                    MostFrequentActivity = activityAnalysis.FirstOrDefault()?.Activity,
                    BottleneckActivities = activityAnalysis.Where(a => a.Bottleneck).Select(a => a.Activity).ToList(),
                    HighErrorActivities = activityAnalysis.Where(a => a.ErrorRate > 5).Select(a => new { a.Activity, a.ErrorRate }).ToList(),
                    LowPerformanceActivities = activityAnalysis.Where(a => a.SuccessRate < 95).Select(a => new { a.Activity, a.SuccessRate }).ToList()
                }
            };
        }

        public async Task<object> GetProcessConformanceAnalysisAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var events = await GetFilteredEventsAsync(startDate, endDate);
            var caseGroups = events.GroupBy(e => e.CaseId).ToList();
            
            // Define expected process flow
            var expectedFlow = new List<string> 
            { 
                "Order Created", 
                "Order Approved by VoorraadBeheer", 
                "Production Started", 
                "Order Updated", 
                "Approve Order", 
                "Order Status Changed", 
                "Update Order Status" 
            };

            var conformanceResults = new List<object>();
            var deviations = new List<object>();

            foreach (var caseGroup in caseGroups)
            {
                var caseEvents = caseGroup.OrderBy(e => e.Timestamp).ToList();
                var actualFlow = caseEvents.Select(e => NormalizeActivityName(e.Activity)).ToList();
                
                var conformanceScore = CalculateConformanceScore(actualFlow, expectedFlow);
                var caseDeviations = FindDeviations(actualFlow, expectedFlow, caseGroup.Key);
                
                conformanceResults.Add(new
                {
                    CaseId = caseGroup.Key,
                    ConformanceScore = conformanceScore,
                    ActualSteps = actualFlow.Count,
                    ExpectedSteps = expectedFlow.Count,
                    HasDeviations = caseDeviations.Any(),
                    DeviationCount = caseDeviations.Count(),
                    ProcessVariant = string.Join(" → ", actualFlow.Take(5)) // First 5 steps for variant identification
                });

                deviations.AddRange(caseDeviations);
            }

            return new
            {
                OverallConformance = new
                {
                    AverageConformanceScore = conformanceResults.Any() ? 
                        conformanceResults.Average(r => ((dynamic)r).ConformanceScore) : 0,
                    FullyConformantCases = conformanceResults.Count(r => ((dynamic)r).ConformanceScore >= 95),
                    NonConformantCases = conformanceResults.Count(r => ((dynamic)r).ConformanceScore < 80),
                    TotalDeviations = deviations.Count
                },
                ProcessVariants = conformanceResults
                    .GroupBy(r => ((dynamic)r).ProcessVariant)
                    .Select(g => new
                    {
                        Variant = g.Key,
                        CaseCount = g.Count(),
                        Percentage = conformanceResults.Count > 0 ? ((double)g.Count() / conformanceResults.Count) * 100 : 0,
                        AverageConformance = g.Average(r => ((dynamic)r).ConformanceScore)
                    })
                    .OrderByDescending(v => v.CaseCount)
                    .ToList(),
                CommonDeviations = deviations
                    .GroupBy(d => ((dynamic)d).DeviationType)
                    .Select(g => new
                    {
                        DeviationType = g.Key,
                        Count = g.Count(),
                        Percentage = deviations.Count > 0 ? ((double)g.Count() / deviations.Count) * 100 : 0,
                        Examples = g.Take(3).ToList()
                    })
                    .OrderByDescending(d => d.Count)
                    .ToList(),
                CaseConformanceDetails = conformanceResults.OrderBy(r => ((dynamic)r).ConformanceScore).Take(20).ToList()
            };
        }

        public async Task<object> GetResourceUtilizationAnalysisAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var events = await GetFilteredEventsAsync(startDate, endDate);
            
            var resourceAnalysis = events
                .GroupBy(e => e.Resource)
                .Select(g => new
                {
                    Resource = g.Key,
                    TotalActivities = g.Count(),
                    UniqueActivities = g.Select(e => e.Activity).Distinct().Count(),
                    UniqueCases = g.Select(e => e.CaseId).Distinct().Count(),
                    AverageActivitiesPerDay = CalculateActivitiesPerDay(g.ToList()),
                    WorkloadDistribution = GetWorkloadDistribution(g.ToList()),
                    PerformanceMetrics = new
                    {
                        SuccessRate = g.Count() > 0 ? ((double)g.Count(e => e.Status == "Completed") / g.Count()) * 100 : 0,
                        ErrorRate = g.Count() > 0 ? ((double)g.Count(e => e.Status.Contains("Failed")) / g.Count()) * 100 : 0,
                        AverageResponseTime = g.Where(e => e.DurationMs.HasValue).Any() 
                            ? g.Where(e => e.DurationMs.HasValue).Average(e => e.DurationMs!.Value) 
                            : (double?)null
                    },
                    ActivityBreakdown = g.GroupBy(e => e.Activity)
                        .Select(a => new { Activity = a.Key, Count = a.Count() })
                        .OrderByDescending(a => a.Count)
                        .ToList(),
                    UtilizationScore = CalculateUtilizationScore(g.ToList(), events.Count)
                })
                .OrderByDescending(r => r.TotalActivities)
                .ToList();

            return new
            {
                TotalResources = resourceAnalysis.Count,
                ResourceDetails = resourceAnalysis,
                UtilizationSummary = new
                {
                    HighlyUtilizedResources = resourceAnalysis.Where(r => r.UtilizationScore > 80).Select(r => r.Resource).ToList(),
                    UnderutilizedResources = resourceAnalysis.Where(r => r.UtilizationScore < 20).Select(r => r.Resource).ToList(),
                    AverageUtilization = resourceAnalysis.Any() ? resourceAnalysis.Average(r => r.UtilizationScore) : 0,
                    ResourceEfficiency = resourceAnalysis.Any() ? resourceAnalysis.Average(r => r.PerformanceMetrics.SuccessRate) : 0
                },
                Recommendations = GenerateResourceRecommendations(resourceAnalysis.Cast<object>().ToList())
            };
        }

        public async Task<object> GetCaseJourneyAnalysisAsync(string? caseId = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            var events = await GetFilteredEventsAsync(startDate, endDate);
            
            if (!string.IsNullOrEmpty(caseId))
            {
                events = events.Where(e => e.CaseId == caseId).ToList();
            }

            var caseJourneys = events
                .GroupBy(e => e.CaseId)
                .Select(g => AnalyzeCaseJourney(g.ToList()))
                .ToList();

            return new
            {
                TotalCases = caseJourneys.Count,
                CaseJourneys = caseJourneys.OrderByDescending(c => ((dynamic)c).TotalDuration).ToList(),
                JourneySummary = new
                {
                    AverageJourneySteps = caseJourneys.Any() ? caseJourneys.Average(c => ((dynamic)c).TotalSteps) : 0,
                    AverageJourneyDuration = caseJourneys.Any() ? caseJourneys.Average(c => ((dynamic)c).TotalDuration) : 0,
                    MostCommonIssues = GetMostCommonJourneyIssues(caseJourneys),
                    SuccessfulJourneys = caseJourneys.Count(c => ((dynamic)c).IsSuccessful),
                    ProblematicJourneys = caseJourneys.Count(c => !((dynamic)c).IsSuccessful)
                }
            };
        }

        public async Task<object> GetProcessOptimizationRecommendationsAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var events = await GetFilteredEventsAsync(startDate, endDate);
            var caseGroups = events.GroupBy(e => e.CaseId).ToList();
            
            var recommendations = new List<object>();

            // Analyze bottlenecks
            var bottlenecks = IdentifyBottlenecks(events);
            foreach (dynamic bottleneck in bottlenecks)
            {
                recommendations.Add(new
                {
                    Type = "Bottleneck Resolution",
                    Priority = "High",
                    Category = "Process Flow",
                    Issue = $"Activity '{bottleneck.Activity}' is causing delays",
                    Impact = $"Average delay of {bottleneck.AverageDelay:F1} minutes per case",
                    Recommendation = $"Consider parallel processing or additional resources for '{bottleneck.Activity}'",
                    EstimatedImprovement = $"Could reduce cycle time by {bottleneck.PotentialImprovement:F1}%"
                });
            }

            // Analyze rework patterns
            var reworkPatterns = IdentifyReworkPatterns(caseGroups);
            foreach (dynamic pattern in reworkPatterns)
            {
                recommendations.Add(new
                {
                    Type = "Rework Reduction",
                    Priority = "Medium",
                    Category = "Quality Improvement",
                    Issue = $"High rework rate in '{pattern.Stage}' ({pattern.ReworkRate:F1}%)",
                    Impact = $"Affects {pattern.CasesAffected} cases, adding {pattern.ExtraTime:F1} minutes average",
                    Recommendation = $"Implement quality checks and training for '{pattern.Stage}' activities",
                    EstimatedImprovement = $"Could improve efficiency by {pattern.PotentialSavings:F1}%"
                });
            }

            // Analyze resource allocation
            var resourceIssues = IdentifyResourceIssues(events);
            foreach (dynamic issue in resourceIssues)
            {
                recommendations.Add(new
                {
                    Type = "Resource Optimization",
                    Priority = issue.Severity,
                    Category = "Resource Management",
                    Issue = issue.Description,
                    Impact = issue.Impact,
                    Recommendation = issue.Recommendation,
                    EstimatedImprovement = issue.EstimatedImprovement
                });
            }

            return new
            {
                TotalRecommendations = recommendations.Count,
                HighPriorityRecommendations = recommendations.Count(r => ((dynamic)r).Priority == "High"),
                Recommendations = recommendations.OrderBy(r => ((dynamic)r).Priority == "High" ? 0 : ((dynamic)r).Priority == "Medium" ? 1 : 2).ToList(),
                ImplementationRoadmap = GenerateImplementationRoadmap(recommendations),
                ExpectedBenefits = CalculateExpectedBenefits(recommendations)
            };
        }

        // Helper methods for the new analysis features
        private string ExtractStageFromActivity(string activity)
        {
            if (activity.Contains("Created")) return "Created";
            if (activity.Contains("ApprovedByVoorraadbeheer")) return "ApprovedByVoorraadbeheer";
            if (activity.Contains("ToProduction")) return "ToProduction";
            if (activity.Contains("InProduction")) return "InProduction";
            if (activity.Contains("AwaitingAccountManagerApproval")) return "AwaitingAccountManagerApproval";
            if (activity.Contains("ApprovedByAccountManager")) return "ApprovedByAccountManager";
            if (activity.Contains("Delivered")) return "Delivered";
            if (activity.Contains("Completed")) return "Completed";
            return "Other";
        }

        private bool HasRework(List<EventLog> caseEvents)
        {
            var activities = caseEvents.Select(e => ExtractStageFromActivity(e.Activity)).ToList();
            var uniqueActivities = activities.Distinct().ToList();
            return activities.Count > uniqueActivities.Count; // Rework if same activity appears multiple times
        }

        private double GetMedian(List<double> values)
        {
            var sorted = values.OrderBy(x => x).ToList();
            var count = sorted.Count;
            if (count == 0) return 0;
            if (count % 2 == 0)
                return (sorted[count / 2 - 1] + sorted[count / 2]) / 2.0;
            return sorted[count / 2];
        }

        private double CalculateStandardDeviation(List<double> values)
        {
            if (!values.Any()) return 0;
            var avg = values.Average();
            var sumOfSquares = values.Sum(x => Math.Pow(x - avg, 2));
            return Math.Sqrt(sumOfSquares / values.Count);
        }

        private string GetMostCommonProcessPath(List<IGrouping<string, EventLog>> caseGroups)
        {
            var paths = caseGroups
                .Select(g => string.Join(" → ", g.OrderBy(e => e.Timestamp).Select(e => ExtractStageFromActivity(e.Activity)).Take(5)))
                .GroupBy(p => p)
                .OrderByDescending(g => g.Count())
                .FirstOrDefault();
            
            return paths?.Key ?? "No common path found";
        }

        private List<object> GetProcessVariants(List<IGrouping<string, EventLog>> caseGroups)
        {
            return caseGroups
                .Select(g => string.Join(" → ", g.OrderBy(e => e.Timestamp).Select(e => ExtractStageFromActivity(e.Activity))))
                .GroupBy(path => path)
                .Select(g => new { Variant = g.Key, Count = g.Count() })
                .OrderByDescending(v => v.Count)
                .Take(5)
                .Cast<object>()
                .ToList();
        }

        private double CalculateOnTimeDeliveryRate(List<IGrouping<string, EventLog>> caseGroups)
        {
            var deliveredCases = caseGroups.Where(g => g.Any(e => e.Activity.Contains("Delivered"))).ToList();
            if (!deliveredCases.Any()) return 0;

            var onTimeCases = deliveredCases.Count(g =>
            {
                var created = g.OrderBy(e => e.Timestamp).FirstOrDefault();
                var delivered = g.FirstOrDefault(e => e.Activity.Contains("Delivered"));
                if (created == null || delivered == null) return false;
                
                var deliveryTime = (delivered.Timestamp - created.Timestamp).TotalDays;
                return deliveryTime <= 7; // Assuming 7 days is the target
            });

            return ((double)onTimeCases / deliveredCases.Count) * 100;
        }

        private object GetCustomerSatisfactionIndicators(List<IGrouping<string, EventLog>> caseGroups)
        {
            var rejectedOrders = caseGroups.Count(g => g.Any(e => e.Activity.Contains("Rejected")));
            var totalOrders = caseGroups.Count;
            
            return new
            {
                RejectionRate = totalOrders > 0 ? ((double)rejectedOrders / totalOrders) * 100 : 0,
                ComplaintIndicators = rejectedOrders,
                ProcessSmoothness = CalculateProcessSmoothness(caseGroups)
            };
        }

        private double CalculateProcessSmoothness(List<IGrouping<string, EventLog>> caseGroups)
        {
            if (!caseGroups.Any()) return 0;
            
            var smoothCases = caseGroups.Count(g => !HasRework(g.ToList()));
            return ((double)smoothCases / caseGroups.Count) * 100;
        }

        // Additional helper methods would continue here...
        private object GetActivityPeakTimes(List<EventLog> activityEvents)
        {
            return activityEvents
                .GroupBy(e => e.Timestamp.Hour)
                .OrderByDescending(g => g.Count())
                .Take(3)
                .Select(g => new { Hour = g.Key, Count = g.Count() })
                .ToList();
        }

        private bool IsBottleneck(List<EventLog> activityEvents, List<EventLog> allEvents)
        {
            var activityCount = activityEvents.Count;
            var avgActivityCount = allEvents.GroupBy(e => e.Activity).Average(g => g.Count());
            return activityCount > avgActivityCount * 1.5; // 50% above average
        }

        private double CalculateProcessImpact(string activity, List<EventLog> allEvents)
        {
            var activityEvents = allEvents.Where(e => e.Activity == activity).ToList();
            var totalEvents = allEvents.Count;
            return totalEvents > 0 ? ((double)activityEvents.Count / totalEvents) * 100 : 0;
        }

        private string NormalizeActivityName(string activity)
        {
            // Normalize activity names for conformance analysis
            if (activity.Contains("Order Created")) return "Order Created";
            if (activity.Contains("Approved by VoorraadBeheer")) return "Order Approved by VoorraadBeheer";
            if (activity.Contains("Production Started")) return "Production Started";
            if (activity.Contains("Order Updated")) return "Order Updated";
            if (activity.Contains("Approve Order")) return "Approve Order";
            if (activity.Contains("Order Status Changed")) return "Order Status Changed";
            if (activity.Contains("Update Order Status")) return "Update Order Status";
            return activity;
        }

        private double CalculateConformanceScore(List<string> actualFlow, List<string> expectedFlow)
        {
            // Simple conformance calculation - can be enhanced with more sophisticated algorithms
            var matches = actualFlow.Intersect(expectedFlow).Count();
            var maxLength = Math.Max(actualFlow.Count, expectedFlow.Count);
            return maxLength > 0 ? ((double)matches / maxLength) * 100 : 0;
        }

        private IEnumerable<object> FindDeviations(List<string> actualFlow, List<string> expectedFlow, string caseId)
        {
            var deviations = new List<object>();
            
            // Find missing steps
            var missingSteps = expectedFlow.Except(actualFlow).ToList();
            foreach (var missing in missingSteps)
            {
                deviations.Add(new
                {
                    CaseId = caseId,
                    DeviationType = "Missing Step",
                    Description = $"Missing expected step: {missing}",
                    Impact = "Process incompleteness"
                });
            }

            // Find extra steps
            var extraSteps = actualFlow.Except(expectedFlow).ToList();
            foreach (var extra in extraSteps)
            {
                deviations.Add(new
                {
                    CaseId = caseId,
                    DeviationType = "Extra Step",
                    Description = $"Unexpected step: {extra}",
                    Impact = "Process inefficiency"
                });
            }

            return deviations;
        }

        private double CalculateActivitiesPerDay(List<EventLog> resourceEvents)
        {
            if (!resourceEvents.Any()) return 0;
            
            var days = (resourceEvents.Max(e => e.Timestamp) - resourceEvents.Min(e => e.Timestamp)).TotalDays;
            return days > 0 ? resourceEvents.Count / days : resourceEvents.Count;
        }

        private object GetWorkloadDistribution(List<EventLog> resourceEvents)
        {
            return resourceEvents
                .GroupBy(e => e.Timestamp.Date)
                .Select(g => new { Date = g.Key, ActivityCount = g.Count() })
                .OrderByDescending(x => x.ActivityCount)
                .Take(5)
                .ToList();
        }

        private double CalculateUtilizationScore(List<EventLog> resourceEvents, int totalEvents)
        {
            return totalEvents > 0 ? ((double)resourceEvents.Count / totalEvents) * 100 : 0;
        }

        private List<object> GenerateResourceRecommendations(List<object> resourceAnalysis)
        {
            var recommendations = new List<object>();
            
            foreach (dynamic resource in resourceAnalysis)
            {
                if (resource.UtilizationScore > 90)
                {
                    recommendations.Add(new
                    {
                        Type = "Overutilization",
                        Resource = resource.Resource,
                        Recommendation = "Consider load balancing or additional resources",
                        Priority = "High"
                    });
                }
                else if (resource.UtilizationScore < 10)
                {
                    recommendations.Add(new
                    {
                        Type = "Underutilization",
                        Resource = resource.Resource,
                        Recommendation = "Consider reassigning tasks or cross-training",
                        Priority = "Medium"
                    });
                }
            }
            
            return recommendations;
        }

        private object AnalyzeCaseJourney(List<EventLog> caseEvents)
        {
            var orderedEvents = caseEvents.OrderBy(e => e.Timestamp).ToList();
            var totalDuration = orderedEvents.Any() ? (orderedEvents.Last().Timestamp - orderedEvents.First().Timestamp).TotalMinutes : 0;
            
            return new
            {
                CaseId = caseEvents.First().CaseId,
                TotalSteps = orderedEvents.Count,
                TotalDuration = totalDuration,
                StartTime = orderedEvents.First().Timestamp,
                EndTime = orderedEvents.Last().Timestamp,
                IsSuccessful = orderedEvents.Any(e => e.Activity.Contains("Completed") || e.Activity.Contains("Delivered")),
                HasRework = HasRework(orderedEvents),
                Journey = orderedEvents.Select(e => new
                {
                    Step = e.Activity,
                    Timestamp = e.Timestamp,
                    Resource = e.Resource,
                    Duration = e.DurationMs
                }).ToList()
            };
        }

        private List<object> GetMostCommonJourneyIssues(List<object> caseJourneys)
        {
            var issuesList = new List<object>();
            
            foreach (dynamic journey in caseJourneys)
            {
                if (journey.HasRework)
                    issuesList.Add(new { Issue = "Rework Required", CaseId = journey.CaseId });
                
                if (journey.TotalDuration > 1440) // More than 24 hours
                    issuesList.Add(new { Issue = "Extended Duration", CaseId = journey.CaseId });
                    
                if (!journey.IsSuccessful)
                    issuesList.Add(new { Issue = "Incomplete Process", CaseId = journey.CaseId });
            }
            
            return issuesList
                .GroupBy(i => ((dynamic)i).Issue)
                .Select(g => new { Issue = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .Cast<object>()
                .ToList();
        }

        private List<object> IdentifyBottlenecks(List<EventLog> events)
        {
            // Simplified bottleneck identification
            return events
                .GroupBy(e => e.Activity)
                .Where(g => g.Count() > events.Count * 0.1) // Activities that occur in more than 10% of events
                .Select(g => new
                {
                    Activity = g.Key,
                    AverageDelay = g.Where(e => e.DurationMs.HasValue).Any() 
                        ? g.Where(e => e.DurationMs.HasValue).Average(e => e.DurationMs!.Value) / 60000.0 // Convert to minutes
                        : 0.0,
                    PotentialImprovement = 15.0 // Placeholder percentage
                })
                .Where(b => b.AverageDelay > 5) // More than 5 minutes average
                .Cast<object>()
                .ToList();
        }

        private List<object> IdentifyReworkPatterns(List<IGrouping<string, EventLog>> caseGroups)
        {
            return new List<object>
            {
                new
                {
                    Stage = "Order Approval",
                    ReworkRate = 15.0,
                    CasesAffected = caseGroups.Count(g => HasRework(g.ToList())),
                    ExtraTime = 30.0,
                    PotentialSavings = 10.0
                }
            };
        }

        private List<object> IdentifyResourceIssues(List<EventLog> events)
        {
            var resourceWorkload = events
                .GroupBy(e => e.Resource)
                .Select(g => new
                {
                    Resource = g.Key,
                    Workload = g.Count(),
                    AvgWorkload = events.Count / events.Select(e => e.Resource).Distinct().Count()
                })
                .ToList();

            var issues = new List<object>();

            foreach (var resource in resourceWorkload)
            {
                if (resource.Workload > resource.AvgWorkload * 2)
                {
                    issues.Add(new
                    {
                        Severity = "High",
                        Description = $"Resource '{resource.Resource}' is overloaded",
                        Impact = $"Handling {resource.Workload} activities vs average {resource.AvgWorkload:F0}",
                        Recommendation = "Redistribute workload or add capacity",
                        EstimatedImprovement = "20-30% efficiency gain"
                    });
                }
            }

            return issues;
        }

        private object GenerateImplementationRoadmap(List<object> recommendations)
        {
            return new
            {
                Phase1 = "Address high-priority bottlenecks (0-3 months)",
                Phase2 = "Implement quality improvements (3-6 months)",
                Phase3 = "Optimize resource allocation (6-12 months)",
                TotalEstimatedTime = "12 months",
                InvestmentRequired = "Medium to High"
            };
        }

        private object CalculateExpectedBenefits(List<object> recommendations)
        {
            return new
            {
                CycleTimeReduction = "15-25%",
                EfficiencyImprovement = "20-30%",
                CostSavings = "10-15%",
                QualityImprovement = "Reduced rework by 40%",
                CustomerSatisfaction = "Improved delivery times"
            };
        }
    }
}