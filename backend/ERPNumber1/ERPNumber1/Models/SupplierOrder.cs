using System.Text.Json.Serialization;

namespace ERPNumber1.Models
{
    public class SupplierOrder
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int OrderId { get; set; }
        public int Quantity { get; set; }
        public string? Status { get; set; }  // Must have "FromProduction" status, that can be used in the supplier page or "From Order" to continue automatically.
        public int round_number { get; set; }
        public bool IsRMA { get; set; }
        public DateTime OrderDate { get; set; }
        [JsonIgnore]
        public AppUser? AppUser { get; set; }
        [JsonIgnore]
        public List<Material>? Materials { get; set; } = new List<Material> ();
        [JsonIgnore]
        public Order Order { get; set; } = null!;
    }
}
