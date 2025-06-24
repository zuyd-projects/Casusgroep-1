using Microsoft.AspNetCore.Identity;
using System.Text.Json.Serialization;

namespace ERPNumber1.Models
{
    public class AppUser :IdentityUser
    {
        public int? OrderId { get; set; }
        public string? Role { get; set; }
        [JsonIgnore]
        public Inventory? Inventory { get; set;  }
        [JsonIgnore]
        public Order? Order { get; set; }
    }
}
