using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using FoodDeliveryApi.Api.Dtos;
using FoodDeliveryApi.Api.Models;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;
using FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryApi.Tests.Integration;

public class OrderCrudTests : IntegrationTestBase
{
    public OrderCrudTests(WebApplicationFactory<Program> factory) : base(factory)
    {
        SetTenantHeader();
    }

    [Fact]
    public async Task GetOrders_ShouldReturnAllOrders()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/orders");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PaginatedResult<OrderDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        result.Should().NotBeNull();
        result.Data.Should().NotBeNull();
    }

    [Fact]
    public async Task GetOrders_WithPagination_ShouldReturnCorrectPage()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/orders?page=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PaginatedResult<OrderDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        result.Should().NotBeNull();
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(10);
    }

    [Fact]
    public async Task GetOrders_WithStatusFilter_ShouldReturnFilteredResults()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/orders?status=Pending");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PaginatedResult<OrderDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        result.Should().NotBeNull();
        result.Data.Should().NotBeNull();
    }

    [Fact]
    public async Task GetOrderById_WithValidId_ShouldReturnOrder()
    {
        // Arrange - First create an order
        var order = await CreateTestOrder();

        // Act
        var response = await Client.GetAsync($"/api/v1/orders/{order.ExternalId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var orderDto = JsonSerializer.Deserialize<OrderDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        orderDto.Should().NotBeNull();
        orderDto.Id.Should().Be(order.ExternalId);
        orderDto.Status.Should().Be("Pending");
    }

    [Fact]
    public async Task GetOrderById_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var orderId = "non-existent-id";

        // Act
        var response = await Client.GetAsync($"/api/v1/orders/{orderId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task PlaceOrder_WithValidData_ShouldReturnCreated()
    {
        // Arrange
        var orderRequest = new CreateOrderDto
        {
            ExternalId = "order-001",
            RestaurantName = "Pizza Palace",
            EtaMinutes = 25,
            Customer = new CustomerDto
            {
                UserId = Guid.NewGuid(),
                Name = "John Doe",
                Phone = "+1234567890"
            },
            DeliveryAddress = new AddressDto
            {
                Street = "123 Main St",
                City = "New York",
                State = "NY",
                Zip = "10001",
                Latitude = 40.7128,
                Longitude = -74.0060
            },
            Items = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto
                {
                    Name = "Margherita Pizza",
                    Quantity = 2,
                    UnitPrice = new MoneyDto { Amount = 15.99m, Currency = "USD" },
                    Total = new MoneyDto { Amount = 31.98m, Currency = "USD" }
                }
            },
            DeliveryFee = new MoneyDto { Amount = 3.99m, Currency = "USD" },
            RestaurantId = Guid.NewGuid()
        };

        var json = JsonSerializer.Serialize(orderRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/v1/orders/place", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<dynamic>(responseContent);

        result.Should().NotBeNull();
    }

    [Fact]
    public async Task PlaceOrder_WithInvalidData_ShouldReturnBadRequest()
    {
        // Arrange
        var invalidOrder = new CreateOrderDto
        {
            ExternalId = "order-002",
            RestaurantName = "", // Empty restaurant name should fail validation
            EtaMinutes = 25,
            Customer = new CustomerDto
            {
                UserId = Guid.NewGuid(),
                Name = "John Doe",
                Phone = "+1234567890"
            },
            DeliveryAddress = new AddressDto
            {
                Street = "123 Main St",
                City = "New York",
                State = "NY",
                Zip = "10001",
                Latitude = 40.7128,
                Longitude = -74.0060
            },
            Items = new List<CreateOrderItemDto>(), // Empty items should fail validation
            DeliveryFee = new MoneyDto { Amount = 3.99m, Currency = "USD" }
        };

        var json = JsonSerializer.Serialize(invalidOrder);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/v1/orders/place", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ConfirmOrder_WithValidId_ShouldReturnOk()
    {
        // Arrange - First create an order
        var order = await CreateTestOrder();

        // Act
        var response = await Client.PostAsync($"/api/v1/orders/{order.ExternalId}/confirm", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<dynamic>(responseContent);

        result.Should().NotBeNull();

        // Verify order status was updated
        var updatedOrder = await Context.Orders.FirstOrDefaultAsync(o => o.ExternalId == order.ExternalId);
        updatedOrder.Should().NotBeNull();
        updatedOrder.Status.Should().Be(OrderStatus.Confirmed);
    }

    [Fact]
    public async Task ConfirmOrder_WithInvalidId_ShouldReturnBadRequest()
    {
        // Arrange
        var orderId = "non-existent-id";

        // Act
        var response = await Client.PostAsync($"/api/v1/orders/{orderId}/confirm", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task MarkOrderReadyForPickup_WithValidId_ShouldReturnOk()
    {
        // Arrange - First create and confirm an order
        var order = await CreateTestOrder();
        await Client.PostAsync($"/api/v1/orders/{order.ExternalId}/confirm", null);

        // Act
        var response = await Client.PostAsync($"/api/v1/orders/{order.ExternalId}/ready-for-pickup", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<dynamic>(responseContent);

        result.Should().NotBeNull();

        // Verify order status was updated
        var updatedOrder = await Context.Orders.FirstOrDefaultAsync(o => o.ExternalId == order.ExternalId);
        updatedOrder.Should().NotBeNull();
        updatedOrder.Status.Should().Be(OrderStatus.ReadyForPickup);
    }

    [Fact]
    public async Task CancelOrder_WithValidId_ShouldReturnOk()
    {
        // Arrange - First create an order
        var order = await CreateTestOrder();
        var cancelRequest = new CancelOrderDto
        {
            Reason = "Customer requested cancellation"
        };

        var json = JsonSerializer.Serialize(cancelRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/v1/orders/{order.ExternalId}/cancel", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<dynamic>(responseContent);

        result.Should().NotBeNull();

        // Verify order status was updated
        var updatedOrder = await Context.Orders.FirstOrDefaultAsync(o => o.ExternalId == order.ExternalId);
        updatedOrder.Should().NotBeNull();
        updatedOrder.Status.Should().Be(OrderStatus.Canceled);
    }

    [Fact]
    public async Task CancelOrder_WithInvalidData_ShouldReturnBadRequest()
    {
        // Arrange
        var orderId = "non-existent-id";
        var cancelRequest = new CancelOrderDto
        {
            Reason = "Customer requested cancellation"
        };

        var json = JsonSerializer.Serialize(cancelRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/v1/orders/{orderId}/cancel", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task DeleteOrder_WithValidId_ShouldReturnNoContent()
    {
        // Arrange - First create an order
        var order = await CreateTestOrder();

        // Act
        var response = await Client.DeleteAsync($"/api/v1/orders/{order.ExternalId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify it was deleted from database
        var deletedOrder = await Context.Orders.FirstOrDefaultAsync(o => o.ExternalId == order.ExternalId);
        deletedOrder.Should().BeNull();
    }

    [Fact]
    public async Task DeleteOrder_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var orderId = "non-existent-id";

        // Act
        var response = await Client.DeleteAsync($"/api/v1/orders/{orderId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    private async Task<Order> CreateTestOrder()
    {
        var order = Order.Place(
            "test-order-001",
            new CustomerRef(Guid.NewGuid(), "Test Customer", "+1234567890"),
            new Address("123 Test St", "Test City", "TS", "12345", 40.7128, -74.0060),
            new List<FoodDeliveryApi.Domain.ValueObjects.OrderItem>
            {
                new FoodDeliveryApi.Domain.ValueObjects.OrderItem(
                    "Test Item",
                    1,
                    new Money(10.99m, "USD"),
                    new Money(10.99m, "USD")
                )
            },
            new Money(2.99m, "USD"),
            25,
            "Test Restaurant"
        );

        Context.Orders.Add(order);
        await Context.SaveChangesAsync();
        return order;
    }
}
