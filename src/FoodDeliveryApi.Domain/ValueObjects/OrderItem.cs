namespace FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;

public record OrderItem(string Name, int Quantity, Money UnitPrice, Money Total)
{
    // Parameterless constructor for EF Core
    public OrderItem() : this(string.Empty, 0, new Money(0, "USD"), new Money(0, "USD"))
    {
    }
    public static OrderItem Create(string name, int quantity, Money unitPrice)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));
        
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));
        
        if (unitPrice.Amount < 0)
            throw new ArgumentException("Unit price cannot be negative", nameof(unitPrice));
        
        var total = unitPrice * quantity;
        return new OrderItem(name, quantity, unitPrice, total);
    }
    
    public override string ToString() => $"{Quantity}x {Name} @ {UnitPrice} = {Total}";
}

