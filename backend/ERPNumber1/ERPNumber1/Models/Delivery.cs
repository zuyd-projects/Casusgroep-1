namespace ERPNumber1.Models
{
    public class Delivery
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public bool IsDelivered { get; set; }
        public bool QualityCheckPassed { get; set; }
        public bool ApprovedByCustomer { get; set; }
        public Order Order { get; set; }

        public Delivery()
        {
        }
        public Delivery(int id, int orderId, bool isDelivered, bool qualityCheckPassed, bool approvedByCustomer, Order order)
        {
            Id = id;
            OrderId = orderId;
            IsDelivered = isDelivered;
            QualityCheckPassed = qualityCheckPassed;
            ApprovedByCustomer = approvedByCustomer;
            Order = order;
        }
    }
}
