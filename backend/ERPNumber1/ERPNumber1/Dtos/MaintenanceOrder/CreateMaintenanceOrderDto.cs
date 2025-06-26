namespace ERPNumber1.Dtos.MaintenanceOrder
{
    public class CreateMaintenanceOrderDto
    {
        public int RoundNumber { get; set; }
        public int ProductionLine { get; set; } // 1 or 2
        public string? Description { get; set; }
        public string? CreatedBy { get; set; }
    }
}
