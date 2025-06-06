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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Simulation>()
                .HasMany(s => s.Rounds)
                .WithOne(r => r.Simulation)
                .HasForeignKey(r => r.SimulationId);
        }
        public DbSet<ERPNumber1.Models.User> User { get; set; } = default!;
    }
}
