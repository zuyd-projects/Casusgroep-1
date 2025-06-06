using System.ComponentModel.DataAnnotations;

namespace ERPNumber1.Models
{
    public class Round
    {
        public int Id { get; set; }
        public int SimulationId { get; set; }
        public int RoundNumber { get; set; }

        // Navigation
        public required Simulation Simulation { get; set; }
    }

}
