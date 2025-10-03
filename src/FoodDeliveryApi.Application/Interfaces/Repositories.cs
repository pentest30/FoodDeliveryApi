using FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Users;

namespace FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;

public interface IRestaurantRepository
{
    Task<(IReadOnlyList<Restaurant> Items, int TotalCount)> SearchAsync(string? city, bool? openNow, string? category, string? q, int page, int pageSize, CancellationToken ct);
    Task<Restaurant?> GetByExternalIdAsync(string externalId, CancellationToken ct);
    Task<Restaurant?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<RestaurantSection>> GetSectionsByRestaurantExternalIdAsync(string externalId, CancellationToken ct);
    Task<RestaurantSection?> GetSectionByIdAsync(Guid sectionId, CancellationToken ct);
    Task<Restaurant> CreateAsync(Restaurant restaurant, CancellationToken ct);
    Task<Restaurant> UpdateAsync(string externalId, Action<Restaurant> update, CancellationToken ct);
    Task UpdateAsync(Restaurant update, CancellationToken ct);
    Task<bool> DeleteAsync(string externalId, CancellationToken ct);
    Task<IReadOnlyList<Category>> GetCategoriesByExternalIdsAsync(List<string> externalIds, CancellationToken ct);
}

public interface ICategoryRepository
{
    Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken ct);
    Task<Category?> GetByExternalIdAsync(string externalId, CancellationToken ct);
    Task<Category> CreateAsync(Category category, CancellationToken ct);
    Task<Category> UpdateAsync(string externalId, Action<Category> update, CancellationToken ct);
    Task<bool> DeleteAsync(string externalId, CancellationToken ct);
}

public interface IOrderRepository
{
    Task<Order?> Get(Guid id);
    Task Add(Order order);
    Task Update(Order order);
    Task<Order?> GetByExternalId(string externalId);
    
    // Legacy methods for backward compatibility
    Task<(IReadOnlyList<Order> Items, int TotalCount)> SearchAsync(string? status, string? restaurantName, DateTimeOffset? from, DateTimeOffset? to, int page, int pageSize, CancellationToken ct);
    Task<Order?> GetByExternalIdAsync(string externalId, CancellationToken ct);
    Task<Order> CreateAsync(Order order, CancellationToken ct);
    Task<Order> UpdateAsync(string externalId, Action<Order> update, CancellationToken ct);
    Task<bool> DeleteAsync(string externalId, CancellationToken ct);
}

public interface IUserRepository
{
    Task<UserProfile?> GetByExternalIdAsync(string externalId, CancellationToken ct);
    Task<UserProfile> UpdateAsync(string externalId, Action<UserProfile> update, CancellationToken ct);
    Task<UserProfile> CreateAsync(UserProfile user, CancellationToken ct);
    Task<bool> DeleteAsync(string externalId, CancellationToken ct);
}


