namespace ERPNumber1.Dtos.MaintenanceOrder
{
    public class UpdateMaintenanceOrderDto
    {
        public int RoundNumber { get; set; }
        public int ProductionLine { get; set; } // 1 or 2
        public string Status { get; set; } = "Scheduled"; // Scheduled, InProgress, Completed
        public string? Description { get; set; }
    }
}
