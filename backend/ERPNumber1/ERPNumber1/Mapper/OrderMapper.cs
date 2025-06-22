using ERPNumber1.Dtos.Order;
using ERPNumber1.Dtos.Simulation;
using ERPNumber1.Models;

namespace ERPNumber1.Mapper
{
    public static class OrderMapper
    {
        public static OrderDto ToOrderDto(this Order orderModel)
        {
            return new OrderDto
            {
                RoundId = orderModel.RoundId,
                DeliveryId = orderModel.DeliveryId,
                AppUserId = orderModel.AppUserId,
                MotorType = orderModel.MotorType,
                Quantity = orderModel.Quantity,
                Signature = orderModel.Signature,
                OrderDate = orderModel.OrderDate,   

            };

        }

        public static Order ToOrderFromCreate(this CreateOrderDto orderDto)
        {
            return new Order
            {
                RoundId = orderDto.RoundId,
                DeliveryId = orderDto.DeliveryId,
                AppUserId = orderDto.AppUserId,
                MotorType = orderDto.MotorType,
                Quantity = orderDto.Quantity,
                Signature = orderDto.Signature,
                ProductionLine = orderDto.ProductionLine,
            };
        }

        public static Order ToOrderFromUpdate(this UpdateOrderDto orderDto)
        {
            return new Order
            {

                RoundId = orderDto.RoundId,
                DeliveryId = orderDto.DeliveryId,
                AppUserId = orderDto.AppUserId,
                MotorType = orderDto.MotorType,
                Quantity = orderDto.Quantity,
                Signature = orderDto.Signature,
                ProductionLine = orderDto.ProductionLine,
            };
        }
    }
}
