using FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence;

/// <summary>
/// Context for seeding data without multi-tenant enforcement
/// </summary>
public class SeedingContext : DbContext
{
    public SeedingContext(DbContextOptions<SeedingContext> options) : base(options)
    {
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<RestaurantCategory> RestaurantCategories => Set<RestaurantCategory>();
    public DbSet<RestaurantSection> RestaurantSections => Set<RestaurantSection>();
    public DbSet<RestaurantMenuItem> RestaurantMenuItems => Set<RestaurantMenuItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<global::FoodDeliveryApi.FoodDeliveryApi.Domain.Orders.OrderItem> OrderItems => Set<global::FoodDeliveryApi.FoodDeliveryApi.Domain.Orders.OrderItem>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<UserPaymentMethod> UserPaymentMethods => Set<UserPaymentMethod>();
    public DbSet<UserPreferences> UserPreferences => Set<UserPreferences>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure Tenant
        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasMaxLength(100);
            entity.Property(e => e.Identifier).HasMaxLength(100);
            entity.HasIndex(e => e.Identifier).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Url).HasMaxLength(500);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Mobile).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Configure Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ExternalId).HasMaxLength(100);
            entity.HasIndex(e => e.ExternalId).IsUnique();
            entity.Property(e => e.TenantId).HasMaxLength(100); // Match Tenant.Id length
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Icon).HasMaxLength(100);
            entity.Property(e => e.Color).HasMaxLength(20);
            
            // Foreign key to Tenant
            
        });

        // Configure Restaurant
        modelBuilder.Entity<Restaurant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ExternalId).HasMaxLength(100);
            entity.HasIndex(e => e.ExternalId).IsUnique();
            entity.Property(e => e.TenantId).HasMaxLength(100); // Match Tenant.Id length
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.Icon).HasMaxLength(100);
            entity.Property(e => e.PrimaryColor).HasMaxLength(20);
            entity.Property(e => e.Rating).HasPrecision(3, 2);
            entity.Property(e => e.DistanceKm).HasPrecision(10, 2);
            
            // Foreign key to Tenant
            });

        // Configure RestaurantCategory (Many-to-Many)
        modelBuilder.Entity<RestaurantCategory>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.Restaurant)
                  .WithMany(r => r.RestaurantCategories)
                  .HasForeignKey(e => e.RestaurantId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(e => e.Category)
                  .WithMany(c => c.RestaurantCategories)
                  .HasForeignKey(e => e.CategoryId)
                  .OnDelete(DeleteBehavior.NoAction);
                  
            // Unique constraint
            entity.HasIndex(e => new { e.RestaurantId, e.CategoryId }).IsUnique();
        });

        // Configure RestaurantSection
        modelBuilder.Entity<RestaurantSection>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.Restaurant)
                  .WithMany(r => r.RestaurantSections)
                  .HasForeignKey(e => e.RestaurantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure RestaurantMenuItem
        modelBuilder.Entity<RestaurantMenuItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.RestaurantSection)
                  .WithMany(s => s.MenuItems)
                  .HasForeignKey(e => e.RestaurantSectionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Order
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ExternalId).HasMaxLength(100);
            entity.HasIndex(e => e.ExternalId).IsUnique();
            entity.Property(e => e.TenantId).HasMaxLength(100); // Match Tenant.Id length
            entity.Property(e => e.RestaurantName).HasMaxLength(200);
            
            // Foreign key to Tenant
         
            // Foreign key to Restaurant (optional)
            entity.HasOne(e => e.Restaurant)
                  .WithMany(r => r.Orders)
                  .HasForeignKey(e => e.RestaurantId)
                  .OnDelete(DeleteBehavior.SetNull);
                  
            // Foreign key to UserProfile (optional)
            entity.HasOne(e => e.UserProfile)
                  .WithMany(u => u.Orders)
                  .HasForeignKey("UserProfileId")
                  .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure UserProfile
        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ExternalId).HasMaxLength(100);
            entity.HasIndex(e => e.ExternalId).IsUnique();
            entity.Property(e => e.TenantId).HasMaxLength(100); // Match Tenant.Id length
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(20);
            
          
            // Configure Address value objects as owned types
            entity.OwnsMany(e => e.Addresses, address =>
            {
                address.Property(a => a.Street).HasMaxLength(200);
                address.Property(a => a.City).HasMaxLength(100);
                address.Property(a => a.State).HasMaxLength(100);
                address.Property(a => a.Zip).HasMaxLength(20);
                address.Property(a => a.Latitude).HasPrecision(10, 7);
                address.Property(a => a.Longitude).HasPrecision(10, 7);
                // FullAddress is a computed property, so we don't map it
                address.Ignore(a => a.FullAddress);
            });
        });

        // Configure UserPaymentMethod
        modelBuilder.Entity<UserPaymentMethod>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ExternalId).HasMaxLength(100);
            entity.Property(e => e.Type).HasMaxLength(50);
            entity.Property(e => e.Label).HasMaxLength(100);
            
            entity.HasOne(e => e.UserProfile)
                  .WithMany(u => u.PaymentMethods)
                  .HasForeignKey(e => e.UserProfileId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure UserPreferences
        modelBuilder.Entity<UserPreferences>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Language).HasMaxLength(10);
            entity.Property(e => e.Theme).HasMaxLength(20);
            
            entity.HasOne(e => e.UserProfile)
                  .WithOne(u => u.Preferences)
                  .HasForeignKey<UserPreferences>(e => e.UserProfileId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure owned types for Order
        modelBuilder.Entity<Order>(entity =>
        {
            entity.OwnsOne(e => e.Subtotal, money =>
            {
                money.Property(m => m.Amount).HasPrecision(10, 2);
                money.Property(m => m.Currency).HasMaxLength(3);
            });
            
            entity.OwnsOne(e => e.Total, money =>
            {
                money.Property(m => m.Amount).HasPrecision(10, 2);
                money.Property(m => m.Currency).HasMaxLength(3);
            });
            
            entity.OwnsOne(e => e.DeliveryFee, money =>
            {
                money.Property(m => m.Amount).HasPrecision(10, 2);
                money.Property(m => m.Currency).HasMaxLength(3);
            });
            
            entity.OwnsOne(e => e.DeliveryAddress, address =>
            {
                address.Property(a => a.Street).HasMaxLength(200);
                address.Property(a => a.City).HasMaxLength(100);
                address.Property(a => a.State).HasMaxLength(100);
                address.Property(a => a.Zip).HasMaxLength(20);
                address.Property(a => a.Latitude).HasPrecision(10, 7);
                address.Property(a => a.Longitude).HasPrecision(10, 7);
                // FullAddress is a computed property, so we don't map it
                address.Ignore(a => a.FullAddress);
            });
            
            entity.OwnsOne(e => e.Customer, customer =>
            {
                customer.Property(c => c.Name).HasMaxLength(200);
                customer.Property(c => c.Phone).HasMaxLength(20);
            });
            
            // Configure OrderItem collection as entities
            entity.HasMany(e => e.Items)
                .WithOne(i => i.Order)
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure OrderItem entity
        modelBuilder.Entity<global::FoodDeliveryApi.FoodDeliveryApi.Domain.Orders.OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Quantity);
            
            entity.OwnsOne(e => e.UnitPrice, money =>
            {
                money.Property(m => m.Amount).HasPrecision(10, 2);
                money.Property(m => m.Currency).HasMaxLength(3);
            });
            
            entity.OwnsOne(e => e.Total, money =>
            {
                money.Property(m => m.Amount).HasPrecision(10, 2);
                money.Property(m => m.Currency).HasMaxLength(3);
            });
        });
    }
}

