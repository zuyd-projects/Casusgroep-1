using System.Text.Json.Serialization;

namespace ERPNumber1.Models
{
    public class Product
    {
        public int Id { get; set; }
        public int orderId { get; set; }
        public char type { get; set; }
        [JsonIgnore]
        public List<Material> materials { get; set; } = new List<Material>();
        [JsonIgnore]
        public Order? Order { get; set; }   

        public Product()
        {
        }

        public Product(int id, int orderId, char type, List<Material> materials)
        {
            Id = id;
            this.orderId = orderId;
            this.type = type;
            this.materials = materials;
        }
    }
}
