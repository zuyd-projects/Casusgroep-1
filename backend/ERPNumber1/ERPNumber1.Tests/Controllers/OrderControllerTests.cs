using ERPNumber1.Models;
using ERPNumber1.Dtos.Order;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace ERPNumber1.Tests.Controllers;

public class OrderControllerTests : BaseIntegrationTest
{
    public OrderControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetOrders_ShouldReturnEmptyList_WhenNoOrdersExist()
    {
        // Act
        var response = await HttpClient.GetAsync("/api/order");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var orders = await DeserializeResponse<List<Order>>(response);
        orders.Should().NotBeNull();
        orders.Should().BeEmpty();
    }

    [Fact]
    public async Task GetOrders_ShouldReturnOrders_WhenOrdersExist()
    {
        // Arrange
        var order1 = new Order 
        { 
            Id = 1, 
            RoundId = 100, 
            MotorType = 'A', 
            Quantity = 5, 
            OrderDate = DateTime.UtcNow 
        };
        var order2 = new Order 
        { 
            Id = 3, 
            RoundId = 101, 
            MotorType = 'B', 
            Quantity = 3, 
            OrderDate = DateTime.UtcNow 
        };
        
        DbContext.Orders.AddRange(order1, order2);
        await DbContext.SaveChangesAsync();

        // Act
        var response = await HttpClient.GetAsync("/api/order");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var orders = await DeserializeResponse<List<Order>>(response);
        orders.Should().NotBeNull();
        orders.Should().HaveCount(2);
        orders!.Should().Contain(o => o.Id == 1 && o.RoundId == 100 && o.MotorType == 'A');
        orders.Should().Contain(o => o.Id == 2 && o.RoundId == 101 && o.MotorType == 'B');
    }

    [Fact]
    public async Task GetOrder_ShouldReturnOrder_WhenOrderExists()
    {
        // Arrange
        var order = new Order 
        { 
            Id = 1, 
            RoundId = 100, 
            MotorType = 'A', 
            Quantity = 5, 
            OrderDate = DateTime.UtcNow 
        };
        DbContext.Orders.Add(order);
        await DbContext.SaveChangesAsync();

        // Act
        var response = await HttpClient.GetAsync("/api/order/1");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var returnedOrder = await DeserializeResponse<Order>(response);
        returnedOrder.Should().NotBeNull();
        returnedOrder!.Id.Should().Be(1);
        returnedOrder.RoundId.Should().Be(100);
        returnedOrder.MotorType.Should().Be('A');
        returnedOrder.Quantity.Should().Be(5);
    }

    [Fact]
    public async Task GetOrder_ShouldReturnNotFound_WhenOrderDoesNotExist()
    {
        // Act
        var response = await HttpClient.GetAsync("/api/order/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ApiHealthCheck_ShouldReturnOk()
    {
        // Act
        var response = await HttpClient.GetAsync("/api/order");

        // Assert
        response.Should().NotBeNull();
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }
}
