import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';

export interface RestaurantInfo {
  id: string;
  name: string;
  logo?: string;
  rating?: number;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive' | 'pending';
  cuisine?: string;
  deliveryTime?: string;
  minimumOrder?: number;
}

@Component({
  selector: 'app-restaurant-header',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    TranslateModule
  ],
  template: `
    <mat-card class="restaurant-header-card" [class]="getStatusClass(restaurant.status)">
      <div class="restaurant-header-content">
        <!-- Restaurant Logo and Basic Info -->
        <div class="restaurant-main-info">
          <div class="restaurant-logo">
            @if (restaurant.logo) {
              <img [src]="restaurant.logo" [alt]="restaurant.name + ' logo'" class="logo-image">
            } @else {
              <div class="logo-placeholder">
                <mat-icon>restaurant</mat-icon>
              </div>
            }
          </div>
          
          <div class="restaurant-details">
            <div class="restaurant-name-section">
              <h1 class="restaurant-name">{{ restaurant.name }}</h1>
              <mat-chip 
                [class]="getStatusChipClass(restaurant.status)"
                class="status-chip"
                [matTooltip]="getStatusTooltip(restaurant.status)">
                {{ getStatusText(restaurant.status) }}
              </mat-chip>
            </div>
            
            <div class="restaurant-meta">
              <div class="location-info">
                <mat-icon class="meta-icon">location_on</mat-icon>
                <span class="meta-text">{{ restaurant.city }}</span>
                @if (restaurant.address) {
                  <span class="meta-text secondary">{{ restaurant.address }}</span>
                }
              </div>
              
              @if (restaurant.rating) {
                <div class="rating-info">
                  <mat-icon class="meta-icon">star</mat-icon>
                  <span class="meta-text">{{ restaurant.rating }}/5</span>
                </div>
              }
              
              @if (restaurant.cuisine) {
                <div class="cuisine-info">
                  <mat-icon class="meta-icon">restaurant_menu</mat-icon>
                  <span class="meta-text">{{ restaurant.cuisine }}</span>
                </div>
              }
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="restaurant-actions">
          <div class="action-buttons">
            <button 
              mat-raised-button 
              color="primary" 
              (click)="onViewProfile()"
              matTooltip="View restaurant profile">
              <mat-icon>visibility</mat-icon>
              <span>View Profile</span>
            </button>
            
            <button 
              mat-stroked-button 
              (click)="onViewMap()"
              matTooltip="View on map">
              <mat-icon>map</mat-icon>
              <span>View on Map</span>
            </button>
            
            <button 
              mat-stroked-button 
              (click)="onEditRestaurant()"
              matTooltip="Edit restaurant details">
              <mat-icon>edit</mat-icon>
              <span>Edit</span>
            </button>
          </div>
          
          @if (restaurant.phone || restaurant.email) {
            <mat-divider class="contact-divider"></mat-divider>
            
            <div class="contact-info">
              @if (restaurant.phone) {
                <div class="contact-item">
                  <mat-icon class="contact-icon">phone</mat-icon>
                  <span class="contact-text">{{ restaurant.phone }}</span>
                </div>
              }
              
              @if (restaurant.email) {
                <div class="contact-item">
                  <mat-icon class="contact-icon">email</mat-icon>
                  <span class="contact-text">{{ restaurant.email }}</span>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .restaurant-header-card {
      margin-bottom: var(--spacing-lg);
      border-radius: 12px;
      box-shadow: var(--elevation-2);
      overflow: hidden;
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: var(--elevation-3);
        transform: translateY(-2px);
      }
      
      &.status-active {
        border-left: 4px solid var(--success-color);
      }
      
      &.status-inactive {
        border-left: 4px solid var(--error-color);
      }
      
      &.status-pending {
        border-left: 4px solid var(--warning-color);
      }
    }

    .restaurant-header-content {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg);
    }

    .restaurant-main-info {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
      flex: 1;
    }

    .restaurant-logo {
      flex-shrink: 0;
    }

    .logo-image {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      object-fit: cover;
      box-shadow: var(--elevation-1);
    }

    .logo-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: var(--elevation-1);
      
      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
    }

    .restaurant-details {
      flex: 1;
      min-width: 0;
    }

    .restaurant-name-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
      flex-wrap: wrap;
    }

    .restaurant-name {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.2;
    }

    .status-chip {
      font-weight: 600;
      font-size: 12px;
      
      &.status-active {
        background: var(--success-color);
        color: white;
      }
      
      &.status-inactive {
        background: var(--error-color);
        color: white;
      }
      
      &.status-pending {
        background: var(--warning-color);
        color: white;
      }
    }

    .restaurant-meta {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .location-info,
    .rating-info,
    .cuisine-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .meta-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #64748b;
    }

    .meta-text {
      font-size: 14px;
      color: #64748b;
      
      &.secondary {
        color: #94a3b8;
        font-size: 13px;
      }
    }

    .restaurant-actions {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      min-width: 200px;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .action-buttons button {
      justify-content: flex-start;
      gap: var(--spacing-sm);
      font-weight: 500;
    }

    .contact-divider {
      margin: var(--spacing-sm) 0;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .contact-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #64748b;
    }

    .contact-text {
      font-size: 14px;
      color: #64748b;
    }

    @media (max-width: 768px) {
      .restaurant-header-content {
        flex-direction: column;
        gap: var(--spacing-md);
      }
      
      .restaurant-main-info {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      
      .restaurant-name-section {
        justify-content: center;
      }
      
      .restaurant-actions {
        min-width: auto;
        width: 100%;
      }
      
      .action-buttons {
        flex-direction: row;
        flex-wrap: wrap;
      }
      
      .action-buttons button {
        flex: 1;
        min-width: 120px;
      }
    }
  `]
})
export class RestaurantHeaderComponent {
  @Input() restaurant!: RestaurantInfo;
  @Output() viewProfile = new EventEmitter<string>();
  @Output() viewMap = new EventEmitter<string>();
  @Output() editRestaurant = new EventEmitter<string>();

  protected getStatusClass(status: string): string {
    return `status-${status}`;
  }

  protected getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  }

  protected getStatusChipClass(status: string): string {
    return `status-${status}`;
  }

  protected getStatusTooltip(status: string): string {
    switch (status) {
      case 'active': return 'Restaurant is active and accepting orders';
      case 'inactive': return 'Restaurant is temporarily closed';
      case 'pending': return 'Restaurant is pending approval';
      default: return 'Unknown status';
    }
  }

  protected onViewProfile() {
    this.viewProfile.emit(this.restaurant.id);
  }

  protected onViewMap() {
    this.viewMap.emit(this.restaurant.id);
  }

  protected onEditRestaurant() {
    this.editRestaurant.emit(this.restaurant.id);
  }
}
