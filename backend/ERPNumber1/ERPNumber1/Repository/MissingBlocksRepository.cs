using ERPNumber1.Data;
using ERPNumber1.Interfaces;
using ERPNumber1.Models;
using Microsoft.EntityFrameworkCore;

namespace ERPNumber1.Repository
{
    public class MissingBlocksRepository : IMissingBlocksRepository
    {
        private readonly AppDbContext _context;

        public MissingBlocksRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<MissingBlocks>> GetAllAsync()
        {
            return await _context.MissingBlocks
                .Include(mb => mb.Order)
                .OrderByDescending(mb => mb.ReportedAt)
                .ToListAsync();
        }

        public async Task<List<MissingBlocks>> GetPendingAsync()
        {
            return await _context.MissingBlocks
                .Include(mb => mb.Order)
                .Where(mb => mb.Status == "Pending")
                .OrderByDescending(mb => mb.ReportedAt)
                .ToListAsync();
        }

        public async Task<List<MissingBlocks>> GetForRunnerAsync()
        {
            // Get missing blocks that haven't been attempted by runner yet
            return await _context.MissingBlocks
                .Include(mb => mb.Order)
                .Where(mb => mb.Status == "Pending" && !mb.RunnerAttempted)
                .OrderByDescending(mb => mb.ReportedAt)
                .ToListAsync();
        }

        public async Task<List<MissingBlocks>> GetForSupplierAsync()
        {
            // Get missing blocks that runner has attempted but couldn't deliver
            return await _context.MissingBlocks
                .Include(mb => mb.Order)
                .Where(mb => mb.Status == "Pending" && mb.RunnerAttempted)
                .OrderByDescending(mb => mb.ReportedAt)
                .ToListAsync();
        }

        public async Task<MissingBlocks?> GetByIdAsync(int id)
        {
            return await _context.MissingBlocks
                .Include(mb => mb.Order)
                .FirstOrDefaultAsync(mb => mb.Id == id);
        }

        public async Task<List<MissingBlocks>> GetByOrderIdAsync(int orderId)
        {
            return await _context.MissingBlocks
                .Include(mb => mb.Order)
                .Where(mb => mb.OrderId == orderId)
                .OrderByDescending(mb => mb.ReportedAt)
                .ToListAsync();
        }

        public async Task<MissingBlocks> CreateAsync(MissingBlocks missingBlocks)
        {
            await _context.MissingBlocks.AddAsync(missingBlocks);
            await _context.SaveChangesAsync();
            return missingBlocks;
        }

        public async Task<MissingBlocks?> UpdateAsync(int id, MissingBlocks updated)
        {
            var existingMissingBlocks = await _context.MissingBlocks.FindAsync(id);
            if (existingMissingBlocks == null)
            {
                return null;
            }

            // Update only the fields that should be updatable
            existingMissingBlocks.Status = updated.Status;
            existingMissingBlocks.RunnerAttempted = updated.RunnerAttempted;
            existingMissingBlocks.RunnerAttemptedAt = updated.RunnerAttemptedAt;
            existingMissingBlocks.ResolvedBy = updated.ResolvedBy;
            existingMissingBlocks.ResolvedAt = updated.ResolvedAt;

            await _context.SaveChangesAsync();
            return existingMissingBlocks;
        }

        public async Task<MissingBlocks?> DeleteAsync(int id)
        {
            var missingBlocks = await _context.MissingBlocks.FindAsync(id);
            if (missingBlocks == null)
            {
                return null;
            }

            _context.MissingBlocks.Remove(missingBlocks);
            await _context.SaveChangesAsync();
            return missingBlocks;
        }

        public async Task<bool> MissingBlocksExistsAsync(int id)
        {
            return await _context.MissingBlocks.AnyAsync(mb => mb.Id == id);
        }
    }
}
