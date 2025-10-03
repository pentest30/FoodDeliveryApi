using FoodDeliveryApi.FoodDeliveryApi.Domain.Common;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;

namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;

public class Restaurant : IHasDomainEvents
{
    private readonly List<IDomainEvent> _domainEvents = new();

    public Guid Id { get; private set; }
    public string ExternalId { get; private set; } = string.Empty;
    public string TenantId { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public List<string> Images { get; private set; } = new();
    public decimal Rating { get; private set; }
    public int EtaMinutes { get; private set; }
    public decimal DistanceKm { get; private set; }
    public string City { get; private set; } = string.Empty;
    public bool IsOpenNow { get; private set; }
    public string Icon { get; private set; } = string.Empty;
    public string PrimaryColor { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? UpdatedAt { get; private set; }

    // Navigation properties
    public List<RestaurantCategory> RestaurantCategories { get; private set; } = new();
    public List<RestaurantSection> RestaurantSections { get; private set; } = new();
    public List<Order> Orders { get; private set; } = new();

    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }

    // Factory method
    public static Restaurant Create(
        string externalId,
        string tenantId,
        string name,
        string city,
        int etaMinutes,
        decimal distanceKm,
        string icon = "",
        string primaryColor = "",
        List<string>? images = null,
        List<RestaurantSection>? sections = null)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(externalId))
            throw new ArgumentException("ExternalId cannot be null or empty", nameof(externalId));
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));
        
        if (string.IsNullOrWhiteSpace(city))
            throw new ArgumentException("City cannot be null or empty", nameof(city));
        
        if (etaMinutes <= 0)
            throw new ArgumentException("EtaMinutes must be greater than zero", nameof(etaMinutes));
        
        if (distanceKm < 0)
            throw new ArgumentException("DistanceKm cannot be negative", nameof(distanceKm));

        var restaurant = new Restaurant
        {
            Id = Guid.NewGuid(),
            ExternalId = externalId,
            TenantId = tenantId,
            Name = name,
            City = city,
            EtaMinutes = etaMinutes,
            DistanceKm = distanceKm,
            Icon = icon,
            PrimaryColor = primaryColor,
            Images = images ?? new List<string>(),
            Rating = 0m,
            IsOpenNow = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        return restaurant;
    }

    // Factory method without tenantId (for Finbuckle auto-injection)
    public static Restaurant Create(
        string externalId,
        string name,
        string city,
        int etaMinutes,
        decimal distanceKm,
        string icon = "",
        string primaryColor = "",
        List<string>? images = null,
        List<RestaurantSection>? sections = null,
        List<Guid>? categoryIds = null)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(externalId))
            throw new ArgumentException("ExternalId cannot be null or empty", nameof(externalId));
        
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));
        
        if (string.IsNullOrWhiteSpace(city))
            throw new ArgumentException("City cannot be null or empty", nameof(city));
        
        if (etaMinutes <= 0)
            throw new ArgumentException("EtaMinutes must be greater than zero", nameof(etaMinutes));
        
        if (distanceKm < 0)
            throw new ArgumentException("DistanceKm cannot be negative", nameof(distanceKm));

        var restaurant = new Restaurant
        {
            Id = Guid.NewGuid(),
            ExternalId = externalId,
            Name = name,
            City = city,
            EtaMinutes = etaMinutes,
            DistanceKm = distanceKm,
            Icon = icon,
            PrimaryColor = primaryColor,
            Images = images ?? new List<string>(),
            Rating = 0m,
            IsOpenNow = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        // Add categories if provided
        if (categoryIds != null && categoryIds.Any())
        {
            foreach (var categoryId in categoryIds)
            {
                restaurant.AddCategory(categoryId);
            }
        }

        return restaurant;
    }

    // Behaviors
    public void UpdateBasicInfo(string name, string city, int etaMinutes, decimal distanceKm)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));
        
        if (string.IsNullOrWhiteSpace(city))
            throw new ArgumentException("City cannot be null or empty", nameof(city));
        
        if (etaMinutes <= 0)
            throw new ArgumentException("EtaMinutes must be greater than zero", nameof(etaMinutes));
        
        if (distanceKm < 0)
            throw new ArgumentException("DistanceKm cannot be negative", nameof(distanceKm));

        Name = name;
        City = city;
        EtaMinutes = etaMinutes;
        DistanceKm = distanceKm;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateAppearance(string icon, string primaryColor)
    {
        Icon = icon ?? string.Empty;
        PrimaryColor = primaryColor ?? string.Empty;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void AddImage(string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            throw new ArgumentException("Image URL cannot be null or empty", nameof(imageUrl));

        if (!Images.Contains(imageUrl))
        {
            Images.Add(imageUrl);
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    public void RemoveImage(string imageUrl)
    {
        if (Images.Remove(imageUrl))
        {
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    public void UpdateRating(decimal rating)
    {
        if (rating < 0 || rating > 5)
            throw new ArgumentException("Rating must be between 0 and 5", nameof(rating));

        Rating = rating;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void ToggleOpenStatus()
    {
        IsOpenNow = !IsOpenNow;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void SetOpenStatus(bool isOpen)
    {
        IsOpenNow = isOpen;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void AddCategory(Guid categoryId)
    {
        if (categoryId == Guid.Empty)
            throw new ArgumentException("CategoryId cannot be empty", nameof(categoryId));

        if (!RestaurantCategories.Any(rc => rc.CategoryId == categoryId))
        {
            var restaurantCategory = new RestaurantCategory
            {
                RestaurantId = Id,
                CategoryId = categoryId
            };
            RestaurantCategories.Add(restaurantCategory);
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    public void RemoveCategory(Guid categoryId)
    {
        var categoryToRemove = RestaurantCategories.FirstOrDefault(rc => rc.CategoryId == categoryId);
        if (categoryToRemove != null && RestaurantCategories.Remove(categoryToRemove))
        {
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    public void AddSection(RestaurantSection section)
    {
        if (section == null)
            throw new ArgumentNullException(nameof(section));

        if (!RestaurantSections.Any(rs => rs.Name.Equals(section.Name, StringComparison.OrdinalIgnoreCase)))
        {
            section.SetRestaurantId(Id);
            RestaurantSections.Add(section);
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    public void RemoveSection(string sectionName)
    {
        if (string.IsNullOrWhiteSpace(sectionName))
            throw new ArgumentException("Section name cannot be null or empty", nameof(sectionName));

        var sectionToRemove = RestaurantSections.FirstOrDefault(rs => rs.Name.Equals(sectionName, StringComparison.OrdinalIgnoreCase));
        if (sectionToRemove != null && RestaurantSections.Remove(sectionToRemove))
        {
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    public void UpdateSection(RestaurantSection updatedSection)
    {
        if (updatedSection == null)
            throw new ArgumentNullException(nameof(updatedSection));

        var existingSection = RestaurantSections.FirstOrDefault(rs => rs.Name.Equals(updatedSection.Name, StringComparison.OrdinalIgnoreCase));
        if (existingSection != null)
        {
            var index = RestaurantSections.IndexOf(existingSection);
            updatedSection.SetRestaurantId(Id);
            RestaurantSections[index] = updatedSection;
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    private void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }
}



