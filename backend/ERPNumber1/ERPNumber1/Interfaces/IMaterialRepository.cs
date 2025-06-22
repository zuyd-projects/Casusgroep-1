using ERPNumber1.Models;

namespace ERPNumber1.Interfaces
{
    public interface IMaterialRepository
    {
        Task<List<Material>> GetAllAsync();
        Task<Material?> GetByIdAsync(int id);
        Task<Material> CreateAsync(Material material);
        Task<Material?> UpdateAsync(int id, Material material);
        Task<Material?> DeleteAsync(int id);
        Task<bool> MaterialExistsAsync(int id);
    }
}
