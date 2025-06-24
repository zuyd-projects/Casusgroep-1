using ERPNumber1.Models;

namespace ERPNumber1.Interfaces
{
    public interface IInventoryRepository
    {
        Task<List<Inventory>> GetAllAsync();
        Task<Inventory?> GetByIdAsync(int id);
        Task<Inventory> CreateAsync(Inventory inventory);
        Task<Inventory?> UpdateAsync(int id, Inventory inventory);
        Task<Inventory?> DeleteAsync(int id);
        Task<bool> InventoryExistsAsync(int id);
    }
}

