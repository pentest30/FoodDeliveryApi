namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Orders;

public enum OrderStatus
{
    Pending,
    Confirmed,
    ReadyForPickup,
    OutForDelivery,
    Delivered,
    Canceled,
    Failed
}

