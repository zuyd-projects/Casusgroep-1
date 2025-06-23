namespace ERPNumber1.Dtos.SupplierOrder
{
    public class SupplierOrderDto
    {
        public int Id { get; set; }
        public string AppUserId { get; set; }
        public int OrderId { get; set; }
        public int Quantity { get; set; }
        public string? Status { get; set; }
        public int RoundNumber { get; set; }
        public bool IsRMA { get; set; }
        public DateTime OrderDate { get; set; }
    }
}
