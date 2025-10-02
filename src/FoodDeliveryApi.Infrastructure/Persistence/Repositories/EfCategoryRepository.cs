using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence.Repositories;

public class EfCategoryRepository : ICategoryRepository
{
    private readonly FoodAppContext _db;
    public EfCategoryRepository(FoodAppContext db) { _db = db; }
    public async Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken ct)
        => await _db.Categories.IgnoreQueryFilters().AsNoTracking().OrderBy(c => c.Name).ToListAsync(ct);

    public async Task<Category?> GetByExternalIdAsync(string externalId, CancellationToken ct)
        => await _db.Categories.AsNoTracking().IgnoreQueryFilters().FirstOrDefaultAsync(c => c.ExternalId == externalId, ct);

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