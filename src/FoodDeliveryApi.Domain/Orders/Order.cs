using FoodDeliveryApi.FoodDeliveryApi.Domain.Common;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Users;
using FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;

namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;

public class Order : IHasDomainEvents
{
    private readonly List<IDomainEvent> _domainEvents = new();

    public Guid Id { get; private set; }
    public string ExternalId { get; private set; } = string.Empty;
    public string TenantId { get; private set; } = string.Empty;
    public OrderStatus Status { get; private set; } = OrderStatus.Pending;
    public DateTimeOffset CreatedAt { get; private set; }
    public int EtaMinutes { get; private set; }
    public Guid? RestaurantId { get; private set; }
    public Guid? UserProfileId { get; private set; }
    public string RestaurantName { get; private set; } = string.Empty;
    public Money Subtotal { get; private set; } = Money.Zero();
    public Money Total { get; private set; } = Money.Zero();
    public Money DeliveryFee { get; private set; } = Money.Zero();
    public Address DeliveryAddress { get; private set; } = null!;
    public CustomerRef Customer { get; private set; } = null!;
    public List<OrderItem> Items { get; private set; } = new();
    public Restaurant? Restaurant { get; private set; }
    public UserProfile? UserProfile { get; private set; }

    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }

    // Factory method
    public static Order Place(
        string externalId,
        CustomerRef customer,
        Address deliveryAddress,
        IEnumerable<ValueObjects.OrderItem> items,
        Money deliveryFee,
        int etaMinutes,
        string restaurantName,
        Guid? restaurantId = null,
        Guid? userProfileId = null)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(externalId))
            throw new ArgumentException("ExternalId cannot be null or empty", nameof(externalId));
        
        
        if (customer == null)
            throw new ArgumentNullException(nameof(customer));
        
        if (deliveryAddress == null)
            throw new ArgumentNullException(nameof(deliveryAddress));
        
        if (items == null || !items.Any())
            throw new ArgumentException("Items cannot be null or empty", nameof(items));
        
        if (deliveryFee == null)
            throw new ArgumentNullException(nameof(deliveryFee));
        
        if (etaMinutes <= 0)
            throw new ArgumentException("EtaMinutes must be greater than zero", nameof(etaMinutes));
        
        if (string.IsNullOrWhiteSpace(restaurantName))
            throw new ArgumentException("RestaurantName cannot be null or empty", nameof(restaurantName));

        // Validate items
        var itemsList = items.ToList();
        foreach (var item in itemsList)
        {
            if (item.Quantity <= 0)
                throw new ArgumentException($"Item '{item.Name}' quantity must be greater than zero");
            
            if (item.UnitPrice.Amount < 0)
                throw new ArgumentException($"Item '{item.Name}' unit price cannot be negative");
        }

        // Compute subtotal and total
        var subtotal = itemsList.Sum(item => item.Total.Amount);
        var subtotalMoney = new Money(subtotal, itemsList.First().UnitPrice.Currency);
        var total = subtotal + deliveryFee.Amount;
        var totalMoney = new Money(total, subtotalMoney.Currency);

        var orderId = Guid.NewGuid();
        var order = new Order
        {
            Id = orderId,
            ExternalId = externalId,
            Status = OrderStatus.Pending,
            CreatedAt = DateTimeOffset.UtcNow,
            EtaMinutes = etaMinutes,
            RestaurantId = restaurantId,
            UserProfileId = userProfileId,
            RestaurantName = restaurantName,
            Subtotal = subtotalMoney,
            Total = totalMoney,
            DeliveryFee = deliveryFee,
            DeliveryAddress = deliveryAddress,
            Customer = customer,
            Items = itemsList.Select(item => OrderItem.Create(orderId, item.Name, item.Quantity, item.UnitPrice)).ToList()
        };

        order.AddDomainEvent(new OrderPlaced(order.Id, order.ExternalId));
        return order;
    }

    // Behaviors
    public void Confirm()
    {
        if (Status != OrderStatus.Pending)
            throw new InvalidOperationException($"Cannot confirm order in {Status} status. Order must be in Pending status.");

        Status = OrderStatus.Confirmed;
        AddDomainEvent(new OrderConfirmed(Id, ExternalId));
    }

    public void MarkReadyForPickup()
    {
        if (Status != OrderStatus.Confirmed)
            throw new InvalidOperationException($"Cannot mark order ready for pickup in {Status} status. Order must be in Confirmed status.");

        Status = OrderStatus.ReadyForPickup;
        AddDomainEvent(new OrderReadyForPickup(Id, ExternalId));
    }

    public void MoveOutForDelivery()
    {
        if (Status != OrderStatus.ReadyForPickup)
            throw new InvalidOperationException($"Cannot move order out for delivery in {Status} status. Order must be in ReadyForPickup status.");

        Status = OrderStatus.OutForDelivery;
    }

    public void CompleteDelivery()
    {
        if (Status != OrderStatus.OutForDelivery)
            throw new InvalidOperationException($"Cannot complete delivery in {Status} status. Order must be in OutForDelivery status.");

        Status = OrderStatus.Delivered;
    }

    public void Cancel(string reason)
    {
        if (Status == OrderStatus.Delivered)
            throw new InvalidOperationException($"Cannot cancel order in {Status} status. Delivered orders cannot be canceled.");

        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Reason cannot be null or empty", nameof(reason));

        Status = OrderStatus.Canceled;
        AddDomainEvent(new OrderCanceled(Id, ExternalId, reason));
    }

    public void Fail(string reason)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Reason cannot be null or empty", nameof(reason));

        Status = OrderStatus.Failed;
        AddDomainEvent(new OrderFailed(Id, ExternalId, reason));
    }

    private void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }
}


