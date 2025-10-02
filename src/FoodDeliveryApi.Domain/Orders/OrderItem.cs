using FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;

namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;

public class OrderItem
{
    public Guid Id { get; private set; }
    public Guid OrderId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public int Quantity { get; private set; }
    public Money UnitPrice { get; private set; } = Money.Zero();
    public Money Total { get; private set; } = Money.Zero();
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    // Navigation property
    public Order Order { get; private set; } = null!;

    // Private constructor for EF Core
    private OrderItem() { }

    // Factory method
    public static OrderItem Create(Guid orderId, string name, int quantity, Money unitPrice)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));
        
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));
        
        if (unitPrice.Amount < 0)
            throw new ArgumentException("Unit price cannot be negative", nameof(unitPrice));
        
        var total = unitPrice * quantity;
        return new OrderItem
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            Name = name,
            Quantity = quantity,
            UnitPrice = unitPrice,
            Total = total,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
    }

    // Business methods
    public void UpdateQuantity(int newQuantity)
    {
        if (newQuantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(newQuantity));
        
        Quantity = newQuantity;
        Total = UnitPrice * newQuantity;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateUnitPrice(Money newUnitPrice)
    {
        if (newUnitPrice.Amount < 0)
            throw new ArgumentException("Unit price cannot be negative", nameof(newUnitPrice));
        
        UnitPrice = newUnitPrice;
        Total = newUnitPrice * Quantity;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateName(string newName)
    {
        if (string.IsNullOrWhiteSpace(newName))
            throw new ArgumentException("Name cannot be null or empty", nameof(newName));
        
        Name = newName;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public override string ToString() => $"{Quantity}x {Name} @ {UnitPrice} = {Total}";
}
