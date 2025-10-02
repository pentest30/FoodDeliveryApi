using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence.Repositories;

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