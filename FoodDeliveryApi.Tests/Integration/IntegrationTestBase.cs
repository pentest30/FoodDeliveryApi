using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Finbuckle.MultiTenant;
using Finbuckle.MultiTenant.Stores;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Users;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence;

namespace FoodDeliveryApi.Tests.Integration;

public class IntegrationTestBase : IClassFixture<WebApplicationFactory<Program>>, IDisposable
{
    public readonly WebApplicationFactory<Program> Factory;
    public readonly HttpClient Client;
    public readonly TestDbContext Context;
    public readonly string TestTenantId = "test-tenant-001";

    public IntegrationTestBase(WebApplicationFactory<Program> factory)
    {
            var testDbName = $"TestDb_{Guid.NewGuid()}";
            
            Factory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Remove the existing DbContext registration
                    var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<FoodAppContext>));
                    if (descriptor != null)
                        services.Remove(descriptor);

                    // Add test database context
                    services.AddDbContext<TestDbContext>(options =>
                    {
                        options.UseInMemoryDatabase(testDbName);
                        options.EnableSensitiveDataLogging();
                    });

                    // Configure multi-tenant services for testing (do this BEFORE registering FoodAppContext)
                    var tenantStoreDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IMultiTenantStore<AppTenantInfo>));
                    if (tenantStoreDescriptor != null)
                        services.Remove(tenantStoreDescriptor);
                        
                    var tenantContextDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IMultiTenantContextAccessor<AppTenantInfo>));
                    if (tenantContextDescriptor != null)
                        services.Remove(tenantContextDescriptor);

                    // Remove existing multi-tenant configuration
                    var multiTenantDescriptors = services.Where(d => d.ServiceType.Name.Contains("MultiTenant")).ToList();
                    foreach (var multiTenantDescriptor in multiTenantDescriptors)
                    {
                        services.Remove(multiTenantDescriptor);
                    }

                    // Add test-friendly multi-tenant services
                    services.AddMultiTenant<AppTenantInfo>()
                        .WithHeaderStrategy("X-Tenant-Id")
                        .WithInMemoryStore(options =>
                        {
                            options.Tenants.Add(new AppTenantInfo 
                            { 
                                Id = TestTenantId, 
                                Identifier = TestTenantId, 
                                Name = "Test Tenant",
                                ConnectionString = "DataSource=InMemoryDbForTesting"
                            });
                        });

                    // Now register FoodAppContext for the main application (after multi-tenant services are configured)
                    services.AddDbContext<FoodAppContext>(options =>
                    {
                        options.UseInMemoryDatabase(testDbName);
                        options.EnableSensitiveDataLogging();
                    });
                });

                builder.UseEnvironment("Testing");
            });

        Client = Factory.CreateClient();
        Context = Factory.Services.GetRequiredService<TestDbContext>();
        
        // Ensure database is created
        Context.Database.EnsureCreated();
        
        // Seed test data
        SeedTestData();
    }

    protected virtual void SeedTestData()
    {
        // Create test tenant
        var tenant = Tenant.Create(
            TestTenantId,
            "test-tenant",
            "Test Tenant",
            "https://test.example.com",
            "test@example.com",
            "+1234567890"
        );
        Context.Tenants.Add(tenant);

        // Create test categories
        var categories = new[]
        {
            Category.Create("cat-001", TestTenantId, "Pizza", "🍕", "#FF6B6B"),
            Category.Create("cat-002", TestTenantId, "Burger", "🍔", "#4ECDC4"),
            Category.Create("cat-003", TestTenantId, "Sushi", "🍣", "#45B7D1")
        };
        Context.Categories.AddRange(categories);

        // Create test restaurants
        var restaurants = new[]
        {
            Restaurant.Create(
                "rest-001", TestTenantId, "Pizza Palace", "New York", 25, 2.5m, "pizza@palace.com", "+1234567890", "🍕", "#FF6B6B", new List<string> { "https://example.com/pizza1.jpg" }
            ),
            Restaurant.Create(
                "rest-002", TestTenantId, "Burger King", "Los Angeles", 20, 1.8m, "burger@king.com", "+1987654321", "🍔", "#4ECDC4", new List<string> { "https://example.com/burger1.jpg" }
            )
        };
        Context.Restaurants.AddRange(restaurants);

        // Create test user
        var user = UserProfile.Create(
            "user-001", TestTenantId, "John Doe", "john@example.com", "+1234567890", new List<string> { "https://example.com/user1.jpg" }
        );
        Context.UserProfiles.Add(user);

        Context.SaveChanges();
    }

           protected void SetTenantHeader(string? tenantId = null)
           {
               Client.DefaultRequestHeaders.Remove("X-Tenant-Id");
               Client.DefaultRequestHeaders.Add("X-Tenant-Id", tenantId ?? TestTenantId);
           }

    protected async Task<T> DeserializeResponse<T>(HttpResponseMessage response)
    {
        var content = await response.Content.ReadAsStringAsync();
        return System.Text.Json.JsonSerializer.Deserialize<T>(content, new System.Text.Json.JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        })!;
    }

    public void Dispose()
    {
        Context?.Dispose();
        Client?.Dispose();
    }
}
