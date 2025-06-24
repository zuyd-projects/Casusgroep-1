namespace ERPNumber1.Dtos.Delivery
{
    public class DeliveryDto
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public bool IsDelivered { get; set; }
        public bool QualityCheckPassed { get; set; }
        public bool ApprovedByCustomer { get; set; }
        public string? DeliveryRound { get; set; }
    }
}

