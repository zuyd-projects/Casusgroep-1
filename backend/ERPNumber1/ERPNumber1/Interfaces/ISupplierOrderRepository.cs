using ERPNumber1.Models;

namespace ERPNumber1.Interfaces
{
    public interface ISupplierOrderRepository
    {
        Task<List<SupplierOrder>> GetAllAsync();
        Task<SupplierOrder?> GetByIdAsync(int id);
        Task<SupplierOrder> CreateAsync(SupplierOrder supplierOrder);
        Task<SupplierOrder?> UpdateAsync(int id, SupplierOrder supplierOrder);
        Task<SupplierOrder?> DeleteAsync(int id);
        Task<bool> SupplierOrderExistsAsync(int id);
    }
}
