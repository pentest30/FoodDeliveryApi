using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using FoodDeliveryApi.Api.Dtos;
using FoodDeliveryApi.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryApi.Tests.Integration;

public class RestaurantCrudTests : IntegrationTestBase
{
    public RestaurantCrudTests(WebApplicationFactory<Program> factory) : base(factory)
    {
        SetTenantHeader();
    }

    [Fact]
    public async Task GetRestaurants_ShouldReturnAllRestaurants()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/restaurants");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PaginatedResult<RestaurantDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        result.Should().NotBeNull();
        result.Data.Should().HaveCount(2); // We seeded 2 restaurants
        result.Data.Should().Contain(r => r.Name == "Pizza Palace");
        result.Data.Should().Contain(r => r.Name == "Burger King");
    }

    [Fact]
    public async Task GetRestaurants_WithPagination_ShouldReturnCorrectPage()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/restaurants?page=1&pageSize=1");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PaginatedResult<RestaurantDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        result.Should().NotBeNull();
        result.Data.Should().HaveCount(1);
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(1);
        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task GetRestaurants_WithFilters_ShouldReturnFilteredResults()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/restaurants?city=New York");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PaginatedResult<RestaurantDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        result.Should().NotBeNull();
        result.Data.Should().HaveCount(1);
        result.Data.Should().Contain(r => r.Name == "Pizza Palace");
    }

    [Fact]
    public async Task GetRestaurantById_WithValidId_ShouldReturnRestaurant()
    {
        // Arrange
        var restaurantId = "rest-001";

        // Act
        var response = await Client.GetAsync($"/api/v1/restaurants/{restaurantId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var restaurant = JsonSerializer.Deserialize<RestaurantDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        restaurant.Should().NotBeNull();
        restaurant.Id.Should().Be(restaurantId);
        restaurant.Name.Should().Be("Pizza Palace");
        restaurant.City.Should().Be("New York");
        restaurant.EtaMinutes.Should().Be(25);
        restaurant.DistanceKm.Should().Be(2.5m);
    }

    [Fact]
    public async Task GetRestaurantById_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var restaurantId = "non-existent-id";

        // Act
        var response = await Client.GetAsync($"/api/v1/restaurants/{restaurantId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateRestaurant_WithValidData_ShouldReturnCreated()
    {
        // Arrange
        var newRestaurant = new UpsertRestaurantDto
        {
            ExternalId = "rest-003",
            Name = "Sushi World",
            City = "Tokyo",
            EtaMinutes = 30,
            DistanceKm = 3.2m,
            Icon = "🍣",
            PrimaryColor = "#45B7D1",
            Images = new List<string> { "https://example.com/sushi1.jpg" },
            Categories = new List<string> { "Sushi" }
        };

        var json = JsonSerializer.Serialize(newRestaurant);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/v1/restaurants", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<dynamic>(responseContent);

        result.Should().NotBeNull();

        // Verify it was saved to database
        var savedRestaurant = await Context.Restaurants.FirstOrDefaultAsync(r => r.ExternalId == "rest-003");
        savedRestaurant.Should().NotBeNull();
        savedRestaurant.Name.Should().Be("Sushi World");
        savedRestaurant.City.Should().Be("Tokyo");
    }

    [Fact]
    public async Task CreateRestaurant_WithInvalidData_ShouldReturnBadRequest()
    {
        // Arrange
        var invalidRestaurant = new UpsertRestaurantDto
        {
            ExternalId = "rest-004",
            Name = "", // Empty name should fail validation
            City = "Tokyo",
            EtaMinutes = 30,
            DistanceKm = 3.2m,
            Icon = "🍣",
            PrimaryColor = "#45B7D1"
        };

        var json = JsonSerializer.Serialize(invalidRestaurant);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/v1/restaurants", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateRestaurant_WithValidData_ShouldReturnOk()
    {
        // Arrange
        var restaurantId = "rest-001";
        var updatedRestaurant = new UpsertRestaurantDto
        {
            Name = "Updated Pizza Palace",
            City = "New York",
            EtaMinutes = 20,
            DistanceKm = 2.0m,
            Icon = "🍕",
            PrimaryColor = "#FF0000",
            Rating = 4.5m,
            IsOpenNow = true
        };

        var json = JsonSerializer.Serialize(updatedRestaurant);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PutAsync($"/api/v1/restaurants/{restaurantId}", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<dynamic>(responseContent);

        result.Should().NotBeNull();

        // Verify it was updated in database
        var savedRestaurant = await Context.Restaurants.FirstOrDefaultAsync(r => r.ExternalId == restaurantId);
        savedRestaurant.Should().NotBeNull();
        savedRestaurant.Name.Should().Be("Updated Pizza Palace");
        savedRestaurant.EtaMinutes.Should().Be(20);
    }

    [Fact]
    public async Task UpdateRestaurant_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var restaurantId = "non-existent-id";
        var updatedRestaurant = new UpsertRestaurantDto
        {
            Name = "Updated Restaurant",
            City = "New York",
            EtaMinutes = 20,
            DistanceKm = 2.0m,
            Icon = "🍕",
            PrimaryColor = "#FF0000"
        };

        var json = JsonSerializer.Serialize(updatedRestaurant);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PutAsync($"/api/v1/restaurants/{restaurantId}", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteRestaurant_WithValidId_ShouldReturnNoContent()
    {
        // Arrange
        var restaurantId = "rest-002"; // Burger King

        // Act
        var response = await Client.DeleteAsync($"/api/v1/restaurants/{restaurantId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify it was deleted from database
        var deletedRestaurant = await Context.Restaurants.FirstOrDefaultAsync(r => r.ExternalId == restaurantId);
        deletedRestaurant.Should().BeNull();
    }

    [Fact]
    public async Task DeleteRestaurant_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var restaurantId = "non-existent-id";

        // Act
        var response = await Client.DeleteAsync($"/api/v1/restaurants/{restaurantId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetRestaurantSections_WithValidId_ShouldReturnSections()
    {
        // Arrange
        var restaurantId = "rest-001";

        // Act
        var response = await Client.GetAsync($"/api/v1/restaurants/{restaurantId}/sections");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var sections = JsonSerializer.Deserialize<List<MenuSectionDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        sections.Should().NotBeNull();
        // Note: We haven't seeded sections, so this might return empty or 404
        // This test verifies the endpoint works
    }
}
