using Microsoft.EntityFrameworkCore.Storage;
using System.Text.Json.Serialization;

namespace ERPNumber1.Models
{
    public class Inventory
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public int Quantity { get; set; }
        public string? AppUserId { get; set; }
        [JsonIgnore]
        public AppUser? AppUser { get; set; }
        [JsonIgnore]
        public List<Material>? Materials { get; set; } = new List<Material>();
    }
}
