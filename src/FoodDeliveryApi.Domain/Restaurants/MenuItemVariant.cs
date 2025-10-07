namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;

public class MenuItemVariant
{
    public Guid Id { get; init; }
    public Guid MenuItemId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public string Currency { get; init; } = "DZD";
    public int SortOrder { get; init; }
    public bool Active { get; init; }
    
    // Size and physical properties
    public string Size { get; init; } = string.Empty;
    public string Unit { get; init; } = string.Empty;
    public decimal? Weight { get; init; }
    public string Dimensions { get; init; } = string.Empty;
    
    // Business properties
    public string SKU { get; init; } = string.Empty;
    public int? StockQuantity { get; init; }
    public DateTime? AvailableUntil { get; init; }
    
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; init; }

    public static MenuItemVariant Create(
        Guid menuItemId,
        string name,
        decimal price,
        string currency = "DZD",
        int sortOrder = 0,
        string description = "",
        string size = "",
        string unit = "",
        decimal? weight = null,
        string dimensions = "",
        string sku = "",
        int? stockQuantity = null,
        DateTime? availableUntil = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));

        if (price < 0)
            throw new ArgumentException("Price cannot be negative", nameof(price));

        if (weight.HasValue && weight < 0)
            throw new ArgumentException("Weight cannot be negative", nameof(weight));

        if (stockQuantity.HasValue && stockQuantity < 0)
            throw new ArgumentException("Stock quantity cannot be negative", nameof(stockQuantity));

        return new MenuItemVariant
        {
            Id = Guid.Empty,
            MenuItemId = menuItemId,
            Name = name.Trim(),
            Description = description?.Trim() ?? string.Empty,
            Price = price,
            Currency = currency,
            SortOrder = sortOrder,
            Active = true,
            Size = size?.Trim() ?? string.Empty,
            Unit = unit?.Trim() ?? string.Empty,
            Weight = weight,
            Dimensions = dimensions?.Trim() ?? string.Empty,
            SKU = sku?.Trim() ?? string.Empty,
            StockQuantity = stockQuantity,
            AvailableUntil = availableUntil,
            CreatedAt = DateTime.UtcNow
        };
    }
}
