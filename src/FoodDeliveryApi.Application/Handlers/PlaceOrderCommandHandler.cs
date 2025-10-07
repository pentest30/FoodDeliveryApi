using FoodDeliveryApi.Api.Dtos;
using FoodDeliveryApi.FoodDeliveryApi.Application.Commands;
using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Common;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;
using FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;
using OrderItem = FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects.OrderItem;

namespace FoodDeliveryApi.FoodDeliveryApi.Application.Handlers;

public class PlaceOrderCommandHandler
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDomainEventBus _eventBus;

    public PlaceOrderCommandHandler(
        IOrderRepository orderRepository,
        IUnitOfWork unitOfWork,
        IDomainEventBus eventBus)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _eventBus = eventBus;
    }

    public async Task<Guid> Handle(CreateOrderDto command)
    {
        // Debug logging
        Console.WriteLine($"Creating order with ExternalId: '{command.ExternalId}'");
        
        // Create order using domain factory method
        var order = Order.Place(
            command.ExternalId,
            new CustomerRef()  {Name = command.Customer.Name, Phone = command.Customer.Phone},
            new Address() {City = command.DeliveryAddress.City, Latitude =  command.DeliveryAddress.Latitude, Longitude = command.DeliveryAddress.Longitude } ,
            command.Items.Select(x=>  new OrderItem() {Name = x.Name ,  Quantity = x.Quantity, UnitPrice =  new Money {Amount = x.UnitPrice.Amount}} ),
             new Money() { Amount = command.DeliveryFee.Amount},
            command.EtaMinutes,
            command.RestaurantName,
            command.RestaurantId);

        Console.WriteLine($"Order created with ExternalId: '{order.ExternalId}'");

        // Add to repository
        await _orderRepository.Add(order);

        // Save changes and publish events
        await _unitOfWork.SaveChangesAsync(_eventBus, order);

        return order.Id;
    }
}
