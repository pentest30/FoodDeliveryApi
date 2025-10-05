namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Storage;

public interface IRestaurantSectionImageService
{
    Task<string> UploadSectionImageAsync(Stream imageStream, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task<bool> DeleteSectionImageAsync(string imageUrl, CancellationToken cancellationToken = default);
    Task<bool> DeleteSectionImagesAsync(IEnumerable<string> imageUrls, CancellationToken cancellationToken = default);
    string GetSectionImageUrl(string fileName);
    Task<bool> ValidateImageAsync(IFormFile file);
}


