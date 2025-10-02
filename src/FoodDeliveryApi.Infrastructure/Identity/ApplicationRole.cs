using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Identity;

public class ApplicationRole : IdentityRole
{
    [MaxLength(500)]
    public string? Description { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
