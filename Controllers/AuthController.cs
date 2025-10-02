using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FoodDeliveryApi.Api.Dtos;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using FoodDeliveryApi.FoodDeliveryApi.Application.Services;
using Finbuckle.MultiTenant;

namespace FoodDeliveryApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthenticationService _authenticationService;

    public AuthController(IAuthenticationService authenticationService)
    {
        _authenticationService = authenticationService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _authenticationService.LoginAsync(model, string.Empty);

        if (!result.Success)
        {
            return Unauthorized(new { message = string.Join(", ", result.Errors) });
        }

        return Ok(new TokenResponseDto
        {
            AccessToken = result.AccessToken!,
            TokenType = "Bearer",
            ExpiresIn = result.ExpiresIn,
            RefreshToken = result.RefreshToken ?? string.Empty
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var tenantId = HttpContext.GetMultiTenantContext<Tenant>()?.TenantInfo?.Id;
        if (string.IsNullOrEmpty(tenantId))
        {
            return BadRequest("Tenant context is required.");
        }

        var result = await _authenticationService.RegisterAsync(model, tenantId);

        if (!result.Success)
        {
            return BadRequest(new { message = string.Join(", ", result.Errors) });
        }

        return CreatedAtAction(nameof(Register), result.User);
    }

    [HttpGet("userinfo")]
    [Authorize]
    public async Task<IActionResult> GetUserInfo()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var tenantId = User.FindFirst("tenant_id")?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var name = User.FindFirst(ClaimTypes.Name)?.Value;
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

        return Ok(new UserInfoDto
        {
            Id = userId,
            Email = email ?? string.Empty,
            FirstName = name?.Split(' ').FirstOrDefault() ?? string.Empty,
            LastName = name?.Split(' ').Skip(1).FirstOrDefault() ?? string.Empty,
            TenantId = tenantId ?? string.Empty,
            Roles = roles,
            CreatedAt = DateTime.UtcNow, // This would need to be retrieved from the database if needed
            LastLoginAt = DateTime.UtcNow // This would need to be retrieved from the database if needed
        });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            await _authenticationService.LogoutAsync(userId);
        }

        return Ok(new { message = "Logged out successfully" });
    }
}