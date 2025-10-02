using FoodDeliveryApi.FoodDeliveryApi.Application.Services;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace FoodDeliveryApi.Tests.Services;

public class TenantServiceTests : IDisposable
{
    private readonly FoodAppContext _context;
    private readonly TenantService _service;

    public TenantServiceTests()
    {
        var options = new DbContextOptionsBuilder<FoodAppContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
            
        _context = new FoodAppContext(options);
        _service = new TenantService(_context);
        
        // Seed test data
        SeedTestData();
    }
    
    private void SeedTestData()
    {
        var tenant1 = Tenant.Create(
            "tenant-1",
            "tenant1",
            "Test Tenant 1",
            "https://tenant1.example.com",
            "tenant1@example.com",
            "+1234567890"
        );
        
        var tenant2 = Tenant.Create(
            "tenant-2",
            "tenant2", 
            "Test Tenant 2",
            "https://tenant2.example.com",
            "tenant2@example.com",
            "+1234567891"
        );
        
        _context.Tenants.AddRange(tenant1, tenant2);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnTenant_WhenTenantExists()
    {
        // Act
        var result = await _service.GetByIdAsync("tenant-1");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("tenant-1", result.Id);
        Assert.Equal("tenant1", result.Identifier);
        Assert.Equal("Test Tenant 1", result.Name);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenTenantDoesNotExist()
    {
        // Act
        var result = await _service.GetByIdAsync("non-existent-tenant");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetByIdentifierAsync_ShouldReturnTenant_WhenTenantExists()
    {
        // Act
        var result = await _service.GetByIdentifierAsync("tenant1");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("tenant-1", result.Id);
        Assert.Equal("tenant1", result.Identifier);
        Assert.Equal("Test Tenant 1", result.Name);
    }

    [Fact]
    public async Task GetByIdentifierAsync_ShouldReturnNull_WhenTenantDoesNotExist()
    {
        // Act
        var result = await _service.GetByIdentifierAsync("non-existent-identifier");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllActiveTenants()
    {
        // Act
        var result = await _service.GetAllAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
        Assert.Contains(result, t => t.Id == "tenant-1");
        Assert.Contains(result, t => t.Id == "tenant-2");
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateNewTenant()
    {
        // Arrange
        var newTenant = Tenant.Create(
            "tenant-3",
            "tenant3",
            "Test Tenant 3",
            "https://tenant3.example.com",
            "tenant3@example.com",
            "+1234567892"
        );

        // Act
        var result = await _service.CreateAsync(newTenant);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("tenant-3", result.Id);
        Assert.Equal("tenant3", result.Identifier);
        Assert.Equal("Test Tenant 3", result.Name);

        // Verify it was saved to database
        var savedTenant = await _context.Tenants.FindAsync("tenant-3");
        Assert.NotNull(savedTenant);
        Assert.Equal("Test Tenant 3", savedTenant.Name);
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateExistingTenant()
    {
        // Arrange
        var tenant = await _service.GetByIdAsync("tenant-1");
        Assert.NotNull(tenant);
        
        tenant.UpdateInfo("Updated Tenant 1", "https://updated.example.com", "updated@example.com", "+9876543210");

        // Act
        var result = await _service.UpdateAsync(tenant);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Updated Tenant 1", result.Name);
        Assert.Equal("https://updated.example.com", result.Url);
        Assert.Equal("updated@example.com", result.Email);
        Assert.Equal("+9876543210", result.Mobile);

        // Verify it was updated in database
        var updatedTenant = await _context.Tenants.FindAsync("tenant-1");
        Assert.NotNull(updatedTenant);
        Assert.Equal("Updated Tenant 1", updatedTenant.Name);
    }

    [Fact]
    public async Task DeleteAsync_ShouldDeactivateTenant_WhenTenantExists()
    {
        // Act
        var result = await _service.DeleteAsync("tenant1");

        // Assert
        Assert.True(result);

        // Verify tenant was deactivated
        var deactivatedTenant = await _context.Tenants.FindAsync("tenant-1");
        Assert.NotNull(deactivatedTenant);
        Assert.False(deactivatedTenant.IsActive);
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnFalse_WhenTenantDoesNotExist()
    {
        // Act
        var result = await _service.DeleteAsync("non-existent-identifier");

        // Assert
        Assert.False(result);
    }

    public void Dispose()
    {
        _context?.Dispose();
    }
}