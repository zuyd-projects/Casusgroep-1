using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ERPNumber1.Models
{
    public class Round
    {
        public int Id { get; set; }
        public int SimulationId { get; set; }
        public int RoundNumber { get; set; }

        // Navigation
        [JsonIgnore]
        public Simulation? Simulation { get; set; }

    }
}
