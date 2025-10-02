namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Common;

public interface IDomainEvent
{
    DateTimeOffset OccurredAt { get; }
}

