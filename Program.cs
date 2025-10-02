using FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Extensions;
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

// Add Infrastructure Services
builder.Services.AddInfrastructureServices(builder.Configuration, builder.Environment);

// Add API Configuration
builder.Services.AddApiConfiguration();

// Add Swagger Configuration
builder.Services.AddSwaggerConfiguration();

var app = builder.Build();

// Configure Application
await app.ConfigureApplicationAsync();

// API version root
var api = app.MapGroup("/api/v1");

// ProblemDetails factory
IResult ValidationProblem(List<FluentValidation.Results.ValidationFailure> failures) => Results.Problem(
    title: "Validation Failed",
    statusCode: StatusCodes.Status400BadRequest,
    extensions: new Dictionary<string, object?>
    {
        ["errors"] = failures
            .GroupBy(f => f.PropertyName)
            .ToDictionary(g => g.Key, g => g.Select(f => f.ErrorMessage).ToArray())
    }
);

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.Run();

namespace FoodDeliveryApi
{
    public partial class Program { }
}