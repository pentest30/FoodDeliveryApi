using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence.Repositories;

public class EfRestaurantRepository : IRestaurantRepository
{
    private readonly FoodAppContext _db;
    public EfRestaurantRepository(FoodAppContext db) { _db = db; }

    public async Task<Restaurant?> GetByExternalIdAsync(string externalId, CancellationToken ct)
        => await _db.Restaurants.AsNoTracking().FirstOrDefaultAsync(r => r.ExternalId == externalId, ct);

    public async Task<IReadOnlyList<RestaurantSection>> GetSectionsByRestaurantExternalIdAsync(string externalId, CancellationToken ct)
    {
        var restaurant = await _db.Restaurants.AsNoTracking().FirstOrDefaultAsync(r => r.ExternalId == externalId, ct);
        return restaurant?.RestaurantSections ?? new List<RestaurantSection>();
    }

    public async Task<(IReadOnlyList<Restaurant> Items, int TotalCount)> SearchAsync(string? city, bool? openNow, string? category, string? q, int page, int pageSize, CancellationToken ct)
    {
     var query = _db.Restaurants
        .Include(r => r.RestaurantCategories)
            .ThenInclude(rc => rc.Category)
        .AsNoTracking()
        .AsQueryable();
    
    if (!string.IsNullOrWhiteSpace(city)) 
        query = query.Where(r => r.City.Contains(city));
    
    if (openNow.HasValue) 
        query = query.Where(r => r.IsOpenNow == openNow.Value);
    
    if (!string.IsNullOrWhiteSpace(category)) 
        query = query.Where(r => r.RestaurantCategories.Any(rc => rc.Category.Name.Contains(category)));
    
    if (!string.IsNullOrWhiteSpace(q)) 
        query = query.Where(r => r.Name.Contains(q) || r.RestaurantCategories.Any(rc => rc.Category.Name.Contains(q)));

    var total = await query.CountAsync(ct);
    
    var items = await query
        .OrderByDescending(r => r.Rating)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync(ct);
    
    return (items, total);

    }

    public async Task<Restaurant> CreateAsync(Restaurant restaurant, CancellationToken ct)
    {
        _db.Restaurants.Add(restaurant);
        await _db.SaveChangesAsync(ct);
        return restaurant;
    }

    public async Task<Restaurant> UpdateAsync(string externalId, Action<Restaurant> update, CancellationToken ct)
    {
        var entity = await _db.Restaurants.FirstOrDefaultAsync(r => r.ExternalId == externalId, ct) ?? throw new KeyNotFoundException();
        update(entity);
        await _db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task<bool> DeleteAsync(string externalId, CancellationToken ct)
    {
        var entity = await _db.Restaurants.FirstOrDefaultAsync(r => r.ExternalId == externalId, ct);
        if (entity is null) return false;
        _db.Restaurants.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class EfCategoryRepository : ICategoryRepository
{
    private readonly FoodAppContext _db;
    public EfCategoryRepository(FoodAppContext db) { _db = db; }
    public async Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken ct)
        => await _db.Categories.AsNoTracking().OrderBy(c => c.Name).ToListAsync(ct);

    public async Task<Category?> GetByExternalIdAsync(string externalId, CancellationToken ct)
        => await _db.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.ExternalId == externalId, ct);

    public async Task<Category> CreateAsync(Category category, CancellationToken ct)
    {
        _db.Categories.Add(category);
        await _db.SaveChangesAsync(ct);
        return category;
    }

    public async Task<Category> UpdateAsync(string externalId, Action<Category> update, CancellationToken ct)
    {
        var entity = await _db.Categories.FirstOrDefaultAsync(c => c.ExternalId == externalId, ct) ?? throw new KeyNotFoundException();
        update(entity);
        await _db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task<bool> DeleteAsync(string externalId, CancellationToken ct)
    {
        var entity = await _db.Categories.FirstOrDefaultAsync(c => c.ExternalId == externalId, ct);
        if (entity is null) return false;
        _db.Categories.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class EfOrderRepository : IOrderRepository
{
    private readonly FoodAppContext _db;
    public EfOrderRepository(FoodAppContext db) { _db = db; }

    public async Task<Order?> Get(Guid id)
        => await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);

    public Task Add(Order order)
    {
        _db.Orders.Add(order);
        return Task.CompletedTask;
    }

    public Task Update(Order order)
    {
        _db.Orders.Update(order);
        return Task.CompletedTask;
    }

    public async Task<Order?> GetByExternalId(string externalId)
        => await _db.Orders.FirstOrDefaultAsync(o => o.ExternalId == externalId);

    public async Task<Order?> GetByExternalIdAsync(string externalId, CancellationToken ct)
        => await _db.Orders.AsNoTracking().FirstOrDefaultAsync(o => o.ExternalId == externalId, ct);

    public async Task<(IReadOnlyList<Order> Items, int TotalCount)> SearchAsync(string? status, string? restaurantName, DateTimeOffset? from, DateTimeOffset? to, int page, int pageSize, CancellationToken ct)
    {
        var query = _db.Orders.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, out var statusEnum)) 
            query = query.Where(o => o.Status == statusEnum);
        if (!string.IsNullOrWhiteSpace(restaurantName)) query = query.Where(o => o.RestaurantName.Contains(restaurantName));
        if (from.HasValue) query = query.Where(o => o.CreatedAt >= from.Value);
        if (to.HasValue) query = query.Where(o => o.CreatedAt <= to.Value);
        var total = await query.CountAsync(ct);
        var items = await query.OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
        return (items, total);
    }

    public async Task<Order> CreateAsync(Order order, CancellationToken ct)
    {
        _db.Orders.Add(order);
        await _db.SaveChangesAsync(ct);
        return order;
    }

    public async Task<Order> UpdateAsync(string externalId, Action<Order> update, CancellationToken ct)
    {
        var entity = await _db.Orders.FirstOrDefaultAsync(o => o.ExternalId == externalId, ct) ?? throw new KeyNotFoundException();
        update(entity);
        await _db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task<bool> DeleteAsync(string externalId, CancellationToken ct)
    {
        var entity = await _db.Orders.FirstOrDefaultAsync(o => o.ExternalId == externalId, ct);
        if (entity is null) return false;
        _db.Orders.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class EfUserRepository : IUserRepository
{
    private readonly FoodAppContext _db;
    public EfUserRepository(FoodAppContext db) { _db = db; }

    public async Task<UserProfile?> GetByExternalIdAsync(string externalId, CancellationToken ct)
        => await _db.UserProfiles.AsNoTracking().Include(u => u.Addresses).Include(u => u.PaymentMethods).FirstOrDefaultAsync(u => u.ExternalId == externalId, ct);

    public async Task<UserProfile> UpdateAsync(string externalId, Action<UserProfile> update, CancellationToken ct)
    {
        var user = await _db.UserProfiles.FirstOrDefaultAsync(u => u.ExternalId == externalId, ct) ?? throw new KeyNotFoundException();
        update(user);
        await _db.SaveChangesAsync(ct);
        return user;
    }

    public async Task<UserProfile> CreateAsync(UserProfile user, CancellationToken ct)
    {
        _db.UserProfiles.Add(user);
        await _db.SaveChangesAsync(ct);
        return user;
    }

    public async Task<bool> DeleteAsync(string externalId, CancellationToken ct)
    {
        var entity = await _db.UserProfiles.FirstOrDefaultAsync(u => u.ExternalId == externalId, ct);
        if (entity is null) return false;
        _db.UserProfiles.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}


