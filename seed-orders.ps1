# PowerShell script to seed orders
Write-Host "Starting order seeding process..." -ForegroundColor Green

# Set environment variables for seeding
$env:PersistenceProvider = "EfCore"
$env:SeedAll = "true"

# Run the application to trigger seeding
Write-Host "Running application to seed orders..." -ForegroundColor Yellow
Write-Host "The application will start, perform seeding, then you can stop it with Ctrl+C" -ForegroundColor Cyan

# Run the application
dotnet run --configuration Release

Write-Host "Order seeding completed!" -ForegroundColor Green
