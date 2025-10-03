import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { RestaurantsListComponent } from '../../features/stores/pages/stores-list/stores-list';
import { SubscriptionsView } from '../../features/subscriptions/pages/subscriptions-view/subscriptions-view';
import { TenantsList } from '../../features/tenants/pages/tenants-list/tenants-list';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    TranslateModule,
    RestaurantsListComponent,
    SubscriptionsView,
    TenantsList
  ],
  template: `
    <div class="page-container">
      <!-- Tabs Section -->
      <div class="tabs-section">
        <mat-card class="tabs-card">
          <mat-tab-group class="customer-tabs" animationDuration="300ms">
            <mat-tab>
              <ng-template mat-tab-label>
                <div class="tab-label">
                  <mat-icon class="tab-icon">store</mat-icon>
                  <span class="tab-text">{{ 'nav.stores' | translate }}</span>
                  <div class="tab-indicator"></div>
                </div>
              </ng-template>
              <div class="tab-content">
                <app-stores-list></app-stores-list>
              </div>
            </mat-tab>
            
            <mat-tab>
              <ng-template mat-tab-label>
                <div class="tab-label">
                  <mat-icon class="tab-icon">subscriptions</mat-icon>
                  <span class="tab-text">{{ 'nav.subscriptions' | translate }}</span>
                  <div class="tab-indicator"></div>
                </div>
              </ng-template>
              <div class="tab-content">
                <app-subscriptions-view></app-subscriptions-view>
              </div>
            </mat-tab>
            
            <mat-tab>
              <ng-template mat-tab-label>
                <div class="tab-label">
                  <mat-icon class="tab-icon">people</mat-icon>
                  <span class="tab-text">Customers</span>
                  <div class="tab-indicator"></div>
                </div>
              </ng-template>
              <div class="tab-content">
                <app-tenants-list></app-tenants-list>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0;
      background: #f8fafc;
      min-height: 100vh;
    }

    /* Tabs Section */
    .tabs-section {
      padding: 32px;
    }

    .tabs-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .customer-tabs {
      width: 100%;
    }

    .tab-label {
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
      padding: 8px 0;
    }

    .tab-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #64748b;
      transition: color 0.3s ease;
    }

    .tab-text {
      font-weight: 500;
      color: #64748b;
      transition: color 0.3s ease;
    }

    .tab-indicator {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 2px;
      opacity: 0;
      transform: scaleX(0);
      transition: all 0.3s ease;
    }

    .tab-content {
      padding: 32px;
      min-height: 500px;
      background: #f8fafc;
    }

    /* Override Material tab styles */
    ::ng-deep .mat-mdc-tab-group {
      .mat-mdc-tab-header {
        background: white;
        border-bottom: 1px solid #e2e8f0;
        padding: 0 24px;
      }
      
      .mat-mdc-tab-label {
        display: flex;
        align-items: center;
        min-height: 64px;
        padding: 0 24px;
        margin: 0 8px;
        border-radius: 12px 12px 0 0;
        transition: all 0.3s ease;
        
        &:hover {
          background: #f1f5f9;
        }
        
        &.mdc-tab--active {
          background: #f8fafc;
          color: #3b82f6;
          
          .tab-icon {
            color: #3b82f6;
          }
          
          .tab-text {
            color: #3b82f6;
            font-weight: 600;
          }
          
          .tab-indicator {
            opacity: 1;
            transform: scaleX(1);
          }
        }
      }
      
      .mat-mdc-tab-body-wrapper {
        background: transparent;
      }
      
      .mat-mdc-tab-body-content {
        overflow: visible;
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .tabs-section {
        padding: 16px;
      }
      
      .tab-content {
        padding: 24px 16px;
      }
      
      ::ng-deep .mat-mdc-tab-label {
        padding: 0 16px;
        min-width: 120px;
        min-height: 56px;
        
        .tab-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    @media (max-width: 480px) {
      .tabs-section {
        padding: 12px;
      }
      
      .tab-content {
        padding: 20px 12px;
      }
    }
  `]
})
export class CustomersPage {}