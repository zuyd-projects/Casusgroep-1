using System.Text.Json.Serialization;

namespace ERPNumber1.Models
{
    public class MissingBlocks
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string ProductionLine { get; set; } = null!;
        public char MotorType { get; set; }
        public int Quantity { get; set; }
        public int BlueBlocks { get; set; }
        public int RedBlocks { get; set; }
        public int GrayBlocks { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Resolved
        public bool RunnerAttempted { get; set; } = false;
        public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
        public DateTime? RunnerAttemptedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public string? ResolvedBy { get; set; }
        
        [JsonIgnore]
        public Order Order { get; set; } = null!;
    }
}
