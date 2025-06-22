using ERPNumber1.Models;
using ERPNumber1.Dtos.Product;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace ERPNumber1.Tests.Controllers;

public class ProductsControllerTests : BaseIntegrationTest
{
    public ProductsControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetProducts_ShouldReturnEmptyList_WhenNoProductsExist()
    {
        // Act
        var response = await HttpClient.GetAsync("/api/products");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var products = await DeserializeResponse<List<Product>>(response);
        products.Should().NotBeNull();
        products.Should().BeEmpty();
    }

    [Fact]
    public async Task GetProducts_ShouldReturnProducts_WhenProductsExist()
    {
        // Arrange
        var product1 = new Product { Id = 1, orderId = 100, type = 'A' };
        var product2 = new Product { Id = 2, orderId = 101, type = 'B' };
        
        DbContext.Products.AddRange(product1, product2);
        await DbContext.SaveChangesAsync();

        // Act
        var response = await HttpClient.GetAsync("/api/products");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var products = await DeserializeResponse<List<Product>>(response);
        products.Should().NotBeNull();
        products.Should().HaveCount(2);
        products!.Should().Contain(p => p.Id == 1 && p.orderId == 100 && p.type == 'A');
        products.Should().Contain(p => p.Id == 2 && p.orderId == 101 && p.type == 'B');
    }

    [Fact]
    public async Task GetProduct_ShouldReturnProduct_WhenProductExists()
    {
        // Arrange
        var product = new Product { Id = 1, orderId = 100, type = 'A' };
        DbContext.Products.Add(product);
        await DbContext.SaveChangesAsync();

        // Act
        var response = await HttpClient.GetAsync("/api/products/1");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var returnedProduct = await DeserializeResponse<Product>(response);
        returnedProduct.Should().NotBeNull();
        returnedProduct!.Id.Should().Be(1);
        returnedProduct.orderId.Should().Be(100);
        returnedProduct.type.Should().Be('A');
    }

    [Fact]
    public async Task GetProduct_ShouldReturnNotFound_WhenProductDoesNotExist()
    {
        // Act
        var response = await HttpClient.GetAsync("/api/products/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Theory]
    [InlineData('A')]
    [InlineData('B')]
    [InlineData('C')]
    public async Task CreateProduct_ShouldCreateProduct_WithValidData(char productType)
    {
        // Arrange
        var newProduct = new CreateProductDto { OrderId = 200, Type = productType };

        // Act
        var response = await HttpClient.PostAsJsonAsync("/api/products", newProduct);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var createdProduct = await DeserializeResponse<Product>(response);
        createdProduct.Should().NotBeNull();
        createdProduct!.orderId.Should().Be(200);
        createdProduct.type.Should().Be(productType);

        // Verify it's actually in the database
        var productInDb = await DbContext.Products.FindAsync(createdProduct.Id);
        productInDb.Should().NotBeNull();
        productInDb!.orderId.Should().Be(200);
        productInDb.type.Should().Be(productType);
    }
}
