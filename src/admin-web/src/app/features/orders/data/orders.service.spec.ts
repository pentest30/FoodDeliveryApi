import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrdersService } from './orders.service';
import { OrderStatus, OrderListParams } from '../models/order.model';

describe('OrdersService', () => {
  let service: OrdersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrdersService]
    });
    service = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOrders', () => {
    it('should fetch orders with default parameters', () => {
      const mockResponse = {
        data: [],
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false
      };

      service.getOrders().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${service['baseUrl']}/orders`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch orders with custom parameters', () => {
      const params: OrderListParams = {
        page: 2,
        pageSize: 25,
        status: OrderStatus.Pending,
        fromDate: '2024-01-01',
        toDate: '2024-01-31',
        search: 'test'
      };

      const mockResponse = {
        data: [],
        page: 2,
        pageSize: 25,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: true,
        hasNextPage: false
      };

      service.getOrders(params).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${service['baseUrl']}/orders?page=2&pageSize=25&status=Pending&fromDate=2024-01-01&toDate=2024-01-31&search=test`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle HTTP errors gracefully', () => {
      service.getOrders().subscribe(response => {
        expect(response.data).toEqual([]);
        expect(response.totalCount).toBe(0);
      });

      const req = httpMock.expectOne(`${service['baseUrl']}/orders`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getOrderById', () => {
    it('should fetch a specific order', () => {
      const mockOrder = {
        id: '1',
        externalId: 'ORD-001',
        status: OrderStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        etaMinutes: 30,
        restaurantName: 'Test Restaurant',
        subtotal: { amount: 25.00, currency: 'DZD' },
        total: { amount: 30.00, currency: 'DZD' },
        deliveryFee: { amount: 5.00, currency: 'DZD' },
        deliveryAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zip: '12345',
          fullAddress: '123 Test St, Test City, Test State 12345'
        },
        customer: {
          userId: 'user-1',
          name: 'John Doe',
          phone: '+1234567890'
        },
        items: []
      };

      service.getOrderById('1').subscribe(order => {
        expect(order).toEqual(mockOrder);
      });

      const req = httpMock.expectOne(`${service['baseUrl']}/orders/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockOrder);
    });

    it('should return null on error', () => {
      service.getOrderById('1').subscribe(order => {
        expect(order).toBeNull();
      });

      const req = httpMock.expectOne(`${service['baseUrl']}/orders/1`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('confirmOrder', () => {
    it('should confirm an order', () => {
      const command = { orderId: '1', reason: 'Order confirmed by admin' };
      const mockOrder = {
        id: '1',
        status: OrderStatus.Confirmed,
        // ... other properties
      };

      service.confirmOrder(command).subscribe(order => {
        expect(order.status).toBe(OrderStatus.Confirmed);
      });

      const req = httpMock.expectOne(`${service['baseUrl']}/orders/1/confirm`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ reason: 'Order confirmed by admin' });
      req.flush(mockOrder);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order', () => {
      const command = { orderId: '1', reason: 'Customer requested cancellation' };
      const mockOrder = {
        id: '1',
        status: OrderStatus.Canceled,
        // ... other properties
      };

      service.cancelOrder(command).subscribe(order => {
        expect(order.status).toBe(OrderStatus.Canceled);
      });

      const req = httpMock.expectOne(`${service['baseUrl']}/orders/1/cancel`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ reason: 'Customer requested cancellation' });
      req.flush(mockOrder);
    });
  });

  describe('getOrderStateMachine', () => {
    it('should return correct state machine for Pending order', () => {
      const order = {
        id: '1',
        status: OrderStatus.Pending,
        // ... other properties
      } as any;

      const stateMachine = service.getOrderStateMachine(order);

      expect(stateMachine.currentStatus).toBe(OrderStatus.Pending);
      expect(stateMachine.canConfirm).toBe(true);
      expect(stateMachine.canCancel).toBe(true);
      expect(stateMachine.canFail).toBe(true);
      expect(stateMachine.canMarkReady).toBe(false);
      expect(stateMachine.canMoveOut).toBe(false);
      expect(stateMachine.canComplete).toBe(false);
    });

    it('should return correct state machine for Confirmed order', () => {
      const order = {
        id: '1',
        status: OrderStatus.Confirmed,
        // ... other properties
      } as any;

      const stateMachine = service.getOrderStateMachine(order);

      expect(stateMachine.currentStatus).toBe(OrderStatus.Confirmed);
      expect(stateMachine.canConfirm).toBe(false);
      expect(stateMachine.canCancel).toBe(true);
      expect(stateMachine.canFail).toBe(true);
      expect(stateMachine.canMarkReady).toBe(true);
      expect(stateMachine.canMoveOut).toBe(false);
      expect(stateMachine.canComplete).toBe(false);
    });

    it('should return correct state machine for Delivered order', () => {
      const order = {
        id: '1',
        status: OrderStatus.Delivered,
        // ... other properties
      } as any;

      const stateMachine = service.getOrderStateMachine(order);

      expect(stateMachine.currentStatus).toBe(OrderStatus.Delivered);
      expect(stateMachine.canConfirm).toBe(false);
      expect(stateMachine.canCancel).toBe(false);
      expect(stateMachine.canFail).toBe(false);
      expect(stateMachine.canMarkReady).toBe(false);
      expect(stateMachine.canMoveOut).toBe(false);
      expect(stateMachine.canComplete).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should format currency correctly', () => {
      const money = { amount: 25.50, currency: 'DZD' };
      const formatted = service.formatCurrency(money);
      expect(formatted).toContain('25.50');
      expect(formatted).toContain('DZD');
    });

    it('should format date correctly', () => {
      const dateString = '2024-01-01T12:00:00Z';
      const formatted = service.formatDate(dateString);
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    it('should return correct status color', () => {
      expect(service.getStatusColor(OrderStatus.Pending)).toBe('orange');
      expect(service.getStatusColor(OrderStatus.Confirmed)).toBe('blue');
      expect(service.getStatusColor(OrderStatus.Delivered)).toBe('green');
      expect(service.getStatusColor(OrderStatus.Canceled)).toBe('red');
    });

    it('should return correct status icon', () => {
      expect(service.getStatusIcon(OrderStatus.Pending)).toBe('schedule');
      expect(service.getStatusIcon(OrderStatus.Confirmed)).toBe('check_circle');
      expect(service.getStatusIcon(OrderStatus.Delivered)).toBe('done_all');
      expect(service.getStatusIcon(OrderStatus.Canceled)).toBe('cancel');
    });
  });
});
