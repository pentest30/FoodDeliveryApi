import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { OrdersService } from '../../data/orders.service';
import { 
  Order, 
  OrderListParams, 
  OrderStatus, 
  OrderStatistics,
  Money
} from '../../models/order.model';
import { OrderDetailsDialogComponent } from '../order-details-dialog/order-details-dialog.component';
import { OrderStatusDialogComponent } from '../order-status-dialog/order-status-dialog.component';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="orders-container">
      <!-- Header -->
      <div class="header">
        <div class="header-content">
          <div class="title-section">
            <mat-icon class="title-icon">receipt_long</mat-icon>
            <div class="title-text">
              <h1>Orders Management</h1>
              <p>Manage and track all restaurant orders</p>
            </div>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="refreshOrders()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="statistics-grid" *ngIf="statistics()">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon total">
                <mat-icon>receipt_long</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ statistics()?.totalOrders || 0 }}</div>
                <div class="stat-label">Total Orders</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon pending">
                <mat-icon>schedule</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ statistics()?.pendingOrders || 0 }}</div>
                <div class="stat-label">Pending</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon delivered">
                <mat-icon>done_all</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ statistics()?.deliveredOrders || 0 }}</div>
                <div class="stat-label">Delivered</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon revenue">
                <mat-icon>attach_money</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ formatCurrency(statistics()?.totalRevenue) }}</div>
                <div class="stat-label">Total Revenue</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filtersForm" class="filters-form">
            <div class="filters-row">
              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Search Orders</mat-label>
                <input matInput formControlName="search" placeholder="Search by order ID, customer name, or restaurant...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="">All Status</mat-option>
                  <mat-option *ngFor="let status of orderStatuses" [value]="status.value">
                    {{ status.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>From Date</mat-label>
                <input matInput [matDatepicker]="fromPicker" formControlName="fromDate">
                <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
                <mat-datepicker #fromPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>To Date</mat-label>
                <input matInput [matDatepicker]="toPicker" formControlName="toDate">
                <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
                <mat-datepicker #toPicker></mat-datepicker>
              </mat-form-field>

              <button mat-stroked-button type="button" (click)="clearFilters()">
                <mat-icon>clear</mat-icon>
                Clear
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Orders Table -->
      <mat-card class="orders-card">
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="orders()" matSort class="orders-table">
              <!-- Order ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Order ID</th>
                <td mat-cell *matCellDef="let order">
                  <div class="order-id">
                    <span class="order-id-text">{{ order.externalId }}</span>
                    <mat-icon class="copy-icon" matTooltip="Copy Order ID" (click)="copyOrderId(order.externalId)">
                      content_copy
                    </mat-icon>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let order">
                  <mat-chip [class]="'status-' + getStatusClass(order.status)" class="status-chip">
                    <mat-icon>{{ getStatusIcon(order.status) }}</mat-icon>
                    {{ order.status }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Customer Column -->
              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let order">
                  <div class="customer-info">
                    <div class="customer-name">{{ order.customer.name }}</div>
                    <div class="customer-phone">{{ order.customer.phone }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Restaurant Column -->
              <ng-container matColumnDef="restaurant">
                <th mat-header-cell *matHeaderCellDef>Restaurant</th>
                <td mat-cell *matCellDef="let order">
                  <div class="restaurant-info">
                    <mat-icon>restaurant</mat-icon>
                    <span>{{ order.restaurantName }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Items Column -->
              <ng-container matColumnDef="items">
                <th mat-header-cell *matHeaderCellDef>Items</th>
                <td mat-cell *matCellDef="let order">
                  <div class="items-info">
                    <span class="items-count">{{ order.items.length }} items</span>
                    <div class="items-preview">
                      <span *ngFor="let item of order.items.slice(0, 2)" class="item-preview">
                        {{ item.quantity }}x {{ item.name }}
                      </span>
                      <span *ngIf="order.items.length > 2" class="more-items">
                        +{{ order.items.length - 2 }} more
                      </span>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Total Column -->
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Total</th>
                <td mat-cell *matCellDef="let order">
                  <div class="total-info">
                    <div class="total-amount">{{ formatCurrency(order.total) }}</div>
                    <div class="delivery-fee" *ngIf="order.deliveryFee.amount > 0">
                      +{{ formatCurrency(order.deliveryFee) }} delivery
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Created At Column -->
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Created</th>
                <td mat-cell *matCellDef="let order">
                  <div class="date-info">
                    <div class="date">{{ formatDate(order.createdAt) }}</div>
                    <div class="eta" *ngIf="order.etaMinutes > 0">
                      ETA: {{ order.etaMinutes }}min
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let order">
                  <button mat-icon-button [matMenuTriggerFor]="orderMenu" [matMenuTriggerData]="{order: order}">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #orderMenu="matMenu">
                    <ng-template matMenuContent let-order="order">
                      <button mat-menu-item (click)="viewOrderDetails(order)">
                        <mat-icon>visibility</mat-icon>
                        View Details
                      </button>
                      <button mat-menu-item (click)="manageOrderStatus(order)" *ngIf="canManageStatus(order)">
                        <mat-icon>edit</mat-icon>
                        Manage Status
                      </button>
                      <button mat-menu-item (click)="copyOrderId(order.externalId)">
                        <mat-icon>content_copy</mat-icon>
                        Copy Order ID
                      </button>
                    </ng-template>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <!-- Loading Spinner -->
            <div class="loading-container" *ngIf="loading()">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading orders...</p>
            </div>

            <!-- Empty State -->
            <div class="empty-state" *ngIf="!loading() && orders().length === 0">
              <mat-icon class="empty-icon">receipt_long</mat-icon>
              <h3>No Orders Found</h3>
              <p>No orders match your current filters. Try adjusting your search criteria.</p>
              <button mat-raised-button color="primary" (click)="clearFilters()">
                <mat-icon>refresh</mat-icon>
                Clear Filters
              </button>
            </div>
          </div>

          <!-- Pagination -->
          <mat-paginator
            *ngIf="!loading() && orders().length > 0"
            [length]="totalCount()"
            [pageSize]="pageSize()"
            [pageSizeOptions]="[10, 25, 50, 100]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .orders-container {
      padding: 24px;
      max-width: 100%;
    }

    .header {
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .title-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #3b82f6;
    }

    .title-text h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
    }

    .title-text p {
      margin: 4px 0 0 0;
      color: #64748b;
      font-size: 16px;
    }

    .statistics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      border-radius: 12px;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.total {
      background-color: #dbeafe;
      color: #3b82f6;
    }

    .stat-icon.pending {
      background-color: #fef3c7;
      color: #f59e0b;
    }

    .stat-icon.delivered {
      background-color: #d1fae5;
      color: #10b981;
    }

    .stat-icon.revenue {
      background-color: #f3e8ff;
      color: #8b5cf6;
    }

    .stat-info {
      flex: 1;
    }

    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      line-height: 1;
    }

    .stat-label {
      font-size: 14px;
      color: #64748b;
      margin-top: 4px;
    }

    .filters-card {
      margin-bottom: 24px;
      border-radius: 12px;
    }

    .filters-form {
      width: 100%;
    }

    .filters-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr auto;
      gap: 16px;
      align-items: end;
    }

    .filter-field {
      width: 100%;
    }

    .orders-card {
      border-radius: 12px;
    }

    .table-container {
      overflow-x: auto;
    }

    .orders-table {
      width: 100%;
    }

    .order-id {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .order-id-text {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #1e293b;
    }

    .copy-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #64748b;
      cursor: pointer;
      transition: color 0.2s;
    }

    .copy-icon:hover {
      color: #3b82f6;
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

    .customer-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .customer-name {
      font-weight: 600;
      color: #1e293b;
    }

    .customer-phone {
      font-size: 14px;
      color: #64748b;
    }

    .restaurant-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .items-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .items-count {
      font-weight: 600;
      color: #1e293b;
    }

    .items-preview {
      font-size: 14px;
      color: #64748b;
    }

    .item-preview {
      display: block;
      margin-bottom: 2px;
    }

    .more-items {
      font-style: italic;
    }

    .total-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .total-amount {
      font-weight: 700;
      color: #1e293b;
      font-size: 16px;
    }

    .delivery-fee {
      font-size: 12px;
      color: #64748b;
    }

    .date-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .date {
      font-weight: 600;
      color: #1e293b;
    }

    .eta {
      font-size: 12px;
      color: #64748b;
    }

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

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #94a3b8;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #1e293b;
      font-size: 18px;
      font-weight: 600;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      color: #64748b;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .filters-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .statistics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OrdersListComponent implements OnInit, OnDestroy {
  private readonly ordersService = inject(OrdersService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  // Signals
  orders = signal<Order[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  pageSize = signal(10);
  statistics = signal<OrderStatistics | null>(null);

  // Form
  filtersForm = new FormGroup({
    search: new FormControl(''),
    status: new FormControl(''),
    fromDate: new FormControl<Date | null>(null),
    toDate: new FormControl<Date | null>(null)
  });

  // Table configuration
  displayedColumns: string[] = [
    'id', 'status', 'customer', 'restaurant', 'total', 'createdAt', 'actions'
  ];

  orderStatuses = [
    { value: OrderStatus.Pending, label: 'Pending' },
    { value: OrderStatus.Confirmed, label: 'Confirmed' },
    { value: OrderStatus.ReadyForPickup, label: 'Ready for Pickup' },
    { value: OrderStatus.OutForDelivery, label: 'Out for Delivery' },
    { value: OrderStatus.Delivered, label: 'Delivered' },
    { value: OrderStatus.Canceled, label: 'Canceled' },
    { value: OrderStatus.Failed, label: 'Failed' }
  ];

  ngOnInit() {
    this.loadOrders();
    this.loadStatistics();
    this.setupFilters();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilters() {
    this.filtersForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadOrders();
      });
  }

  private loadOrders() {
    this.loading.set(true);
    
    const params: OrderListParams = {
      page: 1,
      pageSize: this.pageSize(),
      search: this.filtersForm.value.search || undefined,
      status: this.filtersForm.value.status as OrderStatus || undefined,
      fromDate: this.filtersForm.value.fromDate?.toISOString(),
      toDate: this.filtersForm.value.toDate?.toISOString()
    };

    this.ordersService.getOrders(params).subscribe({
      next: (response) => {
        this.orders.set(response.data);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.snackBar.open('Error loading orders', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  private loadStatistics() {
    this.ordersService.getOrderStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  refreshOrders() {
    this.loadOrders();
    this.loadStatistics();
  }

  clearFilters() {
    this.filtersForm.reset();
  }

  onPageChange(event: PageEvent) {
    this.pageSize.set(event.pageSize);
    this.loadOrders();
  }

  viewOrderDetails(order: Order) {
    this.dialog.open(OrderDetailsDialogComponent, {
      data: { order },
      width: '1000px',
      maxHeight: '90vh'
    });
  }

  manageOrderStatus(order: Order) {
    this.dialog.open(OrderStatusDialogComponent, {
      data: { order },
      width: '600px'
    }).afterClosed().subscribe(result => {
      if (result) {
        this.refreshOrders();
      }
    });
  }

  canManageStatus(order: Order): boolean {
    const stateMachine = this.ordersService.getOrderStateMachine(order);
    return stateMachine.availableTransitions.length > 0;
  }

  copyOrderId(orderId: string) {
    navigator.clipboard.writeText(orderId).then(() => {
      this.snackBar.open('Order ID copied to clipboard', 'Close', { duration: 2000 });
    });
  }

  formatCurrency(money: Money | undefined): string {
    if (!money) return '$0.00';
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
