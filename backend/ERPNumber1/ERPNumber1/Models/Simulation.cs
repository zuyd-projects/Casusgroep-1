namespace ERPNumber1.Models
{
    public class Simulation
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public DateTime Date { get; set; }

        // Navigation
        public required ICollection<Round> Rounds { get; set; } = new List<Round>();
    }

}
