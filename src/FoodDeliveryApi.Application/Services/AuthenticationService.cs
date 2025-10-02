using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Identity;
using FoodDeliveryApi.Api.Dtos;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using Finbuckle.MultiTenant;

namespace FoodDeliveryApi.FoodDeliveryApi.Application.Services;

public interface IAuthenticationService
{
    Task<AuthenticationResult> LoginAsync(LoginDto loginDto, string tenantId);
    Task<AuthenticationResult> RegisterAsync(RegisterDto registerDto, string tenantId);
    Task<bool> LogoutAsync(string userId);
}

public class AuthenticationResult
{
    public bool Success { get; set; }
    public string? AccessToken { get; set; }
    public string TokenType { get; set; } = "Bearer";
    public string? RefreshToken { get; set; }
    public int ExpiresIn { get; set; }
    public UserResponseDto? User { get; set; }
    public List<string> Errors { get; set; } = new();
}

public class AuthenticationService : IAuthenticationService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;

    public AuthenticationService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
    }

    public async Task<AuthenticationResult> LoginAsync(LoginDto loginDto, string tenantId)
    {
        var result = new AuthenticationResult();

        try
        {
            // Find user by email only
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null)
            {
                result.Errors.Add("Invalid login attempt.");
                return result;
            }

            // Check if user is active
            if (!user.IsActive)
            {
                result.Errors.Add("User account is deactivated.");
                return result;
            }

            // Verify password
            var signInResult = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, lockoutOnFailure: false);
            if (!signInResult.Succeeded)
            {
                result.Errors.Add("Invalid login attempt.");
                return result;
            }

            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            // Create claims
            var claims = await CreateUserClaimsAsync(user);

            // Generate JWT token
            var token = GenerateJwtToken(user, claims);

            result.Success = true;
            result.AccessToken = token;
            result.TokenType = "Bearer";
            result.ExpiresIn = 3600; // 1 hour
            result.RefreshToken = string.Empty; // Not implemented for simplicity
            result.User = new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName!,
                LastName = user.LastName!,
                TenantId = user.TenantId,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            };

            return result;
        }
        catch (Exception ex)
        {
            result.Errors.Add($"An error occurred during login: {ex.Message}");
            return result;
        }
    }

    public async Task<AuthenticationResult> RegisterAsync(RegisterDto registerDto, string tenantId)
    {
        var result = new AuthenticationResult();

        try
        {
            // Validate tenant context
            if (registerDto.TenantId != tenantId)
            {
                result.Errors.Add("Provided TenantId does not match the current tenant context.");
                return result;
            }

            // Check if user already exists
            var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
            if (existingUser != null)
            {
                result.Errors.Add("User with this email already exists.");
                return result;
            }

            // Create new user
            var user = new ApplicationUser
            {
                UserName = registerDto.Email,
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                TenantId = registerDto.TenantId,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var createResult = await _userManager.CreateAsync(user, registerDto.Password);
            if (!createResult.Succeeded)
            {
                result.Errors.AddRange(createResult.Errors.Select(e => e.Description));
                return result;
            }

            // Assign default role
            await _userManager.AddToRoleAsync(user, "User");

            result.Success = true;
            result.User = new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName!,
                LastName = user.LastName!,
                TenantId = user.TenantId,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            };

            return result;
        }
        catch (Exception ex)
        {
            result.Errors.Add($"An error occurred during registration: {ex.Message}");
            return result;
        }
    }

    public async Task<bool> LogoutAsync(string userId)
    {
        try
        {
            await _signInManager.SignOutAsync();
            return true;
        }
        catch
        {
            return false;
        }
    }

    private async Task<List<Claim>> CreateUserClaimsAsync(ApplicationUser user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, $"{user.FirstName} {user.LastName}".Trim()),
            new("tenant_id", user.TenantId),
            new("user_id", user.Id)
        };

        // Add role claims
        var roles = await _userManager.GetRolesAsync(user);
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        return claims;
    }

    private string GenerateJwtToken(ApplicationUser user, List<Claim> claims)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "YourSecretKeyThatIsAtLeast32CharactersLong!"));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "FoodDeliveryApi",
            audience: _configuration["Jwt:Audience"] ?? "FoodDeliveryApi",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
