namespace FoodDeliveryApi.Api.Dtos;

public class UpsertRestaurantDto
{
    public string ExternalId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public List<string> Images { get; set; } = new();
    public decimal Rating { get; set; }
    public int EtaMinutes { get; set; }
    public decimal DistanceKm { get; set; }
    public string City { get; set; } = string.Empty;
    public bool IsOpenNow { get; set; }
    public string Icon { get; set; } = string.Empty;
    public string PrimaryColor { get; set; } = string.Empty;
    public List<string> CategoryIds { get; set; } = new();
}



