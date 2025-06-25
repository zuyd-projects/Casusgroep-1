using ERPNumber1.Controllers;
using ERPNumber1.Data;
using ERPNumber1.Models;
using ERPNumber1.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using FluentAssertions;
using Moq;

namespace ERPNumber1.Tests.Unit;

public class ProductsControllerUnitTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly ProductsController _controller;
    private readonly Mock<IEventLogService> _mockEventLogService;
    private readonly Mock<IProductRepository> _mockProductRepo;

    public ProductsControllerUnitTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        _context = new AppDbContext(options);
        _mockEventLogService = new Mock<IEventLogService>();
        _mockProductRepo = new Mock<IProductRepository>();


        // Setup mock to return completed tasks
        _mockEventLogService
            .Setup(x => x.LogEventAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        _controller = new ProductsController(_mockEventLogService.Object,_mockProductRepo.Object);
    }

    [Fact]
    public async Task GetProducts_ShouldReturnEmptyList_WhenNoProductsExist()
    {
        // Act
        var result = await _controller.GetProducts();

        // Assert
        var actionResult = Assert.IsType<ActionResult<IEnumerable<Product>>>(result);
        var products = Assert.IsType<List<Product>>(actionResult.Value);
        products.Should().BeEmpty();
    }

    [Fact]
    public async Task GetProducts_ShouldReturnProducts_WhenProductsExist()
    {
        // Arrange
        var product1 = new Product { Id = 1, orderId = 100, type = 'A' };
        var product2 = new Product { Id = 2, orderId = 101, type = 'B' };
        
        _context.Products.AddRange(product1, product2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.GetProducts();

        // Assert
        var actionResult = Assert.IsType<ActionResult<IEnumerable<Product>>>(result);
        var products = Assert.IsType<List<Product>>(actionResult.Value);
        products.Should().HaveCount(2);
        products.Should().Contain(p => p.Id == 1 && p.orderId == 100 && p.type == 'A');
        products.Should().Contain(p => p.Id == 2 && p.orderId == 101 && p.type == 'B');
    }

    [Fact]
    public async Task GetProduct_ShouldReturnProduct_WhenProductExists()
    {
        // Arrange
        var product = new Product { Id = 1, orderId = 100, type = 'A' };
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.GetProduct(1);

        // Assert
        var actionResult = Assert.IsType<ActionResult<Product>>(result);
        var returnedProduct = Assert.IsType<Product>(actionResult.Value);
        returnedProduct.Id.Should().Be(1);
        returnedProduct.orderId.Should().Be(100);
        returnedProduct.type.Should().Be('A');
    }

    [Fact]
    public async Task GetProduct_ShouldReturnNotFound_WhenProductDoesNotExist()
    {
        // Act
        var result = await _controller.GetProduct(999);

        // Assert
        var actionResult = Assert.IsType<ActionResult<Product>>(result);
        Assert.IsType<NotFoundResult>(actionResult.Result);
    }

    public void Dispose()
    {
        _context?.Dispose();
    }
}
