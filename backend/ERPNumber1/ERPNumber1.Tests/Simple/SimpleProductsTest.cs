using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ERPNumber1.Data;
using ERPNumber1.Models;
using Microsoft.EntityFrameworkCore;
using Xunit;
using Microsoft.Extensions.DependencyInjection;
using FluentAssertions;

namespace ERPNumber1.Tests.Simple;

public class SimpleProductsTest
{
    [Fact]
    public void Product_ShouldHaveCorrectProperties()
    {
        // Arrange & Act
        var product = new Product
        {
            Id = 1,
            orderId = 100,
            type = 'A'
        };

        // Assert
        product.Id.Should().Be(1);
        product.orderId.Should().Be(100);
        product.type.Should().Be('A');
    }

    [Fact]
    public void InMemoryDatabase_ShouldWork()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase")
            .Options;

        using var context = new AppDbContext(options);

        var product = new Product
        {
            Id = 1,
            orderId = 100,
            type = 'A'
        };

        // Act
        context.Products.Add(product);
        context.SaveChanges();

        // Assert
        var retrievedProduct = context.Products.FirstOrDefault(p => p.Id == 1);
        retrievedProduct.Should().NotBeNull();
        retrievedProduct!.orderId.Should().Be(100);
        retrievedProduct.type.Should().Be('A');
    }
}
