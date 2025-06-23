using System.ComponentModel.DataAnnotations;

namespace ERPNumber1.Models
{
    public class EventLog
    {
        [Key]
        public int Id { get; set; }
        
        /// <summary>
        /// Case identifier - represents a unique process instance (e.g., OrderId, SimulationId)
        /// </summary>
        [Required]
        public string CaseId { get; set; } = string.Empty;
        
        /// <summary>
        /// Activity name - what action was performed (e.g., "Order Created", "Product Added", "Delivery Completed")
        /// </summary>
        [Required]
        public string Activity { get; set; } = string.Empty;
        
        /// <summary>
        /// Resource - who or what performed the activity (e.g., UserId, System, Service name)
        /// </summary>
        [Required]
        public string Resource { get; set; } = string.Empty;
        
        /// <summary>
        /// Timestamp when the event occurred
        /// </summary>
        [Required]
        public DateTime Timestamp { get; set; }
        
        /// <summary>
        /// Event type to categorize events (e.g., "Order", "Inventory", "Delivery", "User")
        /// </summary>
        public string EventType { get; set; } = string.Empty;
        
        /// <summary>
        /// Additional context data stored as JSON
        /// </summary>
        public string? AdditionalData { get; set; }
        
        /// <summary>
        /// Status of the event (e.g., "Started", "Completed", "Failed", "Cancelled")
        /// </summary>
        public string Status { get; set; } = "Completed";
        
        /// <summary>
        /// Duration in milliseconds (for activities that have start/end)
        /// </summary>
        public long? DurationMs { get; set; }
        
        /// <summary>
        /// Related entity ID for linking back to specific records
        /// </summary>
        public string? EntityId { get; set; }
        
        /// <summary>
        /// Priority or importance level of the event
        /// </summary>
        public string Priority { get; set; } = "Normal";
        
        /// <summary>
        /// User who initiated the activity (if applicable)
        /// </summary>
        public string? UserId { get; set; }
        
        /// <summary>
        /// Session or transaction identifier for grouping related events
        /// </summary>
        public string? SessionId { get; set; }
    }
}
