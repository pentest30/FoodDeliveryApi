@echo off
echo Starting MongoDB Docker containers...
docker-compose up -d mongodb
echo Waiting for MongoDB to be ready...
timeout /t 5 >nul
echo Running standalone MongoDB seeding...
cd MongoSeeder
dotnet run
cd ..
echo Seeding completed!
pause




