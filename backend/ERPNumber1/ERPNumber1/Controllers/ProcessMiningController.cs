using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ERPNumber1.Interfaces;
using ERPNumber1.Models;
using ERPNumber1.Data;
using Microsoft.EntityFrameworkCore;

namespace ERPNumber1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProcessMiningController : ControllerBase
    {
        public Role[] AllowedRoles => [Role.Admin,Role.Planner];
        private readonly IEventLogService _eventLogService;
        private readonly ILogger<ProcessMiningController> _logger;
        private readonly AppDbContext _context;

        public ProcessMiningController(IEventLogService eventLogService, ILogger<ProcessMiningController> logger, AppDbContext context)
        {
            _eventLogService = eventLogService;
            _logger = logger;
            _context = context;
        }

        /// <summary>
        /// Get event logs for a specific case
        /// </summary>
        [HttpGet("case/{caseId}")]
        public async Task<ActionResult<IEnumerable<EventLog>>> GetEventLogsByCase(string caseId)
        {
            try
            {
                var events = await _eventLogService.GetEventLogsByCaseAsync(caseId);
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving event logs for case {CaseId}", caseId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get event logs with filtering options
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventLog>>> GetEventLogs(
            [FromQuery] string? eventType = null,
            [FromQuery] string? resource = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? status = null,
            [FromQuery] int skip = 0,
            [FromQuery] int take = 100)
        {
            try
            {
                var events = await _eventLogService.GetEventLogsAsync(eventType, resource, startDate, endDate, status, skip, take);
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving event logs");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Export event logs to XES format for process mining tools
        /// </summary>
        [HttpGet("export/xes")]
        public async Task<ActionResult> ExportToXes(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var xesData = await _eventLogService.ExportToXesAsync(startDate, endDate);
                
                var fileName = $"process_log_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xes";
                return File(System.Text.Encoding.UTF8.GetBytes(xesData), "application/xml", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to XES format");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get process statistics and analytics
        /// </summary>
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetProcessStatistics(
            [FromQuery] string? eventType = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var statistics = await _eventLogService.GetProcessStatisticsAsync(eventType, startDate, endDate);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving process statistics");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Detect process anomalies and bottlenecks
        /// </summary>
        [HttpGet("anomalies")]
        public async Task<ActionResult<object>> GetProcessAnomalies(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? severity = null)
        {
            try
            {
                var anomalies = await _eventLogService.DetectAnomaliesAsync(startDate, endDate, severity);
                return Ok(anomalies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting process anomalies");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get process flow visualization data
        /// </summary>
        [HttpGet("flow")]
        public async Task<ActionResult<object>> GetProcessFlow(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var flowData = await _eventLogService.GetProcessFlowAsync(startDate, endDate);
                return Ok(flowData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving process flow data");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get delivery time predictions and warnings for planners
        /// </summary>
        [HttpGet("delivery-predictions")]
        public async Task<ActionResult<object>> GetDeliveryPredictions()
        {
            try
            {
                var predictions = await _eventLogService.GetDeliveryPredictionsAsync();
                return Ok(predictions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving delivery predictions");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Seed sample process mining data for demonstration (Development only)
        /// </summary>
        [HttpPost("seed-sample-data")]
        public async Task<ActionResult> SeedSampleData()
        {
            try
            {
                var random = new Random();
                var activities = new[] { "Order Created", "Order Validated", "Production Started", "Quality Check", "Packaging", "Shipped", "Delivered" };
                var resources = new[] { "OrderSystem", "ValidationTeam", "ProductionLine1", "QualityTeam", "PackagingTeam", "ShippingTeam", "DeliveryService" };
                var statuses = new[] { "Completed", "In Progress", "Failed", "Delayed" };

                // Create sample orders with events
                for (int orderId = 1; orderId <= 20; orderId++)
                {
                    var caseId = $"ORDER-{orderId:D4}";
                    var orderStartTime = DateTime.UtcNow.AddDays(-random.Next(1, 30));
                    var currentTime = orderStartTime;

                    for (int activityIndex = 0; activityIndex < activities.Length; activityIndex++)
                    {
                        var activity = activities[activityIndex];
                        var resource = resources[activityIndex];
                        var status = "Completed";
                        
                        // Simulate some delays and failures
                        if (random.NextDouble() < 0.1) // 10% chance of failure
                        {
                            status = "Failed";
                        }
                        else if (random.NextDouble() < 0.2) // 20% chance of delay
                        {
                            status = "Delayed";
                            currentTime = currentTime.AddHours(random.Next(2, 24)); // Add delay
                        }

                        // Add some randomness to activity duration
                        var duration = random.Next(30, 480); // 30 minutes to 8 hours
                        currentTime = currentTime.AddMinutes(duration);

                        await _eventLogService.LogEventAsync(
                            caseId: caseId,
                            activity: activity,
                            resource: resource,
                            eventType: "Order",
                            status: status,
                            additionalData: System.Text.Json.JsonSerializer.Serialize(new { 
                                orderId = orderId,
                                duration = duration,
                                step = activityIndex + 1,
                                totalSteps = activities.Length 
                            }),
                            entityId: orderId.ToString(),
                            priority: orderId % 3 == 0 ? "High" : "Normal",
                            userId: "SYSTEM",
                            sessionId: Guid.NewGuid().ToString()
                        );

                        // Break if order failed
                        if (status == "Failed")
                            break;

                        // For some orders, stop before completion to simulate ongoing orders
                        if (orderId > 15 && activityIndex >= random.Next(2, activities.Length - 1))
                            break;
                    }
                }

                // Add some anomalous events
                for (int i = 0; i < 5; i++)
                {
                    var anomalyCaseId = $"ANOMALY-{i:D3}";
                    await _eventLogService.LogEventAsync(
                        caseId: anomalyCaseId,
                        activity: "Unusual Processing",
                        resource: "AnomalySystem",
                        eventType: "Anomaly",
                        status: "Completed",
                        additionalData: System.Text.Json.JsonSerializer.Serialize(new { 
                            type = "duration_anomaly",
                            expected = 60,
                            actual = random.Next(300, 1000) // Very long duration
                        }),
                        priority: "High"
                    );
                }

                return Ok(new { message = "Sample data seeded successfully", ordersCreated = 20, anomaliesCreated = 5 });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding sample data");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Manually log an event (for testing or special cases)
        /// </summary>
        [HttpPost("log")]
        public async Task<ActionResult> LogEvent([FromBody] LogEventRequest request)
        {
            try
            {
                await _eventLogService.LogEventAsync(
                    request.CaseId,
                    request.Activity,
                    request.Resource,
                    request.EventType ?? "",
                    request.Status ?? "Completed",
                    request.AdditionalData,
                    request.EntityId,
                    request.Priority ?? "Normal",
                    request.UserId,
                    request.SessionId
                );

                return Ok(new { message = "Event logged successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging event manually");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Clean up all database tables (Development only)
        /// </summary>
        [HttpPost("cleanup-database")]
        public async Task<ActionResult> CleanupDatabase()
        {
            try
            {
                _logger.LogInformation("Starting database cleanup...");

                // Clean up tables in the right order (respecting foreign key constraints)
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM [EventLogs]");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM [Deliveries]");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM [Products]");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM [SupplierOrders]");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM [Orders]");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM [Inventories]");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM [Statistics]");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM [Rounds]");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM [Simulations]");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM [Materials]");

                // Reset identity columns if using SQL Server
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('[EventLogs]', RESEED, 0)");
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('[Deliveries]', RESEED, 0)");
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('[Products]', RESEED, 0)");
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('[SupplierOrders]', RESEED, 0)");
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('[Orders]', RESEED, 0)");
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('[Inventories]', RESEED, 0)");
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('[Statistics]', RESEED, 0)");
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('[Rounds]', RESEED, 0)");
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('[Simulations]', RESEED, 0)");
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('[Materials]', RESEED, 0)");

                _logger.LogInformation("Database cleanup completed successfully");

                return Ok(new { message = "Database cleanup completed successfully. All tables have been cleared and identity columns reset." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during database cleanup");
                return StatusCode(500, $"Database cleanup failed: {ex.Message}");
            }
        }
    }

    public class LogEventRequest
    {
        public string CaseId { get; set; } = string.Empty;
        public string Activity { get; set; } = string.Empty;
        public string Resource { get; set; } = string.Empty;
        public string? EventType { get; set; }
        public string? Status { get; set; }
        public string? AdditionalData { get; set; }
        public string? EntityId { get; set; }
        public string? Priority { get; set; }
        public string? UserId { get; set; }
        public string? SessionId { get; set; }
    }
}
