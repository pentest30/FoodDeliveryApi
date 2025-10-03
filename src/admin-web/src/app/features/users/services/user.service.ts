import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  ChangePasswordRequest,
  UserListResponse,
  UserListRequest 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly API_BASE = environment.apiUrl;

  // Get users list with pagination and filtering
  getUsers(request: UserListRequest = {}): Observable<UserListResponse> {
    let params = new HttpParams();
    
    if (request.pageNumber) params = params.set('pageNumber', request.pageNumber.toString());
    if (request.pageSize) params = params.set('pageSize', request.pageSize.toString());
    if (request.searchTerm) params = params.set('searchTerm', request.searchTerm);
    if (request.isActive !== undefined) params = params.set('isActive', request.isActive.toString());
    if (request.sortBy) params = params.set('sortBy', request.sortBy);
    if (request.sortDirection) params = params.set('sortDirection', request.sortDirection);

    return this.http.get<UserListResponse>(`${this.API_BASE}/users`, { params });
  }

  // Get user by ID
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_BASE}/users/${id}`);
  }

  // Create new user
  createUser(user: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.API_BASE}/users`, user);
  }

  // Update user
  updateUser(user: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.API_BASE}/users/${user.id}`, user);
  }

  // Delete user
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/users/${id}`);
  }

  // Change user password
  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.API_BASE}/users/${request.userId}/password`, request);
  }

  // Toggle user active status
  toggleUserStatus(id: string, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${this.API_BASE}/users/${id}/status`, { isActive });
  }

  // Get available roles
  getRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_BASE}/users/roles`);
  }
}
