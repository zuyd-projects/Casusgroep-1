namespace ERPNumber1.Dtos.Inventory
{
    public class InventoryDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public int Quantity { get; set; }
        public string? AppUserId { get; set; }
    }
}
