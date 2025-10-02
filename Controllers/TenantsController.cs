using Microsoft.AspNetCore.Mvc;
using FoodDeliveryApi.Api.Models;
using FoodDeliveryApi.Api.Dtos;
using FluentValidation;
using FoodDeliveryApi.FoodDeliveryApi.Application.Services;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;

namespace FoodDeliveryApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class TenantsController : ControllerBase
{
    private readonly TenantService _tenantService;

    public TenantsController(TenantService tenantService)
    {
        _tenantService = tenantService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TenantDto>>> GetTenants(CancellationToken ct)
    {
        var tenants = await _tenantService.GetAllAsync(ct);
        return Ok(tenants.Select(t => new TenantDto
        {
            Id = t.Id,
            Identifier = t.Identifier,
            Name = t.Name,
            Url = t.Url,
            Email = t.Email,
            Mobile = t.Mobile,
            IsActive = t.IsActive,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt
        }).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TenantDto>> GetTenant(string id, CancellationToken ct)
    {
        var tenant = await _tenantService.GetByIdAsync(id, ct);
        if (tenant is null) return NotFound(new { message = $"Tenant with ID '{id}' not found" });

        return Ok(new TenantDto
        {
            Id = tenant.Id,
            Identifier = tenant.Identifier,
            Name = tenant.Name,
            Url = tenant.Url,
            Email = tenant.Email,
            Mobile = tenant.Mobile,
            IsActive = tenant.IsActive,
            CreatedAt = tenant.CreatedAt,
            UpdatedAt = tenant.UpdatedAt
        });
    }

    [HttpGet("identifier/{identifier}")]
    public async Task<ActionResult<TenantDto>> GetTenantByIdentifier(string identifier, CancellationToken ct)
    {
        var tenant = await _tenantService.GetByIdentifierAsync(identifier, ct);
        if (tenant is null) return NotFound(new { message = $"Tenant with identifier '{identifier}' not found" });

        return Ok(new TenantDto
        {
            Id = tenant.Id,
            Identifier = tenant.Identifier,
            Name = tenant.Name,
            Url = tenant.Url,
            Email = tenant.Email,
            Mobile = tenant.Mobile,
            IsActive = tenant.IsActive,
            CreatedAt = tenant.CreatedAt,
            UpdatedAt = tenant.UpdatedAt
        });
    }

    [HttpPost]
    public async Task<ActionResult<TenantDto>> CreateTenant(
        [FromBody] CreateTenantDto dto, 
        [FromServices] IValidator<CreateTenantDto> validator, 
        CancellationToken ct)
    {
        var validationResult = await validator.ValidateAsync(dto, ct);
        if (!validationResult.IsValid)
        {
            return Problem(
                title: "Validation Failed",
                statusCode: StatusCodes.Status400BadRequest,
                detail: "Validation failed",
                instance: HttpContext.Request.Path);
        }

        try
        {
            var entity = Tenant.Create(
                dto.Id ?? Guid.NewGuid().ToString(),
                dto.Identifier,
                dto.Name,
                dto.Url,
                dto.Email,
                dto.Mobile,
                dto.ConnectionString ?? string.Empty
            );

            entity = await _tenantService.CreateAsync(entity, ct);
            return Created($"/api/v1/tenants/{entity.Id}", new TenantDto
            {
                Id = entity.Id,
                Identifier = entity.Identifier,
                Name = entity.Name,
                Url = entity.Url,
                Email = entity.Email,
                Mobile = entity.Mobile,
                IsActive = entity.IsActive,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
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
    public async Task<ActionResult<TenantDto>> UpdateTenant(
        string id, 
        [FromBody] UpdateTenantDto dto, 
        [FromServices] IValidator<UpdateTenantDto> validator, 
        CancellationToken ct)
    {
        var validationResult = await validator.ValidateAsync(dto, ct);
        if (!validationResult.IsValid)
        {
            return Problem(
                title: "Validation Failed",
                statusCode: StatusCodes.Status400BadRequest,
                detail: "Validation failed",
                instance: HttpContext.Request.Path);
        }

        try
        {
            var tenant = await _tenantService.GetByIdAsync(id, ct);
            if (tenant == null)
                return NotFound();

            tenant.UpdateInfo(dto.Name, dto.Url, dto.Email, dto.Mobile);
            if (!string.IsNullOrEmpty(dto.ConnectionString))
            {
                tenant.ConnectionString = dto.ConnectionString;
            }
            tenant.SetActive(dto.IsActive);
            
            var updated = await _tenantService.UpdateAsync(tenant, ct);

            return Ok(new TenantDto
            {
                Id = updated.Id,
                Identifier = updated.Identifier,
                Name = updated.Name,
                Url = updated.Url,
                Email = updated.Email,
                Mobile = updated.Mobile,
                IsActive = updated.IsActive,
                CreatedAt = updated.CreatedAt,
                UpdatedAt = updated.UpdatedAt
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

    [HttpDelete("{identifier}")]
    public async Task<ActionResult> DeleteTenant(string identifier, CancellationToken ct)
    {
        var ok = await _tenantService.DeleteAsync(identifier, ct);
        return ok ? NoContent() : NotFound();
    }
}
