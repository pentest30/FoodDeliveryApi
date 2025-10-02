# Order Aggregate - Domain-Driven Design Implementation

## Overview

The Order aggregate implements a rich domain model with value objects, domain events, and strict business rules. It follows Domain-Driven Design principles with proper encapsulation and invariant enforcement.

## Domain Model

### Order Aggregate Root

```csharp
public class Order : IHasDomainEvents
{
    // Properties (private setters for encapsulation)
    public Guid Id { get; private set; }
    public string ExternalId { get; private set; }
    public OrderStatus Status { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public int EtaMinutes { get; private set; }
    public Guid? RestaurantId { get; private set; }
    public string RestaurantName { get; private set; }
    public Money Subtotal { get; private set; }
    public Money Total { get; private set; }
    public Money DeliveryFee { get; private set; }
    public Address DeliveryAddress { get; private set; }
    public CustomerRef Customer { get; private set; }
    public List<OrderItem> Items { get; private set; }
}
```

## Factory Method

### Order.Place()

Creates a new order with proper validation and business rules.

```csharp
public static Order Place(
    string externalId,
    CustomerRef customer,
    Address deliveryAddress,
    IEnumerable<OrderItem> items,
    Money deliveryFee,
    int etaMinutes,
    string restaurantName,
    Guid? restaurantId = null)
```

**Features:**
- ✅ Computes Subtotal and Total automatically
- ✅ Sets Status = Pending
- ✅ Raises OrderPlaced domain event
- ✅ Validates all inputs
- ✅ Enforces business invariants

**Validation Rules:**
- ExternalId cannot be null or empty
- Customer, DeliveryAddress, DeliveryFee cannot be null
- Items cannot be null or empty
- All item quantities must be > 0
- All item prices must be non-negative
- EtaMinutes must be > 0
- RestaurantName cannot be null or empty

## Behaviors (Domain Methods)

### 1. Confirm()
```csharp
public void Confirm()
```
- **Guard**: Order must be in `Pending` status
- **Action**: Sets status to `Confirmed`
- **Event**: Raises `OrderConfirmed` domain event
- **Exception**: `InvalidOperationException` if not in Pending status

### 2. MarkReadyForPickup()
```csharp
public void MarkReadyForPickup()
```
- **Guard**: Order must be in `Confirmed` status
- **Action**: Sets status to `ReadyForPickup`
- **Event**: Raises `OrderReadyForPickup` domain event
- **Exception**: `InvalidOperationException` if not in Confirmed status

### 3. MoveOutForDelivery()
```csharp
public void MoveOutForDelivery()
```
- **Guard**: Order must be in `ReadyForPickup` status
- **Action**: Sets status to `OutForDelivery`
- **Event**: None (internal state change)
- **Exception**: `InvalidOperationException` if not in ReadyForPickup status

### 4. CompleteDelivery()
```csharp
public void CompleteDelivery()
```
- **Guard**: Order must be in `OutForDelivery` status
- **Action**: Sets status to `Delivered`
- **Event**: None (final state)
- **Exception**: `InvalidOperationException` if not in OutForDelivery status

### 5. Cancel(string reason)
```csharp
public void Cancel(string reason)
```
- **Guard**: Order must NOT be in `Delivered` status
- **Action**: Sets status to `Canceled`
- **Event**: Raises `OrderCanceled` domain event
- **Exception**: `InvalidOperationException` if in Delivered status
- **Exception**: `ArgumentException` if reason is null or empty

### 6. Fail(string reason)
```csharp
public void Fail(string reason)
```
- **Action**: Sets status to `Failed` (can be called from any status)
- **Event**: Raises `OrderFailed` domain event
- **Exception**: `ArgumentException` if reason is null or empty

## State Transitions

```
Pending → Confirmed → ReadyForPickup → OutForDelivery → Delivered
   ↓           ↓            ↓              ↓
Canceled   Canceled    Canceled      Canceled
   ↓           ↓            ↓              ↓
 Failed     Failed      Failed        Failed
```

**Valid Transitions:**
- `Pending` → `Confirmed`, `Canceled`, `Failed`
- `Confirmed` → `ReadyForPickup`, `Canceled`, `Failed`
- `ReadyForPickup` → `OutForDelivery`, `Canceled`, `Failed`
- `OutForDelivery` → `Delivered`, `Canceled`, `Failed`
- Any status → `Failed`

## Business Invariants

### 1. Total Calculation
```
Total = Subtotal + DeliveryFee
```
- ✅ Enforced in factory method
- ✅ Automatically computed
- ✅ Currency consistency validated

### 2. Item Validation
```
Quantity > 0 for all items
UnitPrice >= 0 for all items
```
- ✅ Enforced in factory method
- ✅ Validates each item individually

### 3. State Transition Guards
- ✅ Each behavior method validates current status
- ✅ Throws `InvalidOperationException` for invalid transitions
- ✅ Clear error messages indicating required status

## Domain Events

### Event Collection
```csharp
public IReadOnlyCollection<IDomainEvent> DomainEvents { get; }
public void ClearDomainEvents();
```

### Events Raised
1. **OrderPlaced** - When order is created
2. **OrderConfirmed** - When order is confirmed
3. **OrderReadyForPickup** - When order is ready for pickup
4. **OrderCanceled** - When order is canceled
5. **OrderFailed** - When order fails

### Event Structure
```csharp
public record OrderPlaced(Guid OrderId, string ExternalId) : IDomainEvent
{
    public DateTimeOffset OccurredAt { get; } = DateTimeOffset.UtcNow;
}
```

## Value Objects

### Money
```csharp
public record Money(decimal Amount, string Currency)
```
- ✅ Immutable
- ✅ Arithmetic operations (+, -, *)
- ✅ Currency validation
- ✅ Zero factory method

### OrderItem
```csharp
public record OrderItem(string Name, int Quantity, Money UnitPrice, Money Total)
```
- ✅ Immutable
- ✅ Validation in factory method
- ✅ Automatic total calculation

### Address
```csharp
public record Address(string Street, string City, string State, string Zip, double Latitude, double Longitude)
```
- ✅ Immutable
- ✅ Geographic coordinate validation
- ✅ FullAddress computed property

### CustomerRef
```csharp
public record CustomerRef(Guid UserId, string Name, string Phone)
```
- ✅ Immutable
- ✅ UserId validation
- ✅ Name and phone validation

## Usage Examples

### Creating an Order
```csharp
var customer = CustomerRef.Create(userId, "John Doe", "+1234567890");
var address = Address.Create("123 Main St", "New York", "NY", "10001", 40.7128, -74.0060);
var items = new List<OrderItem>
{
    OrderItem.Create("Pizza", 2, new Money(15.99m, "USD")),
    OrderItem.Create("Coke", 1, new Money(2.50m, "USD"))
};
var deliveryFee = new Money(3.99m, "USD");

var order = Order.Place(
    externalId: "ORD-12345",
    customer: customer,
    deliveryAddress: address,
    items: items,
    deliveryFee: deliveryFee,
    etaMinutes: 30,
    restaurantName: "Pizza Palace",
    restaurantId: Guid.NewGuid()
);
```

### Order Lifecycle
```csharp
// Order is created in Pending status
var order = Order.Place(...);

// Confirm the order
order.Confirm(); // Status: Confirmed, Event: OrderConfirmed

// Mark ready for pickup
order.MarkReadyForPickup(); // Status: ReadyForPickup, Event: OrderReadyForPickup

// Move out for delivery
order.MoveOutForDelivery(); // Status: OutForDelivery

// Complete delivery
order.CompleteDelivery(); // Status: Delivered
```

### Error Handling
```csharp
try
{
    order.Confirm(); // Throws if not in Pending status
}
catch (InvalidOperationException ex)
{
    // Handle invalid state transition
}

try
{
    order.Cancel("Customer requested cancellation");
}
catch (InvalidOperationException ex)
{
    // Handle if order is already delivered
}
```

## EF Core Configuration

### Value Object Mapping
```csharp
// Money value objects
builder.OwnsOne(x => x.Subtotal, b => { ... });
builder.OwnsOne(x => x.Total, b => { ... });
builder.OwnsOne(x => x.DeliveryFee, b => { ... });

// Address value object
builder.OwnsOne(x => x.DeliveryAddress, b => { ... });

// CustomerRef value object
builder.OwnsOne(x => x.Customer, b => { ... });

// Order items collection
builder.OwnsMany(o => o.Items, b => { ... });
```

### Enum Conversion
```csharp
builder.Property(x => x.Status)
    .HasConversion<string>()
    .HasMaxLength(50);
```

## Benefits

✅ **Rich Domain Model**: Encapsulates business logic and rules  
✅ **Type Safety**: Strong typing with value objects  
✅ **Immutability**: Value objects are immutable  
✅ **Event Sourcing Ready**: Domain events for audit and integration  
✅ **Validation**: Comprehensive input validation  
✅ **State Management**: Enforced state transitions  
✅ **Testability**: Easy to unit test business logic  
✅ **Maintainability**: Clear separation of concerns  

## Testing

### Unit Test Example
```csharp
[Fact]
public void Place_ValidInputs_CreatesOrderWithPendingStatus()
{
    // Arrange
    var customer = CustomerRef.Create(Guid.NewGuid(), "John", "+1234567890");
    var address = Address.Create("123 St", "City", "State", "12345", 0, 0);
    var items = new[] { OrderItem.Create("Item", 1, new Money(10m, "USD")) };
    
    // Act
    var order = Order.Place("EXT-123", customer, address, items, new Money(2m, "USD"), 30, "Restaurant");
    
    // Assert
    Assert.Equal(OrderStatus.Pending, order.Status);
    Assert.Single(order.DomainEvents);
    Assert.IsType<OrderPlaced>(order.DomainEvents.First());
}
```

This implementation provides a robust, well-encapsulated Order aggregate that enforces business rules and maintains data integrity through proper domain modeling.

