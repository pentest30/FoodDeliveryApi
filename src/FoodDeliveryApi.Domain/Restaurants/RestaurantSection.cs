namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;

public class RestaurantSection
{
    public Guid Id { get; set; }
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool Active { get; set; } = true;
    public List<string> Images { get; set; } = new();
    public List<RestaurantMenuItem> MenuItems { get; set; } = new();
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    // Navigation properties
    public Restaurant Restaurant { get; set; } = null!;

    public RestaurantSection() { }

    public RestaurantSection(string name, int sortOrder = 0, bool active = true, List<string>? images = null, List<RestaurantMenuItem>? menuItems = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty", nameof(name));

        Id = Guid.NewGuid();
        Name = name;
        SortOrder = sortOrder;
        Active = active;
        Images = images ?? new List<string>();
        MenuItems = menuItems ?? new List<RestaurantMenuItem>();
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void AddMenuItem(RestaurantMenuItem menuItem)
    {
        if (menuItem == null)
            throw new ArgumentNullException(nameof(menuItem));

        menuItem.RestaurantSectionId = Id;
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
            updatedItem.RestaurantSectionId = Id;
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
