using ERPNumber1.Data;
using ERPNumber1.Interfaces;
using ERPNumber1.Models;
using Microsoft.EntityFrameworkCore;
using System.CodeDom;

namespace ERPNumber1.Repository
{
    public class SimulationRepository : ISimulationRepository
    {
        private readonly AppDbContext _context;
        public SimulationRepository(AppDbContext context)
        {
            _context = context; 
        }
        public async Task<Simulation> CreateAsync(Simulation simulationModel)
        {
            await _context.Simulations.AddAsync(simulationModel);
            await _context.SaveChangesAsync();
            return simulationModel;
        }

        public async Task<Simulation?> DeleteAsync(int id)
        {
            var simulationModel = await _context.Simulations.FirstOrDefaultAsync(s => s.Id == id);
            if (simulationModel == null)
            {
                return null;
            }

            _context.Simulations.Remove(simulationModel);
            await _context.SaveChangesAsync();
            return simulationModel;
        }

        //public async Task<bool?> Exists(int id)
        //{
        //     return _context.Simulations.Any(e => e.Id == id);
        //}

        public async Task<List<Simulation>> GetAllAsync()
        {
            return await _context.Simulations.ToListAsync();
        }

        public async Task<Simulation?> GetByIdAsync(int id)
        {
            return await _context.Simulations.FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Simulation?> UpdateAysnc(int id, Simulation simulationModel)
        {
            var existingSimulation = await _context.Simulations.FindAsync(id);
            if (existingSimulation == null)
            {
                return null;
            }

            existingSimulation.Name = simulationModel.Name;
            existingSimulation.Date = simulationModel.Date;

            await _context.SaveChangesAsync();
            return existingSimulation;
        }

      
    }
}
