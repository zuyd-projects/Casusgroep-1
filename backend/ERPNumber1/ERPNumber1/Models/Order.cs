using System.Net.Http.Headers;

namespace ERPNumber1.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int RoundId { get; set; }
        public int? DeliveryId { get; set; }
        public string? AppUserId { get; set; }
        public char MotorType { get; set; }
        public int Quantity { get; set; }
        public string Signature { get; set; }
        public DateTime OrderDate { get; set; }
        public List<Product> Products { get; set; } = new List<Product>();
        public Delivery Deliveries { get; set; }
        public IEnumerable<AppUser> appUsers { get; set; } = new List<AppUser>();
        public Round Round { get; set; }

        public Order()
        {
        }
        public Order(int id, int roundId, int deliveryId, string userId, char motorType, int quantity, string signature, DateTime orderDate, List<Product> products, Delivery deliveries)
        {
            Id = id;
            RoundId = roundId;
            DeliveryId = deliveryId;
            AppUserId = userId;
            MotorType = motorType;
            Quantity = quantity;
            Signature = signature;
            OrderDate = orderDate;
            Products = products;
            Deliveries = deliveries;
        }
    }
}
