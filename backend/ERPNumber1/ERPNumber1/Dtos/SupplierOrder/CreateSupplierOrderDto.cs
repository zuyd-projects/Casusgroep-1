namespace ERPNumber1.Dtos.SupplierOrder
{
    public class CreateSupplierOrderDto
    {
        public string AppUserId { get; set; }
        public int Quantity { get; set; }
        public int OrderId { get; set; }
        public string? Status { get; set; }
        public int RoundNumber { get; set; }
        public bool IsRMA { get; set; }
        public DateTime OrderDate { get; set; }
    }
}
