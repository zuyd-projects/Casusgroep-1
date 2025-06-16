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
                AverageCaseDuration = events.GroupBy(e => e.CaseId)
                    .Where(g => g.Count() > 1)
                    .Select(g => new
                    {
                        CaseId = g.Key,
                        Duration = (g.Max(e => e.Timestamp) - g.Min(e => e.Timestamp)).TotalMinutes
                    })
                    .Average(x => x.Duration),
                DateRange = new
                {
                    Start = events.Any() ? events.Min(e => e.Timestamp) : (DateTime?)null,
                    End = events.Any() ? events.Max(e => e.Timestamp) : (DateTime?)null
                }
            };

            return statistics;
        }
    }
}
