using Microsoft.AspNetCore.Identity;

namespace ERPNumber1.Models
{
    public class AppUser :IdentityUser
    {
        public int? OrderId { get; set; }
        public string? Role { get; set; }
        public Inventory? Inventory { get; set;  }
        public Order? Order { get; set; }
    }
}
