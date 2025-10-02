using Microsoft.AspNetCore.Identity;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Identity;

public static class IdentitySeeder
{
    public static async Task SeedAsync(IdentityDbContext context, UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager)
    {
        // Create roles
        var roles = new[] { "Admin", "User", "Manager", "Customer" };
        
        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new ApplicationRole
                {
                    Name = roleName,
                    Description = $"{roleName} role for the application"
                });
            }
        }

        // Create a test admin user for the default tenant
        var defaultTenantId = "0f4b50b3-7116-4222-b17a-41a0aa6edef3";
        var adminEmail = "admin@fooddelivery.com";
        
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "Admin",
                LastName = "User",
                TenantId = defaultTenantId,
                EmailConfirmed = true,
                IsActive = true
            };

            var result = await userManager.CreateAsync(adminUser, "Admin@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }

        // Create a test customer user
        var customerEmail = "customer@fooddelivery.com";
        var customerUser = await userManager.FindByEmailAsync(customerEmail);
        if (customerUser == null)
        {
            customerUser = new ApplicationUser
            {
                UserName = customerEmail,
                Email = customerEmail,
                FirstName = "John",
                LastName = "Doe",
                TenantId = defaultTenantId,
                EmailConfirmed = true,
                IsActive = true
            };

            var result = await userManager.CreateAsync(customerUser, "Customer@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(customerUser, "Customer");
            }
        }
    }
}

