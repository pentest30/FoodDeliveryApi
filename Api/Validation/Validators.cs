using FluentValidation;
using FoodDeliveryApi.Api.Dtos;

namespace FoodDeliveryApi.Api.Validation;

public class CreateOrderItemDtoValidator : AbstractValidator<CreateOrderItemDto>
{
    public CreateOrderItemDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.UnitPrice.Amount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Total.Amount).GreaterThanOrEqualTo(0);
    }
}

public class CreateOrderDtoValidator : AbstractValidator<CreateOrderDto>
{
    public CreateOrderDtoValidator()
    {
        RuleFor(x => x.RestaurantName).NotEmpty();
        RuleFor(x => x.Customer.Name).NotEmpty();
        RuleFor(x => x.Customer.Phone).NotEmpty();
        RuleFor(x => x.DeliveryAddress.Street).NotEmpty();
        RuleFor(x => x.DeliveryAddress.City).NotEmpty();
        RuleFor(x => x.Items).NotEmpty();
        RuleForEach(x => x.Items).SetValidator(new CreateOrderItemDtoValidator());

        RuleFor(x => x)
            .Must(dto => dto.Items.Sum(i => i.Total.Amount) > 0)
            .WithMessage("Order total must be greater than zero");
    }
}

public class UpdateUserDtoValidator : AbstractValidator<UpdateUserDto>
{
    public UpdateUserDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Phone).NotEmpty();
    }
}

public class UpsertRestaurantDtoValidator : AbstractValidator<UpsertRestaurantDto>
{
    public UpsertRestaurantDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.EtaMinutes).GreaterThan(0);
        RuleFor(x => x.DistanceKm).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Rating).InclusiveBetween(0, 5);
        RuleFor(x => x.Icon).MaximumLength(50);
        RuleFor(x => x.PrimaryColor).Matches("^#[0-9A-Fa-f]{6}$").WithMessage("Primary color must be a valid hex color");
    }
}

public class UpsertCategoryDtoValidator : AbstractValidator<UpsertCategoryDto>
{
    public UpsertCategoryDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Icon).MaximumLength(50);
        RuleFor(x => x.Color).Matches("^#[0-9A-Fa-f]{6}$").WithMessage("Color must be a valid hex color");
    }
}

public class CancelOrderDtoValidator : AbstractValidator<CancelOrderDto>
{
    public CancelOrderDtoValidator()
    {
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
    }
}

public class FailOrderDtoValidator : AbstractValidator<FailOrderDto>
{
    public FailOrderDtoValidator()
    {
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
    }
}



