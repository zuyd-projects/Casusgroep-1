using Microsoft.AspNetCore.Mvc.Filters;
using ERPNumber1.Interfaces;
using System.Text.Json;
using System.Security.Claims;

namespace ERPNumber1.Attributes
{
    /// <summary>
    /// Attribute to automatically log events for controller actions
    /// </summary>
    public class LogEventAttribute : ActionFilterAttribute
    {
        private readonly string _eventType;
        private readonly string _activity;
        private readonly bool _logRequest;
        private readonly bool _logResponse;
        private DateTime _startTime;
        private IDictionary<string, object?>? _actionArguments;

        public LogEventAttribute(string eventType, string activity, bool logRequest = false, bool logResponse = false)
        {
            _eventType = eventType;
            _activity = activity;
            _logRequest = logRequest;
            _logResponse = logResponse;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            _startTime = DateTime.UtcNow;
            _actionArguments = context.ActionArguments;

            // Proceed to the next action in the pipeline
            var executedContext = await next();

            try
            {
                var eventLogService = executedContext.HttpContext.RequestServices.GetService<IEventLogService>();
                if (eventLogService == null) return;

                var endTime = DateTime.UtcNow;
                var userId = executedContext.HttpContext.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "System";
                var resource = $"{executedContext.Controller.GetType().Name}.{executedContext.ActionDescriptor.DisplayName}";
                
                // Safely get session ID if sessions are configured
                string? sessionId = null;
                try
                {
                    sessionId = executedContext.HttpContext.Session?.Id;
                }
                catch (InvalidOperationException)
                {
                    // Sessions not configured, use null
                    sessionId = null;
                }

                // Try to extract case ID from route parameters or request body
                var caseId = ExtractCaseId(executedContext);

                // Determine status based on response
                var status = executedContext.Exception == null ? "Completed" : "Failed";

                // Prepare additional data
                var additionalData = PrepareAdditionalData(executedContext);

                await eventLogService.LogTimedEventAsync(
                    caseId,
                    _activity,
                    resource,
                    _eventType,
                    _startTime,
                    endTime,
                    status,
                    additionalData,
                    null, // entityId - could be extracted from response
                    userId
                );
            }
            catch (Exception ex)
            {
                // Log the error but don't break the main flow
                var logger = context.HttpContext.RequestServices.GetService<ILogger<LogEventAttribute>>();
                logger?.LogError(ex, "Failed to log event for action {Action}", _activity);
            }
        }

        private string ExtractCaseId(ActionExecutedContext context)
        {
            // Try to get ID from route parameters
            if (context.RouteData.Values.TryGetValue("id", out var routeId))
            {
                return $"{_eventType}_{routeId}";
            }

            // Try to get simulation ID or other identifier
            if (context.RouteData.Values.TryGetValue("simulationId", out var simId))
            {
                return $"Simulation_{simId}";
            }

            // Try to extract from action parameters
            var actionParams = context.ActionDescriptor.Parameters;
            if (_actionArguments != null)
            {
                foreach (var param in actionParams)
                {
                    if (param.Name.ToLower().Contains("id") && _actionArguments.TryGetValue(param.Name, out var paramValue))
                    {
                        return $"{_eventType}_{paramValue}";
                    }
                }
            }

            // Fallback to session ID or generate one
            string? sessionId = null;
            try
            {
                sessionId = context.HttpContext.Session?.Id;
            }
            catch (InvalidOperationException)
            {
                // Sessions not configured, sessionId remains null
            }
            
            return sessionId ?? $"{_eventType}_{Guid.NewGuid():N}";
        }

        private string? PrepareAdditionalData(ActionExecutedContext context)
        {
            try
            {
                var data = new Dictionary<string, object>();

                // Add HTTP method and path
                data["method"] = context.HttpContext.Request.Method;
                data["path"] = context.HttpContext.Request.Path;

                // Add request data if enabled
                if (_logRequest && _actionArguments != null && _actionArguments.Any())
                {
                    data["request"] = _actionArguments;
                }

                // Add response data if enabled and successful
                if (_logResponse && context.Exception == null && context.Result != null)
                {
                    data["response"] = new { type = context.Result.GetType().Name };
                }

                // Add error information if failed
                if (context.Exception != null)
                {
                    data["error"] = new 
                    { 
                        message = context.Exception.Message,
                        type = context.Exception.GetType().Name
                    };
                }

                return JsonSerializer.Serialize(data);
            }
            catch
            {
                return null;
            }
        }
    }
}
