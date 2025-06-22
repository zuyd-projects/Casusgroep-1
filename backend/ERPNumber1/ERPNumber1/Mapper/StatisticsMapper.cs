using ERPNumber1.Dtos.Statistics;
using ERPNumber1.Models;

namespace ERPNumber1.Mapper
{
    public static class StatisticsMapper
    {
        public static StatisticsDto ToStatisticsDto(this Statistics model)
        {
            return new StatisticsDto
            {
                Id = model.Id,
                SimulationId = model.SimulationId,
                TotalOrders = model.TotalOrders,
                DeliveryRate = model.DeliveryRate,
                Revenue = model.Revenue,
                Cost = model.Cost,
                NetProfit = model.NetProfit
            };
        }

        public static Statistics ToStatisticsFromCreate(this CreateStatisticsDto dto)
        {
            return new Statistics
            {
                SimulationId = dto.SimulationId,
                TotalOrders = dto.TotalOrders,
                DeliveryRate = dto.DeliveryRate,
                Revenue = dto.Revenue,
                Cost = dto.Cost,
                NetProfit = dto.NetProfit
            };
        }

        public static Statistics ToStatisticsFromUpdate(this UpdateStatisticsDto dto)
        {
            return new Statistics
            {
                SimulationId = dto.SimulationId,
                TotalOrders = dto.TotalOrders,
                DeliveryRate = dto.DeliveryRate,
                Revenue = dto.Revenue,
                Cost = dto.Cost,
                NetProfit = dto.NetProfit
            };
        }
    }
}
