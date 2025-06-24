using ERPNumber1.Models;

namespace ERPNumber1.Interfaces
{
    public interface IMissingBlocksRepository
    {
        Task<List<MissingBlocks>> GetAllAsync();
        Task<List<MissingBlocks>> GetPendingAsync();
        Task<List<MissingBlocks>> GetForRunnerAsync();
        Task<List<MissingBlocks>> GetForSupplierAsync();
        Task<MissingBlocks?> GetByIdAsync(int id);
        Task<List<MissingBlocks>> GetByOrderIdAsync(int orderId);
        Task<MissingBlocks> CreateAsync(MissingBlocks missingBlocks);
        Task<MissingBlocks?> UpdateAsync(int id, MissingBlocks missingBlocks);
        Task<MissingBlocks?> DeleteAsync(int id);
        Task<bool> MissingBlocksExistsAsync(int id);
    }
}
