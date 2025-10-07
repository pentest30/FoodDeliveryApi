using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;
using FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;
using FoodDeliveryApi.Api.Dtos;

namespace FoodDeliveryApi.FoodDeliveryApi.Application.Services;

public class OrderService
{
    private readonly IOrderRepository _repository;

    public OrderService(IOrderRepository repository)
    {
        _repository = repository;
    }

    public async Task<(IReadOnlyList<Order> Items, int TotalCount)> SearchAsync(
        string? status, string? restaurantName, DateTimeOffset? from, DateTimeOffset? to, int page, int pageSize, CancellationToken ct)
    {
        return await _repository.SearchAsync(status, restaurantName, from, to, page, pageSize, ct);
    }

    public async Task<Order?> GetByExternalIdAsync(string externalId, CancellationToken ct)
    {
        return await _repository.GetByExternalIdAsync(externalId, ct);
    }

    public async Task<Order> PlaceOrderAsync(
        string externalId,
        string tenantId,
        CustomerRef customer,
        Address deliveryAddress,
        IEnumerable<Domain.ValueObjects.OrderItem> items,
        Money deliveryFee,
        int etaMinutes,
        string restaurantName,
        Guid? restaurantId = null,
        CancellationToken ct = default)
    {
        // Use the domain factory method
        // Convert entity items to value objects
        var valueObjectItems = items.Select(item => new global::FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects.OrderItem(
            item.Name,
            item.Quantity,
            item.UnitPrice,
            item.Total
        ));

        var order = Order.Place(
            externalId,
            customer,
            deliveryAddress,
            valueObjectItems,
            deliveryFee,
            etaMinutes,
            restaurantName,
            restaurantId);

        return await _repository.CreateAsync(order, ct);
    }

    public async Task<Order> ConfirmOrderAsync(string externalId, CancellationToken ct)
    {
        var order = await _repository.GetByExternalIdAsync(externalId, ct);
        if (order == null)
            throw new ArgumentException($"Order with ID '{externalId}' not found");

        order.Confirm();
        return await _repository.UpdateAsync(externalId, o => { }, ct);
    }

    public async Task<Order> MarkReadyForPickupAsync(string externalId, CancellationToken ct)
    {
        var order = await _repository.GetByExternalIdAsync(externalId, ct);
        if (order == null)
            throw new ArgumentException($"Order with ID '{externalId}' not found");

        order.MarkReadyForPickup();
        return await _repository.UpdateAsync(externalId, o => { }, ct);
    }

    public async Task<Order> MoveOutForDeliveryAsync(string externalId, CancellationToken ct)
    {
        var order = await _repository.GetByExternalIdAsync(externalId, ct);
        if (order == null)
            throw new ArgumentException($"Order with ID '{externalId}' not found");

        order.MoveOutForDelivery();
        return await _repository.UpdateAsync(externalId, o => { }, ct);
    }

    public async Task<Order> CompleteDeliveryAsync(string externalId, CancellationToken ct)
    {
        var order = await _repository.GetByExternalIdAsync(externalId, ct);
        if (order == null)
            throw new ArgumentException($"Order with ID '{externalId}' not found");

        order.CompleteDelivery();
        return await _repository.UpdateAsync(externalId, o => { }, ct);
    }

    public async Task<Order> CancelOrderAsync(string externalId, string reason, CancellationToken ct)
    {
        var order = await _repository.GetByExternalIdAsync(externalId, ct);
        if (order == null)
            throw new ArgumentException($"Order with ID '{externalId}' not found");

        order.Cancel(reason);
        return await _repository.UpdateAsync(externalId, o => { }, ct);
    }

    public async Task<Order> FailOrderAsync(string externalId, string reason, CancellationToken ct)
    {
        var order = await _repository.GetByExternalIdAsync(externalId, ct);
        if (order == null)
            throw new ArgumentException($"Order with ID '{externalId}' not found");

        order.Fail(reason);
        return await _repository.UpdateAsync(externalId, o => { }, ct);
    }

    public async Task<bool> DeleteAsync(string externalId, CancellationToken ct)
    {
        return await _repository.DeleteAsync(externalId, ct);
    }

    public async Task<OrderStatisticsDto> GetOrderStatisticsAsync(CancellationToken ct = default)
    {
        var now = DateTimeOffset.UtcNow;
        var today = now.Date;
        var weekStart = today.AddDays(-(int)today.DayOfWeek);
        var monthStart = new DateTimeOffset(today.Year, today.Month, 1, 0, 0, 0, now.Offset);

        // Get all orders for statistics
        var (allOrders, _) = await _repository.SearchAsync(null, null, null, null, 1, int.MaxValue, ct);
        
        var totalOrders = allOrders.Count;
        var pendingOrders = allOrders.Count(o => o.Status == OrderStatus.Pending);
        var confirmedOrders = allOrders.Count(o => o.Status == OrderStatus.Confirmed);
        var readyForPickupOrders = allOrders.Count(o => o.Status == OrderStatus.ReadyForPickup);
        var outForDeliveryOrders = allOrders.Count(o => o.Status == OrderStatus.OutForDelivery);
        var deliveredOrders = allOrders.Count(o => o.Status == OrderStatus.Delivered);
        var canceledOrders = allOrders.Count(o => o.Status == OrderStatus.Canceled);
        var failedOrders = allOrders.Count(o => o.Status == OrderStatus.Failed);

        // Calculate revenue from delivered orders only
        var deliveredOrdersList = allOrders.Where(o => o.Status == OrderStatus.Delivered).ToList();
        var totalRevenue = deliveredOrdersList.Sum(o => o.Total.Amount);
        var averageOrderValue = deliveredOrdersList.Any() ? totalRevenue / deliveredOrdersList.Count : 0;

        // Time-based statistics
        var ordersToday = allOrders.Count(o => o.CreatedAt.Date == today);
        var ordersThisWeek = allOrders.Count(o => o.CreatedAt >= weekStart);
        var ordersThisMonth = allOrders.Count(o => o.CreatedAt >= monthStart);

        return new OrderStatisticsDto
        {
            TotalOrders = totalOrders,
            PendingOrders = pendingOrders,
            ConfirmedOrders = confirmedOrders,
            ReadyForPickupOrders = readyForPickupOrders,
            OutForDeliveryOrders = outForDeliveryOrders,
            DeliveredOrders = deliveredOrders,
            CanceledOrders = canceledOrders,
            FailedOrders = failedOrders,
            TotalRevenue = new MoneyDto { Amount = totalRevenue, Currency = "DZD" },
            AverageOrderValue = new MoneyDto { Amount = averageOrderValue, Currency = "DZD" },
            OrdersToday = ordersToday,
            OrdersThisWeek = ordersThisWeek,
            OrdersThisMonth = ordersThisMonth
        };
    }
}
