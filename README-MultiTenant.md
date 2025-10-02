# Multi-Tenant Implementation

This document describes the multi-tenant implementation using Finbuckle.MultiTenant for the Food Delivery API.

## Overview

The application now supports multi-tenancy using a shared database/schema approach where tenants are customers with the following properties:
- **Url**: Tenant's website URL
- **Email**: Tenant's contact email
- **Mobile**: Tenant's contact phone number

## Features Implemented

### 1. Tenant Resolution Strategies

The system supports three tenant resolution strategies:

- **Host Resolution**: Resolves tenant from subdomain (e.g., `tenant1.example.com`)
- **Header Resolution**: Resolves tenant from `X-Tenant-Id` header
- **Query Resolution**: Resolves tenant from `tenant` query parameter

### 2. Data Stores

Two tenant stores are implemented:

- **EF Core Store**: For SQLite/SQL Server persistence
- **MongoDB Store**: For MongoDB persistence

### 3. Global Tenant Filtering

All entities now include a `TenantId` property for automatic tenant filtering:
- `Restaurant`
- `Order` 
- `Category`
- `UserProfile`

### 4. Tenant Management API

Complete CRUD operations for tenant management:

- `GET /api/v1/tenants` - List all tenants
- `GET /api/v1/tenants/{id}` - Get tenant by ID
- `GET /api/v1/tenants/identifier/{identifier}` - Get tenant by identifier
- `POST /api/v1/tenants` - Create new tenant
- `PUT /api/v1/tenants/{id}` - Update tenant
- `DELETE /api/v1/tenants/{identifier}` - Delete tenant

### 5. Validation

Comprehensive validation for tenant data:
- Identifier format validation
- URL format validation
- Email format validation
- Phone number format validation

### 6. Testing

- Unit tests for `TenantService`
- Integration tests for tenant endpoints
- Mock-based testing for tenant operations

## Usage Examples

### Creating a Tenant

```bash
curl -X POST "https://api.example.com/api/v1/tenants" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "tenant1",
    "name": "Restaurant ABC",
    "url": "https://restaurant-abc.com",
    "email": "contact@restaurant-abc.com",
    "mobile": "+1234567890"
  }'
```

### Accessing Tenant-Specific Data

The system automatically filters data based on the resolved tenant:

- **Subdomain**: `https://tenant1.api.example.com/api/v1/restaurants`
- **Header**: `curl -H "X-Tenant-Id: tenant1" https://api.example.com/api/v1/restaurants`
- **Query**: `https://api.example.com/api/v1/restaurants?tenant=tenant1`

## Configuration

The multi-tenant system is automatically configured based on the `PersistenceProvider` setting:

- `EfCore`: Uses EF Core store with SQLite
- `Mongo`: Uses MongoDB store

## Middleware

The `UseMultiTenant()` middleware is automatically applied to resolve tenant context for all requests.

## Security

- Tenant isolation is enforced at the data layer
- All entities are automatically filtered by tenant
- Tenant context is required for all operations
