using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using FoodDeliveryApi.Api.Dtos;

namespace FoodDeliveryApi.Tests.Integration;

public class TenantEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public TenantEndpointTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetTenants_ShouldReturnEmptyList_WhenNoTenantsExist()
    {
        var response = await _client.GetAsync("/api/v1/tenants");
        
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var tenants = JsonSerializer.Deserialize<List<TenantDto>>(content);
        
        Assert.NotNull(tenants);
        Assert.Empty(tenants);
    }

    [Fact]
    public async Task CreateTenant_ShouldReturnCreated_WhenValidDataProvided()
    {
        var createTenantDto = new CreateTenantDto
        {
            Identifier = "test-tenant",
            Name = "Test Tenant",
            Url = "https://test.example.com",
            Email = "test@example.com",
            Mobile = "+1234567890"
        };

        var json = JsonSerializer.Serialize(createTenantDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _client.PostAsync("/api/v1/tenants", content);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
        
        Assert.True(result.TryGetProperty("id", out var id));
        Assert.False(string.IsNullOrEmpty(id.GetString()));
    }

    [Fact]
    public async Task CreateTenant_ShouldReturnBadRequest_WhenInvalidDataProvided()
    {
        var createTenantDto = new CreateTenantDto
        {
            Identifier = "",
            Name = "",
            Url = "invalid-url",
            Email = "invalid-email",
            Mobile = "invalid-phone"
        };

        var json = JsonSerializer.Serialize(createTenantDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _client.PostAsync("/api/v1/tenants", content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetTenantById_ShouldReturnNotFound_WhenTenantDoesNotExist()
    {
        var response = await _client.GetAsync("/api/v1/tenants/non-existent-id");
        
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateTenant_ShouldReturnNotFound_WhenTenantDoesNotExist()
    {
        var updateTenantDto = new UpdateTenantDto
        {
            Name = "Updated Tenant",
            Url = "https://updated.example.com",
            Email = "updated@example.com",
            Mobile = "+9876543210",
            IsActive = true
        };

        var json = JsonSerializer.Serialize(updateTenantDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _client.PutAsync("/api/v1/tenants/non-existent-id", content);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteTenant_ShouldReturnNotFound_WhenTenantDoesNotExist()
    {
        var response = await _client.DeleteAsync("/api/v1/tenants/non-existent-identifier");
        
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetTenantByIdentifier_ShouldReturnNotFound_WhenTenantDoesNotExist()
    {
        var response = await _client.GetAsync("/api/v1/tenants/identifier/non-existent");
        
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
