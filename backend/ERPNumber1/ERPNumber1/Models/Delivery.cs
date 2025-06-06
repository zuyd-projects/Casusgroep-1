namespace ERPNumber1.Models
{
    public class Delivery
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public bool IsDelivered { get; set; }
        public bool QualityCheckPassed { get; set; }
        public bool ApprovedByCustomer { get; set; }

        public Delivery(int Id, int OrderId, bool IsDelivered, bool QualityCheckPassed, bool ApprovedByCustomer)
        {
            
        }
    }
}
