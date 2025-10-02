using FoodDeliveryApi.FoodDeliveryApi.Domain.Common;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;

namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Users;

public class UserProfile : IHasDomainEvents
{
    private readonly List<IDomainEvent> _domainEvents = new();

    public Guid Id { get; private set; }
    public string ExternalId { get; private set; } = string.Empty;
    public string TenantId { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public List<string> ProfileImages { get; private set; } = new();
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? UpdatedAt { get; private set; }

    // Navigation properties
    public List<Order> Orders { get; private set; } = new();
    public List<Address> Addresses { get; private set; } = new();
    public List<UserPaymentMethod> PaymentMethods { get; private set; } = new();
    public UserPreferences Preferences { get; private set; } = null!;

    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }

    // Factory method
    public static UserProfile Create(
        string externalId,
        string tenantId,
        string name,
        string email,
        string phone,
        List<string>? profileImages = null)
    {
        if (string.IsNullOrWhiteSpace(externalId))
            throw new ArgumentException("ExternalId cannot be null or empty", nameof(externalId));
        
        if (string.IsNullOrWhiteSpace(tenantId))
            throw new ArgumentException("TenantId cannot be null or empty", nameof(tenantId));
        
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));
        
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email cannot be null or empty", nameof(email));

        return new UserProfile
        {
            Id = Guid.NewGuid(),
            ExternalId = externalId,
            TenantId = tenantId,
            Name = name,
            Email = email,
            Phone = phone,
            ProfileImages = profileImages ?? new List<string>(),
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    public void UpdateBasicInfo(string name, string email, string phone)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));
        
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email cannot be null or empty", nameof(email));

        Name = name;
        Email = email;
        Phone = phone;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void AddProfileImage(string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            throw new ArgumentException("Image URL cannot be null or empty", nameof(imageUrl));

        if (!ProfileImages.Contains(imageUrl))
        {
            ProfileImages.Add(imageUrl);
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    public void RemoveProfileImage(string imageUrl)
    {
        if (ProfileImages.Remove(imageUrl))
        {
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    public void AddAddress(Address address)
    {
        if (address == null)
            throw new ArgumentNullException(nameof(address));

        if (!Addresses.Contains(address))
        {
            Addresses.Add(address);
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    public void RemoveAddress(Address address)
    {
        if (Addresses.Remove(address))
        {
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    private void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }
}




