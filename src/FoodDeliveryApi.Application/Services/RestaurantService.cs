using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;

namespace FoodDeliveryApi.FoodDeliveryApi.Application.Services;

public class RestaurantService
{
    private readonly IRestaurantRepository _repository;

    public RestaurantService(IRestaurantRepository repository)
    {
        _repository = repository;
    }

    public async Task<(IReadOnlyList<Restaurant> Items, int TotalCount)> SearchAsync(
        string? city, bool? openNow, string? category, string? q, int page, int pageSize, CancellationToken ct)
    {
        return await _repository.SearchAsync(city, openNow, category, q, page, pageSize, ct);
    }

    public async Task<Restaurant?> GetByExternalIdAsync(string externalId, CancellationToken ct)
    {
        return await _repository.GetByExternalIdAsync(externalId, ct);
    }

    public async Task<IReadOnlyList<RestaurantSection>> GetSectionsByRestaurantExternalIdAsync(string externalId, CancellationToken ct)
    {
        return await _repository.GetSectionsByRestaurantExternalIdAsync(externalId, ct);
    }

    public async Task<Restaurant> CreateAsync(Restaurant restaurant, CancellationToken ct)
    {
        // Business logic: validate restaurant data
        if (string.IsNullOrWhiteSpace(restaurant.Name))
            throw new ArgumentException("Restaurant name is required");
        
        if (restaurant.Rating < 0 || restaurant.Rating > 5)
            throw new ArgumentException("Rating must be between 0 and 5");

        return await _repository.CreateAsync(restaurant, ct);
    }

    public async Task<Restaurant> UpdateAsync(string externalId, Action<Restaurant> update, CancellationToken ct)
    {
        return await _repository.UpdateAsync(externalId, update, ct);
    }

    public async Task<bool> DeleteAsync(string externalId, CancellationToken ct)
    {
        return await _repository.DeleteAsync(externalId, ct);
    }

    public async Task<Restaurant> AddCategoriesAsync(string externalId, List<string> categoryIds, CancellationToken ct)
    {
        var restaurant = await _repository.GetByExternalIdAsync(externalId, ct);
        if (restaurant == null)
            throw new KeyNotFoundException($"Restaurant with external ID '{externalId}' not found");

        // Get categories by external IDs
        var categories = await _repository.GetCategoriesByExternalIdsAsync(categoryIds, ct);
        
        foreach (var category in categories)
        {
            restaurant.AddCategory(category.Id);
        }

        return await _repository.UpdateAsync(externalId, r => { }, ct);
    }

    public async Task<Restaurant> RemoveCategoriesAsync(string externalId, List<string> categoryIds, CancellationToken ct)
    {
        var restaurant = await _repository.GetByExternalIdAsync(externalId, ct);
        if (restaurant == null)
            throw new KeyNotFoundException($"Restaurant with external ID '{externalId}' not found");

        // Get categories by external IDs to get their internal IDs
        var categories = await _repository.GetCategoriesByExternalIdsAsync(categoryIds, ct);
        
        foreach (var category in categories)
        {
            restaurant.RemoveCategory(category.Id);
        }

        return await _repository.UpdateAsync(externalId, r => { }, ct);
    }

    public async Task<Restaurant> SetCategoriesAsync(string externalId, List<string> categoryIds, CancellationToken ct)
    {
        var restaurant = await _repository.GetByExternalIdAsync(externalId, ct);
        if (restaurant == null)
            throw new KeyNotFoundException($"Restaurant with external ID '{externalId}' not found");

        // Clear existing categories
        restaurant.RestaurantCategories.Clear();

        // Add new categories
        if (categoryIds.Any())
        {
            var categories = await _repository.GetCategoriesByExternalIdsAsync(categoryIds, ct);
            foreach (var category in categories)
            {
                restaurant.AddCategory(category.Id);
            }
        }

        return await _repository.UpdateAsync(externalId, r => { }, ct);
    }

    public async Task<IReadOnlyList<Category>> GetCategoriesByExternalIdsAsync(List<string> externalIds, CancellationToken ct)
    {
        return await _repository.GetCategoriesByExternalIdsAsync(externalIds, ct);
    }
}
