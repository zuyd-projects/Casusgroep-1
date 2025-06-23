using ERPNumber1.Data;
using ERPNumber1.Interfaces;
using ERPNumber1.Models;
using Microsoft.EntityFrameworkCore;

namespace ERPNumber1.Repository
{
    public class DeliveryRepository : IDeliveryRepository
    {
        private readonly AppDbContext _context;

        public DeliveryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Delivery>> GetAllAsync()
        {
            return await _context.Deliveries.Include(d => d.Order).ToListAsync();
        }

        public async Task<Delivery?> GetByIdAsync(int id)
        {
            return await _context.Deliveries.Include(d => d.Order).FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<Delivery> CreateAsync(Delivery delivery)
        {
            await _context.Deliveries.AddAsync(delivery);
            await _context.SaveChangesAsync();
            return delivery;
        }

        public async Task<Delivery?> UpdateAsync(int id, Delivery updatedDelivery)
        {
            var existing = await _context.Deliveries.FindAsync(id);
            if (existing == null) return null;

            existing.OrderId = updatedDelivery.OrderId;
            existing.IsDelivered = updatedDelivery.IsDelivered;
            existing.QualityCheckPassed = updatedDelivery.QualityCheckPassed;
            existing.ApprovedByCustomer = updatedDelivery.ApprovedByCustomer;
            existing.DeliveryRound = updatedDelivery.DeliveryRound;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<Delivery?> DeleteAsync(int id)
        {
            var delivery = await _context.Deliveries.FindAsync(id);
            if (delivery == null) return null;

            _context.Deliveries.Remove(delivery);
            await _context.SaveChangesAsync();
            return delivery;
        }

        public async Task<bool> DeliveryExistsAsync(int id)
        {
            return await _context.Deliveries.AnyAsync(d => d.Id == id);
        }
    }
}
