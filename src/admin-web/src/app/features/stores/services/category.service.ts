import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly API_BASE = environment.apiUrl;

  /**
   * Get all categories
   */
  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.API_BASE}/categories`).pipe(
      catchError(error => {
        console.error('Error fetching categories:', error);
        return of([]);
      })
    );
  }

  /**
   * Get a single category by ID
   */
  getCategory(id: string): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(`${this.API_BASE}/categories/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching category:', error);
        throw error;
      })
    );
  }

  /**
   * Create a new category
   */
  createCategory(category: CreateCategoryRequest): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(`${this.API_BASE}/categories`, category).pipe(
      catchError(error => {
        console.error('Error creating category:', error);
        throw error;
      })
    );
  }

  /**
   * Update an existing category
   */
  updateCategory(id: string, category: UpdateCategoryRequest): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(`${this.API_BASE}/categories/${id}`, category).pipe(
      catchError(error => {
        console.error('Error updating category:', error);
        throw error;
      })
    );
  }

  /**
   * Delete a category
   */
  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/categories/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting category:', error);
        throw error;
      })
    );
  }
}

