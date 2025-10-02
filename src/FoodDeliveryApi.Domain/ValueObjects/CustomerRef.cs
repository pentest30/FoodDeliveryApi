namespace FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;

public record CustomerRef(Guid UserId, string Name, string Phone)
{
    // Parameterless constructor for EF Core
    public CustomerRef() : this(Guid.Empty, string.Empty, string.Empty)
    {
    }
    public static CustomerRef Create(Guid userId, string name, string phone)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("UserId cannot be empty", nameof(userId));
        
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));
        
        if (string.IsNullOrWhiteSpace(phone))
            throw new ArgumentException("Phone cannot be null or empty", nameof(phone));
        
        return new CustomerRef(userId, name, phone);
    }
    
    public override string ToString() => $"{Name} ({Phone})";
}
