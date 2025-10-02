using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence;

public static class TenantSeeder
{
    public static async Task SeedAsync(FoodAppContext context)
    {
        // Check if tenants already exist
      
       
        var tenants = new List<Tenant>
        {
            Tenant.Create(
                "00000000-0000-0000-0000-000000000001",
                "root-tenant",
                "Root Tenant",
                "https://root-tenant.example.com",
                "admin@root-tenant.com",
                "+1234567890",
                "Server=localhost;Database=Centrex.Customers;User Id=sa;Password=Admin@2024+;TrustServerCertificate=True;"
            ),
            Tenant.Create(
                "tenant-restaurant1",
                "tenant-restaurant1",
                "Restaurant 1 Tenant",
                "https://restaurant1.example.com",
                "admin@restaurant1.com",
                "+1234567891",
                "Server=localhost;Database=Centrex.Customers;User Id=sa;Password=Admin@2024+;TrustServerCertificate=True;"
            ),
            Tenant.Create(
                "tenant-restaurant2",
                "tenant-restaurant2",
                "Restaurant 2 Tenant",
                "https://restaurant2.example.com",
                "admin@restaurant2.com",
                "+1234567892",
                "Server=localhost;Database=Centrex.Customers;User Id=sa;Password=Admin@2024+;TrustServerCertificate=True;"
            ),
            Tenant.Create(
                "0f4b50b3-7116-4222-b17a-41a0aa6edef3",
                "0f4b50b3-7116-4222-b17a-41a0aa6edef3",
                "Test Tenant",
                "https://test-tenant.example.com",
                "admin@test-tenant.com",
                "+1234567893",
                "Server=localhost;Database=Centrex.Customers;User Id=sa;Password=Admin@2024+;TrustServerCertificate=True;"
            )
        };

       // context.Tenants.AddRange(tenants);
        await context.SaveChangesAsync();
    }
}



