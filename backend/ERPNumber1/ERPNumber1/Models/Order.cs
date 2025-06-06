using System.Net.Http.Headers;

namespace ERPNumber1.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int RoundId { get; set; }
        public int DeliveryId { get; set; }
        public int UserId { get; set; }
        public char MotorType { get; set; }
        public int Quantity { get; set; }
        public string Signature { get; set; }
        public DateTime OrderDate { get; set; }
        public List<Product> Products { get; set; }
        public Order(int Id, int RoundId, int DeliveryId, int UserId, char MotorType, int Quantity, string Signature, DateTime OrderDate, List<Product> Products)
        {
            
        }
    }
}
