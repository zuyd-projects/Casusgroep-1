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
<<<<<<< HEAD
        
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
=======
    }

>>>>>>> 7f8c5bc6f5cac49e20165c74bf4999d15c9a366a
}
