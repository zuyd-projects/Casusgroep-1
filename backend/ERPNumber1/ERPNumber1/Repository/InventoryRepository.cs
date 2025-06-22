using ERPNumber1.Data;
using ERPNumber1.Interfaces;
using ERPNumber1.Models;
using Microsoft.EntityFrameworkCore;

namespace ERPNumber1.Repository
{
    public class InventoryRepository : IInventoryRepository
    {
        private readonly AppDbContext _context;

        public InventoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Inventory>> GetAllAsync()
        {
            return await _context.Inventories
                .Include(i => i.Materials)
                .Include(i => i.AppUser)
                .ToListAsync();
        }

        public async Task<Inventory?> GetByIdAsync(int id)
        {
            return await _context.Inventories
                .Include(i => i.Materials)
                .Include(i => i.AppUser)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task<Inventory> CreateAsync(Inventory inventory)
        {
            await _context.Inventories.AddAsync(inventory);
            await _context.SaveChangesAsync();
            return inventory;
        }

        public async Task<Inventory?> UpdateAsync(int id, Inventory updatedInventory)
        {
            var existing = await _context.Inventories.FindAsync(id);
            if (existing == null) return null;

            existing.Name = updatedInventory.Name;
            existing.Quantity = updatedInventory.Quantity;
            existing.AppUserId = updatedInventory.AppUserId;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<Inventory?> DeleteAsync(int id)
        {
            var inventory = await _context.Inventories.FindAsync(id);
            if (inventory == null) return null;

            _context.Inventories.Remove(inventory);
            await _context.SaveChangesAsync();
            return inventory;
        }

        public async Task<bool> InventoryExistsAsync(int id)
        {
            return await _context.Inventories.AnyAsync(i => i.Id == id);
        }
    }
}

