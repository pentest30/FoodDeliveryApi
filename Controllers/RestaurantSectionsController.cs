using Microsoft.AspNetCore.Mvc;
using FoodDeliveryApi.Api.Dtos;
using FoodDeliveryApi.Api.Models;
using FoodDeliveryApi.FoodDeliveryApi.Application.Services;
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

    [HttpGet("menu-items")]
    public async Task<ActionResult<PaginatedResult<RestaurantMenuItemDto>>> GetMenuItems(
        [FromQuery] string restaurantId,
        [FromQuery] string? sectionId = null,
        [FromQuery] string? search = null,
        [FromQuery] bool? available = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        try
        {
            var menuItems = await _sectionService.GetMenuItemsAsync(
                restaurantId, 
                sectionId, 
                search, 
                available, 
                page, 
                pageSize, 
                ct);

            var totalCount = await _sectionService.GetMenuItemsCountAsync(
                restaurantId, 
                sectionId, 
                search, 
                available, 
                ct);

            var menuItemDtos = menuItems.Select(mi => new RestaurantMenuItemDto
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
            }).ToList();

            var result = new PaginatedResult<RestaurantMenuItemDto>
            {
                Items = menuItemDtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                HasPreviousPage = page > 1,
                HasNextPage = page < (int)Math.Ceiling((double)totalCount / pageSize)
            };

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("menu-items/{menuItemId}")]
    public async Task<ActionResult<RestaurantMenuItemDto>> GetMenuItem(Guid menuItemId, CancellationToken ct)
    {
        try
        {
            var menuItem = await _sectionService.GetMenuItemByIdAsync(null, menuItemId, ct);
            
            var menuItemDto = new RestaurantMenuItemDto
            {
                Id = menuItem.Id,
                RestaurantSectionId = menuItem.RestaurantSectionId,
                Name = menuItem.Name,
                Description = menuItem.Description,
                BasePrice = menuItem.BasePrice,
                Quantity = menuItem.Quantity,
                Available = menuItem.Available,
                Images = menuItem.Images,
                Allergens = menuItem.Allergens,
                CreatedAt = menuItem.CreatedAt,
                UpdatedAt = menuItem.UpdatedAt,
                // Include variants if available
                Variants = menuItem.Variants?.Select(v => new MenuItemVariantDto
                {
                    Id = v.Id,
                    MenuItemId = v.MenuItemId,
                    Name = v.Name,
                    Description = v.Description,
                    Price = v.Price,
                    Currency = v.Currency,
                    SortOrder = v.SortOrder,
                    Active = v.Active,
                    Size = v.Size,
                    Unit = v.Unit,
                    Weight = v.Weight,
                    Dimensions = v.Dimensions,
                    SKU = v.SKU,
                    StockQuantity = v.StockQuantity,
                    AvailableUntil = v.AvailableUntil,
                    CreatedAt = v.CreatedAt
                }).ToList() ?? new List<MenuItemVariantDto>(),
                HasVariants = menuItem.Variants?.Any() ?? false,
                MinPrice = menuItem.GetMinVariantPrice(),
                MaxPrice = menuItem.GetMaxVariantPrice(),
                PriceRange = menuItem.GetPriceRange()
            };

            return Ok(menuItemDto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("{sectionId}/menu-items")]
    public async Task<ActionResult> AddMenuItem(Guid sectionId, [FromBody] CreateMenuItemDto dto, CancellationToken ct)
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
        [FromQuery] string restaurantId, Guid sectionId, Guid menuItemId, CancellationToken ct)
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

    // Menu Item Image Management Endpoints
    [HttpPost("{sectionId}/menu-items/{menuItemId}/images")]
    public async Task<ActionResult<ImageUploadResult>> UploadMenuItemImage(
        [FromQuery] string restaurantId, Guid sectionId, Guid menuItemId, IFormFile file, CancellationToken ct)
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

            // Add image to menu item
            await _sectionService.AddImageToMenuItemAsync(sectionId, menuItemId, imageUrl, ct);

            return Ok(new ImageUploadResult 
            { 
                Url = imageUrl, 
                FileName = file.FileName, 
                Size = file.Length, 
                ContentType = file.ContentType 
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error uploading image: {ex.Message}" });
        }
    }

    [HttpDelete("{sectionId}/menu-items/{menuItemId}/images")]
    public async Task<IActionResult> DeleteMenuItemImage(
        [FromQuery] string restaurantId, Guid sectionId, Guid menuItemId, [FromBody] DeleteImageRequest request, CancellationToken ct)
    {
        try
        {
            // Remove image from menu item
            await _sectionService.RemoveImageFromMenuItemAsync(sectionId, menuItemId, request.ImageUrl, ct);

            // Delete from storage
            await _imageService.DeleteSectionImageAsync(request.ImageUrl, ct);

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

    // Menu Item Variant Management Endpoints
    [HttpGet("menu-items/{menuItemId}/variants")]
    public async Task<ActionResult<List<MenuItemVariantDto>>> GetMenuItemVariants(
        [FromQuery] string restaurantId, Guid menuItemId, CancellationToken ct)
    {
        try
        {
            // Find the menu item first to get its section
            var menuItem = await _sectionService.GetMenuItemByIdAsync(null, menuItemId, ct);
            var sectionId = menuItem.RestaurantSectionId;
            
            var variants = await _sectionService.GetMenuItemVariantsAsync(sectionId, menuItemId, ct);
            
            var variantDtos = variants.Select(v => new MenuItemVariantDto
            {
                Id = v.Id,
                MenuItemId = v.MenuItemId,
                Name = v.Name,
                Description = v.Description,
                Price = v.Price,
                Currency = v.Currency,
                SortOrder = v.SortOrder,
                Active = v.Active,
                Size = v.Size,
                Unit = v.Unit,
                Weight = v.Weight,
                Dimensions = v.Dimensions,
                SKU = v.SKU,
                StockQuantity = v.StockQuantity,
                AvailableUntil = v.AvailableUntil,
                CreatedAt = v.CreatedAt
            }).ToList();

            return Ok(variantDtos);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error fetching variants: {ex.Message}" });
        }
    }

    [HttpPost("menu-items/{menuItemId}/variants")]
    public async Task<ActionResult<MenuItemVariantDto>> AddMenuItemVariant(
        [FromQuery] string restaurantId, Guid menuItemId, [FromBody] CreateMenuItemVariantDto dto, CancellationToken ct)
    {
        try
        {
            // Find the menu item first to get its section
            var menuItem = await _sectionService.GetMenuItemByIdAsync(null, menuItemId, ct);
            var sectionId = menuItem.RestaurantSectionId;
            
            var variant = await _sectionService.AddMenuItemVariantAsync(
                sectionId, menuItemId, dto.Name, dto.Price, dto.Currency, dto.SortOrder,
                dto.Description, dto.Size, dto.Unit, dto.Weight, dto.Dimensions,
                dto.SKU, dto.StockQuantity, dto.AvailableUntil, ct);

            var variantDto = new MenuItemVariantDto
            {
                Id = variant.Id,
                MenuItemId = variant.MenuItemId,
                Name = variant.Name,
                Description = variant.Description,
                Price = variant.Price,
                Currency = variant.Currency,
                SortOrder = variant.SortOrder,
                Active = variant.Active,
                Size = variant.Size,
                Unit = variant.Unit,
                Weight = variant.Weight,
                Dimensions = variant.Dimensions,
                SKU = variant.SKU,
                StockQuantity = variant.StockQuantity,
                AvailableUntil = variant.AvailableUntil,
                CreatedAt = variant.CreatedAt
            };

            return Ok(variantDto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error adding variant: {ex.Message}" });
        }
    }

    [HttpPost("{sectionId}/menu-items/{menuItemId}/variants")]
    public async Task<ActionResult<MenuItemVariantDto>> AddMenuItemVariantWithSection(
        [FromQuery] string restaurantId, Guid sectionId, Guid menuItemId, [FromBody] CreateMenuItemVariantDto dto, CancellationToken ct)
    {
        try
        {
            var variant = await _sectionService.AddMenuItemVariantAsync(
                sectionId, menuItemId, dto.Name, dto.Price, dto.Currency, dto.SortOrder,
                dto.Description, dto.Size, dto.Unit, dto.Weight, dto.Dimensions,
                dto.SKU, dto.StockQuantity, dto.AvailableUntil, ct);

            var variantDto = new MenuItemVariantDto
            {
                Id = variant.Id,
                MenuItemId = variant.MenuItemId,
                Name = variant.Name,
                Description = variant.Description,
                Price = variant.Price,
                Currency = variant.Currency,
                SortOrder = variant.SortOrder,
                Active = variant.Active,
                Size = variant.Size,
                Unit = variant.Unit,
                Weight = variant.Weight,
                Dimensions = variant.Dimensions,
                SKU = variant.SKU,
                StockQuantity = variant.StockQuantity,
                AvailableUntil = variant.AvailableUntil,
                CreatedAt = variant.CreatedAt
            };

            return Ok(variantDto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error adding variant: {ex.Message}" });
        }
    }

    [HttpPut("menu-items/{menuItemId}/variants/{variantId}")]
    public async Task<ActionResult<MenuItemVariantDto>> UpdateMenuItemVariant(
        [FromQuery] string restaurantId, Guid menuItemId, Guid variantId, [FromBody] UpdateMenuItemVariantDto dto, CancellationToken ct)
    {
        try
        {
            // Find the menu item first to get its section
            var menuItem = await _sectionService.GetMenuItemByIdAsync(null, menuItemId, ct);
            var sectionId = menuItem.RestaurantSectionId;
            
            var variant = await _sectionService.UpdateMenuItemVariantAsync(
                sectionId, menuItemId, variantId, dto.Name, dto.Price, dto.Description,
                dto.Size, dto.Unit, dto.Weight, dto.Dimensions, dto.SKU, 
                dto.StockQuantity, dto.AvailableUntil, dto.Active, ct);

            var variantDto = new MenuItemVariantDto
            {
                Id = variant.Id,
                MenuItemId = variant.MenuItemId,
                Name = variant.Name,
                Description = variant.Description,
                Price = variant.Price,
                Currency = variant.Currency,
                SortOrder = variant.SortOrder,
                Active = variant.Active,
                Size = variant.Size,
                Unit = variant.Unit,
                Weight = variant.Weight,
                Dimensions = variant.Dimensions,
                SKU = variant.SKU,
                StockQuantity = variant.StockQuantity,
                AvailableUntil = variant.AvailableUntil,
                CreatedAt = variant.CreatedAt
            };

            return Ok(variantDto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error updating variant: {ex.Message}" });
        }
    }

    [HttpPut("{sectionId}/menu-items/{menuItemId}/variants/{variantId}")]
    public async Task<ActionResult<MenuItemVariantDto>> UpdateMenuItemVariantWithSection(
        [FromQuery] string restaurantId, Guid sectionId, Guid menuItemId, Guid variantId, [FromBody] UpdateMenuItemVariantDto dto, CancellationToken ct)
    {
        try
        {
            var variant = await _sectionService.UpdateMenuItemVariantAsync(
                sectionId, menuItemId, variantId, dto.Name, dto.Price, dto.Description,
                dto.Size, dto.Unit, dto.Weight, dto.Dimensions, dto.SKU,
                dto.StockQuantity, dto.AvailableUntil, dto.Active, ct);

            var variantDto = new MenuItemVariantDto
            {
                Id = variant.Id,
                MenuItemId = variant.MenuItemId,
                Name = variant.Name,
                Description = variant.Description,
                Price = variant.Price,
                Currency = variant.Currency,
                SortOrder = variant.SortOrder,
                Active = variant.Active,
                Size = variant.Size,
                Unit = variant.Unit,
                Weight = variant.Weight,
                Dimensions = variant.Dimensions,
                SKU = variant.SKU,
                StockQuantity = variant.StockQuantity,
                AvailableUntil = variant.AvailableUntil,
                CreatedAt = variant.CreatedAt
            };

            return Ok(variantDto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error updating variant: {ex.Message}" });
        }
    }

    [HttpDelete("menu-items/{menuItemId}/variants/{variantId}")]
    public async Task<IActionResult> DeleteMenuItemVariant(
        [FromQuery] string restaurantId, Guid menuItemId, Guid variantId, CancellationToken ct)
    {
        try
        {
            // Find the menu item first to get its section
            var menuItem = await _sectionService.GetMenuItemByIdAsync(null, menuItemId, ct);
            var sectionId = menuItem.RestaurantSectionId;
            
            await _sectionService.RemoveMenuItemVariantAsync(sectionId, menuItemId, variantId, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error deleting variant: {ex.Message}" });
        }
    }

    [HttpDelete("{sectionId}/menu-items/{menuItemId}/variants/{variantId}")]
    public async Task<IActionResult> DeleteMenuItemVariantWithSection(
        [FromQuery] string restaurantId, Guid sectionId, Guid menuItemId, Guid variantId, CancellationToken ct)
    {
        try
        {
            await _sectionService.RemoveMenuItemVariantAsync(sectionId, menuItemId, variantId, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error deleting variant: {ex.Message}" });
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

    public class DeleteImageRequest
    {
        public string ImageUrl { get; set; } = string.Empty;
    }


public class CreateMenuItemVariantDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "DZD";
    public int SortOrder { get; set; } = 0;
    public string Size { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal? Weight { get; set; }
    public string Dimensions { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int? StockQuantity { get; set; }
    public DateTime? AvailableUntil { get; set; }
}

public class UpdateMenuItemVariantDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Size { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal? Weight { get; set; }
    public string Dimensions { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int? StockQuantity { get; set; }
    public DateTime? AvailableUntil { get; set; }
    public bool Active { get; set; } = true;
}
