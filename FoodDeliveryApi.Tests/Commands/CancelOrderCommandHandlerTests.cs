using FoodDeliveryApi.FoodDeliveryApi.Application.Commands;
using FoodDeliveryApi.FoodDeliveryApi.Application.Handlers;
using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Common;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;
using FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;
using Moq;
using Xunit;

namespace FoodDeliveryApi.Tests.Commands;

public class CancelOrderCommandHandlerTests
{
    private readonly Mock<IOrderRepository> _mockRepository;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IDomainEventBus> _mockEventBus;
    private readonly CancelOrderCommandHandler _handler;

    public CancelOrderCommandHandlerTests()
    {
        _mockRepository = new Mock<IOrderRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockEventBus = new Mock<IDomainEventBus>();
        _handler = new CancelOrderCommandHandler(_mockRepository.Object, _mockUnitOfWork.Object, _mockEventBus.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ShouldCancelOrderAndSaveChanges()
    {
        // Arrange
        var order = CreatePendingOrder();
        var command = new CancelOrderCommand 
        { 
            ExternalId = "ORD-12345", 
            Reason = "Customer requested cancellation" 
        };
        
        _mockRepository.Setup(r => r.GetByExternalId("ORD-12345")).ReturnsAsync(order);

        // Act
        await _handler.Handle(command);

        // Assert
        Assert.Equal(OrderStatus.Canceled, order.Status);
        _mockRepository.Verify(r => r.Update(order), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(_mockEventBus.Object, order), Times.Once);
    }

    [Fact]
    public async Task Handle_ConfirmedOrder_ShouldCancelOrderAndSaveChanges()
    {
        // Arrange
        var order = CreateConfirmedOrder();
        var command = new CancelOrderCommand 
        { 
            ExternalId = "ORD-12345", 
            Reason = "Customer requested cancellation" 
        };
        
        _mockRepository.Setup(r => r.GetByExternalId("ORD-12345")).ReturnsAsync(order);

        // Act
        await _handler.Handle(command);

        // Assert
        Assert.Equal(OrderStatus.Canceled, order.Status);
        _mockRepository.Verify(r => r.Update(order), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(_mockEventBus.Object, order), Times.Once);
    }

    [Fact]
    public async Task Handle_ReadyForPickupOrder_ShouldCancelOrderAndSaveChanges()
    {
        // Arrange
        var order = CreateReadyForPickupOrder();
        var command = new CancelOrderCommand 
        { 
            ExternalId = "ORD-12345", 
            Reason = "Customer requested cancellation" 
        };
        
        _mockRepository.Setup(r => r.GetByExternalId("ORD-12345")).ReturnsAsync(order);

        // Act
        await _handler.Handle(command);

        // Assert
        Assert.Equal(OrderStatus.Canceled, order.Status);
        _mockRepository.Verify(r => r.Update(order), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(_mockEventBus.Object, order), Times.Once);
    }

    [Fact]
    public async Task Handle_OutForDeliveryOrder_ShouldCancelOrderAndSaveChanges()
    {
        // Arrange
        var order = CreateOutForDeliveryOrder();
        var command = new CancelOrderCommand 
        { 
            ExternalId = "ORD-12345", 
            Reason = "Customer requested cancellation" 
        };
        
        _mockRepository.Setup(r => r.GetByExternalId("ORD-12345")).ReturnsAsync(order);

        // Act
        await _handler.Handle(command);

        // Assert
        Assert.Equal(OrderStatus.Canceled, order.Status);
        _mockRepository.Verify(r => r.Update(order), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(_mockEventBus.Object, order), Times.Once);
    }

    [Fact]
    public async Task Handle_OrderNotFound_ShouldThrowArgumentException()
    {
        // Arrange
        var command = new CancelOrderCommand 
        { 
            ExternalId = "ORD-NOTFOUND", 
            Reason = "Customer requested cancellation" 
        };
        _mockRepository.Setup(r => r.GetByExternalId("ORD-NOTFOUND")).ReturnsAsync((Order?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command));
        Assert.Contains("Order with External ID 'ORD-NOTFOUND' not found", exception.Message);
    }

    [Fact]
    public async Task Handle_DeliveredOrder_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var order = CreateDeliveredOrder(); // Already delivered
        var command = new CancelOrderCommand 
        { 
            ExternalId = "ORD-12345", 
            Reason = "Customer requested cancellation" 
        };
        
        _mockRepository.Setup(r => r.GetByExternalId("ORD-12345")).ReturnsAsync(order);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command));
    }

    [Fact]
    public async Task Handle_EmptyReason_ShouldThrowArgumentException()
    {
        // Arrange
        var order = CreatePendingOrder();
        var command = new CancelOrderCommand 
        { 
            ExternalId = "ORD-12345", 
            Reason = "" // Empty reason
        };
        
        _mockRepository.Setup(r => r.GetByExternalId("ORD-12345")).ReturnsAsync(order);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command));
    }

    [Fact]
    public async Task Handle_WhitespaceReason_ShouldThrowArgumentException()
    {
        // Arrange
        var order = CreatePendingOrder();
        var command = new CancelOrderCommand 
        { 
            ExternalId = "ORD-12345", 
            Reason = "   " // Whitespace only
        };
        
        _mockRepository.Setup(r => r.GetByExternalId("ORD-12345")).ReturnsAsync(order);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command));
    }

    private Order CreatePendingOrder()
    {
        return Order.Place(
            "ORD-12345",
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

    private Order CreateReadyForPickupOrder()
    {
        var order = CreateConfirmedOrder();
        order.MarkReadyForPickup();
        return order;
    }

    private Order CreateOutForDeliveryOrder()
    {
        var order = CreateReadyForPickupOrder();
        order.MoveOutForDelivery();
        return order;
    }

    private Order CreateDeliveredOrder()
    {
        var order = CreateOutForDeliveryOrder();
        order.CompleteDelivery();
        return order;
    }
}



















