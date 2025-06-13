namespace ERPNumber1.Models
{
    public class SupplierOrder
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int Quantity { get; set; }
        public string Status { get; set; }
        public int round_number { get; set; }
        public DateTime OrderDate { get; set; }
        public AppUser AppUser { get; set; }
        public List<Material> Materials { get; set; }

        public SupplierOrder()
        {
            
        }
        public SupplierOrder(int id, int userId, int quantity, string status, DateTime orderDate)
        {
            Id = id;
            UserId = userId;
            Quantity = quantity;
            Status = status;
            OrderDate = orderDate;
           
        }
    }
}
