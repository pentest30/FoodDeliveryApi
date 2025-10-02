namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Common;

public interface IDomainEventBus
{
    void PublishRange(IEnumerable<IDomainEvent> events);
}

