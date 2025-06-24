namespace ERPNumber1.Dtos.Statistics
{
    public class StatisticsDto
    {
        public int Id { get; set; }
        public int SimulationId { get; set; }
        public int TotalOrders { get; set; }
        public float DeliveryRate { get; set; }
        public float Revenue { get; set; }
        public float Cost { get; set; }
        public float NetProfit { get; set; }
    }
}

