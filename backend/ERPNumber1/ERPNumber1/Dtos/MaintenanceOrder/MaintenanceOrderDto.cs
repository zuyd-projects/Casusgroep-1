namespace ERPNumber1.Dtos.MaintenanceOrder
{
    public class MaintenanceOrderDto
    {
        public int Id { get; set; }
        public int RoundNumber { get; set; }
        public int ProductionLine { get; set; } // 1 or 2
        public DateTime ScheduledDate { get; set; }
        public string Status { get; set; } = "Scheduled"; // Scheduled, InProgress, Completed
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
    }
}
