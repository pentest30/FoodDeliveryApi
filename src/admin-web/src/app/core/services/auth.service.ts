import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
}

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  roles: string[];
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  tenantId: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_info';
  private readonly TENANT_KEY = 'tenant_id';

  private authState = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    tenantId: null
  });

  public authState$ = this.authState.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);
    const tenantId = localStorage.getItem(this.TENANT_KEY);

    if (token && user && tenantId) {
      try {
        const userInfo = JSON.parse(user);
        this.authState.next({
          isAuthenticated: true,
          user: userInfo,
          token,
          tenantId
        });
      } catch (error) {
        this.clearAuth();
      }
    }
  }

  login(credentials: LoginRequest): Observable<boolean> {
    // Use a default tenant ID for the login request
    const defaultTenantId = '0f4b50b3-7116-4222-b17a-41a0aa6edef3';
    
    return this.http.post<LoginResponse>(`${this.API_BASE}/auth/login`, credentials, {
      headers: {
        'X-Tenant-Id': defaultTenantId,
        'Content-Type': 'application/json'
      }
    }).pipe(
      map(response => {
        if (response.accessToken) {
          // Extract tenant ID from JWT token
          const tenantIdFromToken = this.extractTenantIdFromToken(response.accessToken);
          const finalTenantId = tenantIdFromToken || defaultTenantId;
          
          
          // Store token and extracted tenant ID
          localStorage.setItem(this.TOKEN_KEY, response.accessToken);
          localStorage.setItem(this.TENANT_KEY, finalTenantId);
          
          // Update auth state immediately with token and tenant ID
          this.authState.next({
            isAuthenticated: true,
            user: null, // Will be updated after getUserInfo
            token: response.accessToken,
            tenantId: finalTenantId
          });
          
          // Get user info after setting the token
          this.getUserInfo().subscribe({
            next: (userInfo) => {
              localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
              this.authState.next({
                isAuthenticated: true,
                user: userInfo,
                token: response.accessToken,
                tenantId: finalTenantId
              });
            },
            error: (error) => {
              console.error('Failed to get user info:', error);
              // Still consider login successful even if user info fails
            }
          });

          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of(false);
      })
    );
  }

  getUserInfo(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.API_BASE}/auth/userinfo`);
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TENANT_KEY);
    this.authState.next({
      isAuthenticated: false,
      user: null,
      token: null,
      tenantId: null
    });
  }

  private extractTenantIdFromToken(token: string): string | null {
    try {
      // JWT tokens have 3 parts separated by dots: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Decode the payload (middle part)
      const payload = JSON.parse(atob(parts[1]));
      
      // Extract tenant_id from claims
      return payload.tenant_id || null;
    } catch (error) {
      console.error('Error extracting tenant ID from token:', error);
      return null;
    }
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    console.log('🔍 AuthService - getToken:', token ? 'Present' : 'Missing');
    return token;
  }

  getTenantId(): string | null {
    // First try to get from localStorage
    let tenantId = localStorage.getItem(this.TENANT_KEY);
    console.log('🔍 AuthService - getTenantId from localStorage:', tenantId);
    
    // If not found, try to extract from token
    if (!tenantId) {
      const token = this.getToken();
      console.log('🔍 AuthService - Token available for tenant extraction:', token ? 'Yes' : 'No');
      if (token) {
        tenantId = this.extractTenantIdFromToken(token);
        console.log('🔍 AuthService - Extracted tenant ID from token:', tenantId);
        if (tenantId) {
          // Store it for future use
          localStorage.setItem(this.TENANT_KEY, tenantId);
          console.log('✅ AuthService - Stored tenant ID in localStorage');
        }
      }
    }
    
    console.log('🔍 AuthService - Final tenant ID:', tenantId);
    return tenantId;
  }

  isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  getCurrentUser(): UserInfo | null {
    return this.authState.value.user;
  }
}
