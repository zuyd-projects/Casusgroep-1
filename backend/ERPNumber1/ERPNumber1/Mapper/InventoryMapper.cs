using ERPNumber1.Dtos.Inventory;
using ERPNumber1.Models;

namespace ERPNumber1.Mapper
{
    public static class InventoryMapper
    {
        public static InventoryDto ToInventoryDto(this Inventory inventory)
        {
            return new InventoryDto
            {
                Id = inventory.Id,
                Name = inventory.Name,
                Quantity = inventory.Quantity,
                AppUserId = inventory.AppUserId
            };
        }

        public static Inventory ToInventoryFromCreate(this CreateInventoryDto dto)
        {
            return new Inventory
            {
                Name = dto.Name,
                Quantity = dto.Quantity,
                AppUserId = dto.AppUserId
            };
        }

        public static Inventory ToInventoryFromUpdate(this UpdateInventoryDto dto)
        {
            return new Inventory
            {
                Name = dto.Name,
                Quantity = dto.Quantity,
                AppUserId = dto.AppUserId
            };
        }
    }
}
