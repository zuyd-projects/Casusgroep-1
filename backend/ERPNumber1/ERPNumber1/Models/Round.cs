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

        // Default constructor for EF Core
        public Round()
        {
        }

        // Convenience constructor
        public Round(Simulation simulation, int roundNumber)
        {
            Simulation = simulation;
            SimulationId = simulation.Id;
            RoundNumber = roundNumber;
        }
    }
}
