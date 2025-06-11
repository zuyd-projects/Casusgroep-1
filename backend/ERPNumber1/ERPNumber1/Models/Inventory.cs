using Microsoft.EntityFrameworkCore.Storage;

namespace ERPNumber1.Models
{
    public class Inventory
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Quantity { get; set; }
        public List<Material> Materials { get; set; }
        public User User { get; set; }
        public Round Round { get; set; }

        public Inventory(int id, string name, int quantity, List<Material> materials, User user, Round round)
        {
            Id = id;
            Name = name;
            Quantity = quantity;
            Materials = materials;
            User = user;
            Round = round;
        }
    }
}
