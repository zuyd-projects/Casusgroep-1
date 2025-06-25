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
    }
}