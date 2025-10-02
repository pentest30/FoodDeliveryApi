namespace FoodDeliveryApi.Api.Dtos;

public class UpsertSectionDto
{
    public string Name { get; set; } = string.Empty;
    public List<string> Images { get; set; } = new();
}

