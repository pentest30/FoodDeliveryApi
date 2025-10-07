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

    public void RemoveVariant(Guid variantId)
    {
        var variant = Variants.FirstOrDefault(v => v.Id == variantId);
        if (variant != null)
        {
            Variants.Remove(variant);
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    public void UpdateVariant(Guid variantId, string name, decimal price, string description = "", 
        string size = "", string unit = "", decimal? weight = null, string dimensions = "", 
        string sku = "", int? stockQuantity = null, DateTime? availableUntil = null, bool active = true)
    {
        var variant = Variants.FirstOrDefault(v => v.Id == variantId);
        if (variant == null)
            throw new KeyNotFoundException($"Variant with ID '{variantId}' not found");

        // Check for name conflicts with other variants
        if (Variants.Any(v => v.Id != variantId && v.Name == name))
            throw new InvalidOperationException($"Variant with name '{name}' already exists");

        // Remove old variant and add updated one
        Variants.Remove(variant);
        var updatedVariant = MenuItemVariant.Create(
            Id, name, price, variant.Currency, variant.SortOrder, 
            description, size, unit, weight, dimensions, sku, stockQuantity, availableUntil);
        
        Variants.Add(updatedVariant);
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void SetVariantActive(Guid variantId, bool active)
    {
        var variant = Variants.FirstOrDefault(v => v.Id == variantId);
        if (variant == null)
            throw new KeyNotFoundException($"Variant with ID '{variantId}' not found");

        // Since variants are immutable, we need to replace it
        var updatedVariant = MenuItemVariant.Create(
            Id, variant.Name, variant.Price, variant.Currency, variant.SortOrder,
            variant.Description, variant.Size, variant.Unit, variant.Weight, 
            variant.Dimensions, variant.SKU, variant.StockQuantity, variant.AvailableUntil);
        
        Variants.Remove(variant);
        Variants.Add(updatedVariant);
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

    public decimal GetMinVariantPrice()
    {
        if (!Variants.Any(v => v.Active))
            return BasePrice ?? 0m;
        
        return Variants.Where(v => v.Active).Min(v => v.Price);
    }

    public decimal GetMaxVariantPrice()
    {
        if (!Variants.Any(v => v.Active))
            return BasePrice ?? 0m;
        
        return Variants.Where(v => v.Active).Max(v => v.Price);
    }

    public bool HasVariants => Variants.Any(v => v.Active);

    public string GetPriceRange()
    {
        if (!HasVariants)
            return BasePrice?.ToString("C") ?? "N/A";
        
        var minPrice = GetMinVariantPrice();
        var maxPrice = GetMaxVariantPrice();
        
        if (minPrice == maxPrice)
            return minPrice.ToString("C");
        
        return $"{minPrice:C} - {maxPrice:C}";
    }

    public void SetRestaurantId(Guid restaurantId)
    {
        RestaurantId = restaurantId;
    }
}


