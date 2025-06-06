using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;
using ERPNumber1.Models;

namespace ERPNumber1.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Simulation> Simulations { get; set; }
        public DbSet<Round> Rounds { get; set; }
        public DbSet<ERPNumber1.Models.User> User { get; set; } = default!;

        // Added DbSet for Product and Material
        public DbSet<Product> Products { get; set; }
        public DbSet<Material> Materials { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Simulation>()
                .HasMany(s => s.Rounds)
                .WithOne(r => r.Simulation)
                .HasForeignKey(r => r.SimulationId);

            // Configure Product-Material relationship
            modelBuilder.Entity<Product>()
                .HasMany(p => p.materials)
                .WithOne(m => m.product)
                .HasForeignKey(m => m.productId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
