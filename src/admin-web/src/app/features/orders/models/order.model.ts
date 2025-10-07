export interface Order {
  id: string;
  externalId: string;
  status: OrderStatus;
  createdAt: string;
  etaMinutes: number;
  restaurantName: string;
  subtotal: Money;
  total: Money;
  deliveryFee: Money;
  deliveryAddress: Address;
  customer: CustomerRef;
  items: OrderItem[];
  updatedAt?: string;
  completedAt?: string;
  canceledAt?: string;
  canceledReason?: string;
  failedAt?: string;
  failedReason?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: Money;
  total: Money;
  variants?: OrderItemVariant[];
}

export interface OrderItemVariant {
  name: string;
  price: Money;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
  fullAddress: string;
}

export interface CustomerRef {
  userId: string;
  name: string;
  phone: string;
}

export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  ReadyForPickup = 'ReadyForPickup',
  OutForDelivery = 'OutForDelivery',
  Delivered = 'Delivered',
  Canceled = 'Canceled',
  Failed = 'Failed'
}

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
  restaurantId?: string;
  customerId?: string;
  search?: string;
}

export interface OrderListResponse {
  data: Order[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  readyForPickupOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  canceledOrders: number;
  failedOrders: number;
  totalRevenue: Money;
  averageOrderValue: Money;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
}

// Command DTOs for CQRS
export interface ConfirmOrderCommand {
  orderId: string;
  reason?: string;
}

export interface CancelOrderCommand {
  orderId: string;
  reason: string;
}

export interface FailOrderCommand {
  orderId: string;
  reason: string;
}

export interface MarkReadyForPickupCommand {
  orderId: string;
  estimatedReadyTime?: string;
}

export interface MoveOutForDeliveryCommand {
  orderId: string;
  deliveryPersonId?: string;
  estimatedDeliveryTime?: string;
}

export interface CompleteDeliveryCommand {
  orderId: string;
  deliveryNotes?: string;
}

// State machine helpers
export interface OrderStateTransition {
  from: OrderStatus;
  to: OrderStatus;
  action: string;
  description: string;
  allowed: boolean;
  requiresReason: boolean;
}

export interface OrderStateMachine {
  currentStatus: OrderStatus;
  availableTransitions: OrderStateTransition[];
  canCancel: boolean;
  canFail: boolean;
  canConfirm: boolean;
  canMarkReady: boolean;
  canMoveOut: boolean;
  canComplete: boolean;
}
