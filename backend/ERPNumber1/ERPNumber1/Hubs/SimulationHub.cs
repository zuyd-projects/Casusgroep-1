using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

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

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}
