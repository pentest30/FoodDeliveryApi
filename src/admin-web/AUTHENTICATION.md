# Authentication Implementation

This document describes the authentication implementation for the Food Delivery Admin Web application.

## Overview

The authentication system provides:
- JWT token-based authentication
- Multi-tenant support with tenant ID injection
- Automatic token management and storage
- Route protection with authentication guards
- HTTP interceptor for automatic header injection

## Components

### 1. Authentication Service (`core/services/auth.service.ts`)

The `AuthService` handles:
- User login with email/password and tenant ID
- Token storage and retrieval
- User information management
- Authentication state management
- Logout functionality

**Key Methods:**
- `login(credentials, tenantId)` - Authenticate user
- `getUserInfo()` - Get current user information
- `logout()` - Clear authentication data
- `isAuthenticated()` - Check authentication status

### 2. HTTP Interceptor (`core/interceptors/auth.interceptor.ts`)

Automatically injects:
- `Authorization: Bearer <token>` header for authenticated requests
- `X-Tenant-Id: <tenantId>` header for all requests
- Skips header injection for login requests

### 3. Authentication Guard (`core/guards/auth.guard.ts`)

Protects routes by:
- Checking authentication state
- Redirecting to login page if not authenticated
- Allowing access to protected routes only when authenticated

### 4. Login Component (`pages/login/login.component.ts`)

Provides:
- Login form with email, password, and tenant ID fields
- Form validation
- Error handling
- Loading states
- Demo credentials display

## Usage

### Login Process

1. User enters email and password
2. System sends login request with default tenant ID header
3. On success, JWT token is stored locally
4. User is redirected to dashboard
5. All subsequent requests include token and tenant ID

### Demo Credentials

**Admin User:**
- Email: `admin@fooddelivery.com`
- Password: `Admin@123`

**Customer User:**
- Email: `customer@fooddelivery.com`
- Password: `Customer@123`

### Route Protection

All routes except `/login` are protected by the `AuthGuard`. Unauthenticated users are automatically redirected to the login page.

### HTTP Requests

All HTTP requests automatically include:
- `Authorization: Bearer <token>` (if authenticated)
- `X-Tenant-Id: <tenantId>` (from stored tenant ID)

## Configuration

### API Endpoints

The authentication service is configured to use:
- Base URL: `http://localhost:5000/api/v1`
- Login endpoint: `/auth/login`
- User info endpoint: `/auth/userinfo`

### Storage Keys

- Token: `auth_token`
- User info: `user_info`
- Tenant ID: `tenant_id`

## Security Features

- JWT tokens are stored in localStorage
- Automatic token validation
- Secure logout with data cleanup
- Tenant isolation through header injection
- Route protection for sensitive pages

## Error Handling

- Network errors are caught and displayed
- Invalid credentials show user-friendly messages
- Authentication failures redirect to login
- Token expiration is handled gracefully
