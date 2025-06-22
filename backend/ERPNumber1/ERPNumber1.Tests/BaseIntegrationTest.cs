using Microsoft.Extensions.DependencyInjection;
using ERPNumber1.Data;
using ERPNumber1.Models;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Xunit;

namespace ERPNumber1.Tests;

public abstract class BaseIntegrationTest : IClassFixture<CustomWebApplicationFactory<Program>>, IDisposable
{
    protected readonly HttpClient HttpClient;
    protected readonly CustomWebApplicationFactory<Program> Factory;
    protected readonly AppDbContext DbContext;
    private readonly IServiceScope _scope;

    protected BaseIntegrationTest(CustomWebApplicationFactory<Program> factory)
    {
        Factory = factory;
        HttpClient = factory.CreateClient();
        
        _scope = factory.Services.CreateScope();
        DbContext = _scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        // Ensure the database is created and clean
        DbContext.Database.EnsureCreated();
        CleanDatabase();
    }

    protected void CleanDatabase()
    {
        try
        {
            // Remove all entities in correct order to avoid FK constraint issues
            if (DbContext.Products.Any())
            {
                DbContext.Products.RemoveRange(DbContext.Products);
            }
            if (DbContext.Orders.Any())
            {
                DbContext.Orders.RemoveRange(DbContext.Orders);
            }
            if (DbContext.Materials.Any())
            {
                DbContext.Materials.RemoveRange(DbContext.Materials);
            }
            if (DbContext.Deliveries.Any())
            {
                DbContext.Deliveries.RemoveRange(DbContext.Deliveries);
            }
            if (DbContext.Inventories.Any())
            {
                DbContext.Inventories.RemoveRange(DbContext.Inventories);
            }
            
            DbContext.SaveChanges();
        }
        catch (Exception)
        {
            // If cleanup fails, recreate the database
            DbContext.Database.EnsureDeleted();
            DbContext.Database.EnsureCreated();
        }
    }

    protected StringContent CreateJsonContent(object obj)
    {
        var json = JsonSerializer.Serialize(obj);
        return new StringContent(json, Encoding.UTF8, "application/json");
    }

    protected async Task<T?> DeserializeResponse<T>(HttpResponseMessage response)
    {
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }

    public void Dispose()
    {
        HttpClient?.Dispose();
        _scope?.Dispose();
    }
}
