using MongoDB.Driver;
using System.Text.Json;

namespace FoodDeliveryApi;

public class SimpleMongoSeeder
{
    public static async Task SeedAsync()
    {
        try
        {
            Console.WriteLine("Starting simple MongoDB seeding...");
            
            var client = new MongoClient("mongodb://admin:password123@localhost:27017/foodapp?authSource=admin");
            var database = client.GetDatabase("foodapp");
            
            // Clear existing data
            await database.DropCollectionAsync("tenants");
            await database.DropCollectionAsync("categories");
            await database.DropCollectionAsync("restaurants");
            await database.DropCollectionAsync("orders");
            await database.DropCollectionAsync("users");
            
            Console.WriteLine("Cleared existing data.");
            
            // Seed root tenant
            var tenantsCollection = database.GetCollection<object>("tenants");
            var rootTenant = new
            {
                _id = "root-tenant",
                Identifier = "root-tenant",
                Name = "Root Tenant",
                Url = "https://root.example.com",
                Email = "admin@root.example.com",
                Mobile = "+1000000000",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            await tenantsCollection.InsertOneAsync(rootTenant);
            Console.WriteLine("Seeded root tenant.");
            
            // Seed restaurant tenants
            var restaurantTenants = new[]
            {
                new { _id = "tenant-rest-001", Identifier = "tenant-rest-001", Name = "Pizza Palace Tenant", Url = "https://rest-001.example.com", Email = "admin@rest-001.example.com", Mobile = "+1111111111", CreatedAt = DateTime.UtcNow, IsActive = true },
                new { _id = "tenant-rest-002", Identifier = "tenant-rest-002", Name = "Burger King Tenant", Url = "https://rest-002.example.com", Email = "admin@rest-002.example.com", Mobile = "+2222222222", CreatedAt = DateTime.UtcNow, IsActive = true },
                new { _id = "tenant-rest-003", Identifier = "tenant-rest-003", Name = "Sushi Master Tenant", Url = "https://rest-003.example.com", Email = "admin@rest-003.example.com", Mobile = "+3333333333", CreatedAt = DateTime.UtcNow, IsActive = true },
                new { _id = "tenant-rest-004", Identifier = "tenant-rest-004", Name = "Taco Bell Tenant", Url = "https://rest-004.example.com", Email = "admin@rest-004.example.com", Mobile = "+4444444444", CreatedAt = DateTime.UtcNow, IsActive = true },
                new { _id = "tenant-rest-005", Identifier = "tenant-rest-005", Name = "Pasta House Tenant", Url = "https://rest-005.example.com", Email = "admin@rest-005.example.com", Mobile = "+5555555555", CreatedAt = DateTime.UtcNow, IsActive = true }
            };
            await tenantsCollection.InsertManyAsync(restaurantTenants);
            Console.WriteLine("Seeded restaurant tenants.");
            
            // Seed categories
            var categoriesCollection = database.GetCollection<object>("categories");
            var categories = new[]
            {
                new { _id = "cat-001", ExternalId = "cat-001", TenantId = "root-tenant", Name = "Pizza", Icon = "🍕", Color = "#FF6B35" },
                new { _id = "cat-002", ExternalId = "cat-002", TenantId = "root-tenant", Name = "Burgers", Icon = "🍔", Color = "#FF8C00" },
                new { _id = "cat-003", ExternalId = "cat-003", TenantId = "root-tenant", Name = "Sushi", Icon = "🍣", Color = "#4CAF50" },
                new { _id = "cat-004", ExternalId = "cat-004", TenantId = "root-tenant", Name = "Mexican", Icon = "🌮", Color = "#FF5722" },
                new { _id = "cat-005", ExternalId = "cat-005", TenantId = "root-tenant", Name = "Italian", Icon = "🍝", Color = "#9C27B0" },
                new { _id = "cat-006", ExternalId = "cat-006", TenantId = "root-tenant", Name = "Chinese", Icon = "🥡", Color = "#F44336" },
                new { _id = "cat-007", ExternalId = "cat-007", TenantId = "root-tenant", Name = "Indian", Icon = "🍛", Color = "#FF9800" },
                new { _id = "cat-008", ExternalId = "cat-008", TenantId = "root-tenant", Name = "Desserts", Icon = "🍰", Color = "#E91E63" }
            };
            await categoriesCollection.InsertManyAsync(categories);
            Console.WriteLine("Seeded categories.");
            
            // Seed restaurants
            var restaurantsCollection = database.GetCollection<object>("restaurants");
            var restaurants = new[]
            {
                new { _id = "rest-001", ExternalId = "rest-001", TenantId = "tenant-rest-001", Name = "Pizza Palace", Images = new[] { "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop" }, Rating = 4.5m, EtaMinutes = 25, DistanceKm = 1.2m, Categories = new[] { "Pizza", "Italian" }, City = "São Paulo", IsOpenNow = true, Icon = "🍕", PrimaryColor = "#FF6B35" },
                new { _id = "rest-002", ExternalId = "rest-002", TenantId = "tenant-rest-002", Name = "Burger King", Images = new[] { "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop" }, Rating = 4.2m, EtaMinutes = 20, DistanceKm = 0.8m, Categories = new[] { "Burgers", "Fast Food" }, City = "São Paulo", IsOpenNow = true, Icon = "🍔", PrimaryColor = "#FF8C00" },
                new { _id = "rest-003", ExternalId = "rest-003", TenantId = "tenant-rest-003", Name = "Sushi Master", Images = new[] { "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop" }, Rating = 4.8m, EtaMinutes = 30, DistanceKm = 2.1m, Categories = new[] { "Sushi", "Japanese" }, City = "São Paulo", IsOpenNow = true, Icon = "🍣", PrimaryColor = "#4CAF50" },
                new { _id = "rest-004", ExternalId = "rest-004", TenantId = "tenant-rest-004", Name = "Taco Bell", Images = new[] { "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop" }, Rating = 4.0m, EtaMinutes = 15, DistanceKm = 1.5m, Categories = new[] { "Mexican", "Fast Food" }, City = "São Paulo", IsOpenNow = true, Icon = "🌮", PrimaryColor = "#FF5722" },
                new { _id = "rest-005", ExternalId = "rest-005", TenantId = "tenant-rest-005", Name = "Pasta House", Images = new[] { "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop" }, Rating = 4.6m, EtaMinutes = 35, DistanceKm = 3.2m, Categories = new[] { "Italian", "Pasta" }, City = "São Paulo", IsOpenNow = true, Icon = "🍝", PrimaryColor = "#9C27B0" }
            };
            await restaurantsCollection.InsertManyAsync(restaurants);
            Console.WriteLine("Seeded restaurants.");
            
            // Seed orders
            var ordersCollection = database.GetCollection<object>("orders");
            var orders = new[]
            {
                new { _id = "order-001", ExternalId = "order-001", TenantId = "tenant-rest-001", Status = "Delivered", RestaurantName = "Pizza Palace", Total = 24.50m, DeliveryFee = 2.50m, EtaMinutes = 0, Items = new[] { new { Name = "Margherita Pizza", Quantity = 1, Price = 18.00m }, new { Name = "Garlic Bread", Quantity = 1, Price = 4.00m } } },
                new { _id = "order-002", ExternalId = "order-002", TenantId = "tenant-rest-002", Status = "In Progress", RestaurantName = "Burger King", Total = 15.75m, DeliveryFee = 1.50m, EtaMinutes = 15, Items = new[] { new { Name = "Whopper", Quantity = 1, Price = 12.00m }, new { Name = "Fries", Quantity = 1, Price = 2.25m } } },
                new { _id = "order-003", ExternalId = "order-003", TenantId = "tenant-rest-003", Status = "Ready for Pickup", RestaurantName = "Sushi Master", Total = 45.00m, DeliveryFee = 3.00m, EtaMinutes = 5, Items = new[] { new { Name = "Salmon Roll", Quantity = 2, Price = 18.00m }, new { Name = "Tuna Roll", Quantity = 1, Price = 12.00m } } }
            };
            await ordersCollection.InsertManyAsync(orders);
            Console.WriteLine("Seeded orders.");
            
            // Seed user profile
            var usersCollection = database.GetCollection<object>("users");
            var user = new
            {
                _id = "user-001",
                ExternalId = "user-001",
                TenantId = "root-tenant",
                Name = "João Silva",
                Email = "joao.silva@email.com",
                Phone = "+55 11 99999-9999",
                ProfileImages = new[] { "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
                Preferences = new { Language = "pt-BR", Theme = "light", Notifications = true, Promotions = true },
                Addresses = new[]
                {
                    new { _id = "addr-001", ExternalId = "addr-001", Label = "Casa", Street = "Rua das Flores, 123", Neighborhood = "Vila Madalena", City = "São Paulo", State = "SP", ZipCode = "05435-000", IsDefault = true },
                    new { _id = "addr-002", ExternalId = "addr-002", Label = "Trabalho", Street = "Av. Paulista, 1000", Neighborhood = "Bela Vista", City = "São Paulo", State = "SP", ZipCode = "01310-100", IsDefault = false }
                },
                PaymentMethods = new[]
                {
                    new { _id = "pay-001", ExternalId = "pay-001", Type = "CreditCard", Label = "Visa **** 1234", IsDefault = true },
                    new { _id = "pay-002", ExternalId = "pay-002", Type = "Cash", Label = "Dinheiro na entrega", IsDefault = false }
                }
            };
            await usersCollection.InsertOneAsync(user);
            Console.WriteLine("Seeded user profile.");
            
            Console.WriteLine("✅ Simple MongoDB seeding completed successfully!");
            Console.WriteLine($"\nSummary:");
            Console.WriteLine($"- 6 tenants (1 root + 5 restaurant tenants)");
            Console.WriteLine($"- 8 categories (shared)");
            Console.WriteLine($"- 5 restaurants (each with own tenant)");
            Console.WriteLine($"- 3 orders (assigned to restaurant tenants)");
            Console.WriteLine($"- 1 user profile (shared)");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error during simple seeding: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            throw;
        }
    }
}




