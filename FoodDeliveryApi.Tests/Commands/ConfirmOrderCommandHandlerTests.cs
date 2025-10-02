using FoodDeliveryApi.FoodDeliveryApi.Application.Commands;
using FoodDeliveryApi.FoodDeliveryApi.Application.Handlers;
using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Common;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;
using FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;
using Moq;
using Xunit;

namespace FoodDeliveryApi.Tests.Commands;

public class ConfirmOrderCommandHandlerTests
{
    private readonly Mock<IOrderRepository> _mockRepository;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IDomainEventBus> _mockEventBus;
    private readonly ConfirmOrderCommandHandler _handler;

    public ConfirmOrderCommandHandlerTests()
    {
        _mockRepository = new Mock<IOrderRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockEventBus = new Mock<IDomainEventBus>();
        _handler = new ConfirmOrderCommandHandler(_mockRepository.Object, _mockUnitOfWork.Object, _mockEventBus.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ShouldConfirmOrderAndSaveChanges()
    {
        // Arrange
        var order = CreatePendingOrder();
        var command = new ConfirmOrderCommand { ExternalId = "ORD-12345" };
        
        _mockRepository.Setup(r => r.GetByExternalId("ORD-12345")).ReturnsAsync(order);

        // Act
        await _handler.Handle(command);

        // Assert
        Assert.Equal(OrderStatus.Confirmed, order.Status);
        _mockRepository.Verify(r => r.Update(order), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(_mockEventBus.Object, order), Times.Once);
    }

    [Fact]
    public async Task Handle_OrderNotFound_ShouldThrowArgumentException()
    {
        // Arrange
        var command = new ConfirmOrderCommand { ExternalId = "ORD-NOTFOUND" };
        _mockRepository.Setup(r => r.GetByExternalId("ORD-NOTFOUND")).ReturnsAsync((Order?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command));
        Assert.Contains("Order with External ID 'ORD-NOTFOUND' not found", exception.Message);
    }

    [Fact]
    public async Task Handle_OrderNotInPendingStatus_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var order = CreateConfirmedOrder(); // Already confirmed
        var command = new ConfirmOrderCommand { ExternalId = "ORD-12345" };
        
        _mockRepository.Setup(r => r.GetByExternalId("ORD-12345")).ReturnsAsync(order);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command));
    }

    [Fact]
    public async Task Handle_OrderInDeliveredStatus_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var order = CreateDeliveredOrder();
        var command = new ConfirmOrderCommand { ExternalId = "ORD-12345" };
        
        _mockRepository.Setup(r => r.GetByExternalId("ORD-12345")).ReturnsAsync(order);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command));
    }

    [Fact]
    public async Task Handle_OrderInCanceledStatus_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var order = CreateCanceledOrder();
        var command = new ConfirmOrderCommand { ExternalId = "ORD-12345" };
        
        _mockRepository.Setup(r => r.GetByExternalId("ORD-12345")).ReturnsAsync(order);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command));
    }

    [Fact]
    public async Task Handle_OrderInFailedStatus_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var order = CreateFailedOrder();
        var command = new ConfirmOrderCommand { ExternalId = "ORD-12345" };
        
        _mockRepository.Setup(r => r.GetByExternalId("ORD-12345")).ReturnsAsync(order);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command));
    }

    private Order CreatePendingOrder()
    {
        return Order.Place(
            "ORD-12345",
            "test-tenant",
            new CustomerRef(Guid.NewGuid(), "John Doe", "+1234567890"),
            new Address("123 Main St", "New York", "NY", "10001", 40.7128, -74.0060),
            new List<FoodDeliveryApi.Domain.ValueObjects.OrderItem>
            {
                new FoodDeliveryApi.Domain.ValueObjects.OrderItem("Pizza", 2, new Money(15.99m, "USD"), new Money(31.98m, "USD"))
            },
            new Money(3.99m, "USD"),
            30,
            "Pizza Palace"
        );
    }

    private Order CreateConfirmedOrder()
    {
        var order = CreatePendingOrder();
        order.Confirm();
        return order;
    }

    private Order CreateDeliveredOrder()
    {
        var order = CreatePendingOrder();
        order.Confirm();
        order.MarkReadyForPickup();
        order.MoveOutForDelivery();
        order.CompleteDelivery();
        return order;
    }

    private Order CreateCanceledOrder()
    {
        var order = CreatePendingOrder();
        order.Cancel("Customer requested cancellation");
        return order;
    }

    private Order CreateFailedOrder()
    {
        var order = CreatePendingOrder();
        order.Fail("Restaurant closed");
        return order;
    }
}



















