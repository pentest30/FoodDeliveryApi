@echo off
echo Starting MongoDB Docker containers...
docker-compose up -d mongodb

echo Waiting for MongoDB to be ready...
timeout /t 10 /nobreak

echo Running EF Core MongoDB seeding...
dotnet run --project . --configuration Debug

echo Seeding completed!
pause

