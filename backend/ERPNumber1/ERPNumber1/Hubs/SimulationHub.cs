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
            // Log when a user connects (useful for debugging reconnection scenarios)
            Console.WriteLine($"User {Context.UserIdentifier} connected to SimulationHub");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Log when a user disconnects
            if (exception != null)
            {
                Console.WriteLine($"User {Context.UserIdentifier} disconnected from SimulationHub with error: {exception.Message}");
            }
            else
            {
                Console.WriteLine($"User {Context.UserIdentifier} disconnected from SimulationHub");
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
