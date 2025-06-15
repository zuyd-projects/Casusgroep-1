using Microsoft.CodeAnalysis.Scripting;
using System.Globalization;
using BCrypt.Net;
using System.ComponentModel.DataAnnotations;


namespace ERPNumber1.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Role { get; set; }
        public string Email { get; set; }
        public string HashedPassword { get; set; }
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public Inventory? Inventory { get; set; }

        public User()
        {
        }

        public User(int id, string name, string role, string email,  Inventory inventory)
        {
            Id = id;
            Name = name;
            Role = role;
            Email = email;
            Inventory = inventory;
        }

        public void SetPassword(string plainPassword)
        {
            HashedPassword = BCrypt.Net.BCrypt.HashPassword(plainPassword);
        }

        public bool VerifyPassword(string plainPassword)
        {
            return BCrypt.Net.BCrypt.Verify(plainPassword, HashedPassword);
        }
    }
}