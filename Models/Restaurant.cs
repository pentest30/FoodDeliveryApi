namespace FoodDeliveryApi.Models;

public record Restaurant
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string CoverImageUrl { get; init; } = string.Empty;
    public double Rating { get; init; }
    public int EtaMinutes { get; init; }
    public double DistanceKm { get; init; }
    public List<string> Categories { get; init; } = new();
    public string City { get; init; } = string.Empty;
    public bool IsOpenNow { get; init; }
    public string Icon { get; init; } = string.Empty;
    public string PrimaryColor { get; init; } = string.Empty;
    public List<MenuSection> Sections { get; init; } = new();
}

public record MenuSection
{
    public string Name { get; init; } = string.Empty;
    public List<MenuItem> Items { get; init; } = new();
}

public record MenuItem
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public string ImageUrl { get; init; } = string.Empty;
}
