using ERPNumber1.Models;

namespace ERPNumber1.Interfaces
{
    public interface ISimulationRepository
    {
        Task<List<Simulation>> GetAllAsync();
        Task<Simulation?> GetByIdAsync(int id);
        Task<Simulation> CreateAsync(Simulation simulationModel);
        Task<Simulation?> UpdateAysnc(int id, Simulation simulationModel);
        Task<Simulation?> DeleteAsync(int id);
        //Task <bool?> Exists(int id);
    }
}
