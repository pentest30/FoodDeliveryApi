namespace FoodDeliveryApi.Models;

public record Profile
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Phone { get; init; } = string.Empty;
    public string ProfileImageUrl { get; init; } = string.Empty;
    public List<Address> Addresses { get; init; } = new();
    public List<PaymentMethod> PaymentMethods { get; init; } = new();
    public UserPreferences Preferences { get; init; } = new();
}

public record Address
{
    public string Id { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public string Street { get; init; } = string.Empty;
    public string Neighborhood { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string ZipCode { get; init; } = string.Empty;
    public bool IsDefault { get; init; }
}

public record PaymentMethod
{
    public string Id { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public bool IsDefault { get; init; }
}

public record UserPreferences
{
    public bool Notifications { get; init; }
    public bool Promotions { get; init; }
    public string Language { get; init; } = string.Empty;
    public string Theme { get; init; } = string.Empty;
}
