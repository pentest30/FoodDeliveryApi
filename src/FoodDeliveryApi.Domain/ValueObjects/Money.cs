namespace FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;

public record Money(decimal Amount, string Currency)
{
    // Parameterless constructor for EF Core
    public Money() : this(0, "USD")
    {
    }
    public static Money Zero(string currency = "USD") => new(0, currency);
    
    public static Money operator +(Money left, Money right)
    {
        if (left.Currency != right.Currency)
            throw new InvalidOperationException("Cannot add money with different currencies");
        
        return new Money(left.Amount + right.Amount, left.Currency);
    }
    
    public static Money operator -(Money left, Money right)
    {
        if (left.Currency != right.Currency)
            throw new InvalidOperationException("Cannot subtract money with different currencies");
        
        return new Money(left.Amount - right.Amount, left.Currency);
    }
    
    public static Money operator *(Money money, decimal multiplier)
    {
        return new Money(money.Amount * multiplier, money.Currency);
    }
    
    public static Money operator *(decimal multiplier, Money money)
    {
        return money * multiplier;
    }
    
    public override string ToString() => $"{Amount:F2} {Currency}";
}
