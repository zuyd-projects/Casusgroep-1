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
            }
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}
