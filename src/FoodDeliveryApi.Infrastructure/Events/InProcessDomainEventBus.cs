using FoodDeliveryApi.FoodDeliveryApi.Domain.Common;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Events;

public class InProcessDomainEventBus : IDomainEventBus
{
    private readonly IEnumerable<object> _handlers;

    public InProcessDomainEventBus(IEnumerable<object> handlers)
    {
        _handlers = handlers;
    }

    public void PublishRange(IEnumerable<IDomainEvent> events)
    {
        foreach (var evt in events)
        {
            Publish(evt);
        }
    }

    private void Publish(IDomainEvent evt)
    {
        var eventType = evt.GetType();
        var handlerType = typeof(IDomainEventHandler<>).MakeGenericType(eventType);

        foreach (var handler in _handlers)
        {
            if (handlerType.IsInstanceOfType(handler))
            {
                var method = handlerType.GetMethod("Handle");
                method?.Invoke(handler, new object[] { evt });
            }
        }
    }
}
