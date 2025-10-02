namespace FoodDeliveryApi.Api.Dtos;

public class CreateOrderDto
{
    public string ExternalId { get; set; } = string.Empty;
    public string RestaurantName { get; set; } = string.Empty;
    public int EtaMinutes { get; set; }
    public CustomerDto Customer { get; set; } = new();
    public AddressDto DeliveryAddress { get; set; } = new();
    public List<CreateOrderItemDto> Items { get; set; } = new();
    public MoneyDto DeliveryFee { get; set; } = new();
    public Guid? RestaurantId { get; set; }
}

public class CustomerDto
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}


public class MoneyDto
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
}

public class CreateOrderItemDto
{
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public MoneyDto UnitPrice { get; set; } = new();
    public MoneyDto Total { get; set; } = new();
}

public class CancelOrderDto
{
    public string Reason { get; set; } = string.Empty;
}

public class FailOrderDto
{
    public string Reason { get; set; } = string.Empty;
}

public class PlaceOrderDto
{
    public string UserId { get; set; } = string.Empty;
    public string RestaurantId { get; set; } = string.Empty;
    public List<PlaceOrderItemDto> Items { get; set; } = new();
}

public class PlaceOrderItemDto
{
    public string MenuItemId { get; set; } = string.Empty;
    public string MenuItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public List<PlaceOrderItemVariantDto> Variants { get; set; } = new();
}

public class PlaceOrderItemVariantDto
{
    public string VariantName { get; set; } = string.Empty;
    public decimal VariantPrice { get; set; }
}



