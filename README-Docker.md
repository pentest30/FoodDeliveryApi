# MongoDB Docker Setup

## Quick Start

1. **Start MongoDB and Mongo Express:**
   ```bash
   docker-compose up -d
   ```

2. **Access Mongo Express (Web UI):**
   - URL: http://localhost:8081
   - Username: admin
   - Password: admin

3. **Stop services:**
   ```bash
   docker-compose down
   ```

## Services

- **MongoDB**: Port 27017
  - Username: admin
  - Password: password123
  - Database: foodapp

- **Mongo Express**: Port 8081 (Web UI for MongoDB)

## Connection String

Update `appsettings.json`:
```json
{
  "Mongo": {
    "ConnectionString": "mongodb://admin:password123@localhost:27017",
    "Database": "foodapp"
  }
}
```

## Data Persistence

MongoDB data is persisted in Docker volume `mongodb_data`.
