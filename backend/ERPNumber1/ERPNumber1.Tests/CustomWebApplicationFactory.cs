using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ERPNumber1.Data;
using ERPNumber1.Interfaces;
using Moq;

namespace ERPNumber1.Tests;

public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove ALL Entity Framework services to avoid conflicts
            var efServices = services.Where(d => 
                d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                d.ServiceType == typeof(AppDbContext) ||
                (d.ServiceType.IsGenericType && 
                 d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>)) ||
                d.ImplementationType?.Assembly.GetName().Name?.Contains("EntityFramework") == true)
                .ToList();

            foreach (var service in efServices)
            {
                services.Remove(service);
            }

            // Add fresh in-memory database
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseInMemoryDatabase($"TestDb_{Guid.NewGuid()}");
                // Ensure we don't use any SQL Server provider
                options.EnableSensitiveDataLogging();
            });

            // Mock IEventLogService
            var eventLogDescriptor = services.FirstOrDefault(d => d.ServiceType == typeof(IEventLogService));
            if (eventLogDescriptor != null)
            {
                services.Remove(eventLogDescriptor);
            }

            var mockEventLogService = new Mock<IEventLogService>();
            // Setup all possible method overloads to avoid null reference exceptions
            mockEventLogService
                .Setup(x => x.LogEventAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);
            
            services.AddSingleton(mockEventLogService.Object);
        });

        builder.UseEnvironment("Testing");
    }
}
