import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface MenuItemDto {
  id: string;
  restaurantSectionId: string;
  name: string;
  description?: string;
  basePrice?: number;
  quantity: number;
  available: boolean;
  images: string[];
  allergens: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMenuItemDto {
  name: string;
  description?: string;
  basePrice?: number;
  quantity?: number;
  available?: boolean;
  images?: string[];
  allergens?: string[];
  sectionId: string;
  restaurantId: string;
}

export interface UpdateMenuItemDto {
  name?: string;
  description?: string;
  basePrice?: number;
  quantity?: number;
  available?: boolean;
  images?: string[];
  allergens?: string[];
  sectionId?: string;
  restaurantId?: string;
}

export interface MenuItemListResponse {
  items: MenuItemDto[];
  data: MenuItemDto[];
  total: number;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface MenuItemListParams {
  q?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  restaurantId?: string;
  sectionId?: string;
  available?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MenuItemsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getMenuItems(params: MenuItemListParams = {}): Observable<MenuItemListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.restaurantId) queryParams.append('restaurantId', params.restaurantId);
    if (params.sectionId) queryParams.append('sectionId', params.sectionId);
    if (params.q) queryParams.append('search', params.q);
    if (params.available !== undefined) queryParams.append('available', params.available.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const url = `${this.baseUrl}/sections/menu-items?${queryParams.toString()}`;
    
    return this.http.get<MenuItemListResponse>(url).pipe(
      catchError(error => {
        console.error('Error fetching menu items:', error);
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
      })
    );
  }

  getMenuItemsByRestaurant(restaurantId: string): Observable<MenuItemDto[]> {
    // Get all sections for the restaurant and extract menu items
    const url = `${this.baseUrl}/sections?restaurantId=${restaurantId}`;
    
    return this.http.get<any[]>(url).pipe(
      map(sections => {
        // Extract menu items from all sections
        const menuItems: MenuItemDto[] = [];
        sections.forEach(section => {
          if (section.menuItems && Array.isArray(section.menuItems)) {
            section.menuItems.forEach((item: any) => {
              menuItems.push({
                id: item.id,
                restaurantSectionId: item.restaurantSectionId,
                name: item.name,
                description: item.description,
                basePrice: item.basePrice,
                quantity: item.quantity,
                available: item.available,
                images: item.images || [],
                allergens: item.allergens || [],
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
              });
            });
          }
        });
        return menuItems;
      }),
      catchError(error => {
        console.error('Error fetching menu items for restaurant:', error);
        return of([]);
      })
    );
  }

  getMenuItemsBySection(sectionId: string): Observable<MenuItemDto[]> {
    const url = `${this.baseUrl}/sections/${sectionId}`;
    return this.http.get<any>(url).pipe(
      map(section => {
        if (section.menuItems && Array.isArray(section.menuItems)) {
          return section.menuItems.map((item: any) => ({
            id: item.id,
            restaurantSectionId: item.restaurantSectionId,
            name: item.name,
            description: item.description,
            basePrice: item.basePrice,
            quantity: item.quantity,
            available: item.available,
            images: item.images || [],
            allergens: item.allergens || [],
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching menu items for section:', error);
        return of([]);
      })
    );
  }

  getMenuItemById(menuItemId: string): Observable<MenuItemDto> {
    // Since we don't have a direct endpoint for menu items, we need to search through sections
    // This is a workaround - ideally the backend should have a direct endpoint
    const url = `${this.baseUrl}/sections`; // This would need to be implemented properly
    
    return this.http.get<any[]>(url).pipe(
      map(sections => {
        for (const section of sections) {
          if (section.menuItems && Array.isArray(section.menuItems)) {
            const item = section.menuItems.find((item: any) => item.id === menuItemId);
            if (item) {
              return {
                id: item.id,
                restaurantSectionId: item.restaurantSectionId,
                name: item.name,
                description: item.description,
                basePrice: item.basePrice,
                quantity: item.quantity,
                available: item.available,
                images: item.images || [],
                allergens: item.allergens || [],
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
              };
            }
          }
        }
        throw new Error('Menu item not found');
      }),
      catchError(error => {
        console.error('Error fetching menu item:', error);
        throw error;
      })
    );
  }

  createMenuItem(sectionId: string, menuItem: CreateMenuItemDto): Observable<MenuItemDto> {
    const url = `${this.baseUrl}/sections/${sectionId}/menu-items`;
    return this.http.post<MenuItemDto>(url, menuItem).pipe(
      catchError(error => {
        console.error('Error creating menu item:', error);
        throw error;
      })
    );
  }

  updateMenuItem(sectionId: string, menuItemId: string, menuItem: UpdateMenuItemDto): Observable<MenuItemDto> {
    // Since we don't have a direct update endpoint for menu items, we'll need to implement this
    // For now, we'll use the create endpoint as a workaround
    const url = `${this.baseUrl}/sections/${sectionId}/menu-items/${menuItemId}`;
    return this.http.put<MenuItemDto>(url, menuItem).pipe(
      catchError(error => {
        console.error('Error updating menu item:', error);
        throw error;
      })
    );
  }

  deleteMenuItem(sectionId: string, menuItemId: string): Observable<void> {
    const url = `${this.baseUrl}/sections/${sectionId}/menu-items/${menuItemId}`;
    return this.http.delete<void>(url).pipe(
      catchError(error => {
        console.error('Error deleting menu item:', error);
        throw error;
      })
    );
  }

  uploadMenuItemImage(sectionId: string, menuItemId: string, file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${this.baseUrl}/sections/${sectionId}/menu-items/${menuItemId}/images`;

    return this.http.post<{ imageUrl: string }>(url, formData).pipe(
      catchError(error => {
        console.error('Error uploading menu item image:', error);
        throw error;
      })
    );
  }

  deleteMenuItemImage(sectionId: string, menuItemId: string, imageUrl: string): Observable<void> {
    const url = `${this.baseUrl}/sections/${sectionId}/menu-items/${menuItemId}/images/${encodeURIComponent(imageUrl)}`;
    return this.http.delete<void>(url).pipe(
      catchError(error => {
        console.error('Error deleting menu item image:', error);
        throw error;
      })
    );
  }

  getSectionsForRestaurant(restaurantId: string): Observable<{id: string, name: string}[]> {
    const url = `${this.baseUrl}/sections?restaurantId=${restaurantId}`;
    return this.http.get<any[]>(url).pipe(
      map(sections => sections.map(section => ({
        id: section.id,
        name: section.name
      }))),
      catchError(error => {
        console.error('Error fetching sections for restaurant:', error);
        return of([]);
      })
    );
  }
}
