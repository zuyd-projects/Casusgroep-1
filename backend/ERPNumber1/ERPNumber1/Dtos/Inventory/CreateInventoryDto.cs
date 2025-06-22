namespace ERPNumber1.Dtos.Inventory
{
    public class CreateInventoryDto
    {
        public string? Name { get; set; }
        public int Quantity { get; set; }
        public string? AppUserId { get; set; }
    }
}
