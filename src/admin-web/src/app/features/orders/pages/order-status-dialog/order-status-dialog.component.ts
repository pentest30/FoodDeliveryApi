import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { Order, OrderStatus, OrderStateMachine, Money } from '../../models/order.model';
import { OrdersService } from '../../data/orders.service';

interface OrderStatusDialogData {
  order: Order;
}

@Component({
  selector: 'app-order-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="order-status-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-content">
          <div class="order-info">
            <h2 mat-dialog-title>Manage Order Status</h2>
            <div class="order-id">{{ data.order.externalId }}</div>
          </div>
          <div class="current-status">
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
        <!-- State Machine Information -->
        <mat-card class="state-machine-card">
          <mat-card-header>
            <mat-card-title>Available Actions</mat-card-title>
            <mat-card-subtitle>Select an action to change the order status</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="state-machine" *ngIf="stateMachine()">
              <div class="current-state">
                <div class="state-info">
                  <mat-icon class="state-icon">{{ getStatusIcon(data.order.status) }}</mat-icon>
                  <div class="state-details">
                    <div class="state-name">{{ data.order.status }}</div>
                    <div class="state-description">{{ getStatusDescription(data.order.status) }}</div>
                  </div>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="available-transitions" *ngIf="stateMachine() && stateMachine()!.availableTransitions.length > 0">
                <div class="transitions-title">Available Actions:</div>
                <div class="transitions-list">
                  <div class="transition-item" *ngFor="let transition of stateMachine()?.availableTransitions">
                    <button 
                      mat-stroked-button 
                      class="transition-button"
                      (click)="selectTransition(transition)"
                      [class.selected]="selectedTransition()?.action === transition.action">
                      <mat-icon>{{ getActionIcon(transition.action) }}</mat-icon>
                      {{ transition.description }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="no-transitions" *ngIf="stateMachine() && stateMachine()!.availableTransitions.length === 0">
                <mat-icon class="no-transitions-icon">lock</mat-icon>
                <div class="no-transitions-text">
                  <div class="no-transitions-title">No Actions Available</div>
                  <div class="no-transitions-description">
                    This order is in a terminal state and cannot be modified.
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Action Form -->
        <mat-card class="action-form-card" *ngIf="selectedTransition()">
          <mat-card-header>
            <mat-card-title>{{ selectedTransition()?.description }}</mat-card-title>
            <mat-card-subtitle>Provide additional information for this action</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="actionForm" class="action-form">
              <!-- Reason field for actions that require it -->
              <mat-form-field appearance="outline" *ngIf="selectedTransition()?.requiresReason">
                <mat-label>Reason</mat-label>
                <textarea 
                  matInput 
                  formControlName="reason" 
                  placeholder="Enter the reason for this action..."
                  rows="3">
                </textarea>
                <mat-hint>This reason will be recorded in the order history</mat-hint>
              </mat-form-field>

              <!-- Additional fields based on action type -->
              <mat-form-field appearance="outline" *ngIf="selectedTransition()?.action === 'markReady'">
                <mat-label>Estimated Ready Time</mat-label>
                <input 
                  matInput 
                  formControlName="estimatedReadyTime" 
                  type="datetime-local"
                  placeholder="When will the order be ready for pickup?">
                <mat-hint>Optional: Specify when the order will be ready</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" *ngIf="selectedTransition()?.action === 'moveOut'">
                <mat-label>Delivery Person ID</mat-label>
                <input 
                  matInput 
                  formControlName="deliveryPersonId" 
                  placeholder="Enter delivery person ID">
                <mat-hint>Optional: Assign a specific delivery person</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" *ngIf="selectedTransition()?.action === 'moveOut'">
                <mat-label>Estimated Delivery Time</mat-label>
                <input 
                  matInput 
                  formControlName="estimatedDeliveryTime" 
                  type="datetime-local"
                  placeholder="When will the order be delivered?">
                <mat-hint>Optional: Specify estimated delivery time</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" *ngIf="selectedTransition()?.action === 'complete'">
                <mat-label>Delivery Notes</mat-label>
                <textarea 
                  matInput 
                  formControlName="deliveryNotes" 
                  placeholder="Any notes about the delivery..."
                  rows="3">
                </textarea>
                <mat-hint>Optional: Add notes about the delivery completion</mat-hint>
              </mat-form-field>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Order Summary -->
        <mat-card class="order-summary-card">
          <mat-card-header>
            <mat-card-title>Order Summary</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">Customer</div>
                <div class="summary-value">{{ data.order.customer.name }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Restaurant</div>
                <div class="summary-value">{{ data.order.restaurantName }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Total</div>
                <div class="summary-value">{{ formatCurrency(data.order.total) }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Items</div>
                <div class="summary-value">{{ data.order.items.length }} items</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Actions -->
      <div class="dialog-actions">
        <button mat-button mat-dialog-close>Cancel</button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="executeAction()"
          [disabled]="!canExecuteAction()"
          [class.loading]="loading()">
          <mat-icon *ngIf="!loading()">{{ getActionIcon(selectedTransition()?.action || '') }}</mat-icon>
          <mat-spinner *ngIf="loading()" diameter="20"></mat-spinner>
          {{ loading() ? 'Processing...' : (selectedTransition()?.description || 'Execute Action') }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .order-status-dialog {
      max-width: 600px;
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

    .state-machine-card,
    .action-form-card,
    .order-summary-card {
      border-radius: 12px;
    }

    .current-state {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background-color: #f8fafc;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .state-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #3b82f6;
    }

    .state-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 16px;
    }

    .state-description {
      color: #64748b;
      font-size: 14px;
      margin-top: 2px;
    }

    .transitions-title {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 12px;
    }

    .transitions-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .transition-button {
      justify-content: flex-start;
      text-align: left;
      padding: 12px 16px;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .transition-button:hover {
      background-color: #f1f5f9;
    }

    .transition-button.selected {
      background-color: #dbeafe;
      color: #3b82f6;
      border-color: #3b82f6;
    }

    .no-transitions {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      text-align: center;
      color: #64748b;
    }

    .no-transitions-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #94a3b8;
    }

    .no-transitions-title {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .no-transitions-description {
      font-size: 14px;
    }

    .action-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .summary-label {
      font-size: 14px;
      color: #64748b;
      font-weight: 600;
    }

    .summary-value {
      font-weight: 600;
      color: #1e293b;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid #e2e8f0;
      margin-top: 24px;
    }

    .loading {
      opacity: 0.7;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      
      .summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OrderStatusDialogComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<OrderStatusDialogComponent>);
  readonly data = inject<OrderStatusDialogData>(MAT_DIALOG_DATA);

  // Signals
  stateMachine = signal<OrderStateMachine | null>(null);
  selectedTransition = signal<any>(null);
  loading = signal(false);

  // Form
  actionForm = new FormGroup({
    reason: new FormControl(''),
    estimatedReadyTime: new FormControl(''),
    deliveryPersonId: new FormControl(''),
    estimatedDeliveryTime: new FormControl(''),
    deliveryNotes: new FormControl('')
  });

  ngOnInit() {
    this.initializeStateMachine();
  }

  private initializeStateMachine() {
    const stateMachine = this.ordersService.getOrderStateMachine(this.data.order);
    this.stateMachine.set(stateMachine);
  }

  selectTransition(transition: any) {
    this.selectedTransition.set(transition);
    
    // Reset form when selecting a new transition
    this.actionForm.reset();
    
    // Set required validators based on transition
    if (transition.requiresReason) {
      this.actionForm.get('reason')?.setValidators([Validators.required]);
    } else {
      this.actionForm.get('reason')?.clearValidators();
    }
    
    this.actionForm.updateValueAndValidity();
  }

  canExecuteAction(): boolean {
    if (!this.selectedTransition()) return false;
    
    const form = this.actionForm;
    const transition = this.selectedTransition();
    
    if (transition.requiresReason && !form.get('reason')?.value?.trim()) {
      return false;
    }
    
    return form.valid;
  }

  executeAction() {
    if (!this.selectedTransition() || !this.canExecuteAction()) return;
    
    this.loading.set(true);
    
    const transition = this.selectedTransition();
    const formValue = this.actionForm.value;
    
    let command: any = { orderId: this.data.order.id };
    
    switch (transition.action) {
      case 'confirm':
        command = { orderId: this.data.order.id, reason: formValue.reason };
        this.ordersService.confirmOrder(command).subscribe({
          next: (order) => this.handleSuccess('Order confirmed successfully', order),
          error: (error) => this.handleError('Error confirming order', error)
        });
        break;
        
      case 'cancel':
        command = { orderId: this.data.order.id, reason: formValue.reason };
        this.ordersService.cancelOrder(command).subscribe({
          next: (order) => this.handleSuccess('Order canceled successfully', order),
          error: (error) => this.handleError('Error canceling order', error)
        });
        break;
        
      case 'fail':
        command = { orderId: this.data.order.id, reason: formValue.reason };
        this.ordersService.failOrder(command).subscribe({
          next: (order) => this.handleSuccess('Order marked as failed', order),
          error: (error) => this.handleError('Error failing order', error)
        });
        break;
        
      case 'markReady':
        command = { 
          orderId: this.data.order.id, 
          estimatedReadyTime: formValue.estimatedReadyTime 
        };
        this.ordersService.markReadyForPickup(command).subscribe({
          next: (order) => this.handleSuccess('Order marked ready for pickup', order),
          error: (error) => this.handleError('Error marking order ready', error)
        });
        break;
        
      case 'moveOut':
        command = { 
          orderId: this.data.order.id,
          deliveryPersonId: formValue.deliveryPersonId,
          estimatedDeliveryTime: formValue.estimatedDeliveryTime
        };
        this.ordersService.moveOutForDelivery(command).subscribe({
          next: (order) => this.handleSuccess('Order moved out for delivery', order),
          error: (error) => this.handleError('Error moving order out for delivery', error)
        });
        break;
        
      case 'complete':
        command = { 
          orderId: this.data.order.id,
          deliveryNotes: formValue.deliveryNotes
        };
        this.ordersService.completeDelivery(command).subscribe({
          next: (order) => this.handleSuccess('Order delivery completed', order),
          error: (error) => this.handleError('Error completing delivery', error)
        });
        break;
        
      default:
        this.handleError('Unknown action', new Error('Unknown action'));
        break;
    }
  }

  private handleSuccess(message: string, order: Order) {
    this.loading.set(false);
    this.snackBar.open(message, 'Close', { duration: 3000 });
    this.dialogRef.close(order);
  }

  private handleError(message: string, error: any) {
    this.loading.set(false);
    console.error(message, error);
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }

  formatCurrency(money: Money): string {
    return this.ordersService.formatCurrency(money);
  }

  getStatusIcon(status: OrderStatus): string {
    return this.ordersService.getStatusIcon(status);
  }

  getStatusClass(status: OrderStatus): string {
    return status.toLowerCase();
  }

  getStatusDescription(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'Order has been placed and is waiting for confirmation';
      case OrderStatus.Confirmed:
        return 'Order has been confirmed and is being prepared';
      case OrderStatus.ReadyForPickup:
        return 'Order is ready for pickup or delivery';
      case OrderStatus.OutForDelivery:
        return 'Order is out for delivery';
      case OrderStatus.Delivered:
        return 'Order has been successfully delivered';
      case OrderStatus.Canceled:
        return 'Order has been canceled';
      case OrderStatus.Failed:
        return 'Order has failed';
      default:
        return 'Unknown status';
    }
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'confirm':
        return 'check_circle';
      case 'cancel':
        return 'cancel';
      case 'fail':
        return 'error';
      case 'markReady':
        return 'restaurant';
      case 'moveOut':
        return 'local_shipping';
      case 'complete':
        return 'done_all';
      default:
        return 'help';
    }
  }
}
