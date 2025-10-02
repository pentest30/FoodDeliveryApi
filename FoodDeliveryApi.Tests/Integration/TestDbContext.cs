using FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryApi.Tests.Integration;

public class TestDbContext : DbContext
{
    public TestDbContext(DbContextOptions<TestDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Restaurant> Restaurants { get; set; } = null!;
    public DbSet<Order> Orders { get; set; } = null!;
    public DbSet<UserProfile> UserProfiles { get; set; } = null!;
    public DbSet<Tenant> Tenants { get; set; } = null!;
    public DbSet<RestaurantCategory> RestaurantCategories { get; set; } = null!;
    public DbSet<RestaurantSection> RestaurantSections { get; set; } = null!;
    public DbSet<RestaurantMenuItem> RestaurantMenuItems { get; set; } = null!;
    public DbSet<FoodDeliveryApi.Domain.Orders.OrderItem> OrderItems { get; set; } = null!;
    public DbSet<UserPaymentMethod> UserPaymentMethods { get; set; } = null!;
    public DbSet<UserPreferences> UserPreferences { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Icon).HasMaxLength(10);
            entity.Property(e => e.Color).HasMaxLength(7);
            entity.Property(e => e.TenantId).IsRequired().HasMaxLength(50);
        });

        // Configure Restaurant
        modelBuilder.Entity<Restaurant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.City).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Icon).HasMaxLength(10);
            entity.Property(e => e.PrimaryColor).HasMaxLength(7);
            entity.Property(e => e.TenantId).IsRequired().HasMaxLength(50);
            entity.Property(e => e.EtaMinutes).IsRequired();
            entity.Property(e => e.Rating).HasColumnType("decimal(3,2)");
            entity.Property(e => e.DistanceKm).HasColumnType("decimal(10,2)");
        });

        // Configure Order
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ExternalId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.TenantId).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.RestaurantName).HasMaxLength(200);
            entity.Property(e => e.CreatedAt).IsRequired();
            
            // Configure Money value objects
            entity.OwnsOne(e => e.Subtotal, money =>
            {
                money.Property(m => m.Amount).HasColumnName("SubtotalAmount").HasColumnType("decimal(18,2)");
                money.Property(m => m.Currency).HasColumnName("SubtotalCurrency").HasMaxLength(3);
            });
            entity.OwnsOne(e => e.Total, money =>
            {
                money.Property(m => m.Amount).HasColumnName("TotalAmount").HasColumnType("decimal(18,2)");
                money.Property(m => m.Currency).HasColumnName("TotalCurrency").HasMaxLength(3);
            });
            entity.OwnsOne(e => e.DeliveryFee, money =>
            {
                money.Property(m => m.Amount).HasColumnName("DeliveryFeeAmount").HasColumnType("decimal(18,2)");
                money.Property(m => m.Currency).HasColumnName("DeliveryFeeCurrency").HasMaxLength(3);
            });
            
            // Configure Address value object
            entity.OwnsOne(e => e.DeliveryAddress, address =>
            {
                address.Property(a => a.Street).IsRequired().HasMaxLength(500);
                address.Property(a => a.State).IsRequired().HasMaxLength(200);
                address.Property(a => a.City).IsRequired().HasMaxLength(100);
                address.Property(a => a.Zip).IsRequired().HasMaxLength(20);
                address.Property(a => a.Latitude);
                address.Property(a => a.Longitude);
                // FullAddress is a computed property, so we don't map it
                address.Ignore(a => a.FullAddress);
            });
            
            // Configure CustomerRef value object
            entity.OwnsOne(e => e.Customer, customer =>
            {
                customer.Property(c => c.UserId).IsRequired();
                customer.Property(c => c.Name).IsRequired().HasMaxLength(200);
                customer.Property(c => c.Phone).IsRequired().HasMaxLength(20);
            });
        });

        // Configure UserProfile
        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.TenantId).IsRequired().HasMaxLength(50);
            
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

        // Configure Tenant
        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Identifier).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Url).HasMaxLength(500);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Mobile).HasMaxLength(20);
        });

        // Configure RestaurantCategory
        modelBuilder.Entity<RestaurantCategory>(entity =>
        {
            entity.HasKey(e => new { e.RestaurantId, e.CategoryId });
            entity.HasOne(e => e.Restaurant)
                .WithMany()
                .HasForeignKey(e => e.RestaurantId);
            entity.HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId);
        });

        // Configure RestaurantSection
        modelBuilder.Entity<RestaurantSection>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.HasOne(e => e.Restaurant)
                .WithMany()
                .HasForeignKey(e => e.RestaurantId);
        });

        // Configure RestaurantMenuItem
        modelBuilder.Entity<RestaurantMenuItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.BasePrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Currency).HasMaxLength(3);
            entity.Property(e => e.Active);
            
            // Configure Images as JSON array
            entity.Property(e => e.Images)
                  .HasConversion(
                      v => string.Join("|", v),
                      v => v.Split("|", StringSplitOptions.RemoveEmptyEntries).ToList())
                  .HasMaxLength(2000);
            entity.HasOne(e => e.RestaurantSection)
                .WithMany()
                .HasForeignKey(e => e.RestaurantSectionId);
        });

        // Configure OrderItem
        modelBuilder.Entity<FoodDeliveryApi.Domain.Orders.OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.HasOne(e => e.Order)
                .WithMany()
                .HasForeignKey(e => e.OrderId);
            
            // Configure Money value objects
            entity.OwnsOne(e => e.UnitPrice, money =>
            {
                money.Property(m => m.Amount).HasColumnName("UnitPriceAmount").HasColumnType("decimal(18,2)");
                money.Property(m => m.Currency).HasColumnName("UnitPriceCurrency").HasMaxLength(3);
            });
            entity.OwnsOne(e => e.Total, money =>
            {
                money.Property(m => m.Amount).HasColumnName("TotalAmount").HasColumnType("decimal(18,2)");
                money.Property(m => m.Currency).HasColumnName("TotalCurrency").HasMaxLength(3);
            });
        });

        // Configure UserPaymentMethod
        modelBuilder.Entity<UserPaymentMethod>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Label).IsRequired().HasMaxLength(100);
            entity.HasOne(e => e.UserProfile)
                .WithMany()
                .HasForeignKey(e => e.UserProfileId);
        });

        // Configure UserPreferences
        modelBuilder.Entity<UserPreferences>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Language).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Theme).IsRequired().HasMaxLength(20);
            entity.HasOne(e => e.UserProfile)
                .WithMany()
                .HasForeignKey(e => e.UserProfileId);
        });
    }
}
