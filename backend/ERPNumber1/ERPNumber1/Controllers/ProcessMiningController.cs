using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ERPNumber1.Interfaces;
using ERPNumber1.Models;

namespace ERPNumber1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProcessMiningController : ControllerBase
    {
        private readonly IEventLogService _eventLogService;
        private readonly ILogger<ProcessMiningController> _logger;

        public ProcessMiningController(IEventLogService eventLogService, ILogger<ProcessMiningController> logger)
        {
            _eventLogService = eventLogService;
            _logger = logger;
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
