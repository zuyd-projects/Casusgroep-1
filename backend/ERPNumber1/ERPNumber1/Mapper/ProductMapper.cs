using ERPNumber1.Dtos.Product;
using ERPNumber1.Models;

namespace ERPNumber1.Mapper
{
    public static class ProductMapper
    {
        public static ProductDto ToProductDto(this Product product)
        {
            return new ProductDto
            {
                Id = product.Id,
                OrderId = product.orderId,
                Type = product.type
            };
        }

        public static Product ToProductFromCreate(this CreateProductDto dto)
        {
            return new Product
            {
                orderId = dto.OrderId,
                type = dto.Type
            };
        }

        public static Product ToProductFromUpdate(this UpdateProductDto dto)
        {
            return new Product
            {
                orderId = dto.OrderId,
                type = dto.Type
            };
        }
    }
}
