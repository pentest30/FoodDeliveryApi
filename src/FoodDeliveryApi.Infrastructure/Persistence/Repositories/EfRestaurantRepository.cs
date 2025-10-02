using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;
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