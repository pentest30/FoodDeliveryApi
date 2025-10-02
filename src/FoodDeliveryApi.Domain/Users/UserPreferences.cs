namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Users;

public class UserPreferences
{
    public Guid Id { get; set; }
    public Guid UserProfileId { get; set; }
    public bool Notifications { get; set; } = true;
    public bool Promotions { get; set; } = true;
    public string Language { get; set; } = "en";
    public string Theme { get; set; } = "light";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    // Navigation properties
    public UserProfile UserProfile { get; set; } = null!;

    public UserPreferences() { }

    public UserPreferences(
        bool notifications = true,
        bool promotions = true,
        string language = "en",
        string theme = "light")
    {
        if (string.IsNullOrWhiteSpace(language))
            throw new ArgumentException("Language cannot be null or empty", nameof(language));
        
        if (string.IsNullOrWhiteSpace(theme))
            throw new ArgumentException("Theme cannot be null or empty", nameof(theme));

        Id = Guid.NewGuid();
        Notifications = notifications;
        Promotions = promotions;
        Language = language;
        Theme = theme;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdatePreferences(bool notifications, bool promotions, string language, string theme)
    {
        if (string.IsNullOrWhiteSpace(language))
            throw new ArgumentException("Language cannot be null or empty", nameof(language));
        
        if (string.IsNullOrWhiteSpace(theme))
            throw new ArgumentException("Theme cannot be null or empty", nameof(theme));

        Notifications = notifications;
        Promotions = promotions;
        Language = language;
        Theme = theme;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateNotificationSettings(bool notifications, bool promotions)
    {
        Notifications = notifications;
        Promotions = promotions;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateDisplaySettings(string language, string theme)
    {
        if (string.IsNullOrWhiteSpace(language))
            throw new ArgumentException("Language cannot be null or empty", nameof(language));
        
        if (string.IsNullOrWhiteSpace(theme))
            throw new ArgumentException("Theme cannot be null or empty", nameof(theme));

        Language = language;
        Theme = theme;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}


