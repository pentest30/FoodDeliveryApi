import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { 
  Order, 
  OrderListParams, 
  OrderListResponse, 
  OrderStatistics,
  ConfirmOrderCommand,
  CancelOrderCommand,
  FailOrderCommand,
  MarkReadyForPickupCommand,
  MoveOutForDeliveryCommand,
  CompleteDeliveryCommand,
  OrderStateMachine,
  OrderStatus,
  Money
} from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Read operations (Queries)
  getOrders(params: OrderListParams = {}): Observable<OrderListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params.toDate) queryParams.append('toDate', params.toDate);
    if (params.restaurantId) queryParams.append('restaurantId', params.restaurantId);
    if (params.customerId) queryParams.append('customerId', params.customerId);
    if (params.search) queryParams.append('search', params.search);

    const url = `${this.baseUrl}/orders?${queryParams.toString()}`;
    
    return this.http.get<OrderListResponse>(url).pipe(
      catchError(error => {
        console.error('Error fetching orders:', error);
        return of({
          data: [],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false
        });
      })
    );
  }

  getOrderById(id: string): Observable<Order | null> {
    return this.http.get<Order>(`${this.baseUrl}/orders/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching order:', error);
        return of(null);
      })
    );
  }

  getOrderStatistics(): Observable<OrderStatistics> {
    return this.http.get<OrderStatistics>(`${this.baseUrl}/orders/statistics`).pipe(
      catchError(error => {
        console.error('Error fetching order statistics:', error);
        return of({
          totalOrders: 0,
          pendingOrders: 0,
          confirmedOrders: 0,
          readyForPickupOrders: 0,
          outForDeliveryOrders: 0,
          deliveredOrders: 0,
          canceledOrders: 0,
          failedOrders: 0,
          totalRevenue: { amount: 0, currency: 'DZD' },
          averageOrderValue: { amount: 0, currency: 'DZD' },
          ordersToday: 0,
          ordersThisWeek: 0,
          ordersThisMonth: 0
        });
      })
    );
  }

  // Command operations (CQRS)
  confirmOrder(command: ConfirmOrderCommand): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders/${command.orderId}/confirm`, {
      reason: command.reason
    }).pipe(
      catchError(error => {
        console.error('Error confirming order:', error);
        throw error;
      })
    );
  }

  cancelOrder(command: CancelOrderCommand): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders/${command.orderId}/cancel`, {
      reason: command.reason
    }).pipe(
      catchError(error => {
        console.error('Error canceling order:', error);
        throw error;
      })
    );
  }

  failOrder(command: FailOrderCommand): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders/${command.orderId}/fail`, {
      reason: command.reason
    }).pipe(
      catchError(error => {
        console.error('Error failing order:', error);
        throw error;
      })
    );
  }

  markReadyForPickup(command: MarkReadyForPickupCommand): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders/${command.orderId}/ready-for-pickup`, {
      estimatedReadyTime: command.estimatedReadyTime
    }).pipe(
      catchError(error => {
        console.error('Error marking order ready for pickup:', error);
        throw error;
      })
    );
  }

  moveOutForDelivery(command: MoveOutForDeliveryCommand): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders/${command.orderId}/move-out-for-delivery`, {
      deliveryPersonId: command.deliveryPersonId,
      estimatedDeliveryTime: command.estimatedDeliveryTime
    }).pipe(
      catchError(error => {
        console.error('Error moving order out for delivery:', error);
        throw error;
      })
    );
  }

  completeDelivery(command: CompleteDeliveryCommand): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders/${command.orderId}/complete-delivery`, {
      deliveryNotes: command.deliveryNotes
    }).pipe(
      catchError(error => {
        console.error('Error completing delivery:', error);
        throw error;
      })
    );
  }

  // State machine helpers
  getOrderStateMachine(order: Order): OrderStateMachine {
    const currentStatus = order.status;
    
    const availableTransitions: OrderStateTransition[] = [];
    let canCancel = false;
    let canFail = false;
    let canConfirm = false;
    let canMarkReady = false;
    let canMoveOut = false;
    let canComplete = false;

    switch (currentStatus) {
      case OrderStatus.Pending:
        availableTransitions.push(
          { from: OrderStatus.Pending, to: OrderStatus.Confirmed, action: 'confirm', description: 'Confirm Order', allowed: true, requiresReason: false },
          { from: OrderStatus.Pending, to: OrderStatus.Canceled, action: 'cancel', description: 'Cancel Order', allowed: true, requiresReason: true },
          { from: OrderStatus.Pending, to: OrderStatus.Failed, action: 'fail', description: 'Fail Order', allowed: true, requiresReason: true }
        );
        canConfirm = true;
        canCancel = true;
        canFail = true;
        break;

      case OrderStatus.Confirmed:
        availableTransitions.push(
          { from: OrderStatus.Confirmed, to: OrderStatus.ReadyForPickup, action: 'markReady', description: 'Mark Ready for Pickup', allowed: true, requiresReason: false },
          { from: OrderStatus.Confirmed, to: OrderStatus.Canceled, action: 'cancel', description: 'Cancel Order', allowed: true, requiresReason: true },
          { from: OrderStatus.Confirmed, to: OrderStatus.Failed, action: 'fail', description: 'Fail Order', allowed: true, requiresReason: true }
        );
        canMarkReady = true;
        canCancel = true;
        canFail = true;
        break;

      case OrderStatus.ReadyForPickup:
        availableTransitions.push(
          { from: OrderStatus.ReadyForPickup, to: OrderStatus.OutForDelivery, action: 'moveOut', description: 'Move Out for Delivery', allowed: true, requiresReason: false },
          { from: OrderStatus.ReadyForPickup, to: OrderStatus.Canceled, action: 'cancel', description: 'Cancel Order', allowed: true, requiresReason: true },
          { from: OrderStatus.ReadyForPickup, to: OrderStatus.Failed, action: 'fail', description: 'Fail Order', allowed: true, requiresReason: true }
        );
        canMoveOut = true;
        canCancel = true;
        canFail = true;
        break;

      case OrderStatus.OutForDelivery:
        availableTransitions.push(
          { from: OrderStatus.OutForDelivery, to: OrderStatus.Delivered, action: 'complete', description: 'Complete Delivery', allowed: true, requiresReason: false },
          { from: OrderStatus.OutForDelivery, to: OrderStatus.Failed, action: 'fail', description: 'Fail Order', allowed: true, requiresReason: true }
        );
        canComplete = true;
        canFail = true;
        break;

      case OrderStatus.Delivered:
      case OrderStatus.Canceled:
      case OrderStatus.Failed:
        // Terminal states - no transitions allowed
        break;
    }

    return {
      currentStatus,
      availableTransitions,
      canCancel,
      canFail,
      canConfirm,
      canMarkReady,
      canMoveOut,
      canComplete
    };
  }

  // Utility methods
  formatCurrency(money: Money | undefined): string {
    if (!money) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: money.currency
    }).format(money.amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'orange';
      case OrderStatus.Confirmed:
        return 'blue';
      case OrderStatus.ReadyForPickup:
        return 'purple';
      case OrderStatus.OutForDelivery:
        return 'indigo';
      case OrderStatus.Delivered:
        return 'green';
      case OrderStatus.Canceled:
        return 'red';
      case OrderStatus.Failed:
        return 'red';
      default:
        return 'gray';
    }
  }

  getStatusIcon(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'schedule';
      case OrderStatus.Confirmed:
        return 'check_circle';
      case OrderStatus.ReadyForPickup:
        return 'restaurant';
      case OrderStatus.OutForDelivery:
        return 'local_shipping';
      case OrderStatus.Delivered:
        return 'done_all';
      case OrderStatus.Canceled:
        return 'cancel';
      case OrderStatus.Failed:
        return 'error';
      default:
        return 'help';
    }
  }
}

interface OrderStateTransition {
  from: OrderStatus;
  to: OrderStatus;
  action: string;
  description: string;
  allowed: boolean;
  requiresReason: boolean;
}
