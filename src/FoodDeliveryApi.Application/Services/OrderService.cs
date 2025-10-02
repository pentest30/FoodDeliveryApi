using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;
using FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;

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
        global::FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects.Address deliveryAddress,
        IEnumerable<global::FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects.OrderItem> items,
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
            tenantId,
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
}
