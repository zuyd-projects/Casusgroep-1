using ERPNumber1.Dtos.MaintenanceOrder;
using ERPNumber1.Models;

namespace ERPNumber1.Mapper
{
    public static class MaintenanceOrderMapper
    {
        public static MaintenanceOrderDto ToMaintenanceOrderDto(this MaintenanceOrder maintenanceOrder)
        {
            return new MaintenanceOrderDto
            {
                Id = maintenanceOrder.Id,
                RoundNumber = maintenanceOrder.RoundNumber,
                ProductionLine = maintenanceOrder.ProductionLine,
                ScheduledDate = maintenanceOrder.ScheduledDate,
                Status = maintenanceOrder.Status,
                Description = maintenanceOrder.Description,
                CreatedAt = maintenanceOrder.CreatedAt,
                CreatedBy = maintenanceOrder.CreatedBy
            };
        }

        public static MaintenanceOrder ToMaintenanceOrderFromCreate(this CreateMaintenanceOrderDto createDto)
        {
            return new MaintenanceOrder
            {
                RoundNumber = createDto.RoundNumber,
                ProductionLine = createDto.ProductionLine,
                Description = createDto.Description,
                CreatedBy = createDto.CreatedBy,
                Status = "Scheduled",
                ScheduledDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
        }

        public static MaintenanceOrder ToMaintenanceOrderFromUpdate(this UpdateMaintenanceOrderDto updateDto)
        {
            return new MaintenanceOrder
            {
                RoundNumber = updateDto.RoundNumber,
                ProductionLine = updateDto.ProductionLine,
                Status = updateDto.Status,
                Description = updateDto.Description
            };
        }
    }
}
