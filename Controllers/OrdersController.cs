using Microsoft.AspNetCore.Mvc;
using FoodDeliveryApi.Api.Models;
using FoodDeliveryApi.Api.Dtos;
using Finbuckle.MultiTenant;
using FoodDeliveryApi.FoodDeliveryApi.Application.Commands;
using FoodDeliveryApi.FoodDeliveryApi.Application.Handlers;
using FoodDeliveryApi.FoodDeliveryApi.Application.Services;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;

namespace FoodDeliveryApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orderService;
    private readonly PlaceOrderCommandHandler _placeOrderHandler;
    private readonly ConfirmOrderCommandHandler _confirmOrderHandler;
    private readonly MarkOrderReadyForPickupCommandHandler _markReadyHandler;
    private readonly CancelOrderCommandHandler _cancelOrderHandler;
    private readonly FailOrderCommandHandler _failOrderHandler;

    public OrdersController(
        OrderService orderService,
        PlaceOrderCommandHandler placeOrderHandler,
        ConfirmOrderCommandHandler confirmOrderHandler,
        MarkOrderReadyForPickupCommandHandler markReadyHandler,
        CancelOrderCommandHandler cancelOrderHandler,
        FailOrderCommandHandler failOrderHandler)
    {
        _orderService = orderService;
        _placeOrderHandler = placeOrderHandler;
        _confirmOrderHandler = confirmOrderHandler;
        _markReadyHandler = markReadyHandler;
        _cancelOrderHandler = cancelOrderHandler;
        _failOrderHandler = failOrderHandler;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResult<OrderDto>>> GetOrders(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? status = null,
        [FromQuery] DateTimeOffset? fromDate = null,
        [FromQuery] DateTimeOffset? toDate = null,
        CancellationToken ct = default
    )
    {
        var (items, total) = await _orderService.SearchAsync(status, null, fromDate, toDate, page, pageSize, ct);
        var models = items.Select(MapToOrderDto).ToList();

        var result = new PaginatedResult<OrderDto>
        {
            Data = models,
            Page = page,
            PageSize = pageSize,
            TotalCount = total,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize),
            HasPreviousPage = page > 1,
            HasNextPage = page * pageSize < total
        };
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrderById(string id, CancellationToken ct)
    {
        var order = await _orderService.GetByExternalIdAsync(id, ct);
        if (order is null) return NotFound(new { message = $"Order with ID '{id}' not found" });

        return Ok(MapToOrderDto(order));
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> PlaceOrder([FromBody] CreateOrderDto dto, CancellationToken ct)
    {
        try
        {
            await _placeOrderHandler.Handle(dto);
            // Create a simplified order for now - this would need proper implementation
            // based on the actual business requirements
            return BadRequest(new { message = "Order placement not yet implemented - requires proper DTO mapping and business logic" });
        }
        catch (ArgumentException ex)
        {
            return Problem(title: "Validation Error", statusCode: 400, detail: ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Problem(title: "Business Rule Violation", statusCode: 409, detail: ex.Message);
        }
    }

    [HttpPost("{id}/confirm")]
    public async Task<ActionResult<OrderDto>> ConfirmOrder(string id, CancellationToken ct)
    {
        try
        {
            var command = new ConfirmOrderCommand { ExternalId = id };
            await _confirmOrderHandler.Handle(command);
            var order = await _orderService.GetByExternalIdAsync(id, ct);
            if (order == null) return NotFound();
            return Ok(MapToOrderDto(order));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Problem(title: "Business Rule Violation", statusCode: 409, detail: ex.Message);
        }
    }

    [HttpPost("{id}/ready-for-pickup")]
    public async Task<ActionResult<OrderDto>> MarkOrderReadyForPickup(string id, CancellationToken ct)
    {
        try
        {
            var command = new MarkOrderReadyForPickupCommand { ExternalId = id };
            await _markReadyHandler.Handle(command);
            var order = await _orderService.GetByExternalIdAsync(id, ct);
            if (order == null) return NotFound();
            return Ok(MapToOrderDto(order));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Problem(title: "Business Rule Violation", statusCode: 409, detail: ex.Message);
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<OrderDto>> CancelOrder(string id, [FromBody] CancelOrderDto dto, CancellationToken ct)
    {
        try
        {
            var command = new CancelOrderCommand { ExternalId = id, Reason = dto.Reason };
            await _cancelOrderHandler.Handle(command);
            var order = await _orderService.GetByExternalIdAsync(id, ct);
            if (order == null) return NotFound();
            return Ok(MapToOrderDto(order));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Problem(title: "Business Rule Violation", statusCode: 409, detail: ex.Message);
        }
    }

    [HttpPost("{id}/fail")]
    public async Task<ActionResult<OrderDto>> FailOrder(string id, [FromBody] FailOrderDto dto, CancellationToken ct)
    {
        try
        {
            var command = new FailOrderCommand { ExternalId = id, Reason = dto.Reason };
            await _failOrderHandler.Handle(command);
            var order = await _orderService.GetByExternalIdAsync(id, ct);
            if (order == null) return NotFound();
            return Ok(MapToOrderDto(order));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Problem(title: "Business Rule Violation", statusCode: 409, detail: ex.Message);
        }
    }

    private static OrderDto MapToOrderDto(Order order)
    {
        return new OrderDto
        {
            Id = order.ExternalId,
            ExternalId = order.ExternalId,
            Status = order.Status.ToString(),
            CreatedAt = order.CreatedAt,
            EtaMinutes = order.EtaMinutes,
            RestaurantName = order.RestaurantName,
            Subtotal = new MoneyApiModel { Amount = order.Subtotal.Amount, Currency = order.Subtotal.Currency },
            Total = new MoneyApiModel { Amount = order.Total.Amount, Currency = order.Total.Currency },
            DeliveryFee = new MoneyApiModel { Amount = order.DeliveryFee.Amount, Currency = order.DeliveryFee.Currency },
            DeliveryAddress = new AddressApiModel
            {
                Street = order.DeliveryAddress.Street,
                City = order.DeliveryAddress.City,
                State = order.DeliveryAddress.State,
                Zip = order.DeliveryAddress.Zip,
                Latitude = order.DeliveryAddress.Latitude,
                Longitude = order.DeliveryAddress.Longitude,
                FullAddress = order.DeliveryAddress.FullAddress
            },
            Customer = new CustomerRefApiModel
            {
                UserId = order.UserProfileId?.ToString() ?? string.Empty,
                Name = order.Customer.Name,
                Phone = order.Customer.Phone
            },
            Items = order.Items.Select(i => new OrderItemApiModel
            {
                Name = i.Name,
                Quantity = i.Quantity,
                UnitPrice = new MoneyApiModel { Amount = i.UnitPrice.Amount, Currency = i.UnitPrice.Currency },
                Total = new MoneyApiModel { Amount = i.Total.Amount, Currency = i.Total.Currency }
            }).ToList()
        };
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<OrderStatisticsDto>> GetOrderStatistics(CancellationToken ct = default)
    {
        var statistics = await _orderService.GetOrderStatisticsAsync(ct);
        return Ok(statistics);
    }
}