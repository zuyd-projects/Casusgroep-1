using System.Text.Json.Serialization;

namespace ERPNumber1.Models
{
    public class Simulation
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public DateTime Date { get; set; }

        // Navigation
        [JsonIgnore]
        public ICollection<Round>? Rounds { get; set; } = new List<Round>();
        
        
    }
}
