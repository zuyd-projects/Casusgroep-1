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
                .Select(g => new
                {
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
                .Where(o => o.Status != OrderStatus.Delivered &&
                           o.Status != OrderStatus.Completed &&
                           o.Status != OrderStatus.Cancelled) // Exclude all completed orders
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
                                   order.Status != OrderStatus.Completed &&
                                   order.Status != OrderStatus.Cancelled;

                    // Check if order is at risk (2 rounds passed, not yet delayed but close)
                    bool isAtRisk = roundsSinceCreation == (DELAY_THRESHOLD - 1) &&
                                  order.Status != OrderStatus.Delivered &&
                                  order.Status != OrderStatus.Completed &&
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
                .Where(o => o.Status != OrderStatus.Delivered &&
                           o.Status != OrderStatus.Completed &&
                           o.Status != OrderStatus.Cancelled)
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
                        conformanceResults.Average(r => (double)((dynamic)r).ConformanceScore) : 0,
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
                        AverageConformance = g.Average(r => (double)((dynamic)r).ConformanceScore)
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
                    AverageJourneySteps = caseJourneys.Any() ? caseJourneys.Average(c => (double)((dynamic)c).TotalSteps) : 0,
                    AverageJourneyDuration = caseJourneys.Any() ? caseJourneys.Average(c => (double)((dynamic)c).TotalDuration) : 0,
                    MostCommonIssues = GetMostCommonJourneyIssues(caseJourneys),
                    SuccessfulJourneys = caseJourneys.Count(c => (bool)((dynamic)c).IsSuccessful),
                    ProblematicJourneys = caseJourneys.Count(c => !(bool)((dynamic)c).IsSuccessful)
                }
            };
        }

        private List<object> GetMostCommonJourneyIssues(List<object> caseJourneys)
        {
            // Implementation for getting most common journey issues
            return new List<object>();
        }

        public async Task<object> GetDetailedProcessTimingAnalysisAsync(string? caseId = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            var events = await GetFilteredEventsAsync(startDate, endDate);

            if (!string.IsNullOrEmpty(caseId))
            {
                events = events.Where(e => e.CaseId == caseId).ToList();
            }

            var caseGroups = events.GroupBy(e => e.CaseId).ToList();
            var detailedTimingResults = new List<object>();

            foreach (var caseGroup in caseGroups)
            {
                var caseEvents = caseGroup.OrderBy(e => e.Timestamp).ToList();
                if (caseEvents.Count < 2) continue; // Skip cases with only one event

                var stages = new List<object>();
                var totalDuration = (caseEvents.Last().Timestamp - caseEvents.First().Timestamp).TotalMinutes;

                // Create detailed stage-by-stage timing
                for (int i = 0; i < caseEvents.Count; i++)
                {
                    var currentEvent = caseEvents[i];
                    var nextEvent = i < caseEvents.Count - 1 ? caseEvents[i + 1] : null;

                    var stageDuration = nextEvent != null
                        ? (nextEvent.Timestamp - currentEvent.Timestamp).TotalMinutes
                        : 0;

                    var stageInfo = new
                    {
                        StageNumber = i + 1,
                        Activity = currentEvent.Activity,
                        Resource = currentEvent.Resource,
                        Status = currentEvent.Status,
                        EventType = currentEvent.EventType,
                        StartTime = currentEvent.Timestamp,
                        EndTime = nextEvent?.Timestamp,
                        DurationMinutes = stageDuration,
                        DurationHours = stageDuration / 60.0,
                        DurationDays = stageDuration / (60.0 * 24),
                        DurationMs = currentEvent.DurationMs,
                        PercentageOfTotal = totalDuration > 0 ? (stageDuration / totalDuration) * 100 : 0,
                        IsBottleneck = stageDuration > 0 && totalDuration > 0 && (stageDuration / totalDuration) > 0.3, // More than 30% of total time
                        AdditionalData = currentEvent.AdditionalData,
                        UserId = currentEvent.UserId,
                        SessionId = currentEvent.SessionId
                    };

                    stages.Add(stageInfo);
                }

                // Calculate process metrics
                var completionStatus = DetermineCompletionStatus(caseEvents);
                var processEfficiency = CalculateProcessEfficiency(caseEvents);
                var waitTimes = CalculateWaitTimes(caseEvents);
                var bottleneckStages = stages.Cast<dynamic>().Where(s => s.IsBottleneck).ToList();

                var caseTimingAnalysis = new
                {
                    CaseId = caseGroup.Key,
                    ProcessStart = caseEvents.First().Timestamp,
                    ProcessEnd = caseEvents.Last().Timestamp,
                    TotalDurationMinutes = totalDuration,
                    TotalDurationHours = totalDuration / 60.0,
                    TotalDurationDays = totalDuration / (60.0 * 24),
                    TotalStages = stages.Count,
                    CompletionStatus = completionStatus,
                    ProcessEfficiency = processEfficiency,

                    // Detailed stage information
                    Stages = stages,

                    // Process insights
                    LongestStage = stages.Cast<dynamic>().OrderByDescending(s => s.DurationMinutes).FirstOrDefault(),
                    ShortestStage = stages.Cast<dynamic>().Where(s => s.DurationMinutes > 0).OrderBy(s => s.DurationMinutes).FirstOrDefault(),
                    BottleneckStages = bottleneckStages,
                    BottleneckCount = bottleneckStages.Count,

                    // Timing metrics
                    AverageStageDuration = stages.Cast<dynamic>().Where(s => s.DurationMinutes > 0).Any()
                        ? stages.Cast<dynamic>().Where(s => s.DurationMinutes > 0).Average(s => (double)s.DurationMinutes)
                        : 0,
                    TotalWaitTime = ((dynamic)waitTimes).TotalWaitTime,
                    ActiveProcessingTime = ((dynamic)waitTimes).ActiveProcessingTime,
                    WaitTimePercentage = ((dynamic)waitTimes).WaitTimePercentage,

                    // Process flow analysis
                    ProcessPath = string.Join(" → ", caseEvents.Take(10).Select(e => ExtractStageFromActivity(e.Activity))),
                    UniqueActivities = caseEvents.Select(e => e.Activity).Distinct().Count(),
                    UniqueResources = caseEvents.Select(e => e.Resource).Distinct().Count(),
                    HasRework = HasRework(caseEvents),
                    ReworkStages = IdentifyReworkStages(caseEvents),

                    // Quality indicators
                    ErrorEvents = caseEvents.Count(e => e.Status.ToLower().Contains("error") || e.Status.ToLower().Contains("failed")),
                    SuccessRate = caseEvents.Count > 0 ? ((double)caseEvents.Count(e => e.Status.ToLower().Contains("completed") || e.Status.ToLower().Contains("success")) / caseEvents.Count) * 100 : 0,

                    // Timeline visualization data
                    TimelineData = CreateTimelineData(caseEvents)
                };

                detailedTimingResults.Add(caseTimingAnalysis);
            }

            // Calculate aggregate metrics
            var aggregateMetrics = CalculateAggregateTimingMetrics(detailedTimingResults);
            var stagePerformanceAnalysis = CalculateStagePerformanceAnalysis(detailedTimingResults);
            var processComparisonData = CreateProcessComparisonData(detailedTimingResults);

            return new
            {
                Summary = new
                {
                    TotalCases = detailedTimingResults.Count,
                    AnalysisPeriod = new
                    {
                        Start = events.Any() ? events.Min(e => e.Timestamp) : (DateTime?)null,
                        End = events.Any() ? events.Max(e => e.Timestamp) : (DateTime?)null
                    },
                    AverageProcessDuration = ((dynamic)aggregateMetrics).AverageProcessDuration,
                    MedianProcessDuration = ((dynamic)aggregateMetrics).MedianProcessDuration,
                    FastestProcess = ((dynamic)aggregateMetrics).FastestProcess,
                    SlowestProcess = ((dynamic)aggregateMetrics).SlowestProcess,
                    TotalBottlenecks = ((dynamic)aggregateMetrics).TotalBottlenecks,
                    ProcessEfficiencyScore = ((dynamic)aggregateMetrics).ProcessEfficiencyScore
                },

                // Detailed case-by-case analysis
                DetailedCaseAnalysis = detailedTimingResults.OrderByDescending(c => ((dynamic)c).TotalDurationMinutes).ToList(),

                // Stage performance insights
                StagePerformanceAnalysis = stagePerformanceAnalysis,

                // Process comparison and benchmarking
                ProcessComparison = processComparisonData,

                // Timing insights and recommendations
                TimingInsights = new
                {
                    MostCommonBottlenecks = GetMostCommonBottlenecks(detailedTimingResults),
                    OptimizationOpportunities = IdentifyOptimizationOpportunities(detailedTimingResults),
                    PerformancePatterns = IdentifyPerformancePatterns(detailedTimingResults),
                    ProcessVariations = AnalyzeProcessVariations(detailedTimingResults)
                }
            };
        }

        private string DetermineCompletionStatus(List<EventLog> caseEvents)
        {
            var lastEvent = caseEvents.LastOrDefault();
            if (lastEvent == null) return "Unknown";

            if (lastEvent.Activity.ToLower().Contains("delivered") || lastEvent.Activity.ToLower().Contains("completed"))
                return "Completed";
            if (lastEvent.Activity.ToLower().Contains("cancelled") || lastEvent.Activity.ToLower().Contains("rejected"))
                return "Cancelled";
            if (lastEvent.Status.ToLower().Contains("error") || lastEvent.Status.ToLower().Contains("failed"))
                return "Failed";
            return "In Progress";
        }

        private double CalculateProcessEfficiency(List<EventLog> caseEvents)
        {
            if (caseEvents.Count <= 1) return 100.0;

            var totalTime = (caseEvents.Last().Timestamp - caseEvents.First().Timestamp).TotalMinutes;
            var activeTime = caseEvents.Where(e => e.DurationMs.HasValue).Sum(e => (e.DurationMs ?? 0) / 60000.0); // Convert to minutes

            if (totalTime <= 0) return 100.0;
            return activeTime > 0 ? Math.Min(100.0, (activeTime / totalTime) * 100) : 50.0; // Default to 50% if no duration data
        }

        private object CalculateWaitTimes(List<EventLog> caseEvents)
        {
            if (caseEvents.Count <= 1)
                return new { TotalWaitTime = 0.0, ActiveProcessingTime = 0.0, WaitTimePercentage = 0.0 };

            var totalDuration = (caseEvents.Last().Timestamp - caseEvents.First().Timestamp).TotalMinutes;
            var activeProcessingTime = caseEvents.Where(e => e.DurationMs.HasValue).Sum(e => (e.DurationMs ?? 0) / 60000.0);
            var waitTime = Math.Max(0, totalDuration - activeProcessingTime);
            var waitTimePercentage = totalDuration > 0 ? (waitTime / totalDuration) * 100 : 0;

            return new
            {
                TotalWaitTime = waitTime,
                ActiveProcessingTime = activeProcessingTime,
                WaitTimePercentage = waitTimePercentage
            };
        }

        private List<object> IdentifyReworkStages(List<EventLog> caseEvents)
        {
            var activities = caseEvents.Select(e => e.Activity).ToList();
            var reworkStages = new List<object>();

            var activityCounts = activities.GroupBy(a => a).Where(g => g.Count() > 1).ToList();
            foreach (var rework in activityCounts)
            {
                reworkStages.Add(new
                {
                    Activity = rework.Key,
                    Occurrences = rework.Count(),
                    ReworkCount = rework.Count() - 1
                });
            }

            return reworkStages;
        }

        private List<object> CreateTimelineData(List<EventLog> caseEvents)
        {
            return caseEvents.Select((evt, index) => new
            {
                SequenceNumber = index + 1,
                Timestamp = evt.Timestamp,
                Activity = evt.Activity,
                Resource = evt.Resource,
                Status = evt.Status,
                RelativeTime = index == 0 ? 0 : (evt.Timestamp - caseEvents.First().Timestamp).TotalMinutes,
                CumulativeTime = (evt.Timestamp - caseEvents.First().Timestamp).TotalMinutes
            }).Cast<object>().ToList();
        }

        private object CalculateAggregateTimingMetrics(List<object> detailedResults)
        {
            if (!detailedResults.Any())
                return new { AverageProcessDuration = 0.0, MedianProcessDuration = 0.0, FastestProcess = (object?)null, SlowestProcess = (object?)null, TotalBottlenecks = 0, ProcessEfficiencyScore = 0.0 };

            var durations = detailedResults.Select(r => (double)((dynamic)r).TotalDurationMinutes).ToList();
            var efficiencyScores = detailedResults.Select(r => (double)((dynamic)r).ProcessEfficiency).ToList();

            return new
            {
                AverageProcessDuration = durations.Average(),
                MedianProcessDuration = GetMedian(durations),
                FastestProcess = detailedResults.OrderBy(r => ((dynamic)r).TotalDurationMinutes).FirstOrDefault(),
                SlowestProcess = detailedResults.OrderByDescending(r => ((dynamic)r).TotalDurationMinutes).FirstOrDefault(),
                TotalBottlenecks = (int)detailedResults.Sum(r => ((dynamic)r).BottleneckCount),
                ProcessEfficiencyScore = efficiencyScores.Any() ? efficiencyScores.Average() : 0.0
            };
        }

        private object CalculateStagePerformanceAnalysis(List<object> detailedResults)
        {
            var allStages = new List<dynamic>();
            foreach (var result in detailedResults)
            {
                var stages = ((IEnumerable<object>)((dynamic)result).Stages).Cast<dynamic>();
                allStages.AddRange(stages);
            }

            if (!allStages.Any()) return new { };

            var stagePerformance = allStages
                .GroupBy(s => (string)s.Activity)
                .Select(g => new
                {
                    Activity = g.Key,
                    AverageDuration = g.Where(s => s.DurationMinutes > 0).Any() ? g.Where(s => s.DurationMinutes > 0).Average(s => (double)s.DurationMinutes) : 0,
                    MedianDuration = GetMedian(g.Where(s => s.DurationMinutes > 0).Select(s => (double)s.DurationMinutes).ToList()),
                    MinDuration = g.Where(s => s.DurationMinutes > 0).Any() ? g.Where(s => s.DurationMinutes > 0).Min(s => (double)s.DurationMinutes) : 0,
                    MaxDuration = g.Where(s => s.DurationMinutes > 0).Any() ? g.Where(s => s.DurationMinutes > 0).Max(s => (double)s.DurationMinutes) : 0,
                    Occurrences = g.Count(),
                    BottleneckFrequency = g.Count(s => s.IsBottleneck),
                    BottleneckPercentage = g.Count() > 0 ? ((double)g.Count(s => s.IsBottleneck) / g.Count()) * 100 : 0
                })
                .OrderByDescending(x => x.AverageDuration)
                .ToList();

            return stagePerformance;
        }

        private object CreateProcessComparisonData(List<object> detailedResults)
        {
            if (!detailedResults.Any()) return new { };

            var processTypes = detailedResults
                .GroupBy(r => ((dynamic)r).ProcessPath)
                .Select(g => new
                {
                    ProcessType = g.Key,
                    CaseCount = g.Count(),
                    AverageDuration = g.Average(r => (double)((dynamic)r).TotalDurationMinutes),
                    SuccessRate = g.Count() > 0 ? g.Average(r => (double)((dynamic)r).SuccessRate) : 0,
                    EfficiencyScore = g.Count() > 0 ? g.Average(r => (double)((dynamic)r).ProcessEfficiency) : 0
                })
                .OrderByDescending(x => x.CaseCount)
                .ToList();

            return processTypes;
        }

        private List<object> GetMostCommonBottlenecks(List<object> detailedResults)
        {
            var allBottlenecks = new List<dynamic>();
            foreach (var result in detailedResults)
            {
                var bottlenecks = ((IEnumerable<object>)((dynamic)result).BottleneckStages).Cast<dynamic>();
                allBottlenecks.AddRange(bottlenecks);
            }

            return allBottlenecks
                .GroupBy(b => (string)b.Activity)
                .Select(g => new
                {
                    Activity = g.Key,
                    Frequency = g.Count(),
                    AverageDuration = g.Average(b => (double)b.DurationMinutes),
                    TotalImpact = g.Sum(b => (double)b.DurationMinutes)
                })
                .OrderByDescending(x => x.Frequency)
                .Take(10)
                .Cast<object>()
                .ToList();
        }

        private List<object> IdentifyOptimizationOpportunities(List<object> detailedResults)
        {
            var opportunities = new List<object>();

            // Find stages with high wait times
            var highWaitTimeStages = detailedResults
                .Where(r => ((dynamic)r).WaitTimePercentage > 50)
                .Select(r => new
                {
                    Type = "High Wait Time",
                    CaseId = ((dynamic)r).CaseId,
                    Issue = $"Process has {((dynamic)r).WaitTimePercentage:F1}% wait time",
                    PotentialSaving = ((dynamic)r).TotalWaitTime,
                    Priority = ((dynamic)r).WaitTimePercentage > 80 ? "High" : "Medium"
                });

            opportunities.AddRange(highWaitTimeStages);

            return opportunities.Take(20).ToList();
        }

        private List<object> IdentifyPerformancePatterns(List<object> detailedResults)
        {
            return new List<object>(); // Placeholder for performance pattern analysis
        }

        private List<object> AnalyzeProcessVariations(List<object> detailedResults)
        {
            return detailedResults
                .GroupBy(r => ((dynamic)r).ProcessPath)
                .Select(g => new
                {
                    ProcessVariant = g.Key,
                    CaseCount = g.Count(),
                    AverageDuration = g.Average(r => (double)((dynamic)r).TotalDurationMinutes),
                    PerformanceRating = CalculatePerformanceRating(g.ToList())
                })
                .OrderByDescending(x => x.CaseCount)
                .Cast<object>()
                .ToList();
        }

        private string CalculatePerformanceRating(List<object> processGroup)
        {
            var avgEfficiency = processGroup.Average(r => (double)((dynamic)r).ProcessEfficiency);
            if (avgEfficiency >= 80) return "Excellent";
            if (avgEfficiency >= 60) return "Good";
            if (avgEfficiency >= 40) return "Fair";
            return "Poor";
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

        // Helper methods - placeholders for missing implementations
        private double CalculateStandardDeviation(List<double> values)
        {
            if (!values.Any()) return 0;
            var mean = values.Average();
            var sumSquaredDifferences = values.Sum(v => Math.Pow(v - mean, 2));
            return Math.Sqrt(sumSquaredDifferences / values.Count);
        }

        private string GetMostCommonProcessPath(List<IGrouping<string, EventLog>> caseGroups)
        {
            return "Order Created → Approved → Production → Delivered"; // Placeholder
        }

        private List<object> GetProcessVariants(List<IGrouping<string, EventLog>> caseGroups)
        {
            return new List<object>(); // Placeholder
        }

        private double CalculateOnTimeDeliveryRate(List<IGrouping<string, EventLog>> caseGroups)
        {
            return 85.0; // Placeholder percentage
        }

        private object GetCustomerSatisfactionIndicators(List<IGrouping<string, EventLog>> caseGroups)
        {
            return new { SatisfactionScore = 4.2, ResponseTime = 2.5 }; // Placeholder
        }

        private object GetActivityPeakTimes(List<EventLog> events)
        {
            return new { PeakHour = 14, PeakDay = "Tuesday" }; // Placeholder
        }

        private bool IsBottleneck(List<EventLog> events, List<EventLog> allEvents)
        {
            return false; // Placeholder
        }

        private double CalculateProcessImpact(string activity, List<EventLog> allEvents)
        {
            return 1.0; // Placeholder
        }

        private string NormalizeActivityName(string activity)
        {
            return activity.Trim().ToLower().Replace(" ", "");
        }

        private double CalculateConformanceScore(List<string> actualFlow, List<string> expectedFlow)
        {
            return 85.0; // Placeholder percentage
        }

        private List<object> FindDeviations(List<string> actualFlow, List<string> expectedFlow, string caseId)
        {
            return new List<object>(); // Placeholder
        }

        private double CalculateActivitiesPerDay(List<EventLog> events)
        {
            if (!events.Any()) return 0;
            var timespan = (events.Max(e => e.Timestamp) - events.Min(e => e.Timestamp)).TotalDays;
            return timespan > 0 ? events.Count / timespan : events.Count;
        }

        private object GetWorkloadDistribution(List<EventLog> events)
        {
            return new { EvenDistribution = true, PeakLoad = 85 }; // Placeholder
        }

        private double CalculateUtilizationScore(List<EventLog> events, int totalEvents)
        {
            return totalEvents > 0 ? (events.Count / (double)totalEvents) * 100 : 0;
        }

        private List<object> GenerateResourceRecommendations(List<object> resourceAnalysis)
        {
            return new List<object>(); // Placeholder
        }

        private object AnalyzeCaseJourney(List<EventLog> caseEvents)
        {
            var orderedEvents = caseEvents.OrderBy(e => e.Timestamp).ToList();
            var totalDuration = orderedEvents.Count > 1
                ? (orderedEvents.Last().Timestamp - orderedEvents.First().Timestamp).TotalMinutes
                : 0;

            return new
            {
                CaseId = caseEvents.First().CaseId,
                TotalSteps = caseEvents.Count,
                TotalDuration = totalDuration,
                IsSuccessful = !caseEvents.Any(e => e.Status.ToLower().Contains("failed") || e.Status.ToLower().Contains("error")),
                ProcessPath = string.Join(" → ", orderedEvents.Select(e => ExtractStageFromActivity(e.Activity))),
                Steps = orderedEvents.Select((e, index) => new
                {
                    Step = e.Activity,
                    Resource = e.Resource,
                    Timestamp = e.Timestamp,
                    Duration = e.DurationMs,
                    Status = e.Status,
                    StepNumber = index + 1
                }).ToList()
            };
        }

        private List<object> IdentifyBottlenecks(List<EventLog> events)
        {
            return new List<object>(); // Placeholder
        }

        private List<object> IdentifyReworkPatterns(List<IGrouping<string, EventLog>> caseGroups)
        {
            return new List<object>(); // Placeholder
        }

        private List<object> IdentifyResourceIssues(List<EventLog> events)
        {
            return new List<object>(); // Placeholder
        }

        private List<object> GenerateImplementationRoadmap(List<object> recommendations)
        {
            return new List<object>(); // Placeholder
        }

        private object CalculateExpectedBenefits(List<object> recommendations)
        {
            return new { TotalSavings = 15.5, EfficiencyGain = 23.2 }; // Placeholder
        }

        private string ExtractStageFromActivity(string activity)
        {
            // Extract meaningful stage name from activity description
            if (string.IsNullOrEmpty(activity)) return "Unknown";

            // Common patterns to clean up activity names
            var stageName = activity.Split(' ').FirstOrDefault() ?? activity;
            return stageName.Length > 15 ? stageName.Substring(0, 15) + "..." : stageName;
        }

        private bool HasRework(List<EventLog> caseEvents)
        {
            var activities = caseEvents.Select(e => e.Activity).ToList();
            return activities.Count != activities.Distinct().Count();
        }

        private double GetMedian(List<double> values)
        {
            if (!values.Any()) return 0;

            var sortedValues = values.OrderBy(x => x).ToList();
            var count = sortedValues.Count;

            if (count % 2 == 0)
            {
                return (sortedValues[count / 2 - 1] + sortedValues[count / 2]) / 2.0;
            }
            else
            {
                return sortedValues[count / 2];
            }
        }

        /// <summary>
        /// Get simulation-specific business analysis with metrics per product type, quantity, and production line
        /// </summary>
        public async Task<object> GetSimulationBusinessAnalysisAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var events = await GetFilteredEventsAsync(startDate, endDate);
            var orders = await _context.Orders
                .Where(o => !startDate.HasValue || o.OrderDate >= startDate)
                .Where(o => !endDate.HasValue || o.OrderDate <= endDate)
                .ToListAsync();

            var caseGroups = events.GroupBy(e => e.CaseId).ToList();

            // Calculate order cycle times by product type, quantity, and production line
            var orderCycleTimes = new List<dynamic>();
            var cycleTimesByCategory = new Dictionary<string, List<double>>();

            foreach (var order in orders)
            {
                var orderEvents = events.Where(e => e.EntityId == order.Id.ToString()).OrderBy(e => e.Timestamp).ToList();
                if (orderEvents.Count >= 2)
                {
                    var startEvent = orderEvents.First();
                    var endEvent = orderEvents.Last();
                    var cycleTime = (endEvent.Timestamp - startEvent.Timestamp).TotalSeconds;

                    var productType = order.MotorType.ToString();
                    var quantity = order.Quantity;
                    var productionLine = order.ProductionLine?.ToString() ?? "Unknown";
                    var categoryKey = $"{productType}-Q{quantity}-L{productionLine}";

                    orderCycleTimes.Add(new
                    {
                        OrderId = order.Id,
                        ProductType = productType,
                        Quantity = quantity,
                        ProductionLine = productionLine,
                        RoundId = order.RoundId,
                        CycleTimeSeconds = cycleTime,
                        CategoryKey = categoryKey
                    });

                    if (!cycleTimesByCategory.ContainsKey(categoryKey))
                        cycleTimesByCategory[categoryKey] = new List<double>();
                    cycleTimesByCategory[categoryKey].Add(cycleTime);
                }
            }

            // Calculate statistics per category
            var categoryStats = cycleTimesByCategory.Select(kvp => new
            {
                Category = kvp.Key,
                ProductType = kvp.Key.Split('-')[0],
                Quantity = int.Parse(kvp.Key.Split('-')[1].Substring(1)),
                ProductionLine = kvp.Key.Split('-')[2].Substring(1),
                OrderCount = kvp.Value.Count,
                AverageCycleTime = kvp.Value.Average(),
                MedianCycleTime = GetMedian(kvp.Value),
                MinCycleTime = kvp.Value.Min(),
                MaxCycleTime = kvp.Value.Max(),
                StandardDeviation = CalculateStandardDeviation(kvp.Value)
            }).ToList();

            // Calculate per-round statistics
            var roundStats = orders.GroupBy(o => o.RoundId).Select(g => new
            {
                RoundId = g.Key,
                OrderCount = g.Count(),
                ProductTypes = g.GroupBy(o => o.MotorType).Select(pg => new
                {
                    Type = pg.Key.ToString(),
                    Count = pg.Count(),
                    Quantities = pg.GroupBy(o => o.Quantity).Select(qg => new { Quantity = qg.Key, Count = qg.Count() })
                }),
                ProductionLines = g.Where(o => o.ProductionLine.HasValue).GroupBy(o => o.ProductionLine).Select(lg => new
                {
                    Line = lg.Key.ToString(),
                    Count = lg.Count()
                })
            }).OrderBy(r => r.RoundId).ToList();

            // Calculate period statistics (assume 20 seconds per round, 30 rounds per period)
            var periodStats = !roundStats.Any() ? new List<object>() :
                roundStats.GroupBy(r => r.RoundId / 30).Select(pg => new
                {
                    PeriodId = pg.Key,
                    StartRound = pg.Key * 30,
                    EndRound = Math.Min((pg.Key + 1) * 30 - 1, roundStats.Max(r => r.RoundId)),
                    TotalOrders = pg.Sum(r => r.OrderCount),
                    AverageOrdersPerRound = pg.Average(r => r.OrderCount)
                }).Cast<object>().ToList();

            return new
            {
                SimulationMetrics = new
                {
                    TotalOrders = orders.Count,
                    TotalRounds = orders.Any() ? orders.Max(o => o.RoundId) + 1 : 0,
                    TotalPeriods = periodStats.Count,
                    AverageOrdersPerRound = roundStats.Any() ? roundStats.Average(r => r.OrderCount) : 0,
                    ProductTypeDistribution = orders.GroupBy(o => o.MotorType).Select(g => new
                    {
                        Type = g.Key.ToString(),
                        Count = g.Count(),
                        Percentage = (double)g.Count() / orders.Count * 100
                    }),
                    QuantityDistribution = orders.GroupBy(o => o.Quantity).Select(g => new
                    {
                        Quantity = g.Key,
                        Count = g.Count(),
                        Percentage = (double)g.Count() / orders.Count * 100
                    }),
                    ProductionLineDistribution = orders.Where(o => o.ProductionLine.HasValue).GroupBy(o => o.ProductionLine).Select(g => new
                    {
                        Line = g.Key.ToString(),
                        Count = g.Count(),
                        Percentage = orders.Count(o => o.ProductionLine.HasValue) > 0 ? (double)g.Count() / orders.Count(o => o.ProductionLine.HasValue) * 100 : 0
                    })
                },
                CycleTimeAnalysis = new
                {
                    OverallStats = new
                    {
                        AverageCycleTime = orderCycleTimes.Any() ? orderCycleTimes.Average(o => (double)o.CycleTimeSeconds) : 0,
                        MedianCycleTime = orderCycleTimes.Any() ? GetMedian(orderCycleTimes.Select(o => (double)o.CycleTimeSeconds).ToList()) : 0,
                        MinCycleTime = orderCycleTimes.Any() ? orderCycleTimes.Min(o => (double)o.CycleTimeSeconds) : 0,
                        MaxCycleTime = orderCycleTimes.Any() ? orderCycleTimes.Max(o => (double)o.CycleTimeSeconds) : 0
                    },
                    ByCategory = categoryStats,
                    ByProductType = categoryStats.GroupBy(c => c.ProductType).Select(g => new
                    {
                        ProductType = g.Key,
                        AverageCycleTime = g.Average(c => c.AverageCycleTime),
                        OrderCount = g.Sum(c => c.OrderCount)
                    }),
                    ByQuantity = categoryStats.GroupBy(c => c.Quantity).Select(g => new
                    {
                        Quantity = g.Key,
                        AverageCycleTime = g.Average(c => c.AverageCycleTime),
                        OrderCount = g.Sum(c => c.OrderCount)
                    }),
                    ByProductionLine = categoryStats.GroupBy(c => c.ProductionLine).Select(g => new
                    {
                        ProductionLine = g.Key,
                        AverageCycleTime = g.Average(c => c.AverageCycleTime),
                        OrderCount = g.Sum(c => c.OrderCount)
                    })
                },
                RoundAnalysis = roundStats,
                PeriodAnalysis = periodStats,
                DetailedOrders = orderCycleTimes
            };
        }

        /// <summary>
        /// Get simulation performance metrics for the dashboard
        /// </summary>
        public async Task<object> GetSimulationPerformanceAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var orders = await _context.Orders
                .Where(o => !startDate.HasValue || o.OrderDate >= startDate)
                .Where(o => !endDate.HasValue || o.OrderDate <= endDate)
                .ToListAsync();

            var events = await GetFilteredEventsAsync(startDate, endDate);

            // Production line efficiency
            var productionLineMetrics = orders.Where(o => o.ProductionLine.HasValue)
                .GroupBy(o => o.ProductionLine)
                .Select(g => new
                {
                    ProductionLine = g.Key.ToString(),
                    TotalOrders = g.Count(),
                    // Production line is complete when handed to account manager (or further in the process)
                    CompletedOrders = g.Count(o => o.Status == OrderStatus.ApprovedByAccountManager ||
                                                   o.Status == OrderStatus.Delivered ||
                                                   o.Status == OrderStatus.Completed),
                    ProductTypes = g.GroupBy(o => o.MotorType).Select(pg => new
                    {
                        Type = pg.Key.ToString(),
                        Count = pg.Count()
                    }),
                    AverageQuantity = g.Average(o => o.Quantity),
                    CompletionRate = g.Count() > 0 ? (double)g.Count(o => o.Status == OrderStatus.ApprovedByAccountManager ||
                                                                          o.Status == OrderStatus.Delivered ||
                                                                          o.Status == OrderStatus.Completed) / g.Count() * 100 : 0
                }).ToList();

            // Round-by-round performance - show both orders created and production activity
            var roundPerformance = orders.GroupBy(o => o.RoundId)
                .Select(g => new
                {
                    RoundId = g.Key,
                    OrdersCreated = g.Count(), // Orders created in this round
                    ProductionLine1Orders = g.Count(o => o.ProductionLine == '1'),
                    ProductionLine2Orders = g.Count(o => o.ProductionLine == '2'),
                    ProductAOrders = g.Count(o => o.MotorType == 'A'),
                    ProductBOrders = g.Count(o => o.MotorType == 'B'),
                    ProductCOrders = g.Count(o => o.MotorType == 'C'),
                    AverageQuantity = g.Average(o => o.Quantity),
                    // Production completed in this round (orders that reach account manager stage)
                    ProductionCompleted = g.Count(o => o.Status == OrderStatus.ApprovedByAccountManager ||
                                                      o.Status == OrderStatus.Delivered ||
                                                      o.Status == OrderStatus.Completed),
                    // Orders still in production phases
                    OrdersInProduction = g.Count(o => o.Status == OrderStatus.ToProduction ||
                                                     o.Status == OrderStatus.InProduction ||
                                                     o.Status == OrderStatus.AwaitingAccountManagerApproval),
                    // Total quantity being processed
                    TotalQuantity = g.Sum(o => o.Quantity)
                })
                .OrderBy(r => r.RoundId)
                .ToList();

            return new
            {
                ProductionLineMetrics = productionLineMetrics,
                RoundPerformance = roundPerformance,
                CurrentRound = orders.Any() ? orders.Max(o => o.RoundId) : 0,
                SimulationProgress = new
                {
                    OrderingPhaseRounds = 30,
                    ProductionPhaseRounds = 36,
                    TotalRounds = 66,
                    CurrentRound = orders.Any() ? orders.Max(o => o.RoundId) : 0,
                    IsInOrderingPhase = orders.Any() ? orders.Max(o => o.RoundId) < 30 : true,
                    CompletionPercentage = orders.Any() ? (double)orders.Max(o => o.RoundId) / 66 * 100 : 0
                }
            };
        }
    }
}