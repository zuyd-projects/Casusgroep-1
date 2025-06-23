using System.Text.Json.Serialization;

namespace ERPNumber1.Models
{
    public class Material
    {
        public int Id { get; set; }
        public int productId { get; set; }
        public string? name { get; set; }
        public float cost { get; set; }
        public int quantity { get; set; }
        [JsonIgnore]
        public Product? product { get; set; }

        public Material()
        {
        }

        public Material(int id, int productId, string? name, float cost, int quantity, Product? product)
        {
            Id = id;
            this.productId = productId;
            this.name = name;
            this.cost = cost;
            this.quantity = quantity;
            this.product = product;
        }
    }
}
