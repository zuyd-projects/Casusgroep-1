using ERPNumber1.Models;

namespace ERPNumber1.Interfaces
{
    public interface IDeliveryRepository
    {
        Task<List<Delivery>> GetAllAsync();
        Task<Delivery?> GetByIdAsync(int id);
        Task<Delivery> CreateAsync(Delivery delivery);
        Task<Delivery?> UpdateAsync(int id, Delivery delivery);
        Task<Delivery?> DeleteAsync(int id);
        Task<bool> DeliveryExistsAsync(int id);
    }
}

