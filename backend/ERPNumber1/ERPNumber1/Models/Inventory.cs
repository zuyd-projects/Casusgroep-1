using Microsoft.EntityFrameworkCore.Storage;

namespace ERPNumber1.Models
{
    public class Inventory
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Quantity { get; set; }
        public List<Product> Products { get; set; }
        public User User { get; set; }
        public Round Round { get; set; }

        public Inventory(int id, string name, int quantity, List<Product> products, User user, Round round)
        {
            Id = id;
            Name = name;
            Quantity = quantity;
            Products = products;
            User = user;
            Round = round;
        }
    }
}
