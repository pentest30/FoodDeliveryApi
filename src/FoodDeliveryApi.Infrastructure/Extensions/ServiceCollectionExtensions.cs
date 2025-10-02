using System.Text;
using FluentValidation;
using FoodDeliveryApi.Api.Validation;
using FoodDeliveryApi.FoodDeliveryApi.Application.Handlers;
using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Application.Services;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Common;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Events;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Identity;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence.Repositories;
using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Storage;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Minio;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        // Add DbContexts
        services.AddDbContexts(configuration, environment);
        
        // Add Multi-tenant configuration
        services.AddMultiTenantConfiguration();
        
        // Add Identity and Authentication
        services.AddIdentityAndAuthentication(configuration);
        
        // Add Application Services
        services.AddApplicationServices();
        
        // Add Infrastructure Services
        services.AddInfrastructureServices();
        
        // Add External Services
        services.AddExternalServices(configuration);
        
        return services;
    }

    private static IServiceCollection AddDbContexts(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        // Register FoodAppContext FIRST (needed by CustomTenantStore)
        services.AddDbContext<FoodAppContext>((serviceProvider, options) =>
        {
            options.UseSqlServer(configuration.GetConnectionString("Default"));
            
            if (environment.IsDevelopment())
            {
                options.EnableSensitiveDataLogging();
                options.EnableDetailedErrors();
            }
        });

        // Register CustomTenantStore with database provider
        services.AddDbContext<CustomTenantStore>((serviceProvider, options) =>
        {
            options.UseSqlServer(configuration.GetConnectionString("Default"));
            
            if (environment.IsDevelopment())
            {
                options.EnableSensitiveDataLogging();
                options.EnableDetailedErrors();
            }
        });

        // Add Identity DbContext (separate from FoodDbContext)
        services.AddDbContext<IdentityDbContext>(options =>
        {
            options.UseSqlServer(configuration.GetConnectionString("Identity"));
            
            if (environment.IsDevelopment())
            {
                options.EnableSensitiveDataLogging();
                options.EnableDetailedErrors();
            }
        });

        // Add a factory for seeding context without tenant enforcement
        services.AddTransient<Func<SeedingContext>>(provider =>
        {
            var options = new DbContextOptionsBuilder<SeedingContext>()
                .UseSqlServer(configuration.GetConnectionString("Default"))
                .Options;
            return () => new SeedingContext(options);
        });

        return services;
    }

    private static IServiceCollection AddMultiTenantConfiguration(this IServiceCollection services)
    {
        // Configure Finbuckle.MultiTenant - Register CustomTenantStore BEFORE AddMultiTenant
        services.AddMultiTenant<Tenant>()
            .WithHeaderStrategy("X-Tenant-Id")
            .WithEFCoreStore<CustomTenantStore, Tenant>();

        return services;
    }

    private static IServiceCollection AddIdentityAndAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure ASP.NET Core Identity
        services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
        {
            // Password settings
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = true;
            options.Password.RequiredLength = 6;
            options.Password.RequiredUniqueChars = 1;

            // Lockout settings
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;

            // User settings
            options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
            options.User.RequireUniqueEmail = true;

            // Sign-in settings
            options.SignIn.RequireConfirmedEmail = false;
            options.SignIn.RequireConfirmedPhoneNumber = false;
        })
        .AddEntityFrameworkStores<IdentityDbContext>()
        .AddDefaultTokenProviders();

        // Configure OpenIddict
        services.AddOpenIddict()
            .AddCore(options =>
            {
                options.UseEntityFrameworkCore()
                       .UseDbContext<IdentityDbContext>();
            })
            .AddServer(options =>
            {
                // Enable the token endpoint
                options.SetTokenEndpointUris("/connect/token");

                // Enable the password flow
                options.AllowPasswordFlow();

                // Register the signing and encryption credentials
                options.AddDevelopmentEncryptionCertificate()
                       .AddDevelopmentSigningCertificate();

                // Register the ASP.NET Core host and configure the ASP.NET Core options
                options.UseAspNetCore()
                       .EnableTokenEndpointPassthrough();
            })
            .AddValidation(options =>
            {
                options.UseLocalServer();
                options.UseAspNetCore();
            });

        // Configure JWT Authentication
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(configuration["Jwt:Key"] ?? "YourSecretKeyThatIsAtLeast32CharactersLong!"))
                };
            });

        return services;
    }

    private static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Repository registration (EF Core only)
        services.AddScoped<IRestaurantRepository, EfRestaurantRepository>();
        services.AddScoped<ICategoryRepository, EfCategoryRepository>();
        services.AddScoped<IOrderRepository, EfOrderRepository>();
        services.AddScoped<IUserRepository, EfUserRepository>();

        // Application Services
        services.AddScoped<RestaurantService>();
        services.AddScoped<CategoryService>();
        services.AddScoped<OrderService>();
        services.AddScoped<UserService>();
        services.AddScoped<IAuthenticationService, AuthenticationService>();

        // Command Handlers
        services.AddScoped<PlaceOrderCommandHandler>();
        services.AddScoped<ConfirmOrderCommandHandler>();
        services.AddScoped<MarkOrderReadyForPickupCommandHandler>();
        services.AddScoped<CancelOrderCommandHandler>();
        services.AddScoped<FailOrderCommandHandler>();

        // Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Event Bus (InProcess implementation)
        services.AddSingleton<IDomainEventBus>(new InProcessDomainEventBus(new List<object>()));

        // Tenant service
        services.AddScoped<TenantService>();

        return services;
    }

    private static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
    {
        // FluentValidation
        services.AddValidatorsFromAssemblyContaining<CreateOrderDtoValidator>();

        return services;
    }

    private static IServiceCollection AddExternalServices(this IServiceCollection services, IConfiguration configuration)
    {
        // MinIO configuration and services
        services.Configure<MinioOptions>(configuration.GetSection("Minio"));
        services.AddSingleton<IMinioClient>(sp =>
        {
            var options = new MinioOptions();
            configuration.GetSection("Minio").Bind(options);
            return new MinioClient()
                .WithEndpoint(options.Endpoint)
                .WithCredentials(options.AccessKey, options.SecretKey)
                .WithSSL(options.UseSSL)
                .Build();
        });
        services.AddScoped<IImageService, MinioImageService>();

        return services;
    }
}
