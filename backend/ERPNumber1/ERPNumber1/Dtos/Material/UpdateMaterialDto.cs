namespace ERPNumber1.Dtos.Material
{
    public class UpdateMaterialDto
    {
        public int ProductId { get; set; }
        public string? Name { get; set; }
        public float Cost { get; set; }
        public int Quantity { get; set; }
    }
}
