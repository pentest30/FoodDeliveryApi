namespace FoodDeliveryApi.Api.Models;

public class ImageUploadResult
{
    public string Url { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long Size { get; set; }
    public string ContentType { get; set; } = string.Empty;
}

public class CategoryDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}

public class RestaurantDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public List<string> Images { get; set; } = new();
    public decimal Rating { get; set; }
    public int EtaMinutes { get; set; }
    public decimal DistanceKm { get; set; }
    public string City { get; set; } = string.Empty;
    public bool IsOpenNow { get; set; }
    public string Icon { get; set; } = string.Empty;
    public string PrimaryColor { get; set; } = string.Empty;
    public List<string> Categories { get; set; } = new();
    public List<SectionDto> Sections { get; set; } = new();
}

public class SectionDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public List<string> Images { get; set; } = new();
    public List<MenuItemDto> Items { get; set; } = new();
}

public class MenuItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
}

public class OrderDto
{
    public string Id { get; set; } = string.Empty;
    public string ExternalId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public int EtaMinutes { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public MoneyApiModel Subtotal { get; set; } = new();
    public MoneyApiModel Total { get; set; } = new();
    public MoneyApiModel DeliveryFee { get; set; } = new();
    public AddressApiModel DeliveryAddress { get; set; } = new();
    public CustomerRefApiModel Customer { get; set; } = new();
    public List<OrderItemApiModel> Items { get; set; } = new();
}

public class OrderItemApiModel
{
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public MoneyApiModel UnitPrice { get; set; } = new();
    public MoneyApiModel Total { get; set; } = new();
}

public class MoneyApiModel
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
}

public class AddressApiModel
{
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Zip { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string FullAddress { get; set; } = string.Empty;
}

public class CustomerRefApiModel
{
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class UserProfileDto
{
    public string Id { get; set; } = string.Empty;
    public string ExternalId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public List<string> ProfileImages { get; set; } = new();
    public List<UserAddressDto> Addresses { get; set; } = new();
    public List<PaymentMethodDto> PaymentMethods { get; set; } = new();
    public PreferencesDto Preferences { get; set; } = new();
}

public class UserAddressDto
{
    public string Id { get; set; } = string.Empty;
    public string ExternalId { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string Neighborhood { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}

public class PaymentMethodDto
{
    public string Id { get; set; } = string.Empty;
    public string ExternalId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}

public class PreferencesDto
{
    public bool Notifications { get; set; }
    public bool Promotions { get; set; }
    public string Language { get; set; } = string.Empty;
    public string Theme { get; set; } = string.Empty;
}

public class MenuSectionDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public List<string> Images { get; set; } = new();
    public List<MenuItemDto> Items { get; set; } = new();
}

