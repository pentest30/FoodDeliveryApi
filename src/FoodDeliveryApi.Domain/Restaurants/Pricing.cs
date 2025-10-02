namespace FoodDeliveryApi.FoodDeliveryApi.Domain.Restaurants;

public static class Pricing
{
    public static decimal CalculateFinalPrice(
        decimal basePrice,
        string currency,
        IEnumerable<Discount> discounts,
        int quantity = 1,
        Guid? categoryId = null,
        Guid? menuItemId = null,
        Guid? variantId = null)
    {
        var applicableDiscounts = GetApplicableDiscounts(
            discounts,
            categoryId,
            menuItemId,
            variantId,
            quantity);

        if (!applicableDiscounts.Any())
            return Math.Round(basePrice, 2, MidpointRounding.AwayFromZero);

        var bestDiscount = applicableDiscounts
            .OrderByDescending(d => d.Priority)
            .First();

        var discountAmount = bestDiscount.CalculateDiscount(basePrice, quantity);
        var finalPrice = Math.Max(0, basePrice - discountAmount);

        return Math.Round(finalPrice, 2, MidpointRounding.AwayFromZero);
    }

    public static decimal GetBasePrice(RestaurantMenuItem item, Guid? variantId = null)
    {
        if (variantId.HasValue)
        {
            var variant = item.Variants.FirstOrDefault(v => v.Id == variantId && v.Active);
            return variant?.Price ?? 0m;
        }

        return item.BasePrice ?? 0m;
    }

    private static IEnumerable<Discount> GetApplicableDiscounts(
        IEnumerable<Discount> discounts,
        Guid? categoryId,
        Guid? menuItemId,
        Guid? variantId,
        int quantity)
    {
        var now = DateTime.UtcNow;

        return discounts.Where(discount =>
            discount.IsApplicable(now, quantity) &&
            IsDiscountApplicableToTarget(discount, categoryId, menuItemId, variantId));
    }

    private static bool IsDiscountApplicableToTarget(
        Discount discount,
        Guid? categoryId,
        Guid? menuItemId,
        Guid? variantId)
    {
        return discount.Scope switch
        {
            DiscountScope.Restaurant => true,
            DiscountScope.Category => discount.CategoryId == categoryId,
            DiscountScope.Item => discount.MenuItemId == menuItemId,
            DiscountScope.Variant => discount.VariantId == variantId,
            _ => false
        };
    }
}
