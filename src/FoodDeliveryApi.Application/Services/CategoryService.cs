using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using Microsoft.Extensions.Caching.Memory;

namespace FoodDeliveryApi.FoodDeliveryApi.Application.Services;

public class CategoryService
{
    private readonly ICategoryRepository _repository;
    private readonly IMemoryCache _cache;
    private const string CACHE_KEY_PREFIX = "categories_";

    public CategoryService(ICategoryRepository repository, IMemoryCache cache)
    {
        _repository = repository;
        _cache = cache;
    }

    public async Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken ct)
    {
        var cacheKey = $"{CACHE_KEY_PREFIX}all";
        
        if (_cache.TryGetValue(cacheKey, out IReadOnlyList<Category>? cachedCategories))
        {
            return cachedCategories!;
        }

        var categories = await _repository.GetAllAsync(ct);
        
        // Cache for 5 minutes
        _cache.Set(cacheKey, categories, TimeSpan.FromMinutes(5));
        
        return categories;
    }

    public async Task<Category?> GetByExternalIdAsync(string externalId, CancellationToken ct)
    {
        return await _repository.GetByExternalIdAsync(externalId, ct);
    }

    public async Task<Category> CreateAsync(Category category, CancellationToken ct)
    {
        // Business logic: validate category data
        if (string.IsNullOrWhiteSpace(category.Name))
            throw new ArgumentException("Category name is required");

        // Check for duplicate names
        var existing = await _repository.GetAllAsync(ct);
        if (existing.Any(c => c.Name.Equals(category.Name, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException("Category with this name already exists");

        var result = await _repository.CreateAsync(category, ct);
        
        // Invalidate cache
        _cache.Remove($"{CACHE_KEY_PREFIX}all");
        
        return result;
    }

    public async Task<Category> UpdateAsync(string externalId, Action<Category> update, CancellationToken ct)
    {
        var result = await _repository.UpdateAsync(externalId, update, ct);
        
        // Invalidate cache
        _cache.Remove($"{CACHE_KEY_PREFIX}all");
        
        return result;
    }

    public async Task<bool> DeleteAsync(string externalId, CancellationToken ct)
    {
        var result = await _repository.DeleteAsync(externalId, ct);
        
        if (result)
        {
            // Invalidate cache
            _cache.Remove($"{CACHE_KEY_PREFIX}all");
        }
        
        return result;
    }
}
