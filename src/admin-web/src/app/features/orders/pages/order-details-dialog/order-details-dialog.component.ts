import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Order, OrderStatus, Money } from '../../models/order.model';
import { OrdersService } from '../../data/orders.service';
import { OrderStatusDialogComponent } from '../order-status-dialog/order-status-dialog.component';

interface OrderDetailsDialogData {
  order: Order;
}

@Component({
  selector: 'app-order-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  template: `
    <div class="order-details-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-content">
          <div class="order-info">
            <h2 mat-dialog-title>Order Details</h2>
            <div class="order-id">
              <span class="order-id-text">{{ data.order.externalId }}</span>
              <button mat-icon-button (click)="copyOrderId()" matTooltip="Copy Order ID">
                <mat-icon>content_copy</mat-icon>
              </button>
            </div>
          </div>
          <div class="order-status">
            <mat-chip [class]="'status-' + getStatusClass(data.order.status)" class="status-chip">
              <mat-icon>{{ getStatusIcon(data.order.status) }}</mat-icon>
              {{ data.order.status }}
            </mat-chip>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <!-- Order Overview -->
        <mat-card class="overview-card">
          <mat-card-header>
            <mat-card-title>Order Overview</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="overview-grid">
              <div class="overview-item">
                <mat-icon>schedule</mat-icon>
                <div class="overview-content">
                  <div class="overview-label">Created</div>
                  <div class="overview-value">{{ formatDate(data.order.createdAt) }}</div>
                </div>
              </div>
              <div class="overview-item" *ngIf="data.order.etaMinutes > 0">
                <mat-icon>timer</mat-icon>
                <div class="overview-content">
                  <div class="overview-label">ETA</div>
                  <div class="overview-value">{{ data.order.etaMinutes }} minutes</div>
                </div>
              </div>
              <div class="overview-item">
                <mat-icon>restaurant</mat-icon>
                <div class="overview-content">
                  <div class="overview-label">Restaurant</div>
                  <div class="overview-value">{{ data.order.restaurantName }}</div>
                </div>
              </div>
              <div class="overview-item">
                <mat-icon>attach_money</mat-icon>
                <div class="overview-content">
                  <div class="overview-label">Total</div>
                  <div class="overview-value">{{ formatCurrency(data.order.total) }}</div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Customer Information -->
        <mat-card class="customer-card">
          <mat-card-header>
            <mat-card-title>Customer Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="customer-details">
              <div class="customer-item">
                <mat-icon>person</mat-icon>
                <div class="customer-content">
                  <div class="customer-label">Name</div>
                  <div class="customer-value">{{ data.order.customer.name }}</div>
                </div>
              </div>
              <div class="customer-item">
                <mat-icon>phone</mat-icon>
                <div class="customer-content">
                  <div class="customer-label">Phone</div>
                  <div class="customer-value">{{ data.order.customer.phone }}</div>
                </div>
              </div>
              <div class="customer-item">
                <mat-icon>badge</mat-icon>
                <div class="customer-content">
                  <div class="customer-label">User ID</div>
                  <div class="customer-value">{{ data.order.customer.userId }}</div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Delivery Address -->
        <mat-card class="address-card">
          <mat-card-header>
            <mat-card-title>Delivery Address</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="address-details">
              <div class="address-item">
                <mat-icon>location_on</mat-icon>
                <div class="address-content">
                  <div class="address-full">{{ data.order.deliveryAddress.fullAddress }}</div>
                  <div class="address-breakdown">
                    <span *ngIf="data.order.deliveryAddress.street">{{ data.order.deliveryAddress.street }}</span>
                    <span *ngIf="data.order.deliveryAddress.city">{{ data.order.deliveryAddress.city }}</span>
                    <span *ngIf="data.order.deliveryAddress.state">{{ data.order.deliveryAddress.state }}</span>
                    <span *ngIf="data.order.deliveryAddress.zip">{{ data.order.deliveryAddress.zip }}</span>
                  </div>
                </div>
              </div>
              <div class="address-actions" *ngIf="data.order.deliveryAddress.latitude && data.order.deliveryAddress.longitude">
                <button mat-stroked-button (click)="openInMaps()">
                  <mat-icon>map</mat-icon>
                  Open in Maps
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Order Items -->
        <mat-card class="items-card">
          <mat-card-header>
            <mat-card-title>Order Items</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="items-list">
              <div class="item" *ngFor="let item of data.order.items">
                <div class="item-main">
                  <div class="item-info">
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-quantity">Quantity: {{ item.quantity }}</div>
                    <div class="item-variants" *ngIf="item.variants && item.variants.length > 0">
                      <div class="variant" *ngFor="let variant of item.variants">
                        <span class="variant-name">{{ variant.name }}</span>
                        <span class="variant-price">{{ formatCurrency(variant.price) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="item-pricing">
                    <div class="item-unit-price">{{ formatCurrency(item.unitPrice) }} each</div>
                    <div class="item-total">{{ formatCurrency(item.total) }}</div>
                  </div>
                </div>
                <mat-divider *ngIf="item !== data.order.items[data.order.items.length - 1]"></mat-divider>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Order Summary -->
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Order Summary</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="summary-details">
              <div class="summary-row">
                <span class="summary-label">Subtotal</span>
                <span class="summary-value">{{ formatCurrency(data.order.subtotal) }}</span>
              </div>
              <div class="summary-row" *ngIf="data.order.deliveryFee.amount > 0">
                <span class="summary-label">Delivery Fee</span>
                <span class="summary-value">{{ formatCurrency(data.order.deliveryFee) }}</span>
              </div>
              <mat-divider></mat-divider>
              <div class="summary-row total-row">
                <span class="summary-label">Total</span>
                <span class="summary-value">{{ formatCurrency(data.order.total) }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Order Timeline -->
        <mat-card class="timeline-card" *ngIf="data.order.updatedAt || data.order.completedAt || data.order.canceledAt || data.order.failedAt">
          <mat-card-header>
            <mat-card-title>Order Timeline</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-marker created">
                  <mat-icon>add</mat-icon>
                </div>
                <div class="timeline-content">
                  <div class="timeline-title">Order Created</div>
                  <div class="timeline-time">{{ formatDate(data.order.createdAt) }}</div>
                </div>
              </div>
              
              <div class="timeline-item" *ngIf="data.order.updatedAt">
                <div class="timeline-marker updated">
                  <mat-icon>edit</mat-icon>
                </div>
                <div class="timeline-content">
                  <div class="timeline-title">Order Updated</div>
                  <div class="timeline-time">{{ formatDate(data.order.updatedAt) }}</div>
                </div>
              </div>
              
              <div class="timeline-item" *ngIf="data.order.completedAt">
                <div class="timeline-marker completed">
                  <mat-icon>done_all</mat-icon>
                </div>
                <div class="timeline-content">
                  <div class="timeline-title">Order Completed</div>
                  <div class="timeline-time">{{ formatDate(data.order.completedAt) }}</div>
                </div>
              </div>
              
              <div class="timeline-item" *ngIf="data.order.canceledAt">
                <div class="timeline-marker canceled">
                  <mat-icon>cancel</mat-icon>
                </div>
                <div class="timeline-content">
                  <div class="timeline-title">Order Canceled</div>
                  <div class="timeline-time">{{ formatDate(data.order.canceledAt) }}</div>
                  <div class="timeline-reason" *ngIf="data.order.canceledReason">
                    Reason: {{ data.order.canceledReason }}
                  </div>
                </div>
              </div>
              
              <div class="timeline-item" *ngIf="data.order.failedAt">
                <div class="timeline-marker failed">
                  <mat-icon>error</mat-icon>
                </div>
                <div class="timeline-content">
                  <div class="timeline-title">Order Failed</div>
                  <div class="timeline-time">{{ formatDate(data.order.failedAt) }}</div>
                  <div class="timeline-reason" *ngIf="data.order.failedReason">
                    Reason: {{ data.order.failedReason }}
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Actions -->
      <div class="dialog-actions">
        <button mat-button mat-dialog-close>Close</button>
        <button mat-raised-button color="primary" (click)="manageStatus()">
          <mat-icon>edit</mat-icon>
          Manage Status
        </button>
      </div>
    </div>
  `,
  styles: [`
    .order-details-dialog {
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 0 24px;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 24px;
      flex: 1;
    }

    .order-info h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .order-id {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .order-id-text {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #64748b;
      font-size: 14px;
    }

    .status-chip {
      font-weight: 600;
    }

    .status-Pending {
      background-color: #fef3c7;
      color: #f59e0b;
    }

    .status-Confirmed {
      background-color: #dbeafe;
      color: #3b82f6;
    }

    .status-ReadyForPickup {
      background-color: #e0e7ff;
      color: #6366f1;
    }

    .status-OutForDelivery {
      background-color: #f3e8ff;
      color: #8b5cf6;
    }

    .status-Delivered {
      background-color: #d1fae5;
      color: #10b981;
    }

    .status-Canceled,
    .status-Failed {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .dialog-content {
      padding: 0 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .overview-card,
    .customer-card,
    .address-card,
    .items-card,
    .summary-card,
    .timeline-card {
      border-radius: 12px;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .overview-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .overview-item mat-icon {
      color: #3b82f6;
    }

    .overview-label {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 4px;
    }

    .overview-value {
      font-weight: 600;
      color: #1e293b;
    }

    .customer-details {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .customer-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .customer-item mat-icon {
      color: #3b82f6;
    }

    .customer-label {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 4px;
    }

    .customer-value {
      font-weight: 600;
      color: #1e293b;
    }

    .address-details {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .address-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
    }

    .address-item mat-icon {
      color: #3b82f6;
      margin-top: 4px;
    }

    .address-full {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .address-breakdown {
      font-size: 14px;
      color: #64748b;
    }

    .address-breakdown span:not(:last-child)::after {
      content: ', ';
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .item {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .item-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .item-info {
      flex: 1;
    }

    .item-name {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .item-quantity {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 8px;
    }

    .item-variants {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .variant {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      color: #64748b;
    }

    .variant-name {
      font-style: italic;
    }

    .variant-price {
      font-weight: 600;
    }

    .item-pricing {
      text-align: right;
    }

    .item-unit-price {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 4px;
    }

    .item-total {
      font-weight: 700;
      color: #1e293b;
      font-size: 16px;
    }

    .summary-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .summary-label {
      color: #64748b;
    }

    .summary-value {
      font-weight: 600;
      color: #1e293b;
    }

    .total-row {
      font-size: 18px;
      font-weight: 700;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .timeline-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .timeline-marker {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .timeline-marker.created {
      background-color: #dbeafe;
      color: #3b82f6;
    }

    .timeline-marker.updated {
      background-color: #fef3c7;
      color: #f59e0b;
    }

    .timeline-marker.completed {
      background-color: #d1fae5;
      color: #10b981;
    }

    .timeline-marker.canceled,
    .timeline-marker.failed {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .timeline-content {
      flex: 1;
    }

    .timeline-title {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .timeline-time {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 4px;
    }

    .timeline-reason {
      font-size: 14px;
      color: #64748b;
      font-style: italic;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid #e2e8f0;
      margin-top: 24px;
    }

    @media (max-width: 768px) {
      .overview-grid {
        grid-template-columns: 1fr;
      }
      
      .address-details {
        flex-direction: column;
        align-items: stretch;
      }
      
      .item-main {
        flex-direction: column;
        gap: 8px;
      }
      
      .item-pricing {
        text-align: left;
      }
    }
  `]
})
export class OrderDetailsDialogComponent {
  private readonly ordersService = inject(OrdersService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<OrderDetailsDialogComponent>);
  readonly data = inject<OrderDetailsDialogData>(MAT_DIALOG_DATA);

  copyOrderId() {
    navigator.clipboard.writeText(this.data.order.externalId).then(() => {
      this.snackBar.open('Order ID copied to clipboard', 'Close', { duration: 2000 });
    });
  }

  openInMaps() {
    const lat = this.data.order.deliveryAddress.latitude;
    const lng = this.data.order.deliveryAddress.longitude;
    if (lat && lng) {
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, '_blank');
    }
  }

  manageStatus() {
    this.dialog.open(OrderStatusDialogComponent, {
      data: { order: this.data.order },
      width: '600px'
    }).afterClosed().subscribe((result: any) => {
      if (result) {
        this.dialogRef.close(true);
      }
    });
  }

  formatCurrency(money: Money): string {
    return this.ordersService.formatCurrency(money);
  }

  formatDate(dateString: string): string {
    return this.ordersService.formatDate(dateString);
  }

  getStatusIcon(status: OrderStatus): string {
    return this.ordersService.getStatusIcon(status);
  }

  getStatusClass(status: OrderStatus): string {
    return status.toLowerCase();
  }
}
