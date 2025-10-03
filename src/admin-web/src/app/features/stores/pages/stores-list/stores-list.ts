import { Component, OnInit, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, startWith, switchMap, catchError } from 'rxjs/operators';
import { of, combineLatest } from 'rxjs';

import { RestaurantsService, RestaurantDto, RestaurantListParams } from '../../data/stores.service';
import { StoreDialogComponent, StoreDialogData } from '../../ui/store-dialog';
import { StoreImagesDialogComponent, StoreImagesDialogData } from '../../ui/store-images-dialog';
import { StoreHoursDialogComponent, StoreHoursDialogData } from '../../ui/store-hours-dialog';

@Component({
  selector: 'app-stores-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressBarModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './stores-list.component.html',
  styleUrls: ['./stores-list.component.css']
})
export class RestaurantsListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private restaurantsService = inject(RestaurantsService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  // Form controls
  searchControl = new FormControl('');
  cityControl = new FormControl('');
  isOpenControl = new FormControl('');
  ratingControl = new FormControl('');

  // Signals for state management
  restaurants = signal<RestaurantDto[]>([]);
  cities = signal<string[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  // Table configuration
  displayedColumns = ['name', 'city', 'rating', 'eta', 'status', 'created', 'actions'];

  ngOnInit() {
    this.loadCities();
    this.setupSearch();
    this.loadRestaurants();
  }

  private setupSearch() {
    // Combine search controls and trigger search
    combineLatest([
      this.searchControl.valueChanges.pipe(startWith('')),
      this.cityControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(() => this.performSearch())
    ).subscribe(response => {
      this.restaurants.set(response.items);
      this.totalCount.set(response.total);
      this.loading.set(false);
    });
  }

  private performSearch() {
    this.loading.set(true);
    
    const params: RestaurantListParams = {
      q: this.searchControl.value || '',
      city: this.cityControl.value || '',
      isOpen: this.isOpenControl.value ? this.isOpenControl.value === 'true' : undefined,
      rating: this.ratingControl.value ? Number(this.ratingControl.value) : undefined,
      page: this.pageIndex() + 1,
      pageSize: this.pageSize()
    };

    return this.restaurantsService.listRestaurants(params).pipe(
      catchError(error => {
        console.error('Error loading restaurants:', error);
        this.snackBar.open('Error loading restaurants', 'Close', { duration: 3000 });
        this.loading.set(false);
        return of({ items: [], total: 0 });
      })
    );
  }

  private loadRestaurants() {
    this.loading.set(true);
    
    const params: RestaurantListParams = {
      page: this.pageIndex() + 1,
      pageSize: this.pageSize()
    };

    this.restaurantsService.listRestaurants(params).pipe(
      catchError(error => {
        console.error('Error loading restaurants:', error);
        this.snackBar.open('Error loading restaurants', 'Close', { duration: 3000 });
        return of({ items: [], total: 0 });
      })
    ).subscribe(response => {
      this.restaurants.set(response.items);
      this.totalCount.set(response.total);
      this.loading.set(false);
    });
  }

  private loadCities() {
    this.restaurantsService.getCities().subscribe(cities => {
      this.cities.set(cities);
    });
  }

  onImageError(event: any) {
    // Use a simple data URL for a gray placeholder to avoid infinite loop
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRTBFMEUwIi8+CjxwYXRoIGQ9Ik0xMiAxNkwyMCAyNEwyOCAxNlYyOEgxMlYxNloiIGZpbGw9IiM5RTlFOUUiLz4KPC9zdmc+';
  }

  createRestaurant() {
    const dialogRef = this.dialog.open(StoreDialogComponent, {
      width: '600px',
      data: { mode: 'create' } as StoreDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRestaurants();
        this.snackBar.open('Restaurant created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  editRestaurant(restaurant: RestaurantDto) {
    const dialogRef = this.dialog.open(StoreDialogComponent, {
      width: '600px',
      data: { store: restaurant, mode: 'edit' } as StoreDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRestaurants();
        this.snackBar.open('Restaurant updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  manageImages(restaurant: RestaurantDto) {
    const dialogRef = this.dialog.open(StoreImagesDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { store: restaurant } as StoreImagesDialogData
    });

    dialogRef.afterClosed().subscribe(() => {
      // Refresh the restaurant list to update cover images
      this.loadRestaurants();
    });
  }

  manageHours(restaurant: RestaurantDto) {
    const dialogRef = this.dialog.open(StoreHoursDialogComponent, {
      width: '600px',
      data: { store: restaurant } as StoreHoursDialogData
    });

    dialogRef.afterClosed().subscribe(() => {
      // Future: Refresh restaurant data if hours were updated
    });
  }

  deleteRestaurant(restaurant: RestaurantDto) {
    if (confirm(`Are you sure you want to delete "${restaurant.name}"? This action cannot be undone.`)) {
      this.restaurantsService.deleteRestaurant(restaurant.id).subscribe({
        next: () => {
          this.loadRestaurants();
          this.snackBar.open('Restaurant deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting restaurant:', error);
          this.snackBar.open('Error deleting restaurant', 'Close', { duration: 3000 });
        }
      });
    }
  }

  viewRestaurant(restaurant: RestaurantDto) {
    this.router.navigate(['/restaurants', restaurant.id]);
  }
}