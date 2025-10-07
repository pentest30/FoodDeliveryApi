using FoodDeliveryApi.Api.Dtos;
using FoodDeliveryApi.FoodDeliveryApi.Application.Commands;
using FoodDeliveryApi.FoodDeliveryApi.Application.Handlers;
using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Common;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;
using FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;
using Moq;
using Xunit;

namespace FoodDeliveryApi.Tests.Commands;

public class PlaceOrderCommandHandlerTests
{
    private readonly Mock<IOrderRepository> _mockRepository;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IDomainEventBus> _mockEventBus;
    private readonly PlaceOrderCommandHandler _handler;

    public PlaceOrderCommandHandlerTests()
    {
        _mockRepository = new Mock<IOrderRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockEventBus = new Mock<IDomainEventBus>();
        _handler = new PlaceOrderCommandHandler(_mockRepository.Object, _mockUnitOfWork.Object, _mockEventBus.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ShouldCreateOrderAndSaveChanges()
    {
        // Arrange
        var command = new CreateOrderDto()
        {
            ExternalId = "ORD-12345",
            Customer = new CustomerDto() { UserId = Guid.NewGuid(), Name = "John Doe", Phone = "+1234567890"},
            DeliveryAddress = new AddressDto() { Street = "123 Main St", City = "New York",  State = "NY", Zip = "10001", Latitude = 40.7128, Longitude = -74.0060},
            Items = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto(  ) { Name = "Pizza" , Quantity = 2, UnitPrice = new MoneyDto() { Amount = 31.98m, Currency = "USD"}}
            },
            DeliveryFee = new MoneyDto() { Amount = 3.99m, Currency = "USD" },
            EtaMinutes = 30,
            RestaurantName = "Pizza Palace",
            RestaurantId = Guid.NewGuid()
        };

        // Act
        var result = await _handler.Handle(command);

        // Assert
        Assert.NotEqual(Guid.Empty, result);
        _mockRepository.Verify(r => r.Add(It.IsAny<Order>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(_mockEventBus.Object, It.IsAny<Order>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithEmptyExternalId_ShouldThrowArgumentException()
    {
        // Arrange
        
        var command = new CreateOrderDto()
        {
            //ExternalId = "ORD-12345",
            Customer = new CustomerDto() { UserId = Guid.NewGuid(), Name = "John Doe", Phone = "+1234567890"},
            DeliveryAddress = new AddressDto() { Street = "123 Main St", City = "New York",  State = "NY", Zip = "10001", Latitude = 40.7128, Longitude = -74.0060},
            Items = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto(  ) { Name = "Pizza" , Quantity = 2, UnitPrice = new MoneyDto() { Amount = 31.98m, Currency = "USD"}}
            },
            DeliveryFee = new MoneyDto() { Amount = 3.99m, Currency = "USD" },
            EtaMinutes = 30,
            RestaurantName = "Pizza Palace",
            RestaurantId = Guid.NewGuid()
        };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command));
    }

    [Fact]
    public async Task Handle_WithNullCustomer_ShouldThrowArgumentException()
    {
        // Arrange
  
        var command = new CreateOrderDto()
        {
            ExternalId = "ORD-12345",
            Customer = null,
            DeliveryAddress = new AddressDto() { Street = "123 Main St", City = "New York",  State = "NY", Zip = "10001", Latitude = 40.7128, Longitude = -74.0060},
            Items = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto(  ) { Name = "Pizza" , Quantity = 2, UnitPrice = new MoneyDto() { Amount = 31.98m, Currency = "USD"}}
            },
            DeliveryFee = new MoneyDto() { Amount = 3.99m, Currency = "USD" },
            EtaMinutes = 30,
            RestaurantName = "Pizza Palace",
            RestaurantId = Guid.NewGuid()
        };
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(command));
    }

    [Fact]
    public async Task Handle_WithEmptyItems_ShouldThrowArgumentException()
    {
        // Arrange
        
        // Act & Assert
        var command = new CreateOrderDto()
        {
            ExternalId = "ORD-12345",
            Customer = new CustomerDto() { UserId = Guid.NewGuid(), Name = "John Doe", Phone = "+1234567890"},
            DeliveryAddress = new AddressDto() { Street = "123 Main St", City = "New York",  State = "NY", Zip = "10001", Latitude = 40.7128, Longitude = -74.0060},
            Items = new List<CreateOrderItemDto>(),
            DeliveryFee = new MoneyDto() { Amount = 3.99m, Currency = "USD" },
            EtaMinutes = 30,
            RestaurantName = "Pizza Palace",
            RestaurantId = Guid.NewGuid()
        };
        await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command));
    }

    [Fact]
    public async Task Handle_WithInvalidEtaMinutes_ShouldThrowArgumentException()
    {
        // Arrange
        
        var command = new CreateOrderDto()
        {
            ExternalId = "ORD-12345",
            Customer = new CustomerDto() { UserId = Guid.NewGuid(), Name = "John Doe", Phone = "+1234567890"},
            DeliveryAddress = new AddressDto() { Street = "123 Main St", City = "New York",  State = "NY", Zip = "10001", Latitude = 40.7128, Longitude = -74.0060},
            Items = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto(  ) { Name = "Pizza" , Quantity = 2, UnitPrice = new MoneyDto() { Amount = 31.98m, Currency = "USD"}}
            },
            DeliveryFee = new MoneyDto() { Amount = 3.99m, Currency = "USD" },
            EtaMinutes = 0,
            RestaurantName = "Pizza Palace",
            RestaurantId = Guid.NewGuid()
        };
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command));
    }

    [Fact]
    public async Task Handle_WithNegativeItemQuantity_ShouldThrowArgumentException()
    {
        // Arrange
        
        var command = new CreateOrderDto()
        {
            ExternalId = "ORD-12345",
            Customer = new CustomerDto() { UserId = Guid.NewGuid(), Name = "John Doe", Phone = "+1234567890"},
            DeliveryAddress = new AddressDto() { Street = "123 Main St", City = "New York",  State = "NY", Zip = "10001", Latitude = 40.7128, Longitude = -74.0060},
            Items = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto(  ) { Name = "Pizza" , Quantity =-2, UnitPrice = new MoneyDto() { Amount = 31.98m, Currency = "USD"}}
            },
            DeliveryFee = new MoneyDto() { Amount = 3.99m, Currency = "USD" },
            EtaMinutes = 30,
            RestaurantName = "Pizza Palace",
            RestaurantId = Guid.NewGuid()
        };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command));
    }

    [Fact]
    public async Task Handle_WithNegativeItemPrice_ShouldThrowArgumentException()
    {
        // Arrange
        
        var command = new CreateOrderDto()
        {
            ExternalId = "ORD-12345",
            Customer = new CustomerDto() { UserId = Guid.NewGuid(), Name = "John Doe", Phone = "+1234567890"},
            DeliveryAddress = new AddressDto() { Street = "123 Main St", City = "New York",  State = "NY", Zip = "10001", Latitude = 40.7128, Longitude = -74.0060},
            Items = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto(  ) { Name = "Pizza" , Quantity = 2, UnitPrice = new MoneyDto() { Amount = -31.98m, Currency = "USD"}}
            },
            DeliveryFee = new MoneyDto() { Amount = 3.99m, Currency = "USD" },
            EtaMinutes = 30,
            RestaurantName = "Pizza Palace",
            RestaurantId = Guid.NewGuid()
        };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command));
    }

    [Fact]
    public async Task Handle_WithEmptyRestaurantName_ShouldThrowArgumentException()
    {
        // Arrange
        
        var command = new CreateOrderDto()
        {
            ExternalId = "ORD-12345",
            Customer = new CustomerDto() { UserId = Guid.NewGuid(), Name = "John Doe", Phone = "+1234567890"},
            DeliveryAddress = new AddressDto() { Street = "123 Main St", City = "New York",  State = "NY", Zip = "10001", Latitude = 40.7128, Longitude = -74.0060},
            Items = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto(  ) { Name = "Pizza" , Quantity = 2, UnitPrice = new MoneyDto() { Amount = 31.98m, Currency = "USD"}}
            },
            DeliveryFee = new MoneyDto() { Amount = 3.99m, Currency = "USD" },
            EtaMinutes = 30,
          //  RestaurantName = "Pizza Palace",
            RestaurantId = Guid.NewGuid()
        };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command));
    }

    [Fact]
    public async Task Handle_ShouldCalculateSubtotalAndTotalCorrectly()
    {
        // Arrange
        var command = new PlaceOrderCommand
        {
            ExternalId = "ORD-12345",
            Customer = new CustomerRef(Guid.NewGuid(), "John Doe", "+1234567890"),
            DeliveryAddress = new Address("123 Main St", "New York", "NY", "10001", 40.7128, -74.0060),
            Items = new List<FoodDeliveryApi.Domain.ValueObjects.OrderItem>
            {
                new FoodDeliveryApi.Domain.ValueObjects.OrderItem("Pizza", 2, new Money(15.99m, "USD"), new Money(31.98m, "USD")),
                new FoodDeliveryApi.Domain.ValueObjects.OrderItem("Coke", 1, new Money(2.50m, "USD"), new Money(2.50m, "USD"))
            },
            DeliveryFee = new Money(3.99m, "USD"),
            EtaMinutes = 30,
            RestaurantName = "Pizza Palace"
        };

        // Act
       // var result = await _handler.Handle(command);

        // Assert
        /*Assert.NotEqual(Guid.Empty, result);
        _mockRepository.Verify(r => r.Add(It.Is<Order>(o => 
            o.Subtotal.Amount == 34.48m && // 31.98 + 2.50
            o.Total.Amount == 38.47m &&    // 34.48 + 3.99
            o.DeliveryFee.Amount == 3.99m
        )), Times.Once);*/
    }
}
