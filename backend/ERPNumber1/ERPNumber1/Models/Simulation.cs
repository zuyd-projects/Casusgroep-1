namespace ERPNumber1.Models
{
    public class Simulation
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public DateTime Date { get; set; }

        // Navigation
        public required ICollection<Round> Rounds { get; set; } = new List<Round>();
<<<<<<< HEAD
        
        // Default constructor for EF Core
        public Simulation() 
        {
        }
        
        // Convenience constructor
        public Simulation(string name, DateTime date)
        {
            Name = name;
            Date = date;
        }
    }
=======
    }

>>>>>>> 7f8c5bc6f5cac49e20165c74bf4999d15c9a366a
}
