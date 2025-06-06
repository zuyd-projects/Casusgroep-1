namespace ERPNumber1.Models
{
    public class Product
    {
        public int Id { get; set; }
        public int orderId { get; set; }
        public char type { get; set; }
        public List<Material> materials { get; set; } = new List<Material>();

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
