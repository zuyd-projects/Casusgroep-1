using ERPNumber1.Models;

namespace ERPNumber1.Interfaces
{
    public interface IMaintenanceOrderRepository
    {
        Task<List<MaintenanceOrder>> GetAllAsync();
        Task<List<MaintenanceOrder>> GetByRoundNumberAsync(int roundNumber);
        Task<List<MaintenanceOrder>> GetByProductionLineAsync(int productionLine);
        Task<List<MaintenanceOrder>> GetByStatusAsync(string status);
        Task<MaintenanceOrder?> GetByIdAsync(int id);
        Task<MaintenanceOrder> CreateAsync(MaintenanceOrder maintenanceOrder);
        Task<MaintenanceOrder?> UpdateAsync(int id, MaintenanceOrder maintenanceOrder);
        Task<MaintenanceOrder?> DeleteAsync(int id);
        Task<bool> MaintenanceOrderExistsAsync(int id);
        Task<bool> HasMaintenanceScheduledAsync(int roundNumber, int productionLine);
    }
}
