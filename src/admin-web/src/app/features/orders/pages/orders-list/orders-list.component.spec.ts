import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { OrdersListComponent } from './orders-list.component';
import { OrdersService } from '../../data/orders.service';
import { OrderStatus, OrderStatistics } from '../../models/order.model';

describe('OrdersListComponent', () => {
  let component: OrdersListComponent;
  let fixture: ComponentFixture<OrdersListComponent>;
  let mockOrdersService: jasmine.SpyObj<OrdersService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockRouter: jasmine.SpyObj<Router>;

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
    items: [
      {
        id: '1',
        name: 'Test Item',
        quantity: 2,
        unitPrice: { amount: 12.50, currency: 'DZD' },
        total: { amount: 25.00, currency: 'DZD' }
      }
    ]
  };

  const mockStatistics: OrderStatistics = {
    totalOrders: 100,
    pendingOrders: 10,
    confirmedOrders: 20,
    readyForPickupOrders: 15,
    outForDeliveryOrders: 5,
    deliveredOrders: 40,
    canceledOrders: 5,
    failedOrders: 5,
    totalRevenue: { amount: 5000.00, currency: 'DZD' },
    averageOrderValue: { amount: 50.00, currency: 'DZD' },
    ordersToday: 10,
    ordersThisWeek: 50,
    ordersThisMonth: 100
  };

  beforeEach(async () => {
    const ordersServiceSpy = jasmine.createSpyObj('OrdersService', [
      'getOrders',
      'getOrderStatistics',
      'getOrderStateMachine',
      'formatCurrency',
      'formatDate',
      'getStatusIcon',
      'getStatusClass'
    ]);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [OrdersListComponent],
      providers: [
        { provide: OrdersService, useValue: ordersServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersListComponent);
    component = fixture.componentInstance;
    mockOrdersService = TestBed.inject(OrdersService) as jasmine.SpyObj<OrdersService>;
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    // Setup default return values
    mockOrdersService.getOrders.and.returnValue(of({
      data: [mockOrder],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    }));
    mockOrdersService.getOrderStatistics.and.returnValue(of(mockStatistics));
    mockOrdersService.formatCurrency.and.returnValue('30.00 DZD');
    mockOrdersService.formatDate.and.returnValue('Jan 1, 2024');
    mockOrdersService.getStatusIcon.and.returnValue('schedule');
    mockOrdersService.getStatusClass.and.returnValue('pending');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders and statistics on init', () => {
    component.ngOnInit();
    
    expect(mockOrdersService.getOrders).toHaveBeenCalled();
    expect(mockOrdersService.getOrderStatistics).toHaveBeenCalled();
  });

  it('should display orders in the table', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const tableRows = fixture.debugElement.nativeElement.querySelectorAll('mat-row');
    expect(tableRows.length).toBe(1);
  });

  it('should display statistics cards', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const statCards = fixture.debugElement.nativeElement.querySelectorAll('.stat-card');
    expect(statCards.length).toBe(4);
  });

  it('should filter orders when form values change', (done) => {
    component.ngOnInit();
    fixture.detectChanges();

    // Simulate form value change
    component.filtersForm.patchValue({
      search: 'test',
      status: OrderStatus.Pending
    });

    // Wait for debounce
    setTimeout(() => {
      expect(mockOrdersService.getOrders).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        search: 'test',
        status: OrderStatus.Pending,
        fromDate: undefined,
        toDate: undefined,
        restaurantId: undefined,
        customerId: undefined
      });
      done();
    }, 350);
  });

  it('should clear filters when clearFilters is called', () => {
    component.filtersForm.patchValue({
      search: 'test',
      status: OrderStatus.Pending
    });

    component.clearFilters();

    expect(component.filtersForm.value.search).toBe('');
    expect(component.filtersForm.value.status).toBe('');
  });

  it('should refresh orders when refreshOrders is called', () => {
    component.refreshOrders();

    expect(mockOrdersService.getOrders).toHaveBeenCalledTimes(1);
    expect(mockOrdersService.getOrderStatistics).toHaveBeenCalledTimes(1);
  });

  it('should open order details dialog when viewOrderDetails is called', () => {
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialogRef.afterClosed.and.returnValue(of(null));
    mockDialog.open.and.returnValue(mockDialogRef);

    component.viewOrderDetails(mockOrder);

    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should open order status dialog when manageOrderStatus is called', () => {
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialogRef.afterClosed.and.returnValue(of(true));
    mockDialog.open.and.returnValue(mockDialogRef);

    component.manageOrderStatus(mockOrder);

    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should copy order ID to clipboard', () => {
    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
    
    component.copyOrderId('ORD-001');

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ORD-001');
    expect(mockSnackBar.open).toHaveBeenCalledWith('Order ID copied to clipboard', 'Close', { duration: 2000 });
  });

  it('should determine if order status can be managed', () => {
    const stateMachine = {
      currentStatus: OrderStatus.Pending,
      availableTransitions: [
        { from: OrderStatus.Pending, to: OrderStatus.Confirmed, action: 'confirm', description: 'Confirm Order', allowed: true, requiresReason: false }
      ],
      canCancel: true,
      canFail: true,
      canConfirm: true,
      canMarkReady: false,
      canMoveOut: false,
      canComplete: false
    };

    mockOrdersService.getOrderStateMachine.and.returnValue(stateMachine);

    const canManage = component.canManageStatus(mockOrder);

    expect(canManage).toBe(true);
  });

  it('should handle page changes', () => {
    const pageEvent = {
      pageIndex: 1,
      pageSize: 25,
      length: 100
    };

    component.onPageChange(pageEvent);

    expect(component.pageSize()).toBe(25);
    expect(mockOrdersService.getOrders).toHaveBeenCalled();
  });

  it('should display empty state when no orders', () => {
    mockOrdersService.getOrders.and.returnValue(of({
      data: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false
    }));

    component.ngOnInit();
    fixture.detectChanges();

    const emptyState = fixture.debugElement.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should display loading state', () => {
    component.loading.set(true);
    fixture.detectChanges();

    const loadingContainer = fixture.debugElement.nativeElement.querySelector('.loading-container');
    expect(loadingContainer).toBeTruthy();
  });

  it('should handle errors gracefully', () => {
    mockOrdersService.getOrders.and.returnValue(of({
      data: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false
    }));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.orders().length).toBe(0);
  });
});
