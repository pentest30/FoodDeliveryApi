using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;

namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;

public class RestaurantCategory
{
    public Guid Id { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid CategoryId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    // Navigation properties
    public Restaurant Restaurant { get; set; } = null!;
    public Category Category { get; set; } = null!;

    public RestaurantCategory()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTimeOffset.UtcNow;
    }
}
