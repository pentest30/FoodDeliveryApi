namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;

public class MenuItemVariant
{
    public Guid Id { get; init; }
    public Guid MenuItemId { get; init; }
    public string Name { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public string Currency { get; init; } = "DZD";
    public int SortOrder { get; init; }
    public bool Active { get; init; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    public static MenuItemVariant Create(
        Guid menuItemId,
        string name,
        decimal price,
        string currency = "DZD",
        int sortOrder = 0)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));

        if (price < 0)
            throw new ArgumentException("Price cannot be negative", nameof(price));

        return new MenuItemVariant
        {
            Id = Guid.NewGuid(),
            MenuItemId = menuItemId,
            Name = name,
            Price = price,
            Currency = currency,
            SortOrder = sortOrder,
            Active = true,
            CreatedAt = DateTime.UtcNow
        };
    }
}
