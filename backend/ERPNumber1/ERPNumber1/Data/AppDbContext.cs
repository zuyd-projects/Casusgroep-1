using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ERPNumber1.Models;
using Microsoft.AspNetCore.Identity;

namespace ERPNumber1.Data
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Simulation> Simulations { get; set; }
        public DbSet<Round> Rounds { get; set; }
        public DbSet<Material> Materials { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Delivery> Deliveries { get; set; }
        public DbSet<Statistics> Statistics { get; set; }
        public DbSet<SupplierOrder> SupplierOrders { get; set; }
        public DbSet<EventLog> EventLogs { get; set; }
        public DbSet<MissingBlocks> MissingBlocks { get; set; }    

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // ✅ Belangrijk voor Identity

            // Simulation - Round (1-many)
            modelBuilder.Entity<Simulation>()
                .HasMany(s => s.Rounds)
                .WithOne(r => r.Simulation)
                .HasForeignKey(r => r.SimulationId);

            // Round - Order (1-many)
            modelBuilder.Entity<Round>()
                .HasMany<Order>()
                .WithOne(o => o.Round)
                .HasForeignKey(o => o.RoundId);

            // Order - Delivery (1-1)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Deliveries)
                .WithOne(d => d.Order)
                .HasForeignKey<Delivery>(d => d.OrderId);

            // Order - SupplierOrder (1-1)

            modelBuilder.Entity<Order>()
                .HasOne(o => o.SupplierOrder)
                .WithOne(so => so.Order)
                .HasForeignKey<SupplierOrder>(so => so.OrderId);


            // Order - Product (1-many)
            modelBuilder.Entity<Order>()
                .HasMany(o => o.Products)
                .WithOne(p => p.Order)
                .HasForeignKey(p => p.orderId);

            // Product - Material (1-many)
            modelBuilder.Entity<Product>()
                .HasMany(p => p.materials)
                .WithOne(m => m.product)
                .HasForeignKey(m => m.productId);

            // Inventory - Material (1-many)
            modelBuilder.Entity<Inventory>()
                .HasMany(i => i.Materials)
                .WithOne()
                .OnDelete(DeleteBehavior.Restrict);

            // AppUser - Inventory (1-1)
            modelBuilder.Entity<AppUser>()
                .HasOne(u => u.Inventory)
                .WithOne(i => i.AppUser)
                .HasForeignKey<Inventory>(i => i.AppUserId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            // AppUser - Order (many-to-one)
            modelBuilder.Entity<AppUser>()
                .HasOne(u => u.Order)
                .WithMany(o => o.appUsers)
                .HasForeignKey(u => u.OrderId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            // Order - MissingBlocks (1-many)
            modelBuilder.Entity<MissingBlocks>()
                .HasOne(mb => mb.Order)
                .WithMany()
                .HasForeignKey(mb => mb.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            List<IdentityRole> roles = new List<IdentityRole>
            {
                new IdentityRole
                {
                    Id = "1",
                    Name = "Admin",
                    NormalizedName = "ADMIN"
                },

                new IdentityRole
                {
                    Id = "2",
                    Name = "User",
                    NormalizedName = "USER"
                },
            };
            modelBuilder.Entity<IdentityRole>().HasData(roles);
        }
    }
}
