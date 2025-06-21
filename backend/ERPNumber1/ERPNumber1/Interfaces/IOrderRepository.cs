using ERPNumber1.Models;

namespace ERPNumber1.Interfaces
{
    public interface IOrderRepository
    {
        Task<List<Order>> GetAllAsync();
        Task<Order?> GetByIdAsync(int id);
        Task<Order> CreateAsync(Order orderModel);
        Task<Order?> UpdateAysnc(int id, Order orderModel);
        Task<Order?> DeleteAsync(int id);
        Task<bool> OrderExistsAsync(int id);
    }
}
