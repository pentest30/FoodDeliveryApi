namespace FoodDeliveryApi.Models;

public record Order
{
    public string Id { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public int EtaMinutes { get; init; }
    public string RestaurantName { get; init; } = string.Empty;
    public decimal Total { get; init; }
    public decimal DeliveryFee { get; init; }
    public string DeliveryAddress { get; init; } = string.Empty;
    public string ContactPhone { get; init; } = string.Empty;
    public string PaymentMethod { get; init; } = string.Empty;
    public List<OrderItem> Items { get; init; } = new();
}

public record OrderItem
{
    public string Name { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal Price { get; init; }
}
