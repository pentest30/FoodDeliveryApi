# Food Delivery API

A .NET 8 Minimal API for a food delivery application with full pagination support and Swagger documentation.

## Features

- ✅ RESTful API endpoints for Categories, Restaurants, Orders, and Profile
- ✅ Full pagination support on list endpoints
- ✅ Advanced filtering options (category, status, rating, etc.)
- ✅ Swagger/OpenAPI documentation
- ✅ CORS enabled for frontend integration
- ✅ JSON data storage

## Prerequisites

- .NET 8 SDK or higher
- Any code editor (Visual Studio, VS Code, Rider)

## Getting Started

### 1. Restore Dependencies

```bash
cd FoodDeliveryApi
dotnet restore
```

### 2. Run the Application

```bash
dotnet run
```

The API will start on `http://localhost:5000` (or `https://localhost:5001`)

### 3. Access Swagger UI

Open your browser and navigate to:
```
http://localhost:5000/swagger
```

## API Endpoints

### Categories
- `GET /api/categories` - Get all food categories

### Restaurants
- `GET /api/restaurants` - Get restaurants with pagination and filters
  - Query Parameters:
    - `page` (default: 1)
    - `pageSize` (default: 10, max: 100)
    - `category` - Filter by category name
    - `isOpenNow` - Filter by open status (true/false)
    - `city` - Filter by city name
    - `minRating` - Filter by minimum rating
    - `search` - Search by restaurant name or category
- `GET /api/restaurants/{id}` - Get restaurant by ID

### Orders
- `GET /api/orders` - Get orders with pagination and filters
  - Query Parameters:
    - `page` (default: 1)
    - `pageSize` (default: 10, max: 100)
    - `status` - Filter by order status
    - `restaurantName` - Filter by restaurant name
- `GET /api/orders/{id}` - Get order by ID

### Profile
- `GET /api/profile` - Get user profile

### Statistics
- `GET /api/statistics` - Get overall statistics

### System
- `GET /health` - Health check endpoint

## Example Requests

### Get all restaurants (first page, 10 items)
```bash
curl http://localhost:5000/api/restaurants
```

### Get restaurants filtered by category with pagination
```bash
curl "http://localhost:5000/api/restaurants?category=Pizza&page=1&pageSize=5"
```

### Get only open restaurants
```bash
curl "http://localhost:5000/api/restaurants?isOpenNow=true"
```

### Get orders with pagination
```bash
curl "http://localhost:5000/api/orders?page=1&pageSize=3"
```

## Pagination Response Format

All paginated endpoints return the following structure:

```json
{
  "data": [...],
  "page": 1,
  "pageSize": 10,
  "totalCount": 50,
  "totalPages": 5,
  "hasPreviousPage": false,
  "hasNextPage": true
}
```

## Project Structure

```
FoodDeliveryApi/
├── Data/
│   ├── categories.json
│   ├── restaurants.json
│   ├── orders.json
│   └── profile.json
├── Models/
│   ├── Category.cs
│   ├── Restaurant.cs
│   ├── Order.cs
│   ├── Profile.cs
│   └── PaginatedResult.cs
├── Program.cs
├── FoodDeliveryApi.csproj
└── README.md
```

## Development

### Build the Project
```bash
dotnet build
```

### Run in Watch Mode
```bash
dotnet watch run
```

### Publish for Production
```bash
dotnet publish -c Release
```

## CORS Configuration

CORS is enabled for all origins in development. For production, update the CORS policy in `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("https://your-frontend-domain.com")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```

## Technologies Used

- .NET 8
- ASP.NET Core Minimal API
- Swashbuckle (Swagger)
- System.Text.Json

## License

MIT
