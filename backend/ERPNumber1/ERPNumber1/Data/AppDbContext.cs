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

        // Added DbSet for Delivery, Order, and Inventory
        public DbSet<Delivery> Deliveries { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Inventory> Inventories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Simulation>()
                .HasMany(s => s.Rounds)
                .WithOne(r => r.Simulation)
                .HasForeignKey(r => r.SimulationId);

            // Product-Material relationship
            modelBuilder.Entity<Product>()
                .HasMany(p => p.materials)
                .WithOne(m => m.product)
                .HasForeignKey(m => m.productId)
                .OnDelete(DeleteBehavior.Cascade);

            // Order-Delivery one-to-one relationship
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Deliveries)
                .WithOne(d => d.Order)
                .HasForeignKey<Delivery>(d => d.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Inventory-Products one-to-many
            modelBuilder.Entity<Inventory>()
                .HasMany(i => i.Products)
                .WithOne()
                .OnDelete(DeleteBehavior.Cascade);

            // Inventory-User many-to-one (or one-to-one if needed)
            modelBuilder.Entity<Inventory>()
                .HasOne(i => i.User)
                .WithMany()
                .OnDelete(DeleteBehavior.Restrict);

            // Inventory-Round many-to-one (or one-to-one if needed)
            modelBuilder.Entity<Inventory>()
                .HasOne(i => i.Round)
                .WithMany()
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
