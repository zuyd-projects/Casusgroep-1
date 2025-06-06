using Microsoft.EntityFrameworkCore.Storage;

namespace ERPNumber1.Models
{
    public class Inventory
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Quantity { get; set; }
        public List<Material> Materials { get; set; }

        public Inventory(int Id, string Name, int Quantity, List<Material> Materials)
        {
            
        }
    }
}
