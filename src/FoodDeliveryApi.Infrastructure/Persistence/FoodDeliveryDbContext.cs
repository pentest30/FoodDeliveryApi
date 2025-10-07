using Finbuckle.MultiTenant;
using Finbuckle.MultiTenant.EntityFrameworkCore;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence;

public class FoodAppContext : MultiTenantDbContext
{

    private readonly ITenantInfo? _tenantInfo;

    public FoodAppContext(
        DbContextOptions<FoodAppContext> options, 
        ITenantInfo tenantInfo) 
        : base(tenantInfo, options)
    {
        _tenantInfo = tenantInfo;
    }
    
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<RestaurantCategory> RestaurantCategories => Set<RestaurantCategory>();
    public DbSet<RestaurantSection> RestaurantSections => Set<RestaurantSection>();
    public DbSet<RestaurantMenuItem> RestaurantMenuItems => Set<RestaurantMenuItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<UserPaymentMethod> UserPaymentMethods => Set<UserPaymentMethod>();
    public DbSet<UserPreferences> UserPreferences => Set<UserPreferences>();
    
    // Restaurant Menu Management entities
    public DbSet<MenuItemVariant> MenuItemVariants => Set<MenuItemVariant>();
    public DbSet<Discount> Discounts => Set<Discount>();

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
    {
        if (_tenantInfo == null) return base.SaveChangesAsync(cancellationToken);
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.State == EntityState.Added)
            {
                var tenantIdProp = entry.Properties
                    .FirstOrDefault(p => p.Metadata.Name == "TenantId");
                    
                if (tenantIdProp != null && string.IsNullOrEmpty(tenantIdProp.CurrentValue as string))
                {
                    tenantIdProp.CurrentValue = _tenantInfo.Id;
                }
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        

        // Configure Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ExternalId).HasMaxLength(100);
            entity.HasIndex(e => e.ExternalId).IsUnique();
            entity.Property(e => e.TenantId).HasMaxLength(100); // Match Tenant.Id length
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Icon).HasMaxLength(100);
            entity.Property(e => e.Color).HasMaxLength(20);
            
            // Foreign key to Tenant
           
            // Enable automatic multi-tenant filtering
            entity.IsMultiTenant();
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
            // Enable automatic multi-tenant filtering
            entity.IsMultiTenant();
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
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.SortOrder);
            entity.Property(e => e.Active);
            entity.Property(e => e.CreatedAt);
            entity.Property(e => e.UpdatedAt);
            
            // Configure Images as JSON array
            entity.Property(e => e.Images)
                  .HasConversion(
                      v => string.Join("|", v),
                      v => v.Split("|", StringSplitOptions.RemoveEmptyEntries).ToList())
                  .HasMaxLength(2000);
            
            entity.HasOne(e => e.Restaurant)
                  .WithMany(r => r.RestaurantSections)
                  .HasForeignKey(e => e.RestaurantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure RestaurantMenuItem
        modelBuilder.Entity<RestaurantMenuItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.BasePrice).HasPrecision(10, 2);
            entity.Property(e => e.Currency).HasMaxLength(3);
            entity.Property(e => e.Available);
            entity.Property(e => e.CreatedAt);
            entity.Property(e => e.UpdatedAt);
            
            // Configure Images as JSON array
            entity.Property(e => e.Images)
                  .HasConversion(
                      v => string.Join("|", v),
                      v => v.Split("|", StringSplitOptions.RemoveEmptyEntries).ToList())
                  .HasMaxLength(2000);
            
            // Foreign key to Restaurant
            entity.HasOne<Restaurant>()
                  .WithMany()
                  .HasForeignKey(e => e.RestaurantId)
                  .OnDelete(DeleteBehavior.NoAction);
            
            entity.HasOne(e => e.RestaurantSection)
                  .WithMany(rs => rs.MenuItems)
                  .HasForeignKey(e => e.RestaurantSectionId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            // Navigation to MenuItemVariants
            entity.HasMany(e => e.Variants)
                  .WithOne()
                  .HasForeignKey(mv => mv.MenuItemId)
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
                  
            // Enable automatic multi-tenant filtering
            entity.IsMultiTenant();
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
            
            // Foreign key to Tenant
          
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
            
            // Enable automatic multi-tenant filtering
            entity.IsMultiTenant();
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


        // Configure MenuItemVariant (now in Restaurant domain)
        modelBuilder.Entity<MenuItemVariant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Price).HasPrecision(10, 2);
            entity.Property(e => e.Currency).HasMaxLength(3);
            entity.Property(e => e.SortOrder);
            entity.Property(e => e.Active);
            entity.Property(e => e.CreatedAt);
            entity.Property(e => e.UpdatedAt);
            
            // Size and physical properties
            entity.Property(e => e.Size).HasMaxLength(50);
            entity.Property(e => e.Unit).HasMaxLength(20);
            entity.Property(e => e.Weight).HasPrecision(10, 3);
            entity.Property(e => e.Dimensions).HasMaxLength(100);
            
            // Business properties
            entity.Property(e => e.SKU).HasMaxLength(50);
            entity.Property(e => e.StockQuantity);
            entity.Property(e => e.AvailableUntil);
        });

        // Configure Discount (now in Restaurant domain)
        modelBuilder.Entity<Discount>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Scope).HasConversion<int>();
            entity.Property(e => e.Type).HasConversion<int>();
            entity.Property(e => e.Value).HasPrecision(10, 2);
            entity.Property(e => e.Currency).HasMaxLength(3);
            entity.Property(e => e.StartsAt);
            entity.Property(e => e.EndsAt);
            entity.Property(e => e.MinQuantity);
            entity.Property(e => e.MaxPerOrder);
            entity.Property(e => e.Priority);
            entity.Property(e => e.Active);
            entity.Property(e => e.CreatedAt);
            
            // Foreign key to Restaurant
            entity.HasOne<Restaurant>()
                  .WithMany()
                  .HasForeignKey(e => e.RestaurantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Add performance indexes
        AddPerformanceIndexes(modelBuilder);
    }

    private static void AddPerformanceIndexes(ModelBuilder modelBuilder)
    {
        // Restaurant indexes for common queries
       
        // RestaurantCategory indexes for many-to-many queries
        modelBuilder.Entity<RestaurantCategory>()
            .HasIndex(rc => rc.CategoryId)
            .HasDatabaseName("IX_RestaurantCategories_CategoryId");

        // OrderItem indexes
        modelBuilder.Entity<global::FoodDeliveryApi.FoodDeliveryApi.Domain.Orders.OrderItem>()
            .HasIndex(oi => oi.OrderId)
            .HasDatabaseName("IX_OrderItems_OrderId");

        // Restaurant Menu Management indexes
        modelBuilder.Entity<RestaurantMenuItem>()
            .HasIndex(rmi => new { rmi.RestaurantId, rmi.RestaurantSectionId })
            .HasDatabaseName("IX_RestaurantMenuItems_RestaurantId_RestaurantSectionId");
            
        modelBuilder.Entity<RestaurantMenuItem>()
            .HasIndex(rmi => new { rmi.RestaurantId, rmi.Available })
            .HasDatabaseName("IX_RestaurantMenuItems_RestaurantId_Available");

        modelBuilder.Entity<MenuItemVariant>()
            .HasIndex(mv => new { mv.MenuItemId, mv.SortOrder })
            .HasDatabaseName("IX_MenuItemVariants_MenuItemId_SortOrder");
            
        modelBuilder.Entity<MenuItemVariant>()
            .HasIndex(mv => new { mv.MenuItemId, mv.Active })
            .HasDatabaseName("IX_MenuItemVariants_MenuItemId_Active");

        modelBuilder.Entity<Discount>()
            .HasIndex(d => new { d.RestaurantId, d.Scope, d.Active })
            .HasDatabaseName("IX_Discounts_RestaurantId_Scope_Active");
            
        modelBuilder.Entity<Discount>()
            .HasIndex(d => new { d.RestaurantId, d.StartsAt, d.EndsAt })
            .HasDatabaseName("IX_Discounts_RestaurantId_DateRange");
            
        modelBuilder.Entity<Discount>()
            .HasIndex(d => new { d.RestaurantId, d.Priority })
            .HasDatabaseName("IX_Discounts_RestaurantId_Priority");

        // RestaurantSection indexes
        modelBuilder.Entity<RestaurantSection>()
            .HasIndex(rs => new { rs.RestaurantId, rs.SortOrder })
            .HasDatabaseName("IX_RestaurantSections_RestaurantId_SortOrder");
            
        modelBuilder.Entity<RestaurantSection>()
            .HasIndex(rs => new { rs.RestaurantId, rs.Active })
            .HasDatabaseName("IX_RestaurantSections_RestaurantId_Active");
    }
}


