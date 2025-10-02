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
      <div class="page-header">
        <mat-icon class="page-icon">people</mat-icon>
        <h1>{{ 'nav.customers' | translate }}</h1>
      </div>
      
      <mat-card class="tabs-card">
        <mat-tab-group class="customer-tabs" animationDuration="300ms">
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">store</mat-icon>
              {{ 'nav.stores' | translate }}
            </ng-template>
            <div class="tab-content">
              <app-stores-list></app-stores-list>
            </div>
          </mat-tab>
          
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">subscriptions</mat-icon>
              {{ 'nav.subscriptions' | translate }}
            </ng-template>
            <div class="tab-content">
              <app-subscriptions-view></app-subscriptions-view>
            </div>
          </mat-tab>
          
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">business</mat-icon>
              {{ 'nav.tenants' | translate }}
            </ng-template>
            <div class="tab-content">
              <app-tenants-list></app-tenants-list>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .page-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #3f51b5;
    }

    h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.87);
    }

    .tabs-card {
      margin-bottom: 24px;
      padding: 0;
    }

    .customer-tabs {
      width: 100%;
    }

    .tab-icon {
      margin-right: 8px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .tab-content {
      padding: 24px;
      min-height: 400px;
    }

    // Override Material tab styles
    ::ng-deep .mat-mdc-tab-group {
      .mat-mdc-tab-header {
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      }
      
      .mat-mdc-tab-label {
        display: flex;
        align-items: center;
        min-height: 48px;
        padding: 0 24px;
        
        &.mdc-tab--active {
          color: #3f51b5;
        }
      }
      
      .mat-mdc-tab-body-wrapper {
        background: transparent;
      }
    }

    // Responsive design
    @media (max-width: 768px) {
      .page-container {
        padding: 0 8px;
      }
      
      .tab-content {
        padding: 16px;
      }
      
      ::ng-deep .mat-mdc-tab-label {
        padding: 0 16px;
        min-width: 120px;
        
        .tab-icon {
          margin-right: 4px;
        }
      }
    }
  `]
})
export class CustomersPage {}