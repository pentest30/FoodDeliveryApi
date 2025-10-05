using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;
using System.Collections.Generic;
using System;
using System.Linq;

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
            await _repository.UpdateAsync(restaurant, ct);
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

    // Add image to menu item
    public async Task<RestaurantSection> AddImageToMenuItemAsync(Guid sectionId, Guid menuItemId, string imageUrl, CancellationToken ct)
    {
        var section = await _repository.GetSectionByIdAsync(sectionId, ct);
        if (section == null)
            throw new KeyNotFoundException($"Section with ID '{sectionId}' not found");

        var menuItem = section.MenuItems.FirstOrDefault(mi => mi.Id == menuItemId);
        if (menuItem == null)
            throw new KeyNotFoundException($"Menu item with ID '{menuItemId}' not found in section '{sectionId}'");

        menuItem.AddImage(imageUrl);

        // Save changes
        var restaurant = await _repository.GetByIdAsync(section.RestaurantId, ct);
        if (restaurant != null)
        {
            await _repository.UpdateAsync(restaurant.ExternalId, r => { }, ct);
        }

        return section;
    }

    // Remove image from menu item
    public async Task<RestaurantSection> RemoveImageFromMenuItemAsync(Guid sectionId, Guid menuItemId, string imageUrl, CancellationToken ct)
    {
        var section = await _repository.GetSectionByIdAsync(sectionId, ct);
        if (section == null)
            throw new KeyNotFoundException($"Section with ID '{sectionId}' not found");

        var menuItem = section.MenuItems.FirstOrDefault(mi => mi.Id == menuItemId);
        if (menuItem == null)
            throw new KeyNotFoundException($"Menu item with ID '{menuItemId}' not found in section '{sectionId}'");

        menuItem.RemoveImage(imageUrl);

        // Save changes
        var restaurant = await _repository.GetByIdAsync(section.RestaurantId, ct);
        if (restaurant != null)
        {
            await _repository.UpdateAsync(restaurant.ExternalId, r => { }, ct);
        }

        return section;
    }

    public async Task<IReadOnlyList<RestaurantMenuItem>> GetMenuItemsAsync(
        string restaurantId, 
        string? sectionId = null, 
        string? search = null, 
        bool? available = null, 
        int page = 1, 
        int pageSize = 10, 
        CancellationToken ct = default)
    {
        var sections = await GetSectionsByRestaurantAsync(restaurantId, ct);
        
        var allMenuItems = sections
            .Where(s => sectionId == null || s.Id.ToString() == sectionId)
            .SelectMany(s => s.MenuItems)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(search))
        {
            allMenuItems = allMenuItems.Where(mi => 
                mi.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                (mi.Description != null && mi.Description.Contains(search, StringComparison.OrdinalIgnoreCase)));
        }

        if (available.HasValue)
        {
            allMenuItems = allMenuItems.Where(mi => mi.Available == available.Value);
        }

        // Apply pagination
        return allMenuItems
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();
    }

    public async Task<int> GetMenuItemsCountAsync(
        string restaurantId, 
        string? sectionId = null, 
        string? search = null, 
        bool? available = null, 
        CancellationToken ct = default)
    {
        var sections = await GetSectionsByRestaurantAsync(restaurantId, ct);
        
        var allMenuItems = sections
            .Where(s => sectionId == null || s.Id.ToString() == sectionId)
            .SelectMany(s => s.MenuItems)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(search))
        {
            allMenuItems = allMenuItems.Where(mi => 
                mi.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                (mi.Description != null && mi.Description.Contains(search, StringComparison.OrdinalIgnoreCase)));
        }

        if (available.HasValue)
        {
            allMenuItems = allMenuItems.Where(mi => mi.Available == available.Value);
        }

        return allMenuItems.Count();
    }
}
