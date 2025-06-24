using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using System.Text.Json.Serialization;

namespace ERPNumber1.Models
{
    public class Delivery
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public bool IsDelivered { get; set; }
        public bool QualityCheckPassed { get; set; } //Approved By Accountmanager
        public bool ApprovedByCustomer { get; set; }
        public string? DeliveryRound{ get; set; } 
        
        
        [JsonIgnore]
        public Order? Order { get; set; }
    }
}
