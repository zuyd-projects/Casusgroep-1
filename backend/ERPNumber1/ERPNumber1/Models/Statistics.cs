using System.Text.Json.Serialization;

namespace ERPNumber1.Models
{
    public class Statistics
    {
        public int Id { get; set; }
        public int SimulationId { get; set; }
        public int TotalOrders { get; set; }
        public float DeliveryRate { get; set; }
        public float Revenue { get; set; }
        public float Cost { get; set; }
        public float NetProfit { get; set; }    
        [JsonIgnore]
        public Simulation? Simulation { get; set; }

        public Statistics() { }

        public Statistics(int id,int simulationId, int totalOrders, float deliveryRate, float revenue, float cost, float netProfit)
        {
            Id = id;
            SimulationId = simulationId;
            TotalOrders = totalOrders;
            DeliveryRate = deliveryRate;
            Revenue = revenue;
            Cost = cost;
            NetProfit = netProfit;
     
        }
    }
}
