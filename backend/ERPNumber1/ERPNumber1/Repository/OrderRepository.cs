using ERPNumber1.Data;
using ERPNumber1.Interfaces;
using ERPNumber1.Models;
using Microsoft.EntityFrameworkCore;

namespace ERPNumber1.Repository
{
    public class OrderRepository : IOrderRepository
    {

        private readonly AppDbContext _context;
        public OrderRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Order> CreateAsync(Order orderModel)
        {
            await _context.Orders.AddAsync(orderModel);
            await _context.SaveChangesAsync();
            return orderModel;  
        }

        public async Task<Order?> DeleteAsync(int id)
        {
            var orderModel = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id);
            if (orderModel == null)
            {
                return null;
            }

            _context.Orders.Remove(orderModel);
            await _context.SaveChangesAsync();
            return orderModel;
        }

        public async Task<List<Order>> GetAllAsync()
        {
            return await _context.Orders
                .Include(o => o.Products)
                .ToListAsync();
        }

        public async Task<Order?> GetByIdAsync(int id)
        {
           return await _context.Orders.Include(o => o.Products).FirstOrDefaultAsync(o => o.Id == id);  
        }

        public async Task<Order?> UpdateAysnc(int id, Order orderModel)
        {
            var existingOrder = await _context.Orders.FindAsync(id);
            if (existingOrder == null)
            {
                return null;
            }

            existingOrder.RoundId = orderModel.RoundId;
            existingOrder.DeliveryId = orderModel.DeliveryId;
            existingOrder.AppUserId = orderModel.AppUserId;
            existingOrder.MotorType = orderModel.MotorType;
            existingOrder.Quantity = orderModel.Quantity;
            existingOrder.Signature = orderModel.Signature;
            existingOrder.ProductionLine = orderModel.ProductionLine;
            existingOrder.Status = orderModel.Status;

            await _context.SaveChangesAsync();
            return existingOrder;
        }

        public async Task<bool> OrderExistsAsync(int id)
        {
            return await _context.Orders.AnyAsync(o => o.Id == id);
        }
    }
}
