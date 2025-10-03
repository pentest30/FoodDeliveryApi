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

namespace FoodDeliveryApi.Tests.Integration;

public class BasicAuthTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public BasicAuthTests(WebApplicationFactory<Program> factory)
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
