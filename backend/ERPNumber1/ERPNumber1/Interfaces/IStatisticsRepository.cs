using ERPNumber1.Models;

namespace ERPNumber1.Interfaces
{
    public interface IStatisticsRepository
    {
        Task<List<Statistics>> GetAllAsync();
        Task<Statistics?> GetByIdAsync(int id);
        Task<Statistics> CreateAsync(Statistics statistics);
        Task<Statistics?> UpdateAsync(int id, Statistics statistics);
        Task<Statistics?> DeleteAsync(int id);
        Task<bool> StatisticsExistsAsync(int id);
    }
}
