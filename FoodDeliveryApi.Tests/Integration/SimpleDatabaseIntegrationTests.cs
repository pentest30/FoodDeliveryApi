using Microsoft.EntityFrameworkCore;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence;

namespace FoodDeliveryApi.Tests.Integration;

public class SimpleDatabaseIntegrationTests : IClassFixture<IntegrationTestBase>
{
    private readonly IntegrationTestBase _testBase;
    private readonly TestDbContext _context;

    public SimpleDatabaseIntegrationTests(IntegrationTestBase testBase)
    {
        _testBase = testBase;
        _context = _testBase.Context;
    }

    [Fact]
    public async Task CreateRestaurant_ShouldPersistToDatabase()
    {
        // Arrange
        var restaurant = Restaurant.Create(
            "test-restaurant-001",
            "test-tenant-001",
            "Test Restaurant",
            "Test City",
            25,
            2.5m,
            "test@restaurant.com",
            "+1234567890",
            "🍕",
            "#FF6B6B",
            new List<string> { "https://example.com/restaurant1.jpg" }
        );

        // Act
        _context.Restaurants.Add(restaurant);
        await _context.SaveChangesAsync();

        // Assert
        var savedRestaurant = await _context.Restaurants
            .FirstOrDefaultAsync(r => r.ExternalId == "test-restaurant-001");
        
        Assert.NotNull(savedRestaurant);
        Assert.Equal("Test Restaurant", savedRestaurant.Name);
        Assert.Equal("Test City", savedRestaurant.City);
        Assert.Equal(25, savedRestaurant.Rating);
    }

    [Fact]
    public async Task CreateRestaurantSection_ShouldPersistToDatabase()
    {
        // Arrange
        var restaurant = await CreateTestRestaurant();
        var section = RestaurantSection.Create(
            "Test Section",
            "Test Section Description",
            1,
            true
        );
        section.SetRestaurantId(restaurant.Id);

        // Act
        _context.RestaurantSections.Add(section);
        await _context.SaveChangesAsync();

        // Assert
        var savedSection = await _context.RestaurantSections
            .FirstOrDefaultAsync(s => s.Name == "Test Section");
        
        Assert.NotNull(savedSection);
        Assert.Equal("Test Section", savedSection.Name);
        Assert.Equal("Test Section Description", savedSection.Description);
        Assert.Equal(1, savedSection.SortOrder);
        Assert.True(savedSection.Active);
        Assert.Equal(restaurant.Id, savedSection.RestaurantId);
    }

    [Fact]
    public async Task CreateMenuItem_ShouldPersistToDatabase()
    {
        // Arrange
        var restaurant = await CreateTestRestaurant();
        var section = await CreateTestSection(restaurant.Id);
        var menuItem = RestaurantMenuItem.Create(
            "Test Menu Item",
            "Test Description",
            15.99m,
            1,
            true,
            new List<string> { "image1.jpg" },
            new List<string> { "nuts" }
        );

        // Act
        section.AddMenuItem(menuItem);
        _context.RestaurantSections.Update(section);
        await _context.SaveChangesAsync();

        // Assert
        var savedMenuItem = await _context.RestaurantSections
            .Where(s => s.Id == section.Id)
            .SelectMany(s => s.MenuItems)
            .FirstOrDefaultAsync(mi => mi.Name == "Test Menu Item");
        
        Assert.NotNull(savedMenuItem);
        Assert.Equal("Test Menu Item", savedMenuItem.Name);
        Assert.Equal("Test Description", savedMenuItem.Description);
        Assert.Equal(15.99m, savedMenuItem.BasePrice);
        Assert.Equal(1, savedMenuItem.Quantity);
        Assert.True(savedMenuItem.Available);
        Assert.Contains("image1.jpg", savedMenuItem.Images);
        Assert.Contains("nuts", savedMenuItem.Allergens);
    }

    [Fact]
    public async Task CreateMenuItemVariant_ShouldPersistToDatabase()
    {
        // Arrange
        var restaurant = await CreateTestRestaurant();
        var section = await CreateTestSection(restaurant.Id);
        var menuItem = await CreateTestMenuItem(section.Id);
        var variant = MenuItemVariant.Create(
            menuItem.Id,
            "Test Variant",
            19.99m,
            "DZD",
            1,
            "Test Variant Description",
            "Large",
            "piece",
            500m,
            "20x15x10",
            "VAR-001",
            50,
            DateTime.UtcNow.AddDays(30)
        );

        // Act
        menuItem.AddVariant(variant);
        _context.RestaurantSections.Update(section);
        await _context.SaveChangesAsync();

        // Assert
        var savedVariant = await _context.RestaurantSections
            .Where(s => s.Id == section.Id)
            .SelectMany(s => s.MenuItems)
            .Where(mi => mi.Id == menuItem.Id)
            .SelectMany(mi => mi.Variants)
            .FirstOrDefaultAsync(v => v.Name == "Test Variant");
        
        Assert.NotNull(savedVariant);
        Assert.Equal("Test Variant", savedVariant.Name);
        Assert.Equal("Test Variant Description", savedVariant.Description);
        Assert.Equal(19.99m, savedVariant.Price);
        Assert.Equal("DZD", savedVariant.Currency);
        Assert.Equal(1, savedVariant.SortOrder);
        Assert.Equal("Large", savedVariant.Size);
        Assert.Equal("piece", savedVariant.Unit);
        Assert.Equal(500m, savedVariant.Weight);
        Assert.Equal("20x15x10", savedVariant.Dimensions);
        Assert.Equal("VAR-001", savedVariant.SKU);
        Assert.Equal(50, savedVariant.StockQuantity);
    }

    // Helper methods
    private async Task<Restaurant> CreateTestRestaurant()
    {
        var restaurant = Restaurant.Create(
            "test-restaurant-001",
            "test-tenant-001",
            "Test Restaurant",
            "Test City",
            25,
            2.5m,
            "test@restaurant.com",
            "+1234567890",
            "🍕",
            "#FF6B6B",
            new List<string> { "https://example.com/restaurant1.jpg" }
        );

        _context.Restaurants.Add(restaurant);
        await _context.SaveChangesAsync();
        return restaurant;
    }

    private async Task<RestaurantSection> CreateTestSection(Guid restaurantId)
    {
        var section = RestaurantSection.Create(
            "Test Section",
            "Test Section Description",
            1,
            true
        );
        section.SetRestaurantId(restaurantId);

        _context.RestaurantSections.Add(section);
        await _context.SaveChangesAsync();
        return section;
    }

    private async Task<RestaurantMenuItem> CreateTestMenuItem(Guid sectionId, string name = "Test Menu Item")
    {
        var menuItem = RestaurantMenuItem.Create(
            name,
            "Test Description",
            15.99m,
            1,
            true,
            new List<string> { "image1.jpg" },
            new List<string> { "nuts" }
        );

        var section = _context.RestaurantSections.FirstOrDefault(s => s.Id == sectionId);
        if (section != null)
        {
            section.AddMenuItem(menuItem);
            _context.RestaurantSections.Update(section);
            await _context.SaveChangesAsync();
        }
        
        return menuItem;
    }
}
