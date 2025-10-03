import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface RestaurantSectionDto {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
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
  available: boolean;
  quantity: number;
  images: string[];
  allergens: string[];
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

export interface SectionListResponse {
  items: RestaurantSectionDto[];
  data: RestaurantSectionDto[];
  total: number;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SectionListParams {
  q?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  restaurantId?: string;
  active?: boolean;
}

export interface CreateSectionDto {
  name: string;
  description: string;
  sortOrder: number;
  active: boolean;
  restaurantId: string;
}

export interface UpdateSectionDto {
  name?: string;
  description?: string;
  sortOrder?: number;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SectionsService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getSections(params: SectionListParams = {}): Observable<SectionListResponse> {
    // Since the backend only supports restaurant-specific sections,
    // we need to get all restaurants first, then get sections for each
    // This is a workaround until we have a proper backend endpoint
    console.warn('getSections: Using workaround to get sections from all restaurants. Consider implementing a backend endpoint for this.');
    
    // For now, return empty data - in a real implementation, you would:
    // 1. Get all restaurants
    // 2. Get sections for each restaurant
    // 3. Combine and filter results
    return of({
      items: [],
      data: [],
      total: 0,
      totalCount: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false
    });
  }

  getSectionsByRestaurant(restaurantId: string): Observable<RestaurantSectionDto[]> {
    const url = `${this.baseUrl}/sections?restaurantId=${restaurantId}`;
    
    return this.http.get<RestaurantSectionDto[]>(url).pipe(
      catchError(error => {
        console.error('Error fetching sections for restaurant:', error);
        return of([]);
      })
    );
  }

  getSectionById(sectionId: string): Observable<RestaurantSectionDto> {
    const url = `${this.baseUrl}/sections/${sectionId}`;
    return this.http.get<RestaurantSectionDto>(url).pipe(
      catchError(error => {
        console.error('Error fetching section:', error);
        throw error;
      })
    );
  }

  createSection(section: CreateSectionDto): Observable<RestaurantSectionDto> {
    const url = `${this.baseUrl}/sections`;
    return this.http.post<RestaurantSectionDto>(url, section).pipe(
      catchError(error => {
        console.error('Error creating section:', error);
        throw error;
      })
    );
  }

  updateSection(sectionId: string, section: UpdateSectionDto): Observable<RestaurantSectionDto> {
    const url = `${this.baseUrl}/sections/${sectionId}`;
    return this.http.put<RestaurantSectionDto>(url, section).pipe(
      catchError(error => {
        console.error('Error updating section:', error);
        throw error;
      })
    );
  }

  deleteSection(sectionId: string): Observable<void> {
    const url = `${this.baseUrl}/sections/${sectionId}`;
    return this.http.delete<void>(url).pipe(
      catchError(error => {
        console.error('Error deleting section:', error);
        throw error;
      })
    );
  }

  uploadSectionImage(sectionId: string, file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${this.baseUrl}/sections/${sectionId}/images`;

    return this.http.post<{ imageUrl: string }>(url, formData).pipe(
      catchError(error => {
        console.error('Error uploading section image:', error);
        throw error;
      })
    );
  }

  deleteSectionImage(sectionId: string, imageUrl: string): Observable<void> {
    const url = `${this.baseUrl}/sections/${sectionId}/images/${encodeURIComponent(imageUrl)}`;
    return this.http.delete<void>(url).pipe(
      catchError(error => {
        console.error('Error deleting section image:', error);
        throw error;
      })
    );
  }
}
