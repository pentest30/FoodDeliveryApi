using Finbuckle.MultiTenant;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Identity;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Serilog.Events;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Extensions;

public static class WebApplicationExtensions
{
    public static async Task<WebApplication> ConfigureApplicationAsync(this WebApplication app)
    {
        // Apply migrations and seed database (skip in test environment)
        var environment = app.Environment.EnvironmentName;
        if (!string.Equals(environment, "Testing", StringComparison.OrdinalIgnoreCase))
        {
            await app.SeedDatabasesAsync();
        }

        // Enable Swagger in all environments
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "Food Delivery API v1");
            options.RoutePrefix = "swagger";
        });

        app.UseCors();

        // Request logging
        app.UseSerilogRequestLogging(options =>
        {
            options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
            options.GetLevel = (httpContext, elapsed, ex) => LogEventLevel.Information;
        });

        // Global exception handler
        app.UseExceptionHandler(exceptionHandlerApp =>
        {
            exceptionHandlerApp.Run(async context =>
            {
                var exception = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()?.Error;
                if (exception != null)
                {
                    Log.Error(exception, "Unhandled exception occurred");
                    context.Response.StatusCode = 500;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(new
                    {
                        title = "Internal Server Error",
                        status = 500,
                        detail = "An unexpected error occurred"
                    }));
                }
            });
        });

        // Multi-tenant middleware (must come before routing)
        app.UseMultiTenant();

        // Authentication middleware
        app.UseAuthentication();
        app.UseAuthorization();

        app.UseRouting();

        // Add middleware to handle missing tenant context (after multi-tenant middleware)
        app.Use(async (context, next) =>
        {
            var tenantInfo = context.GetMultiTenantContext<Tenant>()?.TenantInfo;
            if (tenantInfo == null && 
                !context.Request.Path.StartsWithSegments("/swagger") &&
                !context.Request.Path.StartsWithSegments("/api/v1/auth/login"))
            {
                context.Response.StatusCode = 400;
                await context.Response.WriteAsync("Tenant context is required. Please provide X-Tenant-Id header.");
                return;
            }
            await next();
        });

        // Map controllers
        app.MapControllers();

        return app;
    }

    private static async Task SeedDatabasesAsync(this WebApplication app)
    {
        var seedAll = app.Configuration.GetValue<bool>("SeedAll");
        
        using (var scope = app.Services.CreateScope())
        {
            // Seed main database
            var db = scope.ServiceProvider.GetRequiredService<FoodAppContext>();
            
            // Ensure main database is created and apply migrations
            await db.Database.EnsureCreatedAsync();
            
            // Only run migrations for relational databases, not in-memory
            if (!db.Database.ProviderName?.Contains("InMemory") == true)
            {
                await db.Database.MigrateAsync();
            }
            
            if (seedAll)
            {
                // Seed tenants using domain Tenant entity
                await TenantSeeder.SeedAsync(db);
                
                // Seed main database
                var seedingFactory = scope.ServiceProvider.GetRequiredService<Func<SeedingContext>>();
                var seedingDb = seedingFactory();
                await DbSeeder.SeedAsync(seedingDb);
            }
        }

        // Seed Identity database
        if (seedAll)
        {
            using (var identityScope = app.Services.CreateScope())
            {
                var identityDb = identityScope.ServiceProvider.GetRequiredService<IdentityDbContext>();
                var userManager = identityScope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
                var roleManager = identityScope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
                
                // Ensure Identity database is created and apply migrations
                await identityDb.Database.EnsureCreatedAsync();
                
                // Only run migrations for relational databases, not in-memory
                if (!identityDb.Database.ProviderName?.Contains("InMemory") == true)
                {
                    await identityDb.Database.MigrateAsync();
                }
                
                // Seed Identity data
                await IdentitySeeder.SeedAsync(identityDb, userManager, roleManager);
            }
        }
    }
}
