using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using FoodDeliveryApi.Api.Dtos;
using FoodDeliveryApi.Api.Models;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryApi.Tests.Integration;

public class UserCrudTests : IntegrationTestBase
{
    public UserCrudTests(WebApplicationFactory<Program> factory) : base(factory)
    {
        SetTenantHeader();
    }

    [Fact]
    public async Task GetUser_WithValidId_ShouldReturnUser()
    {
        // Arrange
        var userId = "user-001";

        // Act
        var response = await Client.GetAsync($"/api/v1/users/{userId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var user = JsonSerializer.Deserialize<UserProfileDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        user.Should().NotBeNull();
        user.Id.Should().Be(userId);
        user.Name.Should().Be("John Doe");
        user.Email.Should().Be("john@example.com");
        user.Phone.Should().Be("+1234567890");
    }

    [Fact]
    public async Task GetUser_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var userId = "non-existent-id";

        // Act
        var response = await Client.GetAsync($"/api/v1/users/{userId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateUser_WithValidData_ShouldReturnCreated()
    {
        // Arrange
        var newUser = new UpdateUserDto
        {
            Name = "Jane Doe",
            Email = "jane@example.com",
            Phone = "+1987654321",
            ProfileImages = new List<string> { "https://example.com/jane.jpg" }
        };

        var json = JsonSerializer.Serialize(newUser);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/v1/users", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<dynamic>(responseContent);

        result.Should().NotBeNull();

        // Verify it was saved to database
        var savedUser = await Context.UserProfiles.FirstOrDefaultAsync(u => u.Email == "jane@example.com");
        savedUser.Should().NotBeNull();
        savedUser.Name.Should().Be("Jane Doe");
        savedUser.Phone.Should().Be("+1987654321");
    }

    [Fact]
    public async Task CreateUser_WithInvalidData_ShouldReturnBadRequest()
    {
        // Arrange
        var invalidUser = new UpdateUserDto
        {
            Name = "", // Empty name should fail validation
            Email = "invalid-email", // Invalid email format
            Phone = "+1987654321"
        };

        var json = JsonSerializer.Serialize(invalidUser);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/v1/users", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateUser_WithValidData_ShouldReturnOk()
    {
        // Arrange
        var userId = "user-001";
        var updatedUser = new UpdateUserDto
        {
            Name = "Updated John Doe",
            Email = "updated.john@example.com",
            Phone = "+1111111111",
            ProfileImages = new List<string> { "https://example.com/updated-john.jpg" }
        };

        var json = JsonSerializer.Serialize(updatedUser);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PutAsync($"/api/v1/users/{userId}", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<UserProfileDto>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        result.Should().NotBeNull();
        result.Name.Should().Be("Updated John Doe");
        result.Email.Should().Be("updated.john@example.com");
        result.Phone.Should().Be("+1111111111");

        // Verify it was updated in database
        var savedUser = await Context.UserProfiles.FirstOrDefaultAsync(u => u.ExternalId == userId);
        savedUser.Should().NotBeNull();
        savedUser.Name.Should().Be("Updated John Doe");
        savedUser.Email.Should().Be("updated.john@example.com");
    }

    [Fact]
    public async Task UpdateUser_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var userId = "non-existent-id";
        var updatedUser = new UpdateUserDto
        {
            Name = "Updated User",
            Email = "updated@example.com",
            Phone = "+1111111111"
        };

        var json = JsonSerializer.Serialize(updatedUser);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PutAsync($"/api/v1/users/{userId}", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateUser_WithInvalidData_ShouldReturnBadRequest()
    {
        // Arrange
        var userId = "user-001";
        var invalidUser = new UpdateUserDto
        {
            Name = "", // Empty name should fail validation
            Email = "invalid-email", // Invalid email format
            Phone = "+1111111111"
        };

        var json = JsonSerializer.Serialize(invalidUser);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PutAsync($"/api/v1/users/{userId}", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task DeleteUser_WithValidId_ShouldReturnNoContent()
    {
        // Arrange - Create a new user first
        var newUser = UserProfile.Create(
            "user-002", TestTenantId, "Test User", "test@example.com", "+1234567890", new List<string>()
        );
        Context.UserProfiles.Add(newUser);
        await Context.SaveChangesAsync();

        // Act
        var response = await Client.DeleteAsync($"/api/v1/users/{newUser.ExternalId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify it was deleted from database
        var deletedUser = await Context.UserProfiles.FirstOrDefaultAsync(u => u.ExternalId == newUser.ExternalId);
        deletedUser.Should().BeNull();
    }

    [Fact]
    public async Task DeleteUser_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var userId = "non-existent-id";

        // Act
        var response = await Client.DeleteAsync($"/api/v1/users/{userId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetUserAddresses_WithValidId_ShouldReturnAddresses()
    {
        // Arrange
        var userId = "user-001";

        // Act
        var response = await Client.GetAsync($"/api/v1/users/{userId}/addresses");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var addresses = JsonSerializer.Deserialize<List<UserAddressDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        addresses.Should().NotBeNull();
        // Note: We haven't seeded addresses, so this might return empty or 404
        // This test verifies the endpoint works
    }

    [Fact]
    public async Task CreateUser_WithoutTenantHeader_ShouldReturnBadRequest()
    {
        // Arrange
        Client.DefaultRequestHeaders.Remove("X-Tenant-Id");
        
        var newUser = new UpdateUserDto
        {
            Name = "Test User",
            Email = "test@example.com",
            Phone = "+1234567890"
        };

        var json = JsonSerializer.Serialize(newUser);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/v1/users", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
