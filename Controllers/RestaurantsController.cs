using Microsoft.AspNetCore.Mvc;
using FoodDeliveryApi.Api.Models;
using FoodDeliveryApi.Api.Dtos;
using Finbuckle.MultiTenant;
using FoodDeliveryApi.FoodDeliveryApi.Application.Services;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Storage;

namespace FoodDeliveryApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class RestaurantsController : ControllerBase
{
    private readonly RestaurantService _restaurantService;
    private readonly IImageService _imageService;

    public RestaurantsController(RestaurantService restaurantService, IImageService imageService)
    {
        _restaurantService = restaurantService;
        _imageService = imageService;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResult<RestaurantDto>>> GetRestaurants(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? category = null,
        [FromQuery] bool? isOpenNow = null,
        [FromQuery] string? city = null,
        [FromQuery] double? minRating = null,
        [FromQuery] string? search = null,
        CancellationToken ct = default
    )
    {
        var (items, total) = await _restaurantService.SearchAsync(city, isOpenNow, category, search, page, pageSize, ct);
        var models = items.Select(r => new RestaurantDto
        {
            Id = r.Id.ToString(),
            Name = r.Name,
            Images = r.Images,
            Rating = (decimal)r.Rating,
            EtaMinutes = r.EtaMinutes,
            DistanceKm = (decimal)r.DistanceKm,
            Categories = r.RestaurantCategories.Select(rc => rc.Category.Name).ToList(),
            CategoryIds = r.RestaurantCategories.Select(rc => rc.Category.ExternalId).ToList(),
            City = r.City,
            Email = r.Email,
            Mobile = r.Mobile,
            IsOpenNow = r.IsOpenNow,
            Icon = r.Icon,
            PrimaryColor = r.PrimaryColor,
            Sections = new List<SectionDto>() // Simplified for now
        }).ToList();

        var result = new PaginatedResult<RestaurantDto>
        {
            Data = models,
            Page = page,
            PageSize = pageSize,
            TotalCount = total,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize),
            HasPreviousPage = page > 1,
            HasNextPage = page * pageSize < total
        };
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RestaurantDto>> GetRestaurantById(string id, CancellationToken ct)
    {
        var r = await _restaurantService.GetByIdAsync(id, ct);
        if (r is null) return NotFound(new { message = $"Restaurant with ID '{id}' not found" });
        
        var model = new RestaurantDto
        {
            Id = r.Id.ToString(),
            Name = r.Name,
            Images = r.Images,
            Rating = (decimal)r.Rating,
            EtaMinutes = r.EtaMinutes,
            DistanceKm = (decimal)r.DistanceKm,
            Categories = r.RestaurantCategories.Select(rc => rc.Category.Name).ToList(),
            CategoryIds = r.RestaurantCategories.Select(rc => rc.Category.ExternalId).ToList(),
            City = r.City,
            Email = r.Email,
            Mobile = r.Mobile,
            IsOpenNow = r.IsOpenNow,
            Icon = r.Icon,
            PrimaryColor = r.PrimaryColor,
            Sections = new List<SectionDto>() // Simplified for now
        };
        return Ok(model);
    }

    [HttpGet("{id}/sections")]
    public async Task<ActionResult<List<MenuSectionDto>>> GetRestaurantSections(string id, CancellationToken ct)
    {
        var sections = await _restaurantService.GetSectionsByRestaurantExternalIdAsync(id, ct);
        var models = sections.Select(s => new MenuSectionDto
        {
            Id = s.Name, // Use name as identifier for value objects
            Name = s.Name,
            Images = s.Images,
            Items = s.MenuItems.Select(i => new MenuItemDto
            {
                Id = i.Name, // Use name as identifier for value objects
                Name = i.Name,
                Description = i.Description ?? string.Empty,
                Price = i.BasePrice ?? 0m,
                ImageUrl = i.Images.FirstOrDefault() ?? string.Empty
            }).ToList()
        }).ToList();
        
        if (models.Count == 0) return NotFound(new { message = $"Restaurant with ID '{id}' not found" });
        return Ok(models);
    }

    [HttpPost]
    public async Task<ActionResult> CreateRestaurant([FromBody] UpsertRestaurantDto dto, CancellationToken ct)
    {
        try
        {
            var entity = Restaurant.Create(
                string.IsNullOrWhiteSpace(dto.ExternalId) ? Guid.NewGuid().ToString("N") : dto.ExternalId,
                dto.Name,
                dto.City,
                dto.EtaMinutes,
                dto.DistanceKm,
                dto.Email,
                dto.Mobile,
                dto.Icon,
                dto.PrimaryColor,
                dto.Images,
                categoryIds: dto.CategoryIds.Select(Guid.Parse).ToList()
            );
            
            entity = await _restaurantService.CreateAsync(entity, ct);
            
            return CreatedAtAction(nameof(GetRestaurantById), new { id = entity.ExternalId }, new { id = entity.ExternalId });
        }
        catch (ArgumentException ex)
        {
            return Problem(title: "Validation Error", statusCode: 400, detail: ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateRestaurant(string id, [FromBody] UpsertRestaurantDto dto, CancellationToken ct)
    {
        try
        {
            var updated = await _restaurantService.UpdateAsync(id, r =>
            {
                r.UpdateBasicInfo(dto.Name, dto.City, dto.EtaMinutes, dto.DistanceKm, dto.Email, dto.Mobile);
                r.UpdateAppearance(dto.Icon, dto.PrimaryColor);
                r.UpdateRating(dto.Rating);
                r.SetOpenStatus(dto.IsOpenNow);

                // Handle images
                if (dto.Images != null)
                {
                    foreach (var image in dto.Images)
                    {
                        r.AddImage(image);
                    }
                }

                // Handle categories - clear existing and add new ones
                if (dto.CategoryIds != null)
                {
                    r.RestaurantCategories.Clear();
                    // Note: We'll add categories after the update call since we need to fetch them first
                }
            }, ct);

            // Handle categories after the restaurant is updated
            if (dto.CategoryIds != null)
            {
                var categories = await _restaurantService.GetCategoriesByExternalIdsAsync(dto.CategoryIds, ct);
                updated = await _restaurantService.UpdateAsync(id, r =>
                {
                    foreach (var category in categories)
                    {
                        r.AddCategory(category.Id);
                    }
                }, ct);
            }
            
            return Ok(new { id = updated.ExternalId });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (ArgumentException ex)
        {
            return Problem(title: "Validation Error", statusCode: 400, detail: ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRestaurant(string id, CancellationToken ct)
    {
        var ok = await _restaurantService.DeleteAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }

    [HttpPost("{id}/images")]
    public async Task<ActionResult<ImageUploadResult>> UploadRestaurantImage(string id, IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType))
            return BadRequest(new { message = "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed" });

        if (file.Length > 5 * 1024 * 1024) // 5MB limit
            return BadRequest(new { message = "File size too large. Maximum 5MB allowed" });

        try
        {
            var imageUrl = await _imageService.UploadImageAsync(file.OpenReadStream(), file.FileName, file.ContentType, ct);

            // Add image to restaurant
            var restaurant = await _restaurantService.GetByExternalIdAsync(id, ct);
            if (restaurant == null)
                return NotFound(new { message = $"Restaurant with ID '{id}' not found" });

            await _restaurantService.UpdateAsync(id, r => r.AddImage(imageUrl), ct);

            return Ok(new ImageUploadResult { Url = imageUrl, FileName = file.FileName, Size = file.Length, ContentType = file.ContentType });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error uploading image: {ex.Message}" });
        }
    }

    [HttpDelete("{id}/images/{imageUrl}")]
    public async Task<IActionResult> DeleteRestaurantImage(string id, string imageUrl, CancellationToken ct)
    {
        try
        {
            var restaurant = await _restaurantService.GetByExternalIdAsync(id, ct);
            if (restaurant == null)
                return NotFound(new { message = $"Restaurant with ID '{id}' not found" });

            await _imageService.DeleteImageAsync(imageUrl, ct);
            await _restaurantService.UpdateAsync(id, r => r.RemoveImage(imageUrl), ct);

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error deleting image: {ex.Message}" });
        }
    }

    // Category Management Endpoints
    [HttpPost("{id}/categories")]
    public async Task<ActionResult> AddCategories(string id, [FromBody] List<string> categoryIds, CancellationToken ct)
    {
        try
        {
            var updated = await _restaurantService.AddCategoriesAsync(id, categoryIds, ct);
            return Ok(new { id = updated.ExternalId, message = "Categories added successfully" });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Restaurant with ID '{id}' not found" });
        }
        catch (ArgumentException ex)
        {
            return Problem(title: "Validation Error", statusCode: 400, detail: ex.Message);
        }
    }

    [HttpDelete("{id}/categories")]
    public async Task<ActionResult> RemoveCategories(string id, [FromBody] List<string> categoryIds, CancellationToken ct)
    {
        try
        {
            var updated = await _restaurantService.RemoveCategoriesAsync(id, categoryIds, ct);
            return Ok(new { id = updated.ExternalId, message = "Categories removed successfully" });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Restaurant with ID '{id}' not found" });
        }
        catch (ArgumentException ex)
        {
            return Problem(title: "Validation Error", statusCode: 400, detail: ex.Message);
        }
    }

    [HttpPut("{id}/categories")]
    public async Task<ActionResult> SetCategories(string id, [FromBody] List<string> categoryIds, CancellationToken ct)
    {
        try
        {
            var updated = await _restaurantService.SetCategoriesAsync(id, categoryIds, ct);
            return Ok(new { id = updated.ExternalId, message = "Categories updated successfully" });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Restaurant with ID '{id}' not found" });
        }
        catch (ArgumentException ex)
        {
            return Problem(title: "Validation Error", statusCode: 400, detail: ex.Message);
        }
    }

    // Note: Menu section image management endpoints removed due to missing service methods
    // These can be added back when the corresponding service methods are implemented
}