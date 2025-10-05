import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { RestaurantsService, RestaurantDto } from '../../data/stores.service';
import { SectionsListComponent } from '../../../sections/pages/sections-list/sections-list.component';
import { MenuItemsListComponent } from '../../../sections/pages/menu-items-list/menu-items-list.component';
// import { RestaurantHeaderComponent, RestaurantInfo } from '../../../../shared/components/restaurant-header/restaurant-header.component';
// import { SegmentedControlComponent, SegmentedControlOption } from '../../../../shared/components/segmented-control/segmented-control.component';

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatButtonToggleModule,
    SectionsListComponent,
    MenuItemsListComponent
  ],
  template: `
    <div class="restaurant-details-container" *ngIf="restaurant(); else loadingTemplate">
      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Left Panel - Restaurant Info -->
        <div class="left-panel">
          <div class="restaurant-info">
            <h1 class="restaurant-name">{{ restaurant()?.name }}</h1>
            <p class="restaurant-description">Authentic Italian cuisine</p>
            
            <div class="status-location">
              <mat-chip [class]="restaurant()?.isOpenNow ? 'status-open' : 'status-closed'" class="status-chip">
                <mat-icon>{{ restaurant()?.isOpenNow ? 'check_circle' : 'cancel' }}</mat-icon>
                {{ restaurant()?.isOpenNow ? 'Open' : 'Closed' }}
              </mat-chip>
              <div class="location">
                <mat-icon>place</mat-icon>
                <span>{{ restaurant()?.city }}</span>
              </div>
            </div>

            <div class="contact-info">
              <div class="contact-item" *ngIf="restaurant()?.email">
                <mat-icon>email</mat-icon>
                <span>{{ restaurant()?.email }}</span>
              </div>
              <div class="contact-item" *ngIf="restaurant()?.mobile">
                <mat-icon>phone</mat-icon>
                <span>{{ restaurant()?.mobile }}</span>
              </div>
              <div class="contact-item" *ngIf="!restaurant()?.email && !restaurant()?.mobile">
                <mat-icon>info</mat-icon>
                <span>No contact information available</span>
              </div>
            </div>

            <div class="stats">
              <div class="stat-item">
                <span class="stat-number">3</span>
                <span class="stat-label">Categories</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">28</span>
                <span class="stat-label">Active items</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">2h</span>
                <span class="stat-label">Last update</span>
              </div>
            </div>

            <div class="action-buttons">
              <button mat-stroked-button class="edit-btn">
                <mat-icon>edit</mat-icon>
                Edit Info
              </button>
              <button mat-stroked-button class="hours-btn">
                <mat-icon>schedule</mat-icon>
                Manage Hours
              </button>
            </div>
          </div>
        </div>

        <!-- Right Panel - Restaurant Image Carousel -->
        <div class="right-panel">
          <div class="carousel-container" *ngIf="restaurant()?.images && restaurant()?.images!.length > 0; else noImages">
            <!-- Main Carousel Image -->
            <div class="carousel-main">
              <img [src]="restaurant()?.images![currentImageIndex()]" 
                   [alt]="restaurant()?.name + ' image ' + (currentImageIndex() + 1)"
                   class="carousel-image"
                   (error)="onImageError($event)">
              
              <!-- Navigation Arrows -->
              <button mat-icon-button 
                      class="carousel-arrow carousel-arrow-left" 
                      (click)="previousImage()"
                      [disabled]="restaurant()?.images!.length <= 1"
                      matTooltip="Previous image">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <button mat-icon-button 
                      class="carousel-arrow carousel-arrow-right" 
                      (click)="nextImage()"
                      [disabled]="restaurant()?.images!.length <= 1"
                      matTooltip="Next image">
                <mat-icon>chevron_right</mat-icon>
              </button>

              <!-- Image Counter -->
              <div class="image-counter">
                {{ currentImageIndex() + 1 }} / {{ restaurant()?.images!.length }}
              </div>
            </div>

            <!-- Thumbnail Navigation -->
            <div class="carousel-thumbnails" *ngIf="restaurant()?.images!.length > 1">
              <div class="thumbnail-item" 
                   *ngFor="let image of restaurant()?.images; let i = index"
                   [class.active]="i === currentImageIndex()"
                   (click)="goToImage(i)">
                <img [src]="image" 
                     [alt]="restaurant()?.name + ' thumbnail ' + (i + 1)"
                     (error)="onImageError($event)">
              </div>
            </div>

            <!-- Carousel Actions -->
            <div class="carousel-actions">
              <button mat-stroked-button class="images-btn">
                <mat-icon>photo_library</mat-icon>
                All Images
              </button>
              <button mat-icon-button class="gallery-btn" matTooltip="Gallery view">
                <mat-icon>collections</mat-icon>
              </button>
              <button mat-icon-button class="add-image-btn" matTooltip="Add image">
                <mat-icon>add_photo_alternate</mat-icon>
              </button>
            </div>
          </div>

          <!-- No Images Template -->
          <ng-template #noImages>
            <div class="no-images-placeholder">
              <mat-icon>image_not_supported</mat-icon>
              <h3>No Images Available</h3>
              <p>This restaurant doesn't have any images yet.</p>
              <button mat-raised-button color="primary">
                <mat-icon>add_photo_alternate</mat-icon>
                Add First Image
              </button>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Tabbed Navigation -->
      <div class="tabbed-content">
        <mat-tab-group [(selectedIndex)]="selectedTabIndex" class="restaurant-tabs">
          <mat-tab label="Sections">
            <div class="tab-content">
              <app-sections-list [restaurantId]="restaurant()?.id"></app-sections-list>
            </div>
          </mat-tab>
          
          <mat-tab label="Menu Items">
            <div class="tab-content">
              <app-menu-items-list [restaurantId]="restaurant()?.id"></app-menu-items-list>
            </div>
          </mat-tab>
          
          <mat-tab label="Prix/Variants">
            <div class="tab-content">
              <div class="variants-content">
                <h3>Price Variants</h3>
                <p>Price variants management will be implemented here.</p>
              </div>
            </div>
          </mat-tab>
          
          <mat-tab label="Discounts">
            <div class="tab-content">
              <div class="discounts-content">
                <h3>Discounts</h3>
                <p>Discounts management will be implemented here.</p>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <!-- Loading Template -->
    <ng-template #loadingTemplate>
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading restaurant details...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .restaurant-details-container {
      padding: 0;
      max-width: 100%;
      margin: 0;
      background-color: #f8fafc;
      min-height: 100vh;
    }

    /* Main Content */
    .main-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      padding: 24px;
      background: white;
      margin: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    /* Left Panel */
    .left-panel {
      padding: 24px;
    }

    .restaurant-name {
      font-size: 32px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 8px 0;
    }

    .restaurant-description {
      color: #64748b;
      font-size: 16px;
      margin: 0 0 16px 0;
    }

    .status-location {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .status-chip {
      font-weight: 600;
    }

    .status-open {
      background-color: #dcfce7;
      color: #166534;
    }

    .status-closed {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .location {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #64748b;
    }

    .contact-info {
      margin-bottom: 24px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      color: #64748b;
    }

    .stats {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      font-size: 14px;
      color: #64748b;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
    }

    .edit-btn,
    .hours-btn {
      flex: 1;
    }

    /* Right Panel - Carousel */
    .right-panel {
      padding: 24px;
    }

    .carousel-container {
      position: relative;
    }

    .carousel-main {
      position: relative;
      width: 100%;
      height: 400px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .carousel-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .carousel-image:hover {
      transform: scale(1.02);
    }

    .carousel-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background-color: rgba(0, 0, 0, 0.6);
      color: white;
      z-index: 10;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .carousel-arrow:hover {
      background-color: rgba(0, 0, 0, 0.8);
      transform: translateY(-50%) scale(1.1);
    }

    .carousel-arrow:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .carousel-arrow-left {
      left: 16px;
    }

    .carousel-arrow-right {
      right: 16px;
    }

    .image-counter {
      position: absolute;
      bottom: 16px;
      right: 16px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }

    .carousel-thumbnails {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      overflow-x: auto;
      padding: 8px 0;
    }

    .thumbnail-item {
      flex-shrink: 0;
      width: 80px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      border: 3px solid transparent;
      transition: all 0.3s ease;
      position: relative;
    }

    .thumbnail-item:hover {
      border-color: #3b82f6;
      transform: scale(1.05);
    }

    .thumbnail-item.active {
      border-color: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
    }

    .thumbnail-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .carousel-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      justify-content: center;
    }

    .images-btn {
      flex: 1;
      max-width: 200px;
    }

    .gallery-btn,
    .add-image-btn {
      width: 48px;
      height: 48px;
    }

    .no-images-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      background: #f8fafc;
      border: 2px dashed #e2e8f0;
      border-radius: 12px;
      height: 400px;
    }

    .no-images-placeholder mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #94a3b8;
      margin-bottom: 16px;
    }

    .no-images-placeholder h3 {
      margin: 0 0 8px 0;
      color: #1e293b;
      font-size: 18px;
      font-weight: 600;
    }

    .no-images-placeholder p {
      margin: 0 0 24px 0;
      color: #64748b;
      font-size: 14px;
    }

    /* Tabbed Content */
    .tabbed-content {
      margin: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .restaurant-tabs {
      border-radius: 12px;
    }

    .tab-content {
      padding: 24px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }

    .info-section h3 {
      margin: 0 0 16px 0;
      color: #1e293b;
      font-size: 18px;
      font-weight: 600;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 16px;
    }

    .info-item label {
      font-weight: 600;
      color: #374151;
      font-size: 14px;
    }

    .info-item span {
      color: #6b7280;
      font-size: 14px;
    }

    .rating-display {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .rating-value {
      font-weight: 600;
      color: #1f2937;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .stars mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #fbbf24;
    }

    /* Images Gallery */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .gallery-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
    }

    .gallery-image {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }

    .image-overlay {
      position: absolute;
      top: 8px;
      right: 8px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .gallery-item:hover .image-overlay {
      opacity: 1;
    }

    .delete-btn {
      background-color: rgba(220, 38, 38, 0.9);
      color: white;
    }

    .no-images {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
      color: #64748b;
    }

    .no-images mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    /* Menu Sections */
    .sections-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .sections-header h3 {
      margin: 0;
      color: #1e293b;
      font-size: 18px;
      font-weight: 600;
    }

    .sections-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-item {
      padding: 20px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background-color: #f8fafc;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .section-info h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .section-info p {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }

    .section-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-details {
      display: flex;
      gap: 16px;
      color: #64748b;
      font-size: 14px;
    }

    .active {
      background-color: #dcfce7;
      color: #166534;
    }

    .inactive {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .no-sections {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
      color: #64748b;
    }

    .no-sections mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    /* Variants and Discounts */
    .variants-content,
    .discounts-content {
      padding: 24px;
      text-align: center;
      color: #64748b;
    }

    .variants-content h3,
    .discounts-content h3 {
      margin: 0 0 16px 0;
      color: #1e293b;
    }

    /* Loading */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }

    .loading-container p {
      margin-top: 16px;
      color: #64748b;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .main-content {
        grid-template-columns: 1fr;
        margin: 0 16px;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .stats {
        flex-direction: column;
        gap: 16px;
      }
      
      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class RestaurantDetailsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly restaurantsService = inject(RestaurantsService);
  private readonly snackBar = inject(MatSnackBar);

  restaurant = signal<RestaurantDto | null>(null);
  loading = signal(true);
  currentImageIndex = signal(0);
  selectedTabIndex = 0;
  
  // protected readonly tabOptions: SegmentedControlOption[] = [
  //   { value: 'sections', label: 'Sections', icon: 'category' },
  //   { value: 'menu-items', label: 'Menu Items', icon: 'restaurant_menu' },
  //   { value: 'variants', label: 'Prix/Variants', icon: 'local_offer' },
  //   { value: 'discounts', label: 'Discounts', icon: 'percent' }
  // ];

  ngOnInit() {
    const restaurantId = this.route.snapshot.paramMap.get('id');
    if (restaurantId) {
      this.loadRestaurant(restaurantId);
    } else {
      this.snackBar.open('Restaurant ID not found', 'Close', { duration: 3000 });
      this.goBack();
    }

    // Add keyboard navigation support
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  private handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      this.previousImage();
    } else if (event.key === 'ArrowRight') {
      this.nextImage();
    }
  }

  private loadRestaurant(id: string) {
    this.loading.set(true);
    this.restaurantsService.getRestaurant(id).subscribe({
      next: (restaurant: RestaurantDto) => {
        this.restaurant.set(restaurant);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading restaurant:', error);
        this.snackBar.open('Error loading restaurant', 'Close', { duration: 3000 });
        this.loading.set(false);
        this.goBack();
      }
    });
  }

  goBack() {
    this.router.navigate(['/restaurants']);
  }

  getStars(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push('star');
    }
    if (hasHalfStar) {
      stars.push('star_half');
    }
    while (stars.length < 5) {
      stars.push('star_border');
    }
    return stars;
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/200x200/e0e0e0/757575?text=No+Image';
  }

  nextImage() {
    const images = this.restaurant()?.images;
    if (images && images.length > 0) {
      const nextIndex = (this.currentImageIndex() + 1) % images.length;
      this.currentImageIndex.set(nextIndex);
    }
  }

  previousImage() {
    const images = this.restaurant()?.images;
    if (images && images.length > 0) {
      const prevIndex = this.currentImageIndex() === 0 ? images.length - 1 : this.currentImageIndex() - 1;
      this.currentImageIndex.set(prevIndex);
    }
  }

  goToImage(index: number) {
    this.currentImageIndex.set(index);
  }

  getRestaurantEmail(): string {
    const name = this.restaurant()?.name || '';
    return name.toLowerCase().replace(/\s+/g, '');
  }

  // protected getRestaurantInfo(): RestaurantInfo | null {
  //   const restaurant = this.restaurant();
  //   if (!restaurant) return null;

  //   return {
  //     id: restaurant.id,
  //     name: restaurant.name,
  //     logo: restaurant.images?.[0] || restaurant.coverImageUrl,
  //     rating: restaurant.rating,
  //     city: restaurant.city || 'Unknown',
  //     address: restaurant.addressLine || restaurant.addressLine1,
  //     phone: restaurant.mobile,
  //     email: restaurant.email,
  //     status: restaurant.isOpenNow ? 'active' : 'inactive',
  //     cuisine: 'Italian', // Default cuisine since it's not in the DTO
  //     deliveryTime: `${restaurant.etaMinutes} min`,
  //     minimumOrder: 0 // Default value since it's not in the DTO
  //   };
  // }

  // protected onTabSelectionChange(value: string) {
  //   const tabIndex = this.tabOptions.findIndex(option => option.value === value);
  //   if (tabIndex !== -1) {
  //     this.selectedTabIndex = tabIndex;
  //   }
  // }

  // protected onViewProfile(restaurantId: string) {
  //   // Navigate to restaurant profile or open in new tab
  //   console.log('View profile for restaurant:', restaurantId);
  // }

  // protected onViewMap(restaurantId: string) {
  //   // Open map with restaurant location
  //   console.log('View map for restaurant:', restaurantId);
  // }

  // protected onEditRestaurant(restaurantId: string) {
  //   // Navigate to edit restaurant page
  //   this.router.navigate(['/restaurants', restaurantId, 'edit']);
  // }
}
