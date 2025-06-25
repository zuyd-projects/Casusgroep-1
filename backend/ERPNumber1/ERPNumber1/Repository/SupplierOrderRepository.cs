using ERPNumber1.Data;
using ERPNumber1.Interfaces;
using ERPNumber1.Models;
using Microsoft.EntityFrameworkCore;

namespace ERPNumber1.Repository
{
    public class SupplierOrderRepository : ISupplierOrderRepository
    {
        private readonly AppDbContext _context;

        public SupplierOrderRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<SupplierOrder>> GetAllAsync()
        {
            return await _context.SupplierOrders
                .Include(s => s.AppUser)
                .Include(s => s.Order)
                .Include(s => s.Materials)
                .ToListAsync();
        }

        public async Task<SupplierOrder?> GetByIdAsync(int id)
        {
            return await _context.SupplierOrders
                .Include(s => s.AppUser)
                .Include(s => s.Order)
                .Include(s => s.Materials)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<SupplierOrder> CreateAsync(SupplierOrder supplierOrder)
        {
            await _context.SupplierOrders.AddAsync(supplierOrder);
            await _context.SaveChangesAsync();
            return supplierOrder;
        }

        public async Task<SupplierOrder?> UpdateAsync(int id, SupplierOrder updated)
        {
            var existing = await _context.SupplierOrders.FindAsync(id);
            if (existing == null) return null;

            existing.AppUserId = updated.AppUserId;
            existing.OrderId = updated.OrderId;
            existing.Quantity = updated.Quantity;
            existing.Status = updated.Status;
            existing.round_number = updated.round_number;
            existing.DeliveryRound = updated.DeliveryRound;
            existing.IsRMA = updated.IsRMA;
            existing.OrderDate = updated.OrderDate;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<SupplierOrder?> DeleteAsync(int id)
        {
            var supplierOrder = await _context.SupplierOrders.FindAsync(id);
            if (supplierOrder == null) return null;

            _context.SupplierOrders.Remove(supplierOrder);
            await _context.SaveChangesAsync();
            return supplierOrder;
        }

        public async Task<bool> SupplierOrderExistsAsync(int id)
        {
            return await _context.SupplierOrders.AnyAsync(s => s.Id == id);
        }
    }
}

