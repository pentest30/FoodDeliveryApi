@echo off
echo ====================================
echo Food Delivery API - Starting...
echo ====================================
echo.

cd /d "%~dp0"

echo Restoring dependencies...
dotnet restore

echo.
echo Building project...
dotnet build

echo.
echo Starting API server...
echo Swagger UI will be available at: http://localhost:5000/swagger
echo.

dotnet run
