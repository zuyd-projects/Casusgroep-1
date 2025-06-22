using ERPNumber1.Models;

namespace ERPNumber1.Interfaces
{
    public interface IRoundRepository
    {
        Task<List<Round>> GetAllAsync();
        Task<Round?> GetByIdAsync(int id);
        Task<Round> CreateAsync(Round round);
        Task<Round?> UpdateAsync(int id, Round round);
        Task<Round?> DeleteAsync(int id);
        Task<bool> RoundExistsAsync(int id);
    }
}

