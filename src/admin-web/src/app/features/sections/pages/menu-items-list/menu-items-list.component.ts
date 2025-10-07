import { Component, OnInit, inject, signal, ViewChild, Input } from '@angular/core';
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
import { debounceTime, distinctUntilChanged, startWith, switchMap, catchError, map } from 'rxjs/operators';
import { of, combineLatest, Observable } from 'rxjs';

import { MenuItemsService, MenuItemDto, MenuItemListParams } from '../../data/menu-items.service';
import { MenuItemDialogComponent } from '../../ui/menu-item-dialog/menu-item-dialog.component';
import { ImageUploadDialogComponent } from '../../../../shared/components/image-upload-dialog/image-upload-dialog.component';

@Component({
  selector: 'app-menu-items-list',
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
    TranslateModule,
    MenuItemDialogComponent
  ],
  template: `
    <div class="menu-items-container">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <div class="title-icon">
              <mat-icon class="page-icon">restaurant_menu</mat-icon>
            </div>
            <div class="title-text">
              <h1 class="page-title">Menu Items</h1>
              <p class="page-subtitle">Manage restaurant menu items and dishes</p>
            </div>
          </div>
          <button mat-raised-button color="primary" (click)="createMenuItem()" class="add-item-btn">
            <mat-icon>add</mat-icon>
            New Menu Item
          </button>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filters-container">
          <div class="search-filters">
            <!-- Search -->
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search menu items...</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Search menu items...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <!-- Status Filter -->
            <mat-form-field appearance="outline" class="status-filter">
              <mat-label>Status</mat-label>
              <mat-select [formControl]="availableControl">
                <mat-option value="">All Status</mat-option>
                <mat-option value="true">Available</mat-option>
                <mat-option value="false">Unavailable</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
      </div>

      <!-- Menu Items Table -->
      <mat-card class="menu-items-table-card">
        <div class="table-container">
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading menu items...</p>
            </div>
          } @else {
            <table mat-table [dataSource]="menuItems()" class="menu-items-table">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>NAME</th>
                <td mat-cell *matCellDef="let item">
                  <div class="item-name">
                    <strong>{{ item.name }}</strong>
                  </div>
                </td>
              </ng-container>

              <!-- Description Column -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>DESCRIPTION</th>
                <td mat-cell *matCellDef="let item">
                  <span class="item-description">{{ item.description || 'No description' }}</span>
                </td>
              </ng-container>

              <!-- Price Column -->
              <ng-container matColumnDef="priceRange">
                <th mat-header-cell *matHeaderCellDef>PRICE</th>
                <td mat-cell *matCellDef="let item">
                  <div class="price-display">
                    <span class="item-price" *ngIf="!item.hasVariants">{{ formatPrice(item.basePrice) }}</span>
                    <div class="price-range" *ngIf="item.hasVariants">
                      <span class="price-range-text">{{ item.priceRange || 'From ' + formatPrice(item.minPrice) }}</span>
                      <span class="variant-indicator" *ngIf="item.variants && item.variants.length > 0">
                        <mat-icon class="variant-icon">tune</mat-icon>
                        {{ item.variants.length }} variant{{ item.variants.length > 1 ? 's' : '' }}
                      </span>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Quantity Column -->
              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef>QTY</th>
                <td mat-cell *matCellDef="let item">
                  <span class="item-quantity">{{ item.quantity }}</span>
                </td>
              </ng-container>

              <!-- Allergens Column -->
              <ng-container matColumnDef="allergens">
                <th mat-header-cell *matHeaderCellDef>ALLERGENS</th>
                <td mat-cell *matCellDef="let item">
                  <div class="allergens-container">
                    @if (item.allergens && item.allergens.length > 0) {
                      @for (allergen of item.allergens; track allergen) {
                        <mat-chip class="allergen-chip">{{ allergen }}</mat-chip>
                      }
                    } @else {
                      <span class="no-allergens">None</span>
                    }
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>STATUS</th>
                <td mat-cell *matCellDef="let item">
                  <mat-chip 
                    [class]="getStatusClass(item.available)"
                    class="status-chip">
                    {{ getStatusText(item.available) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Variants Column -->
              <ng-container matColumnDef="variants">
                <th mat-header-cell *matHeaderCellDef>VARIANTS</th>
                <td mat-cell *matCellDef="let item">
                  <div class="variants-cell">
                    <span *ngIf="!item.hasVariants || !item.variants || item.variants.length === 0" class="no-variants">
                      <mat-icon>tune</mat-icon>
                      No variants
                    </span>
                    <div *ngIf="item.hasVariants && item.variants && item.variants.length > 0" class="has-variants">
                      <span class="variant-count">
                        <mat-icon>tune</mat-icon>
                        {{ item.variants.length }} variant{{ item.variants.length > 1 ? 's' : '' }}
                      </span>
                      <button mat-icon-button (click)="manageVariants(item)" class="manage-variants-btn" matTooltip="Manage Variants">
                        <mat-icon>settings</mat-icon>
                      </button>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Created Column -->
              <ng-container matColumnDef="created">
                <th mat-header-cell *matHeaderCellDef>CREATED</th>
                <td mat-cell *matCellDef="let item">
                  <span class="created-date">{{ formatDate(item.createdAt) }}</span>
                </td>
              </ng-container>


              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>ACTIONS</th>
                <td mat-cell *matCellDef="let item">
                  <button mat-icon-button 
                          [matMenuTriggerFor]="actionsMenu"
                          class="actions-context-button"
                          (click)="setSelectedItem(item)"
                          matTooltip="Actions">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <!-- Pagination -->
            <mat-paginator 
              [length]="totalCount()" 
              [pageSize]="pageSize()" 
              [pageSizeOptions]="[10, 25, 50, 100]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          }
        </div>
      </mat-card>

            <!-- Context Menu -->
            <mat-menu #actionsMenu="matMenu" class="actions-context-menu">
              <button mat-menu-item (click)="editMenuItem(selectedItem)" *ngIf="selectedItem">
                <mat-icon>edit</mat-icon>
                <span>Edit Menu Item</span>
              </button>
              <button mat-menu-item (click)="manageVariants(selectedItem)" *ngIf="selectedItem">
                <mat-icon>tune</mat-icon>
                <span>Manage Variants</span>
              </button>
              <button mat-menu-item (click)="duplicateMenuItem(selectedItem)" *ngIf="selectedItem">
                <mat-icon>content_copy</mat-icon>
                <span>Duplicate</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="openImageUpload(selectedItem)" *ngIf="selectedItem">
                <mat-icon>add_photo_alternate</mat-icon>
                <span>Upload Images</span>
              </button>
              <button mat-menu-item (click)="viewImages(selectedItem)" *ngIf="selectedItem && selectedItem.images && selectedItem.images.length > 0">
                <mat-icon>photo_library</mat-icon>
                <span>View All Images</span>
              </button>
              <button mat-menu-item (click)="removeAllImages(selectedItem)" *ngIf="selectedItem && selectedItem.images && selectedItem.images.length > 0">
                <mat-icon>delete_sweep</mat-icon>
                <span>Remove All Images</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="deleteMenuItem(selectedItem)" *ngIf="selectedItem" class="delete-action">
                <mat-icon>delete</mat-icon>
                <span>Delete</span>
              </button>
            </mat-menu>
    </div>
  `,
  styles: [`
    .menu-items-container {
      padding: 0;
    }

    /* Header Section */
    .page-header {
      background: white;
      color: #333;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #e0e0e0;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .title-icon {
      width: 64px;
      height: 64px;
      background: #f5f5f5;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .page-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #666;
    }

    .page-title {
      font-size: 32px;
      font-weight: 700;
      margin: 0;
      color: #333;
    }

    .page-subtitle {
      font-size: 16px;
      margin: 4px 0 0 0;
      color: #666;
    }

    .add-item-btn {
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 12px;
      padding: 12px 24px;
      font-weight: 600;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      }
    }

    /* Filters Section */
    .filters-section {
      background: white;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .filters-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .search-filters {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .status-filter {
      min-width: 150px;
    }

    /* Table Section */
    .menu-items-table-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
    }

    .menu-items-table {
      width: 100%;
      background: white;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #64748b;
    }

    .item-name {
      font-weight: 600;
      color: #1e293b;
    }

    .item-description {
      color: #64748b;
      font-size: 14px;
    }

    .item-price {
      color: #059669;
      font-weight: 600;
      font-size: 16px;
    }

    .price-display {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .price-range {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .price-range-text {
      font-weight: 600;
      color: #059669;
      font-size: 14px;
    }

    .variant-indicator {
      font-size: 12px;
      color: #64748b;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 12px;
      align-self: flex-start;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .variant-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* Variants Column Styles */
    .variants-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .no-variants {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #64748b;
      font-size: 12px;
    }

    .has-variants {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .variant-count {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #059669;
      font-size: 12px;
      font-weight: 600;
    }

    .manage-variants-btn {
      width: 24px;
      height: 24px;
      line-height: 24px;
      color: #3b82f6;
    }

    .manage-variants-btn:hover {
      background: #eff6ff;
      color: #1d4ed8;
    }

    .item-quantity {
      color: #64748b;
      font-size: 14px;
    }

    .allergens-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .allergen-chip {
      font-size: 11px;
      height: 24px;
      background-color: #fef3c7;
      color: #92400e;
    }

    .no-allergens {
      color: #64748b;
      font-size: 14px;
      font-style: italic;
    }

    .status-chip {
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
    }

    .status-available {
      background-color: #dcfce7;
      color: #166534;
    }

    .status-unavailable {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .created-date {
      color: #64748b;
      font-size: 14px;
    }

    .item-image-container {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .item-image {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .no-image-placeholder {
      width: 50px;
      height: 50px;
      background: #f8fafc;
      border: 1px dashed #e2e8f0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
    }

    .no-image-placeholder mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .actions-context-button {
      width: 32px;
      height: 32px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #64748b;
      transition: all 0.2s ease;
    }

    .actions-context-button:hover {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .actions-container {
      display: flex;
      gap: 8px;
    }

    .edit-button {
      color: #64748b;
      transition: all 0.2s ease;

      &:hover {
        color: #3b82f6;
        background-color: #f1f5f9;
      }
    }

    .delete-button {
      color: #64748b;
      transition: all 0.2s ease;

      &:hover {
        color: #dc2626;
        background-color: #fef2f2;
      }
    }

    /* Context Menu Styles */
    .actions-context-menu {
      min-width: 180px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border: 1px solid #e2e8f0;
    }

    .delete-action {
      color: #dc2626;
    }

    .delete-action:hover {
      background-color: #fef2f2;
    }

    /* Table header styling */
    ::ng-deep .mat-mdc-header-cell {
      background-color: #f8fafc;
      color: #374151;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
    }

    ::ng-deep .mat-mdc-cell {
      padding: 16px 12px;
      border-bottom: 1px solid #f1f5f9;
    }

    ::ng-deep .mat-mdc-row:hover {
      background-color: #f8fafc;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .page-header {
        padding: 24px 16px;
      }

      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .title-section {
        justify-content: center;
        text-align: center;
      }

      .search-filters {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field {
        min-width: auto;
      }
    }
  `]
})
export class MenuItemsListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Input() restaurantId?: string;

  private readonly menuItemsService = inject(MenuItemsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  // Form controls
  searchControl = new FormControl('');
  availableControl = new FormControl('');

  // Signals for state management
  menuItems = signal<MenuItemDto[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  // Table configuration
  displayedColumns = ['name', 'description', 'priceRange', 'quantity', 'allergens', 'status', 'variants', 'created', 'actions'];

  // Selected item for context menus
  selectedItem: MenuItemDto | null = null;

  ngOnInit() {
    this.setupSearch();
    this.loadMenuItems();
  }

  private setupSearch() {
    // Combine search controls and trigger search
    combineLatest([
      this.searchControl.valueChanges.pipe(startWith('')),
      this.availableControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(() => this.loadMenuItems())
    ).subscribe();
  }

  private loadMenuItems(): Observable<void> {
    this.loading.set(true);

    if (this.restaurantId) {
      // Load menu items with pagination and filters
      const params: MenuItemListParams = {
        restaurantId: this.restaurantId,
        q: this.searchControl.value || undefined,
        available: this.availableControl.value ? this.availableControl.value === 'true' : undefined,
        page: this.pageIndex() + 1,
        pageSize: this.pageSize()
      };

      return this.menuItemsService.getMenuItems(params).pipe(
        map(response => {
          this.menuItems.set(response.items);
          this.totalCount.set(response.totalCount);
          this.loading.set(false);
        }),
        catchError(error => {
          console.error('Error loading menu items:', error);
          this.menuItems.set([]);
          this.totalCount.set(0);
          this.loading.set(false);
          return of();
        })
      );
    } else {
      // For now, we'll show empty data since we don't have a backend endpoint
      // to get all menu items across restaurants
      
      this.menuItems.set([]);
      this.totalCount.set(0);
      this.loading.set(false);
      
      return of();
    }
  }

  protected onPageChange(event: any) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadMenuItems().subscribe();
  }

  protected createMenuItem() {
    this.router.navigate(['/restaurants', this.restaurantId, 'menu-items', 'new']);
  }

  protected editMenuItem(menuItem: MenuItemDto) {
    this.router.navigate(['/restaurants', this.restaurantId, 'menu-items', menuItem.id, 'edit']);
  }

  protected deleteMenuItem(menuItem: MenuItemDto) {
    if (confirm(`Are you sure you want to delete the menu item "${menuItem.name}"? This action cannot be undone.`)) {
      this.loading.set(true);
      
      this.menuItemsService.deleteMenuItem(menuItem.restaurantSectionId, menuItem.id).subscribe({
        next: () => {
          this.loading.set(false);
          this.loadMenuItems().subscribe();
          this.snackBar.open('Menu item deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.loading.set(false);
          console.error('Error deleting menu item:', error);
          this.snackBar.open('Error deleting menu item', 'Close', { duration: 3000 });
        }
      });
    }
  }

  protected getStatusText(available: boolean): string {
    if (available) {
      return 'Available';
    }
    return 'Unavailable';
  }

  protected getStatusClass(available: boolean): string {
    if (available) {
      return 'status-available';
    }
    return 'status-unavailable';
  }

  protected formatPrice(price?: number): string {
    if (price === null || price === undefined) {
      return 'No price set';
    }
    return `$${price.toFixed(2)}`;
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  protected onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/50x50/e0e0e0/757575?text=No+Image';
  }

  protected setSelectedItem(item: MenuItemDto) {
    this.selectedItem = item;
  }

  protected openImageUpload(menuItem: MenuItemDto) {
    const dialogRef = this.dialog.open(ImageUploadDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        menuItem: menuItem,
        restaurantId: this.restaurantId
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMenuItems().subscribe();
        this.snackBar.open('Images uploaded successfully', 'Close', { duration: 3000 });
      }
    });
  }

  protected viewImages(menuItem: MenuItemDto) {
    // TODO: Implement view images functionality
    this.snackBar.open('View images functionality not implemented yet', 'Close', { duration: 3000 });
  }

  protected removeAllImages(menuItem: MenuItemDto) {
    if (confirm(`Are you sure you want to remove all images for "${menuItem.name}"?`)) {
      // TODO: Implement remove all images functionality
      this.snackBar.open('Remove all images functionality not implemented yet', 'Close', { duration: 3000 });
    }
  }

  protected duplicateMenuItem(menuItem: MenuItemDto) {
    // TODO: Implement duplicate functionality
    this.snackBar.open('Duplicate functionality not implemented yet', 'Close', { duration: 3000 });
  }

  protected manageVariants(menuItem: MenuItemDto) {
    this.router.navigate(['/restaurants', this.restaurantId, 'menu-items', menuItem.id, 'edit']);
  }
}