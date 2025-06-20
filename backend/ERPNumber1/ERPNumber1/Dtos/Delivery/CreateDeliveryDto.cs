namespace ERPNumber1.Dtos.Delivery
{
    public class CreateDeliveryDto
    {
        public int OrderId { get; set; }
        public bool IsDelivered { get; set; }
        public bool QualityCheckPassed { get; set; }
        public bool ApprovedByCustomer { get; set; }
    }
}
