namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;

public class RestaurantMenuItem
{
    public Guid Id { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid RestaurantSectionId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? BasePrice { get; set; }
    public string Currency { get; set; } = "DZD";
    public bool Active { get; set; } = true;
    public List<string> Images { get; set; } = new();
    public int Quantity { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    public List<MenuItemVariant> Variants { get; set; } = new();

    public bool IsVisible => Active && (BasePrice.HasValue || Variants.Any(v => v.Active));

    // Navigation properties
    public RestaurantSection RestaurantSection { get; set; } = null!;

    public RestaurantMenuItem() { }

    public RestaurantMenuItem(Guid restaurantId, Guid restaurantSectionId, string name, string? description = null, decimal? basePrice = null, string currency = "DZD", int quantity = 1)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));
        
        if (basePrice.HasValue && basePrice < 0)
            throw new ArgumentException("BasePrice cannot be negative", nameof(basePrice));
        
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

        Id = Guid.NewGuid();
        RestaurantId = restaurantId;
        RestaurantSectionId = restaurantSectionId;
        Name = name;
        Description = description;
        BasePrice = basePrice;
        Currency = currency;
        Active = true;
        Quantity = quantity;
        CreatedAt = DateTimeOffset.UtcNow;
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

    public void UpdateActive(bool active)
    {
        Active = active;
        UpdatedAt = DateTimeOffset.UtcNow;
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


