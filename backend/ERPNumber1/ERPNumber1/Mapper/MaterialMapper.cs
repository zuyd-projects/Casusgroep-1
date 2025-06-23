using ERPNumber1.Dtos.Material;
using ERPNumber1.Models;

namespace ERPNumber1.Mapper
{
    public static class MaterialMapper
    {
        public static MaterialDto ToMaterialDto(this Material material)
        {
            return new MaterialDto
            {
                Id = material.Id,
                ProductId = material.productId,
                Name = material.name,
                Cost = material.cost,
                Quantity = material.quantity
            };
        }

        public static Material ToMaterialFromCreate(this CreateMaterialDto dto)
        {
            return new Material
            {
                productId = dto.ProductId,
                name = dto.Name,
                cost = dto.Cost,
                quantity = dto.Quantity
            };
        }

        public static Material ToMaterialFromUpdate(this UpdateMaterialDto dto)
        {
            return new Material
            {
                productId = dto.ProductId,
                name = dto.Name,
                cost = dto.Cost,
                quantity = dto.Quantity
            };
        }
    }
}
