namespace ERPNumber1.Dtos.SupplierOrder
{
    public class CreateSupplierOrderDto
    {
        public int UserId { get; set; }
        public int Quantity { get; set; }
        public string? Status { get; set; }
        public int RoundNumber { get; set; }
        public DateTime OrderDate { get; set; }
    }
}
