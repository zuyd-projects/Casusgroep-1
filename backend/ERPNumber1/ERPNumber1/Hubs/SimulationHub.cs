using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using ERPNumber1.Interfaces;

namespace ERPNumber1.Hubs
{
    [Authorize]
    public class SimulationHub : Hub
    {
        public async Task JoinSimulationGroup(string simulationId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"simulation_{simulationId}");
        }

        public async Task LeaveSimulationGroup(string simulationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"simulation_{simulationId}");
        }

        // Add method to help clients reconnect to the correct groups
        public async Task RejoinSimulationGroup(string simulationId)
        {
            // This method can be called after reconnection to ensure the client 
            // is properly added back to the simulation group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"simulation_{simulationId}");
        }

        // Method for clients to request immediate timer sync after joining
        public async Task RequestTimerSync(string simulationId)
        {
            // This will trigger an immediate timer update for this specific client
            Console.WriteLine($"Timer sync requested for simulation {simulationId} by user {Context.UserIdentifier}");
            
            // Send immediate timer update to this specific client
            var simulationService = Context.GetHttpContext()?.RequestServices.GetService<ISimulationService>();
            if (simulationService != null && await simulationService.IsSimulationRunningAsync(int.Parse(simulationId)))
            {
                var remainingTime = simulationService.GetRemainingTimeForCurrentRound(int.Parse(simulationId));
                var response = new 
                { 
                    simulationId = int.Parse(simulationId), 
                    timeLeft = remainingTime,
                    timestamp = DateTime.UtcNow.ToString("O"),
                    syncType = "onDemand"
                };
                
                await Clients.Caller.SendAsync("TimerUpdate", response);
                Console.WriteLine($"Sent immediate timer sync: {remainingTime}s remaining for simulation {simulationId} to user {Context.UserIdentifier}");
            }
            else
            {
                Console.WriteLine($"Could not send timer sync for simulation {simulationId} - simulation not running or service unavailable");
            }
        }

        public override async Task OnConnectedAsync()
        {
            // Enhanced logging for Windows debugging
            var httpContext = Context.GetHttpContext();
            var userAgent = httpContext?.Request.Headers["User-Agent"].ToString() ?? "Unknown";
            var transport = Context.Features.Get<Microsoft.AspNetCore.Http.Connections.Features.IHttpTransportFeature>()?.TransportType.ToString() ?? "Unknown";
            
            Console.WriteLine($"✅ SignalR Connection Established:");
            Console.WriteLine($"   User: {Context.UserIdentifier ?? "Anonymous"}");
            Console.WriteLine($"   Connection ID: {Context.ConnectionId}");
            Console.WriteLine($"   Transport: {transport}");
            Console.WriteLine($"   User Agent: {userAgent}");
            Console.WriteLine($"   Remote IP: {httpContext?.Connection?.RemoteIpAddress}");
            
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Enhanced logging for Windows debugging
            if (exception != null)
            {
                Console.WriteLine($"❌ SignalR Disconnection with error:");
                Console.WriteLine($"   User: {Context.UserIdentifier ?? "Anonymous"}");
                Console.WriteLine($"   Connection ID: {Context.ConnectionId}");
                Console.WriteLine($"   Error: {exception.Message}");
                Console.WriteLine($"   Stack Trace: {exception.StackTrace}");
            }
            else
            {
                Console.WriteLine($"✅ SignalR Normal Disconnection:");
                Console.WriteLine($"   User: {Context.UserIdentifier ?? "Anonymous"}");
                Console.WriteLine($"   Connection ID: {Context.ConnectionId}");
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
