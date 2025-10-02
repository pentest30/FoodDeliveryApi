using FoodDeliveryApi.FoodDeliveryApi.Application.Commands;
using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Common;

namespace FoodDeliveryApi.FoodDeliveryApi.Application.Handlers;

public class ConfirmOrderCommandHandler
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDomainEventBus _eventBus;

    public ConfirmOrderCommandHandler(
        IOrderRepository orderRepository,
        IUnitOfWork unitOfWork,
        IDomainEventBus eventBus)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _eventBus = eventBus;
    }

    public async Task Handle(ConfirmOrderCommand command)
    {
        // Load aggregate by external ID
        var order = await _orderRepository.GetByExternalId(command.ExternalId);
        if (order == null)
            throw new ArgumentException($"Order with External ID '{command.ExternalId}' not found");

        // Apply behavior
        order.Confirm();

        // Update repository
        await _orderRepository.Update(order);

        // Save changes and publish events
        await _unitOfWork.SaveChangesAsync(_eventBus, order);
    }
}
