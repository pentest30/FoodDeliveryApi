import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Mock authentication token - in a real app, this would come from an auth service
  const token = 'mock-jwt-token';
  const tenantId = 'mock-tenant-id';

  // Clone the request and add authentication headers
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Id': tenantId
    }
  });

  return next(authReq);
};