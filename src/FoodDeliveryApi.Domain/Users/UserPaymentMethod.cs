namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Users;

public class UserPaymentMethod
{
    public Guid Id { get; set; }
    public Guid UserProfileId { get; set; }
    public string ExternalId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    // Navigation properties
    public UserProfile UserProfile { get; set; } = null!;

    public UserPaymentMethod() { }

    public UserPaymentMethod(
        string externalId,
        string type,
        string label,
        bool isDefault = false)
    {
        if (string.IsNullOrWhiteSpace(externalId))
            throw new ArgumentException("ExternalId cannot be null or empty", nameof(externalId));
        
        if (string.IsNullOrWhiteSpace(type))
            throw new ArgumentException("Type cannot be null or empty", nameof(type));
        
        if (string.IsNullOrWhiteSpace(label))
            throw new ArgumentException("Label cannot be null or empty", nameof(label));

        Id = Guid.NewGuid();
        ExternalId = externalId;
        Type = type;
        Label = label;
        IsDefault = isDefault;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateInfo(string type, string label)
    {
        if (string.IsNullOrWhiteSpace(type))
            throw new ArgumentException("Type cannot be null or empty", nameof(type));
        
        if (string.IsNullOrWhiteSpace(label))
            throw new ArgumentException("Label cannot be null or empty", nameof(label));

        Type = type;
        Label = label;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void SetAsDefault()
    {
        IsDefault = true;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void UnsetAsDefault()
    {
        IsDefault = false;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}


