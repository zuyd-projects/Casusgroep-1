using ERPNumber1.Data;
using ERPNumber1.Interfaces;
using ERPNumber1.Models;
using Microsoft.EntityFrameworkCore;

namespace ERPNumber1.Repository
{
    public class RoundRepository : IRoundRepository
    {
        private readonly AppDbContext _context;

        public RoundRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Round>> GetAllAsync()
        {
            return await _context.Rounds.Include(r => r.Simulation).ToListAsync();
        }

        public async Task<Round?> GetByIdAsync(int id)
        {
            return await _context.Rounds.Include(r => r.Simulation).FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<Round> CreateAsync(Round round)
        {
            await _context.Rounds.AddAsync(round);
            await _context.SaveChangesAsync();
            return round;
        }

        public async Task<Round?> UpdateAsync(int id, Round updatedRound)
        {
            var existingRound = await _context.Rounds.FindAsync(id);
            if (existingRound == null) return null;

            existingRound.SimulationId = updatedRound.SimulationId;
            existingRound.RoundNumber = updatedRound.RoundNumber;

            await _context.SaveChangesAsync();
            return existingRound;
        }

        public async Task<Round?> DeleteAsync(int id)
        {
            var round = await _context.Rounds.FindAsync(id);
            if (round == null) return null;

            _context.Rounds.Remove(round);
            await _context.SaveChangesAsync();
            return round;
        }

        public async Task<bool> RoundExistsAsync(int id)
        {
            return await _context.Rounds.AnyAsync(r => r.Id == id);
        }
    }
}
