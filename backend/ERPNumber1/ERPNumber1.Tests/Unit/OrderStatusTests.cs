using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERPNumber1.Controllers;
using ERPNumber1.Data;
using ERPNumber1.Dtos.Order;
using ERPNumber1.Interfaces;
using ERPNumber1.Models;
using ERPNumber1.Repository;
using ERPNumber1.Mapper;
using Moq;
using Xunit;

namespace ERPNumber1.Tests.Unit
{
    public class OrderStatusTests
    {
        [Fact]
        public void OrderStatus_DefaultValue_ShouldBePending()
        {
            // Arrange & Act
            var order = new Order();

            // Assert
            Assert.Equal(OrderStatus.Pending, order.Status);
        }

        [Fact]
        public void OrderMapper_ToOrderDto_ShouldIncludeStatus()
        {
            // Arrange
            var order = new Order
            {
                Id = 1,
                RoundId = 1,
                MotorType = 'A',
                Quantity = 10,
                Status = OrderStatus.ApprovedByAccountManager,
                OrderDate = DateTime.UtcNow
            };

            // Act
            var orderDto = order.ToOrderDto();

            // Assert
            Assert.Equal("ApprovedByAccountManager", orderDto.Status);
        }

        [Fact]
        public void OrderMapper_FromCreateDto_WithValidStatus_ShouldSetStatus()
        {
            // Arrange
            var createDto = new CreateOrderDto
            {
                RoundId = 1,
                MotorType = 'A',
                Quantity = 10,
                Status = "InProduction"
            };

            // Act
            var order = createDto.ToOrderFromCreate();

            // Assert
            Assert.Equal(OrderStatus.InProduction, order.Status);
        }

        [Fact]
        public void OrderMapper_FromCreateDto_WithInvalidStatus_ShouldDefaultToPending()
        {
            // Arrange
            var createDto = new CreateOrderDto
            {
                RoundId = 1,
                MotorType = 'A',
                Quantity = 10,
                Status = "InvalidStatus"
            };

            // Act
            var order = createDto.ToOrderFromCreate();

            // Assert
            Assert.Equal(OrderStatus.Pending, order.Status);
        }

        [Fact]
        public void OrderMapper_FromCreateDto_WithNullStatus_ShouldDefaultToPending()
        {
            // Arrange
            var createDto = new CreateOrderDto
            {
                RoundId = 1,
                MotorType = 'A',
                Quantity = 10,
                Status = null
            };

            // Act
            var order = createDto.ToOrderFromCreate();

            // Assert
            Assert.Equal(OrderStatus.Pending, order.Status);
        }

        [Fact]
        public void UpdateOrderStatusDto_ShouldAcceptValidStatus()
        {
            // Arrange & Act
            var statusDto = new UpdateOrderStatusDto
            {
                Status = "ApprovedByAccountManager"
            };

            // Assert
            Assert.Equal("ApprovedByAccountManager", statusDto.Status);
        }
    }
}
