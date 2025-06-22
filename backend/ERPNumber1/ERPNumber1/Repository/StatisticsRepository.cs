using ERPNumber1.Data;
using ERPNumber1.Interfaces;
using ERPNumber1.Models;
using Microsoft.EntityFrameworkCore;

namespace ERPNumber1.Repository
{
    public class StatisticsRepository : IStatisticsRepository
    {
        private readonly AppDbContext _context;

        public StatisticsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Statistics>> GetAllAsync()
        {
            return await _context.Statistics.Include(s => s.Simulation).ToListAsync();
        }

        public async Task<Statistics?> GetByIdAsync(int id)
        {
            return await _context.Statistics.Include(s => s.Simulation).FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Statistics> CreateAsync(Statistics statistics)
        {
            await _context.Statistics.AddAsync(statistics);
            await _context.SaveChangesAsync();
            return statistics;
        }

        public async Task<Statistics?> UpdateAsync(int id, Statistics updated)
        {
            var existing = await _context.Statistics.FindAsync(id);
            if (existing == null) return null;

            existing.SimulationId = updated.SimulationId;
            existing.TotalOrders = updated.TotalOrders;
            existing.DeliveryRate = updated.DeliveryRate;
            existing.Revenue = updated.Revenue;
            existing.Cost = updated.Cost;
            existing.NetProfit = updated.NetProfit;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<Statistics?> DeleteAsync(int id)
        {
            var statistics = await _context.Statistics.FindAsync(id);
            if (statistics == null) return null;

            _context.Statistics.Remove(statistics);
            await _context.SaveChangesAsync();
            return statistics;
        }

        public async Task<bool> StatisticsExistsAsync(int id)
        {
            return await _context.Statistics.AnyAsync(s => s.Id == id);
        }
    }
}
