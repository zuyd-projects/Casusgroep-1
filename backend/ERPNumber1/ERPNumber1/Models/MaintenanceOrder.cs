using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ERPNumber1.Models
{
    public class MaintenanceOrder
    {
        public int Id { get; set; }
        public int RoundNumber { get; set; }
        public int ProductionLine { get; set; } // 1 or 2
        public DateTime ScheduledDate { get; set; }
        public string Status { get; set; } = "Scheduled"; // Scheduled, InProgress, Completed
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }
        
        // Navigation properties
        [JsonIgnore]
        public Round? Round { get; set; }
    }
}
