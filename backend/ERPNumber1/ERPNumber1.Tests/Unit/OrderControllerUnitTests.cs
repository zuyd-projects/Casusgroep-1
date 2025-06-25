using ERPNumber1.Controllers;
using ERPNumber1.Data;
using ERPNumber1.Models;
using ERPNumber1.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using FluentAssertions;
using Moq;

namespace ERPNumber1.Tests.Unit;

public class OrderControllerUnitTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly OrderController _controller;
    private readonly Mock<IEventLogService> _mockEventLogService;
    private readonly Mock<IOrderRepository> _mockOrderRepo;
    private readonly Mock<ISupplierOrderRepository> _mockSupplierOrderRepo;

    public OrderControllerUnitTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        _context = new AppDbContext(options);
        _mockEventLogService = new Mock<IEventLogService>();
        _mockOrderRepo = new Mock<IOrderRepository>();
        _mockSupplierOrderRepo = new Mock<ISupplierOrderRepository>();

        // Setup mock to return completed tasks
        _mockEventLogService
            .Setup(x => x.LogEventAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        _controller = new OrderController(_mockOrderRepo.Object, _mockEventLogService.Object,_mockSupplierOrderRepo.Object);
    }

    [Fact]
    public async Task GetOrders_ShouldReturnEmptyList_WhenNoOrdersExist()
    {
        _mockOrderRepo.Setup(repo => repo.GetAllAsync())
                  .ReturnsAsync(new List<Order>());

        // Act
        var result = await _controller.GetOrders();

        // Assert
        var actionResult = Assert.IsType<ActionResult<IEnumerable<Order>>>(result);
        var orders = Assert.IsType<List<Order>>(actionResult.Value);
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
            Id = 2, 
            RoundId = 101, 
            MotorType = 'B', 
            Quantity = 3, 
            OrderDate = DateTime.UtcNow 
        };
        
        _context.Orders.AddRange(order1, order2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.GetOrders();

        // Assert
        var actionResult = Assert.IsType<ActionResult<IEnumerable<Order>>>(result);
        var orders = Assert.IsType<List<Order>>(actionResult.Value);
        orders.Should().HaveCount(2);
        orders.Should().Contain(o => o.Id == 1 && o.RoundId == 100 && o.MotorType == 'A');
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
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.GetOrder(1);

        // Assert
        var actionResult = Assert.IsType<ActionResult<Order>>(result);
        var returnedOrder = Assert.IsType<Order>(actionResult.Value);
        returnedOrder.Id.Should().Be(1);
        returnedOrder.RoundId.Should().Be(100);
        returnedOrder.MotorType.Should().Be('A');
        returnedOrder.Quantity.Should().Be(5);
    }

    [Fact]
    public async Task GetOrder_ShouldReturnNotFound_WhenOrderDoesNotExist()
    {

        // Act
        var result = await _controller.GetOrder(999);

        // Assert
        var actionResult = Assert.IsType<ActionResult<Order>>(result);
        Assert.IsType<NotFoundResult>(actionResult.Result);
    }

    public void Dispose()
    {
        _context?.Dispose();
    }
}
