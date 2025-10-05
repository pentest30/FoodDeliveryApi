namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;

public class RestaurantSection
{
    public Guid Id { get; private set; }
    public Guid RestaurantId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public int SortOrder { get; private set; }
    public bool Active { get; private set; } = true;
    public List<string> Images { get; private set; } = new();
    public List<RestaurantMenuItem> MenuItems { get; private set; } = new();
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? UpdatedAt { get; private set; }

    // Navigation properties
    public Restaurant Restaurant { get; private set; } = null!;

    // Private constructor for EF Core
    private RestaurantSection() { }

    // Factory method for creating new sections
    public static RestaurantSection Create(
        string name, 
        string description = "", 
        int sortOrder = 0, 
        bool active = true, 
        List<string>? images = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));

        if (sortOrder < 0)
            throw new ArgumentException("Sort order cannot be negative", nameof(sortOrder));

        return new RestaurantSection
        {
            Name = name.Trim(),
            Description = description?.Trim() ?? string.Empty,
            SortOrder = sortOrder,
            Active = active,
            Images = images ?? new List<string>(),
            MenuItems = new List<RestaurantMenuItem>(),
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    // Business logic methods
    public void UpdateBasicInfo(string name, string description, int sortOrder)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));

        if (sortOrder < 0)
            throw new ArgumentException("Sort order cannot be negative", nameof(sortOrder));

        Name = name.Trim();
        Description = description?.Trim() ?? string.Empty;
        SortOrder = sortOrder;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void SetActiveStatus(bool active)
    {
        Active = active;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void SetRestaurantId(Guid restaurantId)
    {
        if (restaurantId == Guid.Empty)
            throw new ArgumentException("Restaurant ID cannot be empty", nameof(restaurantId));

        RestaurantId = restaurantId;
    }

    public void AddMenuItem(RestaurantMenuItem menuItem)
    {
        if (menuItem == null)
            throw new ArgumentNullException(nameof(menuItem));

        if (MenuItems.Any(mi => mi.Id == menuItem.Id))
            throw new InvalidOperationException("Menu item with this ID already exists in this section");

        menuItem.SetRestaurantSectionId(Id);
        menuItem.SetRestaurantId(RestaurantId);
        MenuItems.Add(menuItem);
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void RemoveMenuItem(Guid menuItemId)
    {
        var itemToRemove = MenuItems.FirstOrDefault(mi => mi.Id == menuItemId);
        if (itemToRemove != null && MenuItems.Remove(itemToRemove))
        {
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    public void UpdateMenuItem(RestaurantMenuItem updatedItem)
    {
        if (updatedItem == null)
            throw new ArgumentNullException(nameof(updatedItem));

        var existingItem = MenuItems.FirstOrDefault(mi => mi.Id == updatedItem.Id);
        if (existingItem != null)
        {
            var index = MenuItems.IndexOf(existingItem);
            updatedItem.SetRestaurantSectionId(Id);
            MenuItems[index] = updatedItem;
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    public void AddImage(string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            throw new ArgumentException("Image URL cannot be null or empty", nameof(imageUrl));
        if (!Images.Contains(imageUrl))
        {
            Images.Add(imageUrl);
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    public void RemoveImage(string imageUrl)
    {
        if (Images.Remove(imageUrl))
        {
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    public decimal GetTotalPrice()
    {
        return MenuItems.Sum(item => (item.BasePrice ?? 0m) * item.Quantity);
    }

    public int GetTotalItemCount()
    {
        return MenuItems.Sum(item => item.Quantity);
    }
}
