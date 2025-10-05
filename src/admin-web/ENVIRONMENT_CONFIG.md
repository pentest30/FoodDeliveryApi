# Environment Configuration

This document describes the environment configuration setup for the Food Delivery Admin Web application.

## Overview

The application uses Angular's environment configuration system to manage different settings for development, staging, and production environments.

## Environment Files

### 1. Development Environment (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api/v1',
  authUrl: 'http://localhost:5000/api/v1',
  appName: 'Food Delivery Admin',
  version: '1.0.0'
};
```

### 2. Development Environment (`src/environments/environment.dev.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api/v1',
  authUrl: 'http://localhost:5000/api/v1',
  appName: 'Food Delivery Admin (Dev)',
  version: '1.0.0-dev'
};
```

### 3. Production Environment (`src/environments/environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.fooddelivery.com/api/v1',
  authUrl: 'https://api.fooddelivery.com/api/v1',
  appName: 'Food Delivery Admin',
  version: '1.0.0'
};
```

## Configuration Properties

| Property | Description | Development | Production |
|----------|-------------|-------------|------------|
| `production` | Build mode flag | `false` | `true` |
| `apiUrl` | Base URL for API calls | `http://localhost:5000/api/v1` | `https://api.fooddelivery.com/api/v1` |
| `authUrl` | Base URL for authentication | `http://localhost:5000/api/v1` | `https://api.fooddelivery.com/api/v1` |
| `appName` | Application display name | `Food Delivery Admin` | `Food Delivery Admin` |
| `version` | Application version | `1.0.0` | `1.0.0` |

## Build Commands

### Development Build
```bash
npm run build -- --configuration=development
```
- Uses `environment.dev.ts`
- Includes source maps
- No optimization
- Larger bundle size for debugging

### Production Build
```bash
npm run build
# or
npm run build -- --configuration=production
```
- Uses `environment.prod.ts`
- Optimized bundle
- Minified code
- Smaller bundle size

### Serve Commands
```bash
# Development server (uses development config)
npm start

# Production server (uses production config)
npm run serve -- --configuration=production
```

## File Replacement

Angular automatically replaces the environment file during build based on the configuration:

- **Development**: `environment.ts` → `environment.dev.ts`
- **Production**: `environment.ts` → `environment.prod.ts`

This is configured in `angular.json`:

```json
{
  "fileReplacements": [
    {
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.prod.ts"
    }
  ]
}
```

## Usage in Code

Import the environment configuration in your services:

```typescript
import { environment } from '../../../environments/environment';

export class MyService {
  private readonly API_BASE = environment.apiUrl;
  
  getData() {
    return this.http.get(`${this.API_BASE}/data`);
  }
}
```

## Services Using Environment Configuration

- **AuthService**: Uses `environment.apiUrl` for authentication endpoints
- **UserService**: Uses `environment.apiUrl` for user management endpoints
- **OpenAPI Configuration**: Uses `environment.apiUrl` for all API calls

## Adding New Environments

To add a new environment (e.g., staging):

1. Create `src/environments/environment.staging.ts`
2. Add configuration to `angular.json`:

```json
{
  "configurations": {
    "staging": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.staging.ts"
        }
      ]
    }
  }
}
```

3. Build with: `npm run build -- --configuration=staging`

## Troubleshooting

### Common Issues

1. **Import Path Errors**: Ensure correct relative paths from your component to `src/environments/`
2. **Build Failures**: Check that all environment files exist and have valid TypeScript syntax
3. **Wrong API URLs**: Verify the `apiUrl` in your environment files matches your backend server

### Debugging

To verify which environment is being used:

```typescript
console.log('Current environment:', environment);
console.log('API URL:', environment.apiUrl);
```

## Security Notes

- Never commit sensitive data (API keys, secrets) to environment files
- Use different API endpoints for different environments
- Production builds should use HTTPS endpoints
- Consider using Angular's `APP_INITIALIZER` for runtime configuration loading


