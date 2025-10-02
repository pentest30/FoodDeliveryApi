using System.Text.Json;
using Finbuckle.MultiTenant;
using FluentValidation;
using FluentValidation.Results;
using FoodDeliveryApi.Api.Validation;
using FoodDeliveryApi.FoodDeliveryApi.Application.Handlers;
using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Application.Services;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Common;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Events;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence.Repositories;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Minio;
using Serilog;
using Serilog.Events;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/food-delivery-api-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// Add Serilog
builder.Host.UseSerilog();

builder.Services.AddHttpContextAccessor();

// Register FoodAppContext FIRST (needed by CustomTenantStore)
builder.Services.AddDbContext<FoodAppContext>((serviceProvider, options) =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default"));
    
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});
builder.Services.AddDbContext<CustomTenantStore>((serviceProvider, options) =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default"));
    
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});
// Add a factory for seeding context without tenant enforcement
builder.Services.AddTransient<Func<SeedingContext>>(provider =>
{
    var options = new DbContextOptionsBuilder<SeedingContext>()
        .UseSqlServer(builder.Configuration.GetConnectionString("Default"))
        .Options;
    return () => new SeedingContext(options);
});

// Configure Finbuckle.MultiTenant - Register CustomTenantStore BEFORE AddMultiTenant
builder.Services.AddMultiTenant<Tenant>()
    .WithHeaderStrategy("X-Tenant-Id")
    .WithEFCoreStore<CustomTenantStore, Tenant>();
// Add controllers
builder.Services.AddControllers();


// MinIO configuration and services
builder.Services.Configure<MinioOptions>(builder.Configuration.GetSection("Minio"));
builder.Services.AddSingleton<IMinioClient>(sp =>
{
    var options = new MinioOptions();
    builder.Configuration.GetSection("Minio").Bind(options);
    return new MinioClient()
        .WithEndpoint(options.Endpoint)
        .WithCredentials(options.AccessKey, options.SecretKey)
        .WithSSL(options.UseSSL)
        .Build();
});
builder.Services.AddScoped<IImageService, MinioImageService>();

// Repository registration (EF Core only)
builder.Services.AddScoped<IRestaurantRepository, EfRestaurantRepository>();
builder.Services.AddScoped<ICategoryRepository, EfCategoryRepository>();
builder.Services.AddScoped<IOrderRepository, EfOrderRepository>();
builder.Services.AddScoped<IUserRepository, EfUserRepository>();

// Application Services
builder.Services.AddScoped<RestaurantService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<UserService>();

// Command Handlers
builder.Services.AddScoped<PlaceOrderCommandHandler>();
builder.Services.AddScoped<ConfirmOrderCommandHandler>();
builder.Services.AddScoped<MarkOrderReadyForPickupCommandHandler>();
builder.Services.AddScoped<CancelOrderCommandHandler>();
builder.Services.AddScoped<FailOrderCommandHandler>();

// Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Event Bus (InProcess implementation)
builder.Services.AddSingleton<IDomainEventBus>(new InProcessDomainEventBus(new List<object>()));

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "Food Delivery API",
        Version = "v1",
        Description = "Mock API for food delivery application with pagination support"
    });
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure JSON options
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNameCaseInsensitive = true;
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.WriteIndented = true;
});

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<CreateOrderDtoValidator>();

// Tenant service
builder.Services.AddScoped<TenantService>();

// Add memory caching
builder.Services.AddMemoryCache();

// Add distributed caching (Redis can be configured later)
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
});

var app = builder.Build();
// Apply migrations and seed database (skip in test environment)
var environment = builder.Environment.EnvironmentName;
if (!string.Equals(environment, "Testing", StringComparison.OrdinalIgnoreCase))
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<FoodAppContext>();
        var persistenceProvider = builder.Configuration.GetValue<string>("PersistenceProvider") ?? "EfCore";
        var seedAll = builder.Configuration.GetValue<bool>("SeedAll");
        
        if (string.Equals(persistenceProvider, "EfCore", StringComparison.OrdinalIgnoreCase))
        {
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
    }
}

// Enable multi-tenant middleware

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
app.UseRouting();

// Add middleware to handle missing tenant context (after multi-tenant middleware)
app.Use(async (context, next) =>
{
    var tenantInfo = context.GetMultiTenantContext<Tenant>()?.TenantInfo;
    if (tenantInfo == null && !context.Request.Path.StartsWithSegments("/swagger"))
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsync("Tenant context is required. Please provide X-Tenant-Id header.");
        return;
    }
    await next();
});

// Map controllers
app.MapControllers();

// API version root
var api = app.MapGroup("/api/v1");

// ProblemDetails factory
IResult ValidationProblem(List<ValidationFailure> failures) => Results.Problem(
    title: "Validation Failed",
    statusCode: StatusCodes.Status400BadRequest,
    extensions: new Dictionary<string, object?>
    {
        ["errors"] = failures
            .GroupBy(f => f.PropertyName)
            .ToDictionary(g => g.Key, g => g.Select(f => f.ErrorMessage).ToArray())
    }
);


// Removed legacy JSON helper methods; API now uses repositories for persistence

// Health check endpoint
app.MapGet("/health", () => new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    version = "1.0.0"
})
.WithName("HealthCheck")
.WithTags("System");
//.WithOpenApi();

// Root endpoint
app.MapGet("/", () => Results.Redirect("/swagger"))
.ExcludeFromDescription();

// Controllers are now in separate files

app.Run();

namespace FoodDeliveryApi
{
    public partial class Program { }
}
