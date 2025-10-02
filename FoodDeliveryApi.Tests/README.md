# FoodDeliveryApi Tests

## Test Structure

### Unit Tests
- **Services**: Test application layer services with mocked repositories
- **Business Logic**: Validate business rules and validation logic
- **Error Handling**: Test exception scenarios

### Integration Tests
- **MongoDB**: Real MongoDB container using Testcontainers
- **EF Core**: In-memory database for fast testing
- **End-to-End**: Full CRUD operations with real repositories

## Running Tests

### All Tests
```bash
dotnet test
```

### Unit Tests Only
```bash
dotnet test --filter Category=Unit
```

### Integration Tests Only
```bash
dotnet test --filter Category=Integration
```

### Specific Test Class
```bash
dotnet test --filter "ClassName=RestaurantServiceTests"
```

## Test Categories

### Unit Tests
- `RestaurantServiceTests`: Business validation, rating constraints
- `CategoryServiceTests`: Duplicate name prevention, required fields
- `OrderServiceTests`: Item validation, total calculation
- `UserServiceTests`: Email uniqueness, required field validation

### Integration Tests
- `MongoIntegrationTests`: Full MongoDB operations with Testcontainers
- `EfIntegrationTests`: Full EF Core operations with in-memory database

## Test Data

Tests use realistic test data:
- Restaurants with ratings, categories, locations
- Orders with items and totals
- Users with addresses and payment methods
- Categories with icons and colors

## Coverage

Tests cover:
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Search and filtering
- ✅ Business rule validation
- ✅ Error scenarios
- ✅ Repository interactions
- ✅ Database persistence
