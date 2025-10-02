namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;

public class Discount
{
    public Guid Id { get; init; }
    public Guid RestaurantId { get; init; }
    public DiscountScope Scope { get; init; }
    public Guid? CategoryId { get; init; }
    public Guid? MenuItemId { get; init; }
    public Guid? VariantId { get; init; }
    public DiscountType Type { get; init; }
    public decimal Value { get; init; }
    public string Currency { get; init; } = "DZD";
    public DateTime StartsAt { get; init; }
    public DateTime? EndsAt { get; init; }
    public int? MinQuantity { get; init; }
    public int? MaxPerOrder { get; init; }
    public int Priority { get; init; }
    public bool Active { get; init; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    public static Discount Create(
        Guid restaurantId,
        DiscountScope scope,
        DiscountType type,
        decimal value,
        DateTime startsAt,
        string currency = "DZD",
        DateTime? endsAt = null,
        int? minQuantity = null,
        int? maxPerOrder = null,
        int priority = 0,
        Guid? categoryId = null,
        Guid? menuItemId = null,
        Guid? variantId = null)
    {
        if (value < 0)
            throw new ArgumentException("Value cannot be negative", nameof(value));

        if (startsAt >= endsAt)
            throw new ArgumentException("StartsAt must be before EndsAt", nameof(startsAt));

        if (minQuantity.HasValue && minQuantity < 0)
            throw new ArgumentException("MinQuantity cannot be negative", nameof(minQuantity));

        if (maxPerOrder.HasValue && maxPerOrder < 0)
            throw new ArgumentException("MaxPerOrder cannot be negative", nameof(maxPerOrder));

        if (type == DiscountType.Percentage && value > 100)
            throw new ArgumentException("Percentage value cannot exceed 100", nameof(value));

        ValidateScopeAndTargetIds(scope, categoryId, menuItemId, variantId);

        return new Discount
        {
            Id = Guid.NewGuid(),
            RestaurantId = restaurantId,
            Scope = scope,
            CategoryId = categoryId,
            MenuItemId = menuItemId,
            VariantId = variantId,
            Type = type,
            Value = value,
            Currency = currency,
            StartsAt = startsAt,
            EndsAt = endsAt,
            MinQuantity = minQuantity,
            MaxPerOrder = maxPerOrder,
            Priority = priority,
            Active = true,
            CreatedAt = DateTime.UtcNow
        };
    }

    public bool IsApplicable(DateTime now, int quantity = 1)
    {
        if (!Active)
            return false;

        if (now < StartsAt)
            return false;

        if (EndsAt.HasValue && now > EndsAt.Value)
            return false;

        if (MinQuantity.HasValue && quantity < MinQuantity.Value)
            return false;

        if (MaxPerOrder.HasValue && quantity > MaxPerOrder.Value)
            return false;

        return true;
    }

    public decimal CalculateDiscount(decimal basePrice, int quantity = 1)
    {
        if (!IsApplicable(DateTime.UtcNow, quantity))
            return 0;

        return Type switch
        {
            DiscountType.Percentage => basePrice * (Value / 100),
            DiscountType.FixedAmount => Value,
            DiscountType.NewPrice => Math.Max(0, basePrice - Value),
            _ => 0
        };
    }

    private static void ValidateScopeAndTargetIds(
        DiscountScope scope,
        Guid? categoryId,
        Guid? menuItemId,
        Guid? variantId)
    {
        switch (scope)
        {
            case DiscountScope.Category:
                if (!categoryId.HasValue)
                    throw new ArgumentException("CategoryId must be set for Category scope discount");
                break;
            case DiscountScope.Item:
                if (!menuItemId.HasValue)
                    throw new ArgumentException("MenuItemId must be set for Item scope discount");
                break;
            case DiscountScope.Variant:
                if (!variantId.HasValue)
                    throw new ArgumentException("VariantId must be set for Variant scope discount");
                break;
        }
    }
}
