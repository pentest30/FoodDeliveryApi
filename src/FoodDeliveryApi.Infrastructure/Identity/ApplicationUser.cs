using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    [Required]
    [MaxLength(450)]
    public string TenantId { get; set; } = string.Empty;
    
    [MaxLength(200)]
    public string? FirstName { get; set; }
    
    [MaxLength(200)]
    public string? LastName { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? LastLoginAt { get; set; }
    
    public bool IsActive { get; set; } = true;
}

