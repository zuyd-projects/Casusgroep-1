using ERPNumber1.Data;
using ERPNumber1.Interfaces;
using ERPNumber1.Models;
using Microsoft.EntityFrameworkCore;

namespace ERPNumber1.Repository
{
    public class MaterialRepository : IMaterialRepository
    {
        private readonly AppDbContext _context;

        public MaterialRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Material>> GetAllAsync()
        {
            return await _context.Materials.Include(m => m.product).ToListAsync();
        }

        public async Task<Material?> GetByIdAsync(int id)
        {
            return await _context.Materials.Include(m => m.product).FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<Material> CreateAsync(Material material)
        {
            await _context.Materials.AddAsync(material);
            await _context.SaveChangesAsync();
            return material;
        }

        public async Task<Material?> UpdateAsync(int id, Material updatedMaterial)
        {
            var existing = await _context.Materials.FindAsync(id);
            if (existing == null) return null;

            existing.productId = updatedMaterial.productId;
            existing.name = updatedMaterial.name;
            existing.cost = updatedMaterial.cost;
            existing.quantity = updatedMaterial.quantity;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<Material?> DeleteAsync(int id)
        {
            var material = await _context.Materials.FindAsync(id);
            if (material == null) return null;

            _context.Materials.Remove(material);
            await _context.SaveChangesAsync();
            return material;
        }

        public async Task<bool> MaterialExistsAsync(int id)
        {
            return await _context.Materials.AnyAsync(m => m.Id == id);
        }
    }
}
