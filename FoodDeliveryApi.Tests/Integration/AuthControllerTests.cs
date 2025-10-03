using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using FoodDeliveryApi.Api.Dtos;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Identity;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace FoodDeliveryApi.Tests.Integration;

public class AuthControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AuthControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove the existing DbContext registrations
                var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<FoodAppContext>));
                if (descriptor != null) services.Remove(descriptor);

                var identityDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<IdentityDbContext>));
                if (identityDescriptor != null) services.Remove(identityDescriptor);

                // Add in-memory databases
                services.AddDbContext<FoodAppContext>(options =>
                {
                    options.UseInMemoryDatabase("TestFoodAppDb");
                });

                services.AddDbContext<IdentityDbContext>(options =>
                {
                    options.UseInMemoryDatabase("TestIdentityDb");
                });

                // Remove multi-tenant configuration for tests
                // Note: Multi-tenant services will be handled by the application configuration
            });
        });

        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken()
    {
        // Arrange
        await SeedTestDataAsync();
        var loginDto = new LoginDto
        {
            Email = "test@example.com",
            Password = "TestPassword123!"
        };

        var json = JsonSerializer.Serialize(loginDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/v1/auth/login", content);

        // Assert
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        var tokenResponse = JsonSerializer.Deserialize<TokenResponseDto>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(tokenResponse);
        Assert.NotEmpty(tokenResponse.AccessToken);
        Assert.Equal("Bearer", tokenResponse.TokenType);
        Assert.True(tokenResponse.ExpiresIn > 0);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        await SeedTestDataAsync();
        var loginDto = new LoginDto
        {
            Email = "test@example.com",
            Password = "WrongPassword"
        };

        var json = JsonSerializer.Serialize(loginDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/v1/auth/login", content);

        // Assert
        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithNonExistentUser_ReturnsUnauthorized()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Email = "nonexistent@example.com",
            Password = "TestPassword123!"
        };

        var json = JsonSerializer.Serialize(loginDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/v1/auth/login", content);

        // Assert
        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsUser()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Email = "newuser@example.com",
            Password = "NewPassword123!",
            ConfirmPassword = "NewPassword123!",
            FirstName = "New",
            LastName = "User",
            TenantId = "test-tenant"
        };

        var json = JsonSerializer.Serialize(registerDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/v1/auth/register", content);

        // Assert
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        var userResponse = JsonSerializer.Deserialize<UserResponseDto>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(userResponse);
        Assert.Equal(registerDto.Email, userResponse.Email);
        Assert.Equal(registerDto.FirstName, userResponse.FirstName);
        Assert.Equal(registerDto.LastName, userResponse.LastName);
        Assert.Equal(registerDto.TenantId, userResponse.TenantId);
    }

    [Fact]
    public async Task Register_WithExistingEmail_ReturnsBadRequest()
    {
        // Arrange
        await SeedTestDataAsync();
        var registerDto = new RegisterDto
        {
            Email = "test@example.com", // Already exists
            Password = "NewPassword123!",
            ConfirmPassword = "NewPassword123!",
            FirstName = "Test",
            LastName = "User",
            TenantId = "test-tenant"
        };

        var json = JsonSerializer.Serialize(registerDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/v1/auth/register", content);

        // Assert
        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_WithMismatchedPasswords_ReturnsBadRequest()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Email = "newuser@example.com",
            Password = "NewPassword123!",
            ConfirmPassword = "DifferentPassword123!",
            FirstName = "New",
            LastName = "User",
            TenantId = "test-tenant"
        };

        var json = JsonSerializer.Serialize(registerDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/v1/auth/register", content);

        // Assert
        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetUserInfo_WithValidToken_ReturnsUserInfo()
    {
        // Arrange
        await SeedTestDataAsync();
        var loginDto = new LoginDto
        {
            Email = "test@example.com",
            Password = "TestPassword123!"
        };

        var json = JsonSerializer.Serialize(loginDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var loginResponse = await _client.PostAsync("/api/v1/auth/login", content);
        loginResponse.EnsureSuccessStatusCode();
        
        var loginContent = await loginResponse.Content.ReadAsStringAsync();
        var tokenResponse = JsonSerializer.Deserialize<TokenResponseDto>(loginContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenResponse.AccessToken);

        // Act
        var response = await _client.GetAsync("/api/v1/auth/userinfo");

        // Assert
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        var userInfo = JsonSerializer.Deserialize<UserInfoDto>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(userInfo);
        Assert.Equal(loginDto.Email, userInfo.Email);
        Assert.NotEmpty(userInfo.Roles);
    }

    [Fact]
    public async Task GetUserInfo_WithoutToken_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/auth/userinfo");

        // Assert
        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logout_WithValidToken_ReturnsOk()
    {
        // Arrange
        await SeedTestDataAsync();
        var loginDto = new LoginDto
        {
            Email = "test@example.com",
            Password = "TestPassword123!"
        };

        var json = JsonSerializer.Serialize(loginDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var loginResponse = await _client.PostAsync("/api/v1/auth/login", content);
        loginResponse.EnsureSuccessStatusCode();
        
        var loginContent = await loginResponse.Content.ReadAsStringAsync();
        var tokenResponse = JsonSerializer.Deserialize<TokenResponseDto>(loginContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenResponse.AccessToken);

        // Act
        var response = await _client.PostAsync("/api/v1/auth/logout", null);

        // Assert
        response.EnsureSuccessStatusCode();
    }

    private async Task SeedTestDataAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();

        // Create test role
        if (!await roleManager.RoleExistsAsync("User"))
        {
            await roleManager.CreateAsync(new ApplicationRole 
            { 
                Name = "User", 
                Description = "Standard user role",
                CreatedAt = DateTime.UtcNow 
            });
        }

        // Create test user
        var testUser = new ApplicationUser
        {
            UserName = "test@example.com",
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            TenantId = "test-tenant",
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var existingUser = await userManager.FindByEmailAsync("test@example.com");
        if (existingUser == null)
        {
            var result = await userManager.CreateAsync(testUser, "TestPassword123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(testUser, "User");
            }
        }
    }
}
