using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;

namespace FoodDeliveryApi.FoodDeliveryApi.Application.Services;

public class RestaurantSectionService
{
    private readonly IRestaurantRepository _repository;

    public RestaurantSectionService(IRestaurantRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<RestaurantSection>> GetSectionsByRestaurantAsync(string restaurantExternalId, CancellationToken ct)
    {
        return await _repository.GetSectionsByRestaurantExternalIdAsync(restaurantExternalId, ct);
    }

    public async Task<RestaurantSection?> GetSectionByIdAsync(Guid sectionId, CancellationToken ct)
    {
        return await _repository.GetSectionByIdAsync(sectionId, ct);
    }

    public async Task<RestaurantSection> CreateSectionAsync(
        Guid restaurantExternalId, 
        string name, 
        string description, 
        int sortOrder, 
        bool active, 
        List<string>? images, 
        CancellationToken ct)
    {
        // Validate restaurant exists
        var restaurant = await _repository.GetByIdAsync(restaurantExternalId, ct);
        if (restaurant == null)
            throw new KeyNotFoundException($"Restaurant with external ID '{restaurantExternalId}' not found");

        // Create section
        var section = RestaurantSection.Create(name, description, sortOrder, active, images);
        section.SetRestaurantId(restaurant.Id);

        // Add section to restaurant
        restaurant.AddSection(section);

        // Save changes
        await _repository.UpdateAsync(restaurant, ct);
        return section;
    }

    public async Task<RestaurantSection> UpdateSectionAsync(
        Guid sectionId, 
        string name, 
        string description, 
        int sortOrder, 
        bool active, 
        List<string>? images, 
        CancellationToken ct)
    {
        var section = await _repository.GetSectionByIdAsync(sectionId, ct);
        if (section == null)
            throw new KeyNotFoundException($"Section with ID '{sectionId}' not found");

        // Update section
        section.UpdateBasicInfo(name, description, sortOrder);
        section.SetActiveStatus(active);

        // Update images if provided
        if (images != null)
        {
            section.Images.Clear();
            foreach (var image in images)
            {
                section.AddImage(image);
            }
        }

        // Save changes
        var restaurant = await _repository.GetByIdAsync(section.RestaurantId, ct);
        if (restaurant != null)
        {
            await _repository.UpdateAsync(restaurant.ExternalId, r => { }, ct);
        }

        return section;
    }

    public async Task<bool> DeleteSectionAsync(Guid sectionId, CancellationToken ct)
    {
        var section = await _repository.GetSectionByIdAsync(sectionId, ct);
        if (section == null)
            return false;

        var restaurant = await _repository.GetByIdAsync(section.RestaurantId, ct);
        if (restaurant == null)
            return false;

        // Remove section from restaurant
        restaurant.RemoveSection(section.Name);

        // Save changes
        await _repository.UpdateAsync(restaurant.ExternalId, r => { }, ct);

        return true;
    }

    public async Task<RestaurantSection> AddMenuItemAsync(
        Guid sectionId, 
        string itemName, 
        string itemDescription, 
        decimal? basePrice, 
        int quantity, 
        bool available, 
        List<string>? images, 
        List<string>? allergens, 
        CancellationToken ct)
    {
        var section = await _repository.GetSectionByIdAsync(sectionId, ct);
        if (section == null)
            throw new KeyNotFoundException($"Section with ID '{sectionId}' not found");

        // Create menu item
        var menuItem = RestaurantMenuItem.Create(
            itemName, 
            itemDescription, 
            basePrice, 
            quantity, 
            available, 
            images, 
            allergens);

        // Add to section
        section.AddMenuItem(menuItem);

        // Save changes
        var restaurant = await _repository.GetByIdAsync(section.RestaurantId, ct);
        if (restaurant != null)
        {
            await _repository.UpdateAsync(restaurant.ExternalId, r => { }, ct);
        }

        return section;
    }

    public async Task<RestaurantSection> RemoveMenuItemAsync(Guid sectionId, Guid menuItemId, CancellationToken ct)
    {
        var section = await _repository.GetSectionByIdAsync(sectionId, ct);
        if (section == null)
            throw new KeyNotFoundException($"Section with ID '{sectionId}' not found");

        section.RemoveMenuItem(menuItemId);

        // Save changes
        var restaurant = await _repository.GetByIdAsync(section.RestaurantId, ct);
        if (restaurant != null)
        {
            await _repository.UpdateAsync(restaurant.ExternalId, r => { }, ct);
        }

        return section;
    }

    public async Task<RestaurantSection> AddImageToSectionAsync(Guid sectionId, string imageUrl, CancellationToken ct)
    {
        var section = await _repository.GetSectionByIdAsync(sectionId, ct);
        if (section == null)
            throw new KeyNotFoundException($"Section with ID '{sectionId}' not found");

        section.AddImage(imageUrl);

        // Save changes
        var restaurant = await _repository.GetByIdAsync(section.RestaurantId, ct);
        if (restaurant != null)
        {
            await _repository.UpdateAsync(restaurant.ExternalId, r => { }, ct);
        }

        return section;
    }

    public async Task<RestaurantSection> RemoveImageFromSectionAsync(Guid sectionId, string imageUrl, CancellationToken ct)
    {
        var section = await _repository.GetSectionByIdAsync(sectionId, ct);
        if (section == null)
            throw new KeyNotFoundException($"Section with ID '{sectionId}' not found");

        section.RemoveImage(imageUrl);

        // Save changes
        var restaurant = await _repository.GetByIdAsync(section.RestaurantId, ct);
        if (restaurant != null)
        {
            await _repository.UpdateAsync(restaurant.ExternalId, r => { }, ct);
        }

        return section;
    }
}
