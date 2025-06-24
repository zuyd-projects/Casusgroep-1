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

            var executedContext = await next();

            try
            {
                var eventLogService = executedContext.HttpContext.RequestServices.GetService<IEventLogService>();
                if (eventLogService == null) return;

                var endTime = DateTime.UtcNow;
                var userId = executedContext.HttpContext.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "System";
                var resource = $"{executedContext.Controller.GetType().Name}.{executedContext.ActionDescriptor.DisplayName}";

                // Safely get session ID with fallback options
                string? sessionId;
                try
                {
                    sessionId = executedContext.HttpContext.Session?.Id;
                }
                catch (InvalidOperationException)
                {
                    sessionId = executedContext.HttpContext.Connection?.Id ?? Guid.NewGuid().ToString("N");
                }

                var caseId = ExtractCaseId(executedContext);
                var status = executedContext.Exception == null ? "Completed" : "Failed";
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
                    null,
                    userId
                );
            }
            catch (Exception ex)
            {
                var logger = context.HttpContext.RequestServices.GetService<ILogger<LogEventAttribute>>();
                logger?.LogError(ex, "Failed to log event for action {Action}", _activity);
            }
        }

        private string ExtractCaseId(ActionExecutedContext context)
        {
            if (context.RouteData.Values.TryGetValue("id", out var routeId))
            {
                return $"{_eventType}_{routeId}";
            }

            if (context.RouteData.Values.TryGetValue("simulationId", out var simId))
            {
                return $"Simulation_{simId}";
            }

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

            try
            {
                return context.HttpContext.Session?.Id ?? $"{_eventType}_{Guid.NewGuid():N}";
            }
            catch (InvalidOperationException)
            {
                return context.HttpContext.Connection?.Id ?? $"{_eventType}_{Guid.NewGuid():N}";
            }
        }

        private string? PrepareAdditionalData(ActionExecutedContext context)
        {
            try
            {
                var data = new Dictionary<string, object>
                {
                    ["method"] = context.HttpContext.Request.Method,
                    ["path"] = context.HttpContext.Request.Path
                };

                if (_logRequest && _actionArguments != null && _actionArguments.Any())
                {
                    data["request"] = _actionArguments;
                }

                if (_logResponse && context.Exception == null && context.Result != null)
                {
                    data["response"] = new { type = context.Result.GetType().Name };
                }

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