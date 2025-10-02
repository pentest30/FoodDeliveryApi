using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence.Repositories;

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