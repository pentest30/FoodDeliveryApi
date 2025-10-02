# PowerShell script to run migration and seed data
Write-Host "Starting migration and seeding process..." -ForegroundColor Green

# Build the project first
Write-Host "Building project..." -ForegroundColor Yellow
dotnet build --configuration Release --verbosity quiet

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Please fix build errors first." -ForegroundColor Red
    exit 1
}

Write-Host "Build successful!" -ForegroundColor Green

# Run the application to trigger migration and seeding
Write-Host "Running application to trigger migration and seeding..." -ForegroundColor Yellow
Write-Host "The application will start, perform migration and seeding, then you can stop it with Ctrl+C" -ForegroundColor Cyan

# Set environment variables for seeding
$env:PersistenceProvider = "EfCore"
$env:SeedAll = "true"

# Run the application
dotnet run --configuration Release

Write-Host "Migration and seeding completed!" -ForegroundColor Green
