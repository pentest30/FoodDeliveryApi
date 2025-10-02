using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using FoodDeliveryApi.Api.Dtos;
using FoodDeliveryApi.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryApi.Tests.Integration;

public class CategoryCrudTests : IntegrationTestBase
{
    public CategoryCrudTests(WebApplicationFactory<Program> factory) : base(factory)
    {
        SetTenantHeader();
    }

    [Fact]
    public async Task GetCategories_ShouldReturnAllCategories()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/categories");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var categories = JsonSerializer.Deserialize<List<CategoryDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        categories.Should().NotBeNull();
        categories.Should().HaveCount(3); // We seeded 3 categories
        categories.Should().Contain(c => c.Name == "Pizza");
        categories.Should().Contain(c => c.Name == "Burger");
        categories.Should().Contain(c => c.Name == "Sushi");
    }

    [Fact]
    public async Task GetCategoryById_WithValidId_ShouldReturnCategory()
    {
        // Arrange
        var categoryId = "cat-001";

        // Act
        var response = await Client.GetAsync($"/api/v1/categories/{categoryId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var category = JsonSerializer.Deserialize<CategoryDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        category.Should().NotBeNull();
        category.Id.Should().Be(categoryId);
        category.Name.Should().Be("Pizza");
        category.Icon.Should().Be("🍕");
        category.Color.Should().Be("#FF6B6B");
    }

    [Fact]
    public async Task GetCategoryById_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var categoryId = "non-existent-id";

        // Act
        var response = await Client.GetAsync($"/api/v1/categories/{categoryId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateCategory_WithValidData_ShouldReturnCreated()
    {
        // Arrange
        var newCategory = new UpsertCategoryDto
        {
            ExternalId = "cat-004",
            Name = "Desserts",
            Icon = "🍰",
            Color = "#FFB6C1"
        };

        var json = JsonSerializer.Serialize(newCategory);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/v1/categories", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var createdCategory = JsonSerializer.Deserialize<CategoryDto>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        createdCategory.Should().NotBeNull();
        createdCategory.Id.Should().Be("cat-004");
        createdCategory.Name.Should().Be("Desserts");
        createdCategory.Icon.Should().Be("🍰");
        createdCategory.Color.Should().Be("#FFB6C1");

        // Verify it was saved to database
        var savedCategory = await Context.Categories.FirstOrDefaultAsync(c => c.ExternalId == "cat-004");
        savedCategory.Should().NotBeNull();
        savedCategory.Name.Should().Be("Desserts");
    }

    [Fact]
    public async Task CreateCategory_WithInvalidData_ShouldReturnBadRequest()
    {
        // Arrange
        var invalidCategory = new UpsertCategoryDto
        {
            ExternalId = "cat-005",
            Name = "", // Empty name should fail validation
            Icon = "🍰",
            Color = "#FFB6C1"
        };

        var json = JsonSerializer.Serialize(invalidCategory);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/v1/categories", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateCategory_WithValidData_ShouldReturnOk()
    {
        // Arrange
        var categoryId = "cat-001";
        var updatedCategory = new UpsertCategoryDto
        {
            Name = "Updated Pizza",
            Icon = "🍕",
            Color = "#FF0000"
        };

        var json = JsonSerializer.Serialize(updatedCategory);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PutAsync($"/api/v1/categories/{categoryId}", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<CategoryDto>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        result.Should().NotBeNull();
        result.Name.Should().Be("Updated Pizza");
        result.Color.Should().Be("#FF0000");

        // Verify it was updated in database
        Context.ChangeTracker.Clear(); // Clear tracked entities to ensure we fetch from database
        var savedCategory = await Context.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.ExternalId == categoryId);
        savedCategory.Should().NotBeNull();
        savedCategory!.Name.Should().Be("Updated Pizza");
        savedCategory.Color.Should().Be("#FF0000");
    }

    [Fact]
    public async Task UpdateCategory_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var categoryId = "non-existent-id";
        var updatedCategory = new UpsertCategoryDto
        {
            Name = "Updated Category",
            Icon = "🍕",
            Color = "#FF0000"
        };

        var json = JsonSerializer.Serialize(updatedCategory);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PutAsync($"/api/v1/categories/{categoryId}", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteCategory_WithValidId_ShouldReturnNoContent()
    {
        // Arrange
        var categoryId = "cat-003"; // Sushi category

        // Act
        var response = await Client.DeleteAsync($"/api/v1/categories/{categoryId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify it was deleted from database
        var deletedCategory = await Context.Categories.FirstOrDefaultAsync(c => c.ExternalId == categoryId);
        deletedCategory.Should().BeNull();
    }

    [Fact]
    public async Task DeleteCategory_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var categoryId = "non-existent-id";

        // Act
        var response = await Client.DeleteAsync($"/api/v1/categories/{categoryId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateCategory_WithoutTenantHeader_ShouldReturnBadRequest()
    {
        // Arrange
        Client.DefaultRequestHeaders.Remove("X-Tenant-Id");
        
        var newCategory = new UpsertCategoryDto
        {
            ExternalId = "cat-006",
            Name = "Test Category",
            Icon = "🍰",
            Color = "#FFB6C1"
        };

        var json = JsonSerializer.Serialize(newCategory);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/v1/categories", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
