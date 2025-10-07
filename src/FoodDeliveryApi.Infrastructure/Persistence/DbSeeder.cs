using FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Users;
using FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(SeedingContext db, CancellationToken cancellationToken = default)
    {
        try
        {
            Console.WriteLine("Starting database seeding...");
            
            // Seed root tenant
            var rootTenantId = "root-tenant";
            var rootTenant = await db.Tenants.FirstOrDefaultAsync(t => t.Identifier == rootTenantId, cancellationToken);
            if (rootTenant is null)
            {
                rootTenant = Tenant.Create(
                    "00000000-0000-0000-0000-000000000001", // Fixed GUID for root tenant
                    rootTenantId,
                    "Root Tenant",
                    "https://root.example.com",
                    "admin@root.example.com",
                    "+1000000000"
                );
                db.Tenants.Add(rootTenant);
                await db.SaveChangesAsync(cancellationToken);
            }

            // Seed the specific tenant for testing
            var testTenantId = "0f4b50b3-7116-4222-b17a-41a0aa6edef3";
            var testTenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == testTenantId, cancellationToken);
            if (testTenant is null)
            {
                testTenant = Tenant.Create(
                    testTenantId,
                    "test-tenant",
                    "Test Tenant",
                    "https://test.example.com",
                    "admin@test.example.com",
                    "+1000000001"
                );
                db.Tenants.Add(testTenant);
                await db.SaveChangesAsync(cancellationToken);
            }

            // Create tenants for each restaurant
            var restaurantTenants = await CreateRestaurantTenantsAsync(db, cancellationToken);

            // Categories (hardcoded) - simplified approach
            Console.WriteLine("Seeding categories...");
            var categories = new[]
            {
            new { Id = "cat-001", Name = "Pizza", Icon = "🍕", Color = "#FF6B35" },
            new { Id = "cat-002", Name = "Burgers", Icon = "🍔", Color = "#FF8C00" },
            new { Id = "cat-003", Name = "Sushi", Icon = "🍣", Color = "#4CAF50" },
            new { Id = "cat-004", Name = "Mexican", Icon = "🌮", Color = "#FF5722" },
            new { Id = "cat-005", Name = "Italian", Icon = "🍝", Color = "#9C27B0" },
            new { Id = "cat-006", Name = "Chinese", Icon = "🥡", Color = "#F44336" },
            new { Id = "cat-007", Name = "Indian", Icon = "🍛", Color = "#FF9800" },
            new { Id = "cat-008", Name = "Desserts", Icon = "🍰", Color = "#E91E63" }
        };

        foreach (var m in categories)
        {
            var categoryExternalId = m.Id;
            var existingCategory = await db.Categories.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.ExternalId == categoryExternalId, cancellationToken);
            if (existingCategory is null)
            {
                var category = Category.Create(
                    categoryExternalId,
                    rootTenant.Id,
                    m.Name,
                    m.Icon,
                    m.Color
                );
                db.Categories.Add(category);
            }
        }

        // Restaurants (hardcoded)
        Console.WriteLine("Seeding restaurants...");
        var restaurants = new[]
        {
            new { Id = "rest-001", Name = "Pizza Palace", CoverImageUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", Rating = 4.5, EtaMinutes = 25, DistanceKm = 1.2, Categories = new[] { "Pizza", "Italian" }, City = "São Paulo", IsOpenNow = true, Icon = "🍕", PrimaryColor = "#FF6B35" },
            new { Id = "rest-002", Name = "Burger King", CoverImageUrl = "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop", Rating = 4.2, EtaMinutes = 20, DistanceKm = 0.8, Categories = new[] { "Burgers", "Fast Food" }, City = "São Paulo", IsOpenNow = true, Icon = "🍔", PrimaryColor = "#FF8C00" },
            new { Id = "rest-003", Name = "Sushi Master", CoverImageUrl = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop", Rating = 4.8, EtaMinutes = 30, DistanceKm = 2.1, Categories = new[] { "Sushi", "Japanese" }, City = "São Paulo", IsOpenNow = true, Icon = "🍣", PrimaryColor = "#4CAF50" },
            new { Id = "rest-004", Name = "Taco Bell", CoverImageUrl = "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop", Rating = 4.0, EtaMinutes = 15, DistanceKm = 1.5, Categories = new[] { "Mexican", "Fast Food" }, City = "São Paulo", IsOpenNow = true, Icon = "🌮", PrimaryColor = "#FF5722" },
            new { Id = "rest-005", Name = "Pasta House", CoverImageUrl = "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop", Rating = 4.6, EtaMinutes = 35, DistanceKm = 3.2, Categories = new[] { "Italian", "Pasta" }, City = "São Paulo", IsOpenNow = true, Icon = "🍝", PrimaryColor = "#9C27B0" }
        };

        foreach (var m in restaurants)
        {
            var restaurantExternalId = m.Id;
            var existingRestaurant = await db.Restaurants.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.ExternalId == restaurantExternalId, cancellationToken);
            if (existingRestaurant is null)
            {
                var restaurant = Restaurant.Create(
                    restaurantExternalId,
                    restaurantTenants.ContainsKey(restaurantExternalId) ? restaurantTenants[restaurantExternalId] : rootTenant.Id,
                    m.Name,
                    m.City,
                    m.EtaMinutes,
                    (decimal)m.DistanceKm,
                    "", // email
                    "", // mobile
                    m.Icon,
                    m.PrimaryColor,
                    new List<string> { m.CoverImageUrl }
                );
                
                restaurant.UpdateRating((decimal)m.Rating);
                restaurant.SetOpenStatus(m.IsOpenNow);
                
                db.Restaurants.Add(restaurant);
                
                // Add categories to restaurant
                foreach (var categoryName in m.Categories)
                {
                    var category = await db.Categories.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Name == categoryName, cancellationToken);
                    if (category != null)
                    {
                        restaurant.AddCategory(category.Id);
                    }
                }
            }
        }

        // Orders (hardcoded)
        Console.WriteLine("Seeding orders...");
        
        // Check if orders already exist
        var existingOrders = await db.Orders.IgnoreQueryFilters().AnyAsync(cancellationToken);
        if (existingOrders)
        {
            Console.WriteLine("Orders already exist, skipping...");
        }
        else
        {
            var orders = new[]
            {
                new { Id = "order-001", Status = "Delivered", RestaurantName = "Pizza Palace", Total = 24.50m, DeliveryFee = 2.50m, EtaMinutes = 30, Items = new[] { new { Name = "Margherita Pizza", Quantity = 1, Price = 18.00m }, new { Name = "Garlic Bread", Quantity = 1, Price = 4.00m } } },
                new { Id = "order-002", Status = "In Progress", RestaurantName = "Burger King", Total = 15.75m, DeliveryFee = 1.50m, EtaMinutes = 15, Items = new[] { new { Name = "Whopper", Quantity = 1, Price = 12.00m }, new { Name = "Fries", Quantity = 1, Price = 2.25m } } },
                new { Id = "order-003", Status = "Ready for Pickup", RestaurantName = "Sushi Master", Total = 45.00m, DeliveryFee = 3.00m, EtaMinutes = 5, Items = new[] { new { Name = "Salmon Roll", Quantity = 2, Price = 18.00m }, new { Name = "Tuna Roll", Quantity = 1, Price = 12.00m } } }
            };

            foreach (var m in orders)
        {
            var orderExternalId = m.Id;
            // Simplified approach - just create new orders
            var customer = new CustomerRef(Guid.NewGuid(), "João Silva", "+5511999999999");
            var address = new Address("Rua das Flores, 123", "Vila Madalena", "São Paulo", "05435-000", 0, 0);
            var items = m.Items.Select(i => new global::FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects.OrderItem(
                i.Name, 
                i.Quantity, 
                new Money(i.Price, "USD"), 
                new Money(i.Price * i.Quantity, "USD")
            )).ToList();
            var deliveryFee = new Money(m.DeliveryFee, "USD");
            
            // Use root tenant for simplicity
            var order = Order.Place(
                orderExternalId,
                customer,
                address,
                items,
                deliveryFee,
                m.EtaMinutes,
                m.RestaurantName,
                null);
            
            db.Orders.Add(order);
            }
        }

        // Profile (hardcoded) - simplified approach
        Console.WriteLine("Seeding user profile...");
        var externalId = "user-001";
        var existingUser = await db.UserProfiles.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.ExternalId == externalId, cancellationToken);
        if (existingUser is null)
        {
            var user = UserProfile.Create(
                externalId,
                rootTenant.Id,
                "João Silva",
                "joao.silva@email.com",
                "+55 11 99999-9999",
                new List<string> { "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" }
            );
            
            db.UserProfiles.Add(user);
            
            // Create user preferences
            var preferences = new UserPreferences(
                notifications: true,
                promotions: true,
                language: "pt-BR",
                theme: "light"
            );
            preferences.UserProfileId = user.Id;
            db.UserPreferences.Add(preferences);
            
            // Create user addresses using Address value objects
            var address1 = Address.Create(
                "Rua das Flores, 123",
                "São Paulo",
                "SP",
                "05435-000",
                -23.5505,
                -46.6333
            );
            user.AddAddress(address1);
            
            var address2 = Address.Create(
                "Av. Paulista, 1000",
                "São Paulo",
                "SP",
                "01310-100",
                -23.5613,
                -46.6565
            );
            user.AddAddress(address2);
            
            // Create payment methods
            var paymentMethod1 = new UserPaymentMethod(
                "pm-001",
                "Credit Card",
                "Visa ****1234",
                true
            );
            paymentMethod1.UserProfileId = user.Id;
            db.UserPaymentMethods.Add(paymentMethod1);
            
            var paymentMethod2 = new UserPaymentMethod(
                "pm-002",
                "Debit Card",
                "Mastercard ****5678",
                false
            );
            paymentMethod2.UserProfileId = user.Id;
            db.UserPaymentMethods.Add(paymentMethod2);
        }

        // Seed orders
        await SeedOrdersAsync(db, cancellationToken);

        Console.WriteLine("Saving all changes to database...");
        await db.SaveChangesAsync(cancellationToken);
        Console.WriteLine("Database seeding completed successfully!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error during seeding: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            throw;
        }
    }

    private static async Task<Dictionary<string, string>> CreateRestaurantTenantsAsync(SeedingContext db, CancellationToken cancellationToken)
    {
        var restaurantTenants = new Dictionary<string, string>();
        
        // Hardcoded restaurant IDs
        var restaurantIds = new[] { "rest-001", "rest-002", "rest-003", "rest-004", "rest-005" };
        var restaurantNames = new[] { "Pizza Palace", "Burger King", "Sushi Master", "Taco Bell", "Pasta House" };
        
        for (int i = 0; i < restaurantIds.Length; i++)
        {
            var restaurantId = restaurantIds[i];
            var restaurantName = restaurantNames[i];
            var tenantId = $"tenant-{restaurantId}";
            var existingTenant = await db.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Identifier == tenantId, cancellationToken);
            
            if (existingTenant == null)
            {
                var tenant = Tenant.Create(
                    Guid.NewGuid().ToString(),
                    tenantId,
                    $"{restaurantName} Tenant",
                    $"https://{restaurantId}.example.com",
                    $"admin@{restaurantId}.example.com",
                    $"+{new Random().Next(100000000, 999999999)}"
                );
                
                db.Tenants.Add(tenant);
                await db.SaveChangesAsync(cancellationToken);
                restaurantTenants[restaurantId] = tenant.Id;
            }
            else
            {
                restaurantTenants[restaurantId] = existingTenant.Id;
            }
        }
        
        return restaurantTenants;
    }

    private static async Task SeedOrdersAsync(SeedingContext db, CancellationToken cancellationToken)
    {
        Console.WriteLine("Seeding orders...");
        
        // Get existing restaurants
        var restaurants = await db.Restaurants.Take(5).ToListAsync(cancellationToken);
        if (!restaurants.Any())
        {
            Console.WriteLine("No restaurants found. Skipping order seeding.");
            return;
        }

        // Get existing user
        var user = await db.UserProfiles.FirstOrDefaultAsync(cancellationToken);
        if (user == null)
        {
            Console.WriteLine("No users found. Skipping order seeding.");
            return;
        }

        // Create sample orders
        var orders = new[]
        {
            new
            {
                ExternalId = "ORD-001",
                Restaurant = restaurants[0],
                Status = OrderStatus.Pending,
                CustomerName = "John Doe",
                CustomerPhone = "+1 555-0123",
                Items = new[]
                {
                    new { Name = "Margherita Pizza", Quantity = 1, UnitPrice = 15.99m },
                    new { Name = "Caesar Salad", Quantity = 2, UnitPrice = 8.50m }
                },
                DeliveryAddress = new
                {
                    Street = "123 Main St",
                    City = "São Paulo",
                    State = "SP",
                    Zip = "01310-100",
                    Latitude = -23.5613,
                    Longitude = -46.6565
                },
                DeliveryFee = 3.50m,
                EtaMinutes = 25
            },
            new
            {
                ExternalId = "ORD-002",
                Restaurant = restaurants[1],
                Status = OrderStatus.Confirmed,
                CustomerName = "Jane Smith",
                CustomerPhone = "+1 555-0456",
                Items = new[]
                {
                    new { Name = "Big Burger", Quantity = 1, UnitPrice = 12.99m },
                    new { Name = "French Fries", Quantity = 1, UnitPrice = 4.99m },
                    new { Name = "Coca Cola", Quantity = 2, UnitPrice = 2.50m }
                },
                DeliveryAddress = new
                {
                    Street = "456 Oak Ave",
                    City = "São Paulo",
                    State = "SP",
                    Zip = "05435-000",
                    Latitude = -23.5505,
                    Longitude = -46.6333
                },
                DeliveryFee = 2.99m,
                EtaMinutes = 20
            },
            new
            {
                ExternalId = "ORD-003",
                Restaurant = restaurants[2],
                Status = OrderStatus.ReadyForPickup,
                CustomerName = "Mike Johnson",
                CustomerPhone = "+1 555-0789",
                Items = new[]
                {
                    new { Name = "Salmon Sushi Roll", Quantity = 2, UnitPrice = 18.99m },
                    new { Name = "Miso Soup", Quantity = 1, UnitPrice = 6.99m }
                },
                DeliveryAddress = new
                {
                    Street = "789 Pine St",
                    City = "São Paulo",
                    State = "SP",
                    Zip = "04567-890",
                    Latitude = -23.5705,
                    Longitude = -46.6433
                },
                DeliveryFee = 4.50m,
                EtaMinutes = 30
            },
            new
            {
                ExternalId = "ORD-004",
                Restaurant = restaurants[0],
                Status = OrderStatus.OutForDelivery,
                CustomerName = "Sarah Wilson",
                CustomerPhone = "+1 555-0321",
                Items = new[]
                {
                    new { Name = "Pepperoni Pizza", Quantity = 1, UnitPrice = 17.99m },
                    new { Name = "Garlic Bread", Quantity = 1, UnitPrice = 5.99m }
                },
                DeliveryAddress = new
                {
                    Street = "321 Elm St",
                    City = "São Paulo",
                    State = "SP",
                    Zip = "01234-567",
                    Latitude = -23.5805,
                    Longitude = -46.6533
                },
                DeliveryFee = 3.99m,
                EtaMinutes = 25
            },
            new
            {
                ExternalId = "ORD-005",
                Restaurant = restaurants[3],
                Status = OrderStatus.Delivered,
                CustomerName = "David Brown",
                CustomerPhone = "+1 555-0654",
                Items = new[]
                {
                    new { Name = "Chicken Tacos", Quantity = 3, UnitPrice = 9.99m },
                    new { Name = "Guacamole", Quantity = 1, UnitPrice = 3.99m }
                },
                DeliveryAddress = new
                {
                    Street = "654 Maple Dr",
                    City = "São Paulo",
                    State = "SP",
                    Zip = "09876-543",
                    Latitude = -23.5905,
                    Longitude = -46.6633
                },
                DeliveryFee = 2.50m,
                EtaMinutes = 15
            },
            new
            {
                ExternalId = "ORD-006",
                Restaurant = restaurants[1],
                Status = OrderStatus.Canceled,
                CustomerName = "Lisa Davis",
                CustomerPhone = "+1 555-0987",
                Items = new[]
                {
                    new { Name = "Veggie Burger", Quantity = 1, UnitPrice = 11.99m }
                },
                DeliveryAddress = new
                {
                    Street = "987 Cedar Ln",
                    City = "São Paulo",
                    State = "SP",
                    Zip = "07654-321",
                    Latitude = -23.6005,
                    Longitude = -46.6733
                },
                DeliveryFee = 2.99m,
                EtaMinutes = 20
            }
        };

        foreach (var orderData in orders)
        {
            // Check if order already exists
            var existingOrder = await db.Orders.IgnoreQueryFilters()
                .FirstOrDefaultAsync(o => o.ExternalId == orderData.ExternalId, cancellationToken);
            
            if (existingOrder != null) continue;

            // Create customer reference
            var customer = CustomerRef.Create(
                user.Id,
                orderData.CustomerName,
                orderData.CustomerPhone
            );

            // Create delivery address
            var deliveryAddress = Address.Create(
                orderData.DeliveryAddress.Street,
                orderData.DeliveryAddress.City,
                orderData.DeliveryAddress.State,
                orderData.DeliveryAddress.Zip,
                orderData.DeliveryAddress.Latitude,
                orderData.DeliveryAddress.Longitude
            );

            // Create order items
            var orderItems = orderData.Items.Select(item => 
                global::FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects.OrderItem.Create(
                    item.Name,
                    item.Quantity,
                    new Money(item.UnitPrice, "DZD")
                )
            ).ToList();

            // Create delivery fee
            var deliveryFee = new Money(orderData.DeliveryFee, "DZD");

            // Create the order
            var order = Order.Place(
                orderData.ExternalId,
                customer,
                deliveryAddress,
                orderItems,
                deliveryFee,
                orderData.EtaMinutes,
                orderData.Restaurant.Name,
                orderData.Restaurant.Id,
                user.Id
            );

            // Apply status transitions based on current status
            switch (orderData.Status)
            {
                case OrderStatus.Confirmed:
                    order.Confirm();
                    break;
                case OrderStatus.ReadyForPickup:
                    order.Confirm();
                    order.MarkReadyForPickup();
                    break;
                case OrderStatus.OutForDelivery:
                    order.Confirm();
                    order.MarkReadyForPickup();
                    order.MoveOutForDelivery();
                    break;
                case OrderStatus.Delivered:
                    order.Confirm();
                    order.MarkReadyForPickup();
                    order.MoveOutForDelivery();
                    order.CompleteDelivery();
                    break;
                case OrderStatus.Canceled:
                    order.Cancel("Customer requested cancellation");
                    break;
            }

            db.Orders.Add(order);
        }

        Console.WriteLine($"Seeded {orders.Length} orders successfully!");
    }
}


