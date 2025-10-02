using FoodDeliveryApi.FoodDeliveryApi.Domain.Common;

namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;

public record OrderReadyForPickup(Guid OrderId, string ExternalId) : IDomainEvent
{
    public DateTimeOffset OccurredAt { get; } = DateTimeOffset.UtcNow;
}

