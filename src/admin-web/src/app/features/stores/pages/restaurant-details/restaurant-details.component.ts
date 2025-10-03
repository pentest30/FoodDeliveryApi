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
    MatButtonToggleModule
  ],
  template: `
    <div class="restaurant-details-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="back-button">
          <button mat-icon-button (click)="goBack()" matTooltip="Back to restaurants">
            <mat-icon>arrow_back</mat-icon>
          </button>
        </div>
        <div class="header-content" *ngIf="restaurant(); else loadingTemplate">
          <div class="restaurant-header">
            <div class="restaurant-info">
              <h1 class="restaurant-name">{{ restaurant()?.name }}</h1>
              <div class="restaurant-meta">
                <div class="meta-item">
                  <mat-icon>location_on</mat-icon>
                  <span>{{ restaurant()?.city }}</span>
                </div>
                <div class="meta-item" *ngIf="restaurant()?.addressLine1">
                  <mat-icon>place</mat-icon>
                  <span>{{ restaurant()?.addressLine1 }}</span>
                </div>
                <div class="meta-item">
                  <mat-icon>schedule</mat-icon>
                  <span>{{ restaurant()?.etaMinutes }} min delivery</span>
                </div>
              </div>
            </div>
            <div class="restaurant-status">
              <mat-chip [class]="restaurant()?.isOpenNow ? 'status-open' : 'status-closed'">
                <mat-icon>{{ restaurant()?.isOpenNow ? 'check_circle' : 'cancel' }}</mat-icon>
                {{ restaurant()?.isOpenNow ? 'Open Now' : 'Closed' }}
              </mat-chip>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Template -->
      <ng-template #loadingTemplate>
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading restaurant details...</p>
        </div>
      </ng-template>

      <!-- Restaurant Content -->
      <div class="restaurant-content" *ngIf="restaurant()">
        <div class="content-grid">
          <!-- Images Section -->
          <div class="images-section">
            <mat-card class="images-card">
              <mat-card-header>
                <mat-card-title>Restaurant Images</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="carousel-container" *ngIf="restaurant()?.images && restaurant()?.images!.length > 0; else noImages">
                  <!-- Main Image Display -->
                  <div class="main-image-container">
                    <img [src]="restaurant()?.images![currentImageIndex()]" 
                         [alt]="restaurant()?.name + ' image ' + (currentImageIndex() + 1)"
                         class="main-image"
                         (error)="onImageError($event)">
                    
                    <!-- Navigation Arrows -->
                    <button mat-icon-button 
                            class="nav-arrow nav-arrow-left" 
                            (click)="previousImage()"
                            [disabled]="restaurant()?.images!.length <= 1"
                            matTooltip="Previous image">
                      <mat-icon>chevron_left</mat-icon>
                    </button>
                    <button mat-icon-button 
                            class="nav-arrow nav-arrow-right" 
                            (click)="nextImage()"
                            [disabled]="restaurant()?.images!.length <= 1"
                            matTooltip="Next image">
                      <mat-icon>chevron_right</mat-icon>
                    </button>
                  </div>

                  <!-- Thumbnail Navigation -->
                  <div class="thumbnail-container" *ngIf="restaurant()?.images!.length > 1">
                    <div class="thumbnail-item" 
                         *ngFor="let image of restaurant()?.images; let i = index"
                         [class.active]="i === currentImageIndex()"
                         (click)="goToImage(i)">
                      <img [src]="image" 
                           [alt]="restaurant()?.name + ' thumbnail ' + (i + 1)"
                           (error)="onImageError($event)">
                    </div>
                  </div>

                  <!-- Image Counter -->
                  <div class="image-counter">
                    {{ currentImageIndex() + 1 }} / {{ restaurant()?.images!.length }}
                  </div>
                </div>
                <ng-template #noImages>
                  <div class="no-images">
                    <mat-icon>image_not_supported</mat-icon>
                    <p>No images available</p>
                  </div>
                </ng-template>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Details Section -->
          <div class="details-section">
            <mat-card class="details-card">
              <mat-card-header>
                <mat-card-title>Restaurant Information</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item">
                    <label>Restaurant Name</label>
                    <span>{{ restaurant()?.name }}</span>
                  </div>
                  <div class="info-item">
                    <label>City</label>
                    <span>{{ restaurant()?.city }}</span>
                  </div>
                  <div class="info-item" *ngIf="restaurant()?.addressLine1">
                    <label>Address</label>
                    <span>{{ restaurant()?.addressLine1 }}</span>
                  </div>
                  <div class="info-item">
                    <label>Rating</label>
                    <div class="rating-display">
                      <span class="rating-value">{{ restaurant()?.rating | number:'1.1-1' }}</span>
                      <div class="stars">
                        <mat-icon *ngFor="let star of getStars(restaurant()?.rating || 0)">{{ star }}</mat-icon>
                      </div>
                    </div>
                  </div>
                  <div class="info-item">
                    <label>Delivery Time</label>
                    <span>{{ restaurant()?.etaMinutes }} minutes</span>
                  </div>
                  <div class="info-item">
                    <label>Distance</label>
                    <span>{{ restaurant()?.distanceKm | number:'1.1-1' }} km</span>
                  </div>
                  <div class="info-item">
                    <label>Status</label>
                    <mat-chip [class]="restaurant()?.isOpenNow ? 'status-open' : 'status-closed'">
                      <mat-icon>{{ restaurant()?.isOpenNow ? 'check_circle' : 'cancel' }}</mat-icon>
                      {{ restaurant()?.isOpenNow ? 'Open Now' : 'Closed' }}
                    </mat-chip>
                  </div>
                  <div class="info-item" *ngIf="restaurant()?.createdAt">
                    <label>Created</label>
                    <span>{{ restaurant()?.createdAt | date:'medium' }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Categories Section -->
            <mat-card class="categories-card" *ngIf="restaurant()?.categories && restaurant()?.categories!.length > 0">
              <mat-card-header>
                <mat-card-title>Categories</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="categories-list">
                  <mat-chip *ngFor="let category of restaurant()?.categories" class="category-chip">
                    {{ category.name || category }}
                  </mat-chip>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Sections/Menu Section -->
            <mat-card class="sections-card" *ngIf="restaurant()?.sections && restaurant()?.sections!.length > 0">
              <mat-card-header>
                <mat-card-title>Menu Sections</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="sections-list">
                  <div class="section-item" *ngFor="let section of restaurant()?.sections">
                    <div class="section-header">
                      <h4>{{ section.name }}</h4>
                      <mat-chip [class]="section.active ? 'active' : 'inactive'">
                        {{ section.active ? 'Active' : 'Inactive' }}
                      </mat-chip>
                    </div>
                    <div class="section-details">
                      <p>Sort Order: {{ section.sortOrder }}</p>
                      <p *ngIf="section.menuItems && section.menuItems.length > 0">
                        {{ section.menuItems.length }} menu items
                      </p>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .restaurant-details-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-section {
      margin-bottom: 24px;
    }

    .back-button {
      margin-bottom: 16px;
    }

    .restaurant-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
    }

    .restaurant-info h1 {
      margin: 0 0 16px 0;
      font-size: 32px;
      font-weight: 700;
      color: #1e293b;
    }

    .restaurant-meta {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #64748b;
      font-size: 14px;
    }

    .meta-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .restaurant-status {
      flex-shrink: 0;
    }

    .status-open {
      background-color: #dcfce7 !important;
      color: #166534 !important;
    }

    .status-closed {
      background-color: #fee2e2 !important;
      color: #dc2626 !important;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .images-card, .details-card, .categories-card, .sections-card {
      margin-bottom: 24px;
    }

    .carousel-container {
      position: relative;
    }

    .main-image-container {
      position: relative;
      width: 100%;
      height: 400px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      margin-bottom: 16px;
    }

    .main-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .main-image:hover {
      transform: scale(1.02);
    }

    .nav-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background-color: rgba(0, 0, 0, 0.5);
      color: white;
      z-index: 2;
      transition: all 0.3s ease;
    }

    .nav-arrow:hover {
      background-color: rgba(0, 0, 0, 0.7);
      transform: translateY(-50%) scale(1.1);
    }

    .nav-arrow:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .nav-arrow-left {
      left: 16px;
    }

    .nav-arrow-right {
      right: 16px;
    }

    .thumbnail-container {
      display: flex;
      gap: 8px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .thumbnail-item {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      opacity: 0.7;
    }

    .thumbnail-item:hover {
      opacity: 1;
      transform: scale(1.05);
    }

    .thumbnail-item.active {
      border-color: #3b82f6;
      opacity: 1;
      transform: scale(1.1);
    }

    .thumbnail-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-counter {
      text-align: center;
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
      background-color: rgba(0, 0, 0, 0.1);
      padding: 4px 12px;
      border-radius: 16px;
      display: inline-block;
      margin: 0 auto;
    }

    .no-images {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      color: #94a3b8;
    }

    .no-images mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .info-grid {
      display: grid;
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
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
      color: #1e293b;
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

    .categories-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .category-chip {
      background-color: #f1f5f9;
      color: #475569;
    }

    .sections-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-item {
      padding: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background-color: #f8fafc;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .section-header h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .section-details {
      color: #64748b;
      font-size: 14px;
    }

    .section-details p {
      margin: 4px 0;
    }

    .active {
      background-color: #dcfce7 !important;
      color: #166534 !important;
    }

    .inactive {
      background-color: #fee2e2 !important;
      color: #dc2626 !important;
    }

    @media (max-width: 768px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
      
      .restaurant-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .restaurant-info h1 {
        font-size: 24px;
      }
    }
  `]
})
export class RestaurantDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private restaurantsService = inject(RestaurantsService);
  private snackBar = inject(MatSnackBar);

  restaurant = signal<RestaurantDto | null>(null);
  loading = signal(true);
  currentImageIndex = signal(0);

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

  loadRestaurant(id: string) {
    this.loading.set(true);
    this.restaurantsService.getRestaurant(id).subscribe({
      next: (restaurant) => {
        this.restaurant.set(restaurant);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading restaurant:', error);
        this.snackBar.open('Error loading restaurant details', 'Close', { duration: 3000 });
        this.loading.set(false);
        this.goBack();
      }
    });
  }

  goBack() {
    this.router.navigate(['/customers']);
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
}
