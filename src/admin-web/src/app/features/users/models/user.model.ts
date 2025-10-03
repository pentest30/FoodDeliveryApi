export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  isActive: boolean;
  emailConfirmed: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  roles: string[];
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  isActive: boolean;
  roles: string[];
}

export interface UpdateUserRequest {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
}

export interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserListResponse {
  users: User[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface UserListRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

