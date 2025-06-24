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

    }
}
