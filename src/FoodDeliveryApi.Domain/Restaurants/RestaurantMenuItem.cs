namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;

public class RestaurantMenuItem
{
    public Guid Id { get; private set; }
    public Guid RestaurantId { get; private set; }
    public Guid RestaurantSectionId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public decimal? BasePrice { get; private set; }
    public string Currency { get; private set; } = "DZD";
    public bool Available { get; private set; } = true;
    public List<string> Images { get; private set; } = new();
    public List<string> Allergens { get; private set; } = new();
    public int Quantity { get; private set; } = 1;
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? UpdatedAt { get; private set; }

    public List<MenuItemVariant> Variants { get; private set; } = new();

    public bool IsVisible => Available && (BasePrice.HasValue || Variants.Any(v => v.Active));

    // Navigation properties
    public RestaurantSection RestaurantSection { get; private set; } = null!;

    // Private constructor for EF Core
    private RestaurantMenuItem() { }

    // Factory method for creating new menu items
    public static RestaurantMenuItem Create(
        string name,
        string description = "",
        decimal? basePrice = null,
        int quantity = 1,
        bool available = true,
        List<string>? images = null,
        List<string>? allergens = null,
        string currency = "DZD")
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));
        
        if (basePrice.HasValue && basePrice < 0)
            throw new ArgumentException("BasePrice cannot be negative", nameof(basePrice));
        
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        return new RestaurantMenuItem
        {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            Description = description?.Trim() ?? string.Empty,
            BasePrice = basePrice,
            Currency = currency,
            Available = available,
            Quantity = quantity,
            Images = images ?? new List<string>(),
            Allergens = allergens ?? new List<string>(),
            Variants = new List<MenuItemVariant>(),
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));

        Name = name;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateDescription(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Description cannot be null or empty", nameof(description));

        Description = description;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateBasePrice(decimal? basePrice)
    {
        if (basePrice.HasValue && basePrice < 0)
            throw new ArgumentException("BasePrice cannot be negative", nameof(basePrice));

        BasePrice = basePrice;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateCurrency(string currency)
    {
        if (string.IsNullOrWhiteSpace(currency))
            throw new ArgumentException("Currency cannot be null or empty", nameof(currency));

        Currency = currency;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void SetAvailable(bool available)
    {
        Available = available;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void SetRestaurantSectionId(Guid restaurantSectionId)
    {
        if (restaurantSectionId == Guid.Empty)
            throw new ArgumentException("Restaurant section ID cannot be empty", nameof(restaurantSectionId));

        RestaurantSectionId = restaurantSectionId;
    }

    public void AddVariant(MenuItemVariant variant)
    {
        if (variant.MenuItemId != Id)
            throw new ArgumentException("Variant must belong to this menu item", nameof(variant));

        if (Variants.Any(v => v.Name == variant.Name))
            throw new InvalidOperationException($"Variant with name '{variant.Name}' already exists");

        Variants.Add(variant);
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void AddImage(string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            throw new ArgumentException("Image URL cannot be null or empty", nameof(imageUrl));

        if (Images.Contains(imageUrl))
            throw new InvalidOperationException("Image already exists");

        Images.Add(imageUrl);
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void RemoveImage(string imageUrl)
    {
        if (Images.Remove(imageUrl))
        {
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    public void Publish()
    {
        if (!BasePrice.HasValue && !Variants.Any(v => v.Active))
            throw new InvalidOperationException("Cannot publish menu item without base price or active variants");
    }

    public void UpdateQuantity(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        Quantity = quantity;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public decimal GetTotalPrice()
    {
        var basePrice = BasePrice ?? 0m;
        return basePrice * Quantity;
    }
}


