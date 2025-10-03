using System.ComponentModel.DataAnnotations;

namespace FoodDeliveryApi.Api.Dtos;

public class CreateRestaurantSectionDto
{
    [Required]
    public string RestaurantId { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int SortOrder { get; set; } = 0;

    public bool Active { get; set; } = true;
}

public class UpdateRestaurantSectionDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int SortOrder { get; set; }

    public bool Active { get; set; }
}

public class RestaurantSectionDto
{
    public Guid Id { get; set; }
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool Active { get; set; }
    public List<string> Images { get; set; } = new();
    public List<RestaurantMenuItemDto> MenuItems { get; set; } = new();
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}

public class RestaurantMenuItemDto
{
    public Guid Id { get; set; }
    public Guid RestaurantSectionId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal? BasePrice { get; set; }
    public int Quantity { get; set; } = 1;
    public bool Available { get; set; } = true;
    public List<string> Images { get; set; } = new();
    public List<string> Allergens { get; set; } = new();
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
