import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    const tenantId = this.authService.getTenantId();

    console.log('🔍 AuthInterceptor - URL:', req.url);
    console.log('🔍 AuthInterceptor - Method:', req.method);
    console.log('🔍 AuthInterceptor - Token:', token ? 'Present' : 'Missing');
    console.log('🔍 AuthInterceptor - TenantId:', tenantId);

    // Skip adding headers only for login requests
    if (req.url.includes('/auth/login')) {
      console.log('🔍 AuthInterceptor - Skipping login request');
      return next.handle(req);
    }

    let authReq = req;
    const headers: { [key: string]: string } = {};

    // Add tenant ID header if available
    if (tenantId) {
      headers['X-Tenant-Id'] = tenantId;
      console.log('✅ AuthInterceptor - Adding X-Tenant-Id:', tenantId);
    } else {
      console.log('❌ AuthInterceptor - No tenant ID available');
    }

    // Add authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ AuthInterceptor - Adding Authorization header');
    } else {
      console.log('❌ AuthInterceptor - No token available');
    }

    // Clone request with all headers
    if (Object.keys(headers).length > 0) {
      authReq = req.clone({
        setHeaders: headers
      });
      console.log('✅ AuthInterceptor - Headers added:', headers);
    } else {
      console.log('❌ AuthInterceptor - No headers to add');
    }

    return next.handle(authReq);
  }
}