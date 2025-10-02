@echo off
echo Starting MongoDB Docker containers...
docker-compose up -d mongodb
echo Waiting for MongoDB to be ready...
timeout /t 5 >nul
echo Running simple MongoDB seeding...
dotnet run --project . --configuration Debug -- SimpleMongoSeeder
echo Seeding completed!
pause




