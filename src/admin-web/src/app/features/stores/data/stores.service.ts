import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface RestaurantDto {
  id: string;
  externalId?: string;
  tenantId?: string;
  name: string;
  images: string[];
  rating: number;
  etaMinutes: number;
  distanceKm: number;
  city: string;
  email: string;
  mobile: string;
  isOpenNow: boolean;
  icon: string;
  primaryColor: string;
  createdAt?: string;
  updatedAt?: string;
  tenantName?: string;
  // Restaurant management specific fields
  addressLine?: string;
  addressLine1?: string;
  lat?: number;
  lng?: number;
  serviceRadiusKm?: number;
  coverImageId?: string;
  coverImageUrl?: string;
  // Menu sections
  sections: RestaurantSectionDto[];
  categories: any[];
  categoryIds: string[];
}

export interface RestaurantSectionDto {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
  active: boolean;
  images: string[];
  menuItems: RestaurantMenuItemDto[];
  createdAt: string;
  updatedAt?: string;
}

export interface RestaurantMenuItemDto {
  id: string;
  restaurantId: string;
  restaurantSectionId: string;
  name: string;
  description?: string;
  basePrice?: number;
  currency: string;
  active: boolean;
  images: string[];
  quantity: number;
  variants: MenuItemVariantDto[];
  createdAt: string;
  updatedAt?: string;
}

export interface MenuItemVariantDto {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  currency: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

export interface RestaurantListResponse {
  items: RestaurantDto[];
  data: RestaurantDto[];
  total: number;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface RestaurantListParams {
  q?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  city?: string;
  tenant?: string;
  isOpen?: boolean;
  rating?: number;
}

export interface StoreImageDto {
  id: string;
  storeId: string;
  url: string;
  thumbnailUrl?: string;
  isCover: boolean;
  uploadedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantsService {
  private readonly http = inject(HttpClient);
  private readonly API_BASE = environment.apiUrl;
  
  /**
   * List restaurants with pagination, search, and filtering
   */
  listRestaurants(params: RestaurantListParams = {}): Observable<RestaurantListResponse> {
    // Use real API call instead of mock data
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.set('q', params.q);
    if (params.city) queryParams.set('city', params.city);
    if (params.isOpen !== undefined) queryParams.set('isOpen', params.isOpen.toString());
    if (params.rating) queryParams.set('rating', params.rating.toString());
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    if (params.sort) queryParams.set('sort', params.sort);

    return this.http.get<any>(`${this.API_BASE}/restaurants?${queryParams.toString()}`).pipe(
      map(response => {
        // Map server response to expected format
        return {
          items: response.data || response.items || [],
          data: response.data || [],
          total: response.totalCount || response.total || 0,
          totalCount: response.totalCount || 0,
          page: response.page || 1,
          pageSize: response.pageSize || 10,
          totalPages: response.totalPages || 1,
          hasPreviousPage: response.hasPreviousPage || false,
          hasNextPage: response.hasNextPage || false
        } as RestaurantListResponse;
      }),
      catchError(error => {
        console.error('Error fetching restaurants:', error);
        // Fallback to empty result on error
        return of({ 
          items: [], 
          data: [],
          total: 0, 
          totalCount: 0,
          page: 1,
          pageSize: 10,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false
        });
      })
    );
  }

  /**
   * Get a single restaurant by ID
   */
  getRestaurant(id: string): Observable<RestaurantDto> {
    return this.http.get<RestaurantDto>(`${this.API_BASE}/restaurants/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching restaurant:', error);
        throw error;
      })
    );
  }

  /**
   * Create a new restaurant
   */
  createRestaurant(dto: Partial<RestaurantDto>): Observable<RestaurantDto> {
    return this.http.post<RestaurantDto>(`${this.API_BASE}/restaurants`, dto).pipe(
      catchError(error => {
        console.error('Error creating restaurant:', error);
        throw error;
      })
    );
  }

  /**
   * Update an existing restaurant
   */
  updateRestaurant(id: string, dto: Partial<RestaurantDto>): Observable<RestaurantDto> {
    return this.http.put<RestaurantDto>(`${this.API_BASE}/restaurants/${id}`, dto).pipe(
      catchError(error => {
        console.error('Error updating restaurant:', error);
        throw error;
      })
    );
  }

  /**
   * Delete a restaurant
   */
  deleteRestaurant(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/restaurants/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting restaurant:', error);
        throw error;
      })
    );
  }

  /**
   * Get restaurant images
   */
  getRestaurantImages(restaurantId: string): Observable<StoreImageDto[]> {
    return this.http.get<StoreImageDto[]>(`${this.API_BASE}/restaurants/${restaurantId}/images`).pipe(
      catchError(error => {
        console.error('Error fetching restaurant images:', error);
        return of([]);
      })
    );
  }

  /**
   * Upload restaurant image
   */
  uploadRestaurantImage(restaurantId: string, file: File): Observable<StoreImageDto> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<StoreImageDto>(`${this.API_BASE}/restaurants/${restaurantId}/images`, formData).pipe(
      catchError(error => {
        console.error('Error uploading restaurant image:', error);
        throw error;
      })
    );
  }

  /**
   * Set cover image
   */
  setCoverImage(restaurantId: string, imageId: string): Observable<void> {
    return this.http.put<void>(`${this.API_BASE}/restaurants/${restaurantId}/images/${imageId}/cover`, {}).pipe(
      catchError(error => {
        console.error('Error setting cover image:', error);
        throw error;
      })
    );
  }

  /**
   * Delete restaurant image
   */
  deleteRestaurantImage(restaurantId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/restaurants/${restaurantId}/images/${imageId}`).pipe(
      catchError(error => {
        console.error('Error deleting restaurant image:', error);
        throw error;
      })
    );
  }

  /**
   * Get unique cities for filter dropdown
   */
  getCities(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_BASE}/restaurants/cities`).pipe(
      catchError(error => {
        console.error('Error fetching cities:', error);
        return of([]);
      })
    );
  }

  /**
   * Get unique tenants for filter dropdown
   */
  getTenants(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_BASE}/tenants`).pipe(
      catchError(error => {
        console.error('Error fetching tenants:', error);
        return of([]);
      })
    );
  }

  /**
   * Get restaurant sections (menu categories)
   */
  getRestaurantSections(restaurantId: string): Observable<RestaurantSectionDto[]> {
    return this.http.get<RestaurantSectionDto[]>(`${this.API_BASE}/restaurants/${restaurantId}/sections`).pipe(
      catchError(error => {
        console.error('Error fetching restaurant sections:', error);
        return of([]);
      })
    );
  }

  /**
   * Create restaurant section
   */
  createRestaurantSection(restaurantId: string, section: Partial<RestaurantSectionDto>): Observable<RestaurantSectionDto> {
    return this.http.post<RestaurantSectionDto>(`${this.API_BASE}/restaurants/${restaurantId}/sections`, section).pipe(
      catchError(error => {
        console.error('Error creating restaurant section:', error);
        throw error;
      })
    );
  }

  /**
   * Update restaurant section
   */
  updateRestaurantSection(restaurantId: string, sectionId: string, section: Partial<RestaurantSectionDto>): Observable<RestaurantSectionDto> {
    return this.http.put<RestaurantSectionDto>(`${this.API_BASE}/restaurants/${restaurantId}/sections/${sectionId}`, section).pipe(
      catchError(error => {
        console.error('Error updating restaurant section:', error);
        throw error;
      })
    );
  }

  /**
   * Delete restaurant section
   */
  deleteRestaurantSection(restaurantId: string, sectionId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/restaurants/${restaurantId}/sections/${sectionId}`).pipe(
      catchError(error => {
        console.error('Error deleting restaurant section:', error);
        throw error;
      })
    );
  }
}