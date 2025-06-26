using ERPNumber1.Data;
using ERPNumber1.Interfaces;
using ERPNumber1.Models;
using Microsoft.EntityFrameworkCore;

namespace ERPNumber1.Repository
{
    public class MaintenanceOrderRepository : IMaintenanceOrderRepository
    {
        private readonly AppDbContext _context;

        public MaintenanceOrderRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<MaintenanceOrder>> GetAllAsync()
        {
            return await _context.MaintenanceOrders
                .OrderBy(mo => mo.RoundNumber)
                .ThenBy(mo => mo.ProductionLine)
                .ToListAsync();
        }

        public async Task<List<MaintenanceOrder>> GetByRoundNumberAsync(int roundNumber)
        {
            return await _context.MaintenanceOrders
                .Where(mo => mo.RoundNumber == roundNumber)
                .OrderBy(mo => mo.ProductionLine)
                .ToListAsync();
        }

        public async Task<List<MaintenanceOrder>> GetByProductionLineAsync(int productionLine)
        {
            return await _context.MaintenanceOrders
                .Where(mo => mo.ProductionLine == productionLine)
                .OrderBy(mo => mo.RoundNumber)
                .ToListAsync();
        }

        public async Task<List<MaintenanceOrder>> GetByStatusAsync(string status)
        {
            return await _context.MaintenanceOrders
                .Where(mo => mo.Status == status)
                .OrderBy(mo => mo.RoundNumber)
                .ThenBy(mo => mo.ProductionLine)
                .ToListAsync();
        }

        public async Task<MaintenanceOrder?> GetByIdAsync(int id)
        {
            return await _context.MaintenanceOrders
                .FirstOrDefaultAsync(mo => mo.Id == id);
        }

        public async Task<MaintenanceOrder> CreateAsync(MaintenanceOrder maintenanceOrder)
        {
            _context.MaintenanceOrders.Add(maintenanceOrder);
            await _context.SaveChangesAsync();
            return maintenanceOrder;
        }

        public async Task<MaintenanceOrder?> UpdateAsync(int id, MaintenanceOrder maintenanceOrder)
        {
            var existingMaintenanceOrder = await _context.MaintenanceOrders.FirstOrDefaultAsync(mo => mo.Id == id);
            if (existingMaintenanceOrder == null)
                return null;

            existingMaintenanceOrder.RoundNumber = maintenanceOrder.RoundNumber;
            existingMaintenanceOrder.ProductionLine = maintenanceOrder.ProductionLine;
            existingMaintenanceOrder.Status = maintenanceOrder.Status;
            existingMaintenanceOrder.Description = maintenanceOrder.Description;

            await _context.SaveChangesAsync();
            return existingMaintenanceOrder;
        }

        public async Task<MaintenanceOrder?> DeleteAsync(int id)
        {
            var maintenanceOrder = await _context.MaintenanceOrders.FirstOrDefaultAsync(mo => mo.Id == id);
            if (maintenanceOrder == null)
                return null;

            _context.MaintenanceOrders.Remove(maintenanceOrder);
            await _context.SaveChangesAsync();
            return maintenanceOrder;
        }

        public async Task<bool> MaintenanceOrderExistsAsync(int id)
        {
            return await _context.MaintenanceOrders.AnyAsync(mo => mo.Id == id);
        }

        public async Task<bool> HasMaintenanceScheduledAsync(int roundNumber, int productionLine)
        {
            return await _context.MaintenanceOrders
                .AnyAsync(mo => mo.RoundNumber == roundNumber && 
                               mo.ProductionLine == productionLine && 
                               mo.Status != "Completed");
        }
    }
}
