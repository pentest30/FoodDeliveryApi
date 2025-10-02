using FoodDeliveryApi.FoodDeliveryApi.Domain.Common;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;

namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;

public class Category : IHasDomainEvents
{
    private readonly List<IDomainEvent> _domainEvents = new();

    public Guid Id { get; private set; }
    public string ExternalId { get; private set; } = string.Empty;
    public string TenantId { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Icon { get; private set; } = string.Empty;
    public string Color { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? UpdatedAt { get; private set; }

    // Navigation properties
    public List<RestaurantCategory> RestaurantCategories { get; private set; } = new();

    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }

    // Factory method
    public static Category Create(
        string externalId,
        string tenantId,
        string name,
        string icon = "",
        string color = "")
    {
        if (string.IsNullOrWhiteSpace(externalId))
            throw new ArgumentException("ExternalId cannot be null or empty", nameof(externalId));
        
        if (string.IsNullOrWhiteSpace(tenantId))
            throw new ArgumentException("TenantId cannot be null or empty", nameof(tenantId));
        
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));

        return new Category
        {
            Id = Guid.NewGuid(),
            ExternalId = externalId,
            TenantId = tenantId,
            Name = name,
            Icon = icon,
            Color = color,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    public void UpdateInfo(string name, string icon, string color)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));

        Name = name;
        Icon = icon ?? string.Empty;
        Color = color ?? string.Empty;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    private void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }
}



