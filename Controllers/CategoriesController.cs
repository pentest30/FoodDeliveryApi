using Microsoft.AspNetCore.Mvc;
using FoodDeliveryApi.Api.Models;
using FoodDeliveryApi.Api.Dtos;
using Finbuckle.MultiTenant;
using FoodDeliveryApi.FoodDeliveryApi.Application.Services;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;

namespace FoodDeliveryApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly CategoryService _categoryService;

    public CategoriesController(CategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories(CancellationToken ct)
    {
        var categories = await _categoryService.GetAllAsync(ct);
        return Ok(categories.Select(c => new CategoryDto 
        { 
            Id = c.ExternalId, 
            Name = c.Name, 
            Icon = c.Icon, 
            Color = c.Color 
        }).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDto>> GetCategory(string id, CancellationToken ct)
    {
        var category = await _categoryService.GetByExternalIdAsync(id, ct);
        if (category is null) return NotFound();
        
        return Ok(new CategoryDto 
        { 
            Id = category.ExternalId, 
            Name = category.Name, 
            Icon = category.Icon, 
            Color = category.Color 
        });
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] UpsertCategoryDto dto, CancellationToken ct)
    {
        try
        {
            var tenantId = HttpContext.GetMultiTenantContext<Tenant>()?.TenantInfo?.Id 
                ?? throw new InvalidOperationException("Tenant context not found");
            
            var entity = Category.Create(
                string.IsNullOrWhiteSpace(dto.ExternalId) ? Guid.NewGuid().ToString("N") : dto.ExternalId,
                tenantId,
                dto.Name,
                dto.Icon,
                dto.Color
            );
            
            entity = await _categoryService.CreateAsync(entity, ct);
            
            return Created($"/api/v1/categories/{entity.ExternalId}", new CategoryDto 
            { 
                Id = entity.ExternalId, 
                Name = entity.Name, 
                Icon = entity.Icon, 
                Color = entity.Color 
            });
        }
        catch (ArgumentException ex)
        {
            return Problem(title: "Validation Error", statusCode: 400, detail: ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Problem(title: "Business Rule Violation", statusCode: 409, detail: ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CategoryDto>> UpdateCategory(string id, [FromBody] UpsertCategoryDto dto, CancellationToken ct)
    {
        try
        {
            var updated = await _categoryService.UpdateAsync(id, c => c.UpdateInfo(dto.Name, dto.Icon, dto.Color), ct);
            return Ok(new CategoryDto 
            { 
                Id = updated.ExternalId, 
                Name = updated.Name, 
                Icon = updated.Icon, 
                Color = updated.Color 
            });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (ArgumentException ex)
        {
            return Problem(title: "Validation Error", statusCode: 400, detail: ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Problem(title: "Business Rule Violation", statusCode: 409, detail: ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCategory(string id, CancellationToken ct)
    {
        var ok = await _categoryService.DeleteAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }
}
