using Microsoft.AspNetCore.Mvc;
using FoodDeliveryApi.Api.Models;
using FoodDeliveryApi.Api.Dtos;
using FluentValidation;
using Finbuckle.MultiTenant;
using FoodDeliveryApi.FoodDeliveryApi.Application.Services;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Users;
using FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Storage;

namespace FoodDeliveryApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;
    private readonly IImageService _imageService;

    public UsersController(UserService userService, IImageService imageService)
    {
        _userService = userService;
        _imageService = imageService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(string id, CancellationToken ct)
    {
        var user = await _userService.GetByExternalIdAsync(id, ct);
        if (user is null) return NotFound(new { message = $"User with ID '{id}' not found" });

        var model = new UserDto
        {
            Id = user.ExternalId,
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
            Avatar = user.ProfileImages.FirstOrDefault() ?? string.Empty,
            Addresses = user.Addresses.Select(a => new AddressDto
            {
                Street = a.Street,
                City = a.City,
                State = a.State,
                Zip = a.Zip,
                Latitude = a.Latitude,
                Longitude = a.Longitude
            }).ToList(),
            CreatedAt = user.CreatedAt.DateTime,
            UpdatedAt = user.UpdatedAt?.DateTime ?? default
        };

        return Ok(model);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto dto, CancellationToken ct)
    {
        try
        {
            var tenantId = HttpContext.GetMultiTenantContext<Tenant>()?.TenantInfo?.Id 
                ?? throw new InvalidOperationException("Tenant context not found");
            
            var user = UserProfile.Create(
                string.IsNullOrWhiteSpace(dto.ExternalId) ? Guid.NewGuid().ToString("N") : dto.ExternalId,
                tenantId,
                dto.Name,
                dto.Email,
                dto.Phone,
                dto.ProfileImages
            );
            
            user = await _userService.CreateAsync(user, ct);
            
            return Created($"/api/v1/users/{user.ExternalId}", new UserDto
            {
                Id = user.ExternalId,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Avatar = user.ProfileImages.FirstOrDefault() ?? string.Empty,
                Addresses = user.Addresses.Select(a => new AddressDto
                {
                    Street = a.Street,
                    City = a.City,
                    State = a.State,
                    Zip = a.Zip,
                    Latitude = a.Latitude,
                    Longitude = a.Longitude
                }).ToList(),
                CreatedAt = user.CreatedAt.DateTime,
                UpdatedAt = user.UpdatedAt?.DateTime ?? default
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
    public async Task<ActionResult<UserDto>> UpdateUser(string id, [FromBody] UpdateUserDto dto, CancellationToken ct)
    {
        try
        {
            var updated = await _userService.UpdateAsync(id, u =>
            {
                u.UpdateBasicInfo(dto.Name, dto.Email, dto.Phone);
                
                // Handle profile images
                if (dto.ProfileImages != null)
                {
                    foreach (var image in dto.ProfileImages)
                    {
                        u.AddProfileImage(image);
                    }
                }
                
                // Handle addresses
                if (dto.Addresses != null)
                {
                    foreach (var addressDto in dto.Addresses)
                    {
                        var address = new Address(
                            addressDto.Street,
                            addressDto.City,
                            addressDto.State,
                            addressDto.Zip,
                            addressDto.Latitude,
                            addressDto.Longitude
                        );
                        u.AddAddress(address);
                    }
                }
            }, ct);

            return Ok(new UserDto
            {
                Id = updated.ExternalId,
                Name = updated.Name,
                Email = updated.Email,
                Phone = updated.Phone,
                Avatar = updated.ProfileImages.FirstOrDefault() ?? string.Empty,
                Addresses = updated.Addresses.Select(a => new AddressDto
                {
                    Street = a.Street,
                    City = a.City,
                    State = a.State,
                    Zip = a.Zip,
                    Latitude = a.Latitude,
                    Longitude = a.Longitude
                }).ToList(),
                CreatedAt = updated.CreatedAt.DateTime,
                UpdatedAt = updated.UpdatedAt?.DateTime ?? default
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
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id, CancellationToken ct)
    {
        var ok = await _userService.DeleteAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }

    [HttpPost("{id}/images")]
    public async Task<ActionResult<ImageUploadResult>> UploadUserImage(string id, IFormFile file, CancellationToken ct)
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

            var user = await _userService.GetByExternalIdAsync(id, ct);
            if (user == null)
                return NotFound(new { message = $"User with ID '{id}' not found" });

            await _userService.UpdateAsync(id, u => u.AddProfileImage(imageUrl), ct);

            return Ok(new ImageUploadResult { Url = imageUrl, FileName = file.FileName, Size = file.Length, ContentType = file.ContentType });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error uploading image: {ex.Message}" });
        }
    }

    [HttpDelete("{id}/images/{imageUrl}")]
    public async Task<IActionResult> DeleteUserImage(string id, string imageUrl, CancellationToken ct)
    {
        try
        {
            var user = await _userService.GetByExternalIdAsync(id, ct);
            if (user == null)
                return NotFound(new { message = $"User with ID '{id}' not found" });

            await _imageService.DeleteImageAsync(imageUrl, ct);
            await _userService.UpdateAsync(id, u => u.RemoveProfileImage(imageUrl), ct);

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error deleting image: {ex.Message}" });
        }
    }

    [HttpGet("{id}/addresses")]
    public async Task<ActionResult<List<AddressDto>>> GetUserAddresses(string id, CancellationToken ct)
    {
        var user = await _userService.GetByExternalIdAsync(id, ct);
        if (user is null) return NotFound();

        return Ok(user.Addresses.Select(a => new AddressDto
        {
            Street = a.Street,
            City = a.City,
            State = a.State,
            Zip = a.Zip,
            Latitude = a.Latitude,
            Longitude = a.Longitude
        }).ToList());
    }
}