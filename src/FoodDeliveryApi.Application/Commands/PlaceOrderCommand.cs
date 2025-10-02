using FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;

namespace FoodDeliveryApi.FoodDeliveryApi.Application.Commands;

public class PlaceOrderCommand
{
    public string ExternalId { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public CustomerRef Customer { get; set; } = null!;
    public Address DeliveryAddress { get; set; } = null!;
    public IEnumerable<global::FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects.OrderItem> Items { get; set; } = new List<global::FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects.OrderItem>();
    public Money DeliveryFee { get; set; } = null!;
    public int EtaMinutes { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public Guid? RestaurantId { get; set; }
}
