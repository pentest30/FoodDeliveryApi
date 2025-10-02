namespace FoodDeliveryApi.FoodDeliveryApi.Application.Commands;

public class FailOrderCommand
{
    public string ExternalId { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}
