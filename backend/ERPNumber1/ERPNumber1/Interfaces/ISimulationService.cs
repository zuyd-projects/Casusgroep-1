using ERPNumber1.Models;

namespace ERPNumber1.Interfaces
{
    public interface ISimulationService
    {
        Task<bool> StartSimulationAsync(int simulationId);
        Task<bool> StopSimulationAsync(int simulationId);
        Task<Round?> GetCurrentRoundAsync(int simulationId);
        Task<bool> IsSimulationRunningAsync(int simulationId);
        int GetRoundDurationSeconds();
        int GetMaxRounds();
        int GetRemainingTimeForCurrentRound(int simulationId);
    }
}
