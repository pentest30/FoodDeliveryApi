using Microsoft.AspNetCore.Mvc;
using FoodDeliveryApi.Api.Dtos;
using FoodDeliveryApi.Api.Models;
using FoodDeliveryApi.FoodDeliveryApi.Application.Services;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Storage;

namespace FoodDeliveryApi.Controllers;

[ApiController]
[Route("api/v1/sections")]
public class RestaurantSectionsController : ControllerBase
{
    private readonly RestaurantSectionService _sectionService;
    private readonly IRestaurantSectionImageService _imageService;

    public RestaurantSectionsController(RestaurantSectionService sectionService, IRestaurantSectionImageService imageService)
    {
        _sectionService = sectionService;
        _imageService = imageService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RestaurantSectionDto>>> GetSections(
        [FromQuery] string restaurantId, CancellationToken ct)
    {
        try
        {
            var sections = await _sectionService.GetSectionsByRestaurantAsync(restaurantId, ct);
            
            var models = sections.Select(s => new RestaurantSectionDto
            {
                Id = s.Id,
                RestaurantId = s.RestaurantId,
                Name = s.Name,
                Description = s.Description,
                SortOrder = s.SortOrder,
                Active = s.Active,
                Images = s.Images,
                MenuItems = s.MenuItems.Select(mi => new RestaurantMenuItemDto
                {
                    Id = mi.Id,
                    RestaurantSectionId = mi.RestaurantSectionId,
                    Name = mi.Name,
                    Description = mi.Description,
                    BasePrice = mi.BasePrice,
                    Quantity = mi.Quantity,
                    Available = mi.Available,
                    Images = mi.Images,
                    Allergens = mi.Allergens,
                    CreatedAt = mi.CreatedAt,
                    UpdatedAt = mi.UpdatedAt
                }).ToList(),
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            }).ToList();

            return Ok(models);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("{sectionId}")]
    public async Task<ActionResult<RestaurantSectionDto>> GetSection(
        Guid sectionId, CancellationToken ct)
    {
        try
        {
            var section = await _sectionService.GetSectionByIdAsync(sectionId, ct);
            if (section == null)
                return NotFound(new { message = $"Section with ID '{sectionId}' not found" });

            var model = new RestaurantSectionDto
            {
                Id = section.Id,
                RestaurantId = section.RestaurantId,
                Name = section.Name,
                Description = section.Description,
                SortOrder = section.SortOrder,
                Active = section.Active,
                Images = section.Images,
                MenuItems = section.MenuItems.Select(mi => new RestaurantMenuItemDto
                {
                    Id = mi.Id,
                    RestaurantSectionId = mi.RestaurantSectionId,
                    Name = mi.Name,
                    Description = mi.Description,
                    BasePrice = mi.BasePrice,
                    Quantity = mi.Quantity,
                    Available = mi.Available,
                    Images = mi.Images,
                    Allergens = mi.Allergens,
                    CreatedAt = mi.CreatedAt,
                    UpdatedAt = mi.UpdatedAt
                }).ToList(),
                CreatedAt = section.CreatedAt,
                UpdatedAt = section.UpdatedAt
            };

            return Ok(model);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult> CreateSection(
        [FromBody] CreateRestaurantSectionDto dto, CancellationToken ct)
    {
        try
        {
            if (!Guid.TryParse(dto.RestaurantId, out var restaurantGuid))
            {
                return BadRequest(new { message = "Invalid restaurant ID format" });
            }

            var section = await _sectionService.CreateSectionAsync(
                restaurantGuid,
                dto.Name,
                dto.Description,
                dto.SortOrder,
                dto.Active,
                null, // Images will be managed separately
                ct);

            return CreatedAtAction(
                nameof(GetSection), 
                new { sectionId = section.Id }, 
                new { id = section.Id });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return Problem(title: "Validation Error", statusCode: 400, detail: ex.Message);
        }
    }

    [HttpPut("{sectionId}")]
    public async Task<ActionResult> UpdateSection(
        Guid sectionId, [FromBody] UpdateRestaurantSectionDto dto, CancellationToken ct)
    {
        try
        {
            await _sectionService.UpdateSectionAsync(
                sectionId,
                dto.Name,
                dto.Description,
                dto.SortOrder,
                dto.Active,
                null, // Images will be managed separately
                ct);

            return Ok(new { id = sectionId });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return Problem(title: "Validation Error", statusCode: 400, detail: ex.Message);
        }
    }

    [HttpDelete("{sectionId}")]
    public async Task<ActionResult> DeleteSection(
        Guid sectionId, CancellationToken ct)
    {
        try
        {
            var deleted = await _sectionService.DeleteSectionAsync(sectionId, ct);
            if (!deleted)
                return NotFound(new { message = $"Section with ID '{sectionId}' not found" });

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("{sectionId}/menu-items")]
    public async Task<ActionResult> AddMenuItem(
        string restaurantId, Guid sectionId, [FromBody] CreateMenuItemDto dto, CancellationToken ct)
    {
        try
        {
            await _sectionService.AddMenuItemAsync(
                sectionId,
                dto.Name,
                dto.Description,
                dto.BasePrice,
                dto.Quantity,
                dto.Available,
                dto.Images,
                dto.Allergens,
                ct);

            return Ok();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return Problem(title: "Validation Error", statusCode: 400, detail: ex.Message);
        }
    }

    [HttpDelete("{sectionId}/menu-items/{menuItemId}")]
    public async Task<ActionResult> RemoveMenuItem(
        string restaurantId, Guid sectionId, Guid menuItemId, CancellationToken ct)
    {
        try
        {
            await _sectionService.RemoveMenuItemAsync(sectionId, menuItemId, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // Image Management Endpoints
    [HttpPost("{sectionId}/images")]
    public async Task<ActionResult<ImageUploadResult>> UploadSectionImage(
        string restaurantId, Guid sectionId, IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        // Validate image
        var isValid = await _imageService.ValidateImageAsync(file);
        if (!isValid)
            return BadRequest(new { message = "Invalid file type or size. Only JPEG, PNG, GIF, and WebP images up to 10MB are allowed" });

        try
        {
            var imageUrl = await _imageService.UploadSectionImageAsync(file.OpenReadStream(), file.FileName, file.ContentType, ct);

            // Add image to section
            var section = await _sectionService.GetSectionByIdAsync(sectionId, ct);
            if (section == null)
                return NotFound(new { message = $"Section with ID '{sectionId}' not found" });

            await _sectionService.UpdateSectionAsync(sectionId, section.Name, section.Description, section.SortOrder, section.Active, null, ct);
            await _sectionService.AddImageToSectionAsync(sectionId, imageUrl, ct);

            return Ok(new ImageUploadResult 
            { 
                Url = imageUrl, 
                FileName = file.FileName, 
                Size = file.Length, 
                ContentType = file.ContentType 
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error uploading image: {ex.Message}" });
        }
    }

    [HttpDelete("{sectionId}/images/{imageUrl}")]
    public async Task<IActionResult> DeleteSectionImage(
        string restaurantId, Guid sectionId, string imageUrl, CancellationToken ct)
    {
        try
        {
            // Remove image from section
            await _sectionService.RemoveImageFromSectionAsync(sectionId, imageUrl, ct);

            // Delete from storage
            await _imageService.DeleteSectionImageAsync(imageUrl, ct);

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error deleting image: {ex.Message}" });
        }
    }
}

public class CreateMenuItemDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal? BasePrice { get; set; }
    public int Quantity { get; set; } = 1;
    public bool Available { get; set; } = true;
    public List<string> Images { get; set; } = new();
    public List<string> Allergens { get; set; } = new();
}
