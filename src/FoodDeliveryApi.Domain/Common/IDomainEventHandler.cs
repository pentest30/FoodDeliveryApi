namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Common;

public interface IDomainEventHandler<TEvent> where TEvent : IDomainEvent
{
    void Handle(TEvent evt);
}

