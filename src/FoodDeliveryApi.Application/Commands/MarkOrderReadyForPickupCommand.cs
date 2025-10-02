namespace FoodDeliveryApi.FoodDeliveryApi.Application.Commands;

public class MarkOrderReadyForPickupCommand
{
    public string ExternalId { get; set; } = string.Empty;
}
