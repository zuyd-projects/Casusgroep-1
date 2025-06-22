using ERPNumber1.Models;

namespace ERPNumber1.Interfaces
{
    public interface IProductRepository
    {
        Task<List<Product>> GetAllAsync();
        Task<Product?> GetByIdAsync(int id);
        Task<Product> CreateAsync(Product product);
        Task<Product?> UpdateAsync(int id, Product product);
        Task<Product?> DeleteAsync(int id);
        Task<bool> ProductExistsAsync(int id);
    }
}
