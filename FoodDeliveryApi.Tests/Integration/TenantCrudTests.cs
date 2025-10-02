using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using FoodDeliveryApi.Api.Dtos;
using FoodDeliveryApi.Api.Models;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryApi.Tests.Integration;

public class TenantCrudTests : IntegrationTestBase
{
    public TenantCrudTests(WebApplicationFactory<Program> factory) : base(factory)
    {
        // Don't set tenant header for tenant management endpoints
    }

    [Fact]
    public async Task GetTenants_ShouldReturnAllTenants()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/tenants");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var tenants = JsonSerializer.Deserialize<List<TenantDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        tenants.Should().NotBeNull();
        tenants.Should().HaveCount(1); // We seeded 1 tenant
        tenants.Should().Contain(t => t.Identifier == "test-tenant");
    }

    [Fact]
    public async Task GetTenantById_WithValidId_ShouldReturnTenant()
    {
        // Arrange
        var tenantId = TestTenantId;

        // Act
        var response = await Client.GetAsync($"/api/v1/tenants/{tenantId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var tenant = JsonSerializer.Deserialize<TenantDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        tenant.Should().NotBeNull();
        tenant.Id.Should().Be(tenantId);
        tenant.Identifier.Should().Be("test-tenant");
        tenant.Name.Should().Be("Test Tenant");
        tenant.Email.Should().Be("test@example.com");
    }

    [Fact]
    public async Task GetTenantById_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var tenantId = "non-existent-id";

        // Act
        var response = await Client.GetAsync($"/api/v1/tenants/{tenantId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetTenantByIdentifier_WithValidIdentifier_ShouldReturnTenant()
    {
        // Arrange
        var identifier = "test-tenant";

        // Act
        var response = await Client.GetAsync($"/api/v1/tenants/identifier/{identifier}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var tenant = JsonSerializer.Deserialize<TenantDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        tenant.Should().NotBeNull();
        tenant.Identifier.Should().Be(identifier);
        tenant.Name.Should().Be("Test Tenant");
    }

    [Fact]
    public async Task GetTenantByIdentifier_WithInvalidIdentifier_ShouldReturnNotFound()
    {
        // Arrange
        var identifier = "non-existent-tenant";

        // Act
        var response = await Client.GetAsync($"/api/v1/tenants/identifier/{identifier}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateTenant_WithValidData_ShouldReturnCreated()
    {
        // Arrange
        var newTenant = new CreateTenantDto
        {
            Identifier = "new-tenant",
            Name = "New Test Tenant",
            Url = "https://newtenant.example.com",
            Email = "newtenant@example.com",
            Mobile = "+9876543210"
        };

        var json = JsonSerializer.Serialize(newTenant);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/v1/tenants", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<dynamic>(responseContent);

        result.Should().NotBeNull();

        // Verify it was saved to database
        var savedTenant = await Context.Tenants.FirstOrDefaultAsync(t => t.Identifier == "new-tenant");
        savedTenant.Should().NotBeNull();
        savedTenant.Name.Should().Be("New Test Tenant");
        savedTenant.Email.Should().Be("newtenant@example.com");
    }

    [Fact]
    public async Task CreateTenant_WithInvalidData_ShouldReturnBadRequest()
    {
        // Arrange
        var invalidTenant = new CreateTenantDto
        {
            Identifier = "", // Empty identifier should fail validation
            Name = "Invalid Tenant",
            Url = "invalid-url", // Invalid URL format
            Email = "invalid-email", // Invalid email format
            Mobile = "invalid-phone" // Invalid phone format
        };

        var json = JsonSerializer.Serialize(invalidTenant);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/v1/tenants", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateTenant_WithDuplicateIdentifier_ShouldReturnConflict()
    {
        // Arrange
        var duplicateTenant = new CreateTenantDto
        {
            Identifier = "test-tenant", // This already exists
            Name = "Duplicate Tenant",
            Url = "https://duplicate.example.com",
            Email = "duplicate@example.com",
            Mobile = "+1111111111"
        };

        var json = JsonSerializer.Serialize(duplicateTenant);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/v1/tenants", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateTenant_WithValidData_ShouldReturnOk()
    {
        // Arrange
        var tenantId = TestTenantId;
        var updatedTenant = new UpdateTenantDto
        {
            Name = "Updated Test Tenant",
            Url = "https://updated.example.com",
            Email = "updated@example.com",
            Mobile = "+1111111111",
            IsActive = true
        };

        var json = JsonSerializer.Serialize(updatedTenant);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PutAsync($"/api/v1/tenants/{tenantId}", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<dynamic>(responseContent);

        result.Should().NotBeNull();

        // Verify it was updated in database
        var savedTenant = await Context.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId);
        savedTenant.Should().NotBeNull();
        savedTenant.Name.Should().Be("Updated Test Tenant");
        savedTenant.Email.Should().Be("updated@example.com");
    }

    [Fact]
    public async Task UpdateTenant_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var tenantId = "non-existent-id";
        var updatedTenant = new UpdateTenantDto
        {
            Name = "Updated Tenant",
            Url = "https://updated.example.com",
            Email = "updated@example.com",
            Mobile = "+1111111111",
            IsActive = true
        };

        var json = JsonSerializer.Serialize(updatedTenant);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PutAsync($"/api/v1/tenants/{tenantId}", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateTenant_WithInvalidData_ShouldReturnBadRequest()
    {
        // Arrange
        var tenantId = TestTenantId;
        var invalidTenant = new UpdateTenantDto
        {
            Name = "", // Empty name should fail validation
            Url = "invalid-url", // Invalid URL format
            Email = "invalid-email", // Invalid email format
            Mobile = "invalid-phone", // Invalid phone format
            IsActive = true
        };

        var json = JsonSerializer.Serialize(invalidTenant);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PutAsync($"/api/v1/tenants/{tenantId}", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task DeleteTenant_WithValidIdentifier_ShouldReturnNoContent()
    {
        // Arrange - Create a new tenant first
        var newTenant = Tenant.Create(
            "tenant-to-delete", "delete-tenant", "Tenant to Delete", 
            "https://delete.example.com", "delete@example.com", "+9999999999"
        );
        Context.Tenants.Add(newTenant);
        await Context.SaveChangesAsync();

        // Act
        var response = await Client.DeleteAsync($"/api/v1/tenants/{newTenant.Identifier}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify it was deactivated in database (soft delete)
        var deletedTenant = await Context.Tenants.FirstOrDefaultAsync(t => t.Identifier == newTenant.Identifier);
        deletedTenant.Should().NotBeNull();
        deletedTenant.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteTenant_WithInvalidIdentifier_ShouldReturnNotFound()
    {
        // Arrange
        var identifier = "non-existent-tenant";

        // Act
        var response = await Client.DeleteAsync($"/api/v1/tenants/{identifier}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
