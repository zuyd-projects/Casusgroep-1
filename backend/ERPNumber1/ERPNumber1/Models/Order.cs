using System.Net.Http.Headers;
using System.Text.Json.Serialization;

namespace ERPNumber1.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int RoundId { get; set; }
        
        public int? DeliveryId { get; set; }
        public string? AppUserId { get; set; }
        public char MotorType { get; set; }
        public int Quantity { get; set; }
        public string? Signature { get; set; }
        public char? ProductionLine { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        [JsonIgnore]            
        public List<Product> Products { get; set; } = new List<Product>();
        [JsonIgnore]
        public Delivery? Deliveries { get; set; }
        [JsonIgnore]
        public IEnumerable<AppUser> appUsers { get; set; } = new List<AppUser>();
        [JsonIgnore]
        public Round? Round { get; set; }

        [JsonIgnore]
        public SupplierOrder SupplierOrder { get; set; } = null!;

    }
}
