using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Users;

namespace FoodDeliveryApi.FoodDeliveryApi.Application.Services;

public class UserService
{
    private readonly IUserRepository _repository;

    public UserService(IUserRepository repository)
    {
        _repository = repository;
    }

    public async Task<UserProfile?> GetByExternalIdAsync(string externalId, CancellationToken ct)
    {
        return await _repository.GetByExternalIdAsync(externalId, ct);
    }

    public async Task<UserProfile> CreateAsync(UserProfile user, CancellationToken ct)
    {
        // Business logic: validate user data
        if (string.IsNullOrWhiteSpace(user.Name))
            throw new ArgumentException("User name is required");

        if (string.IsNullOrWhiteSpace(user.Email))
            throw new ArgumentException("Email is required");

        // Check for duplicate email
        var existing = await _repository.GetByExternalIdAsync(user.Email, ct);
        if (existing != null)
            throw new InvalidOperationException("User with this email already exists");

        return await _repository.CreateAsync(user, ct);
    }

    public async Task<UserProfile> UpdateAsync(string externalId, Action<UserProfile> update, CancellationToken ct)
    {
        return await _repository.UpdateAsync(externalId, update, ct);
    }

    public async Task<bool> DeleteAsync(string externalId, CancellationToken ct)
    {
        return await _repository.DeleteAsync(externalId, ct);
    }

    public async Task<IReadOnlyList<global::FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects.Address>> GetAddressesAsync(string externalId, CancellationToken ct)
    {
        var user = await _repository.GetByExternalIdAsync(externalId, ct);
        return user?.Addresses ?? new List<global::FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects.Address>();
    }

    public async Task<IReadOnlyList<global::FoodDeliveryApi.FoodDeliveryApi.Domain.Users.UserPaymentMethod>> GetPaymentMethodsAsync(string externalId, CancellationToken ct)
    {
        var user = await _repository.GetByExternalIdAsync(externalId, ct);
        return user?.PaymentMethods ?? new List<global::FoodDeliveryApi.FoodDeliveryApi.Domain.Users.UserPaymentMethod>();
    }
}
