using ERPNumber1.Dtos.SupplierOrder;
using ERPNumber1.Models;

namespace ERPNumber1.Mapper
{
    public static class SupplierOrderMapper
    {
        public static SupplierOrderDto ToSupplierOrderDto(this SupplierOrder model)
        {
            return new SupplierOrderDto
            {
                Id = model.Id,
                AppUserId = model.AppUserId,
                OrderId = model.OrderId,
                Quantity = model.Quantity,
                Status = model.Status,
                RoundNumber = model.round_number,
                IsRMA = model.IsRMA,
                OrderDate = model.OrderDate
            };
        }

        public static SupplierOrder ToSupplierOrderFromCreate(this CreateSupplierOrderDto dto)
        {
            return new SupplierOrder
            {
                AppUserId = dto.AppUserId,
                OrderId = dto.OrderId,
                Quantity = dto.Quantity,
                Status = dto.Status,
                round_number = dto.RoundNumber,
                IsRMA = dto.IsRMA,
                OrderDate = dto.OrderDate
            };
        }

        public static SupplierOrder ToSupplierOrderFromUpdate(this UpdateSupplierOrderDto dto)
        {
            return new SupplierOrder
            {
                AppUserId = dto.AppUserId,
                OrderId = dto.OrderId,
                Quantity = dto.Quantity,
                Status = dto.Status,
                round_number = dto.RoundNumber,
                IsRMA = dto.IsRMA,
                OrderDate = dto.OrderDate
            };
        }
    }
}
