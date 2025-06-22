using ERPNumber1.Dtos.Delivery;
using ERPNumber1.Models;

namespace ERPNumber1.Mapper
{
    public static class DeliveryMapper
    {
        public static DeliveryDto ToDeliveryDto(this Delivery delivery)
        {
            return new DeliveryDto
            {
                Id = delivery.Id,
                OrderId = delivery.OrderId,
                IsDelivered = delivery.IsDelivered,
                QualityCheckPassed = delivery.QualityCheckPassed,
                ApprovedByCustomer = delivery.ApprovedByCustomer,
                DeliveryRound = delivery.DeliveryRound
            };
        }

        public static Delivery ToDeliveryFromCreate(this CreateDeliveryDto dto)
        {
            return new Delivery
            {
                OrderId = dto.OrderId,
                IsDelivered = dto.IsDelivered,
                QualityCheckPassed = dto.QualityCheckPassed,
                ApprovedByCustomer = dto.ApprovedByCustomer,
                DeliveryRound = dto.DeliveryRound
            };
        }

        public static Delivery ToDeliveryFromUpdate(this UpdateDeliveryDto dto)
        {
            return new Delivery
            {
                OrderId = dto.OrderId,
                IsDelivered = dto.IsDelivered,
                QualityCheckPassed = dto.QualityCheckPassed,
                ApprovedByCustomer = dto.ApprovedByCustomer,
                DeliveryRound = dto.DeliveryRound
            };
        }
    }
}
