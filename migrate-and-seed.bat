@echo off
echo Starting migration and seeding process...

echo Building project...
dotnet build --configuration Release --verbosity quiet

if %ERRORLEVEL% neq 0 (
    echo Build failed. Please fix build errors first.
    exit /b 1
)

echo Build successful!

echo Running application to trigger migration and seeding...
echo The application will start, perform migration and seeding, then you can stop it with Ctrl+C

set PersistenceProvider=EfCore
set SeedAll=true

dotnet run --configuration Release

echo Migration and seeding completed!
pause
