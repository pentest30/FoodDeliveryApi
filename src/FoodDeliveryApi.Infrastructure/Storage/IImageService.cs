namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Storage;

public interface IImageService
{
    Task<string> UploadImageAsync(Stream imageStream, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task<bool> DeleteImageAsync(string imageUrl, CancellationToken cancellationToken = default);
    Task<bool> DeleteImagesAsync(IEnumerable<string> imageUrls, CancellationToken cancellationToken = default);
    string GetImageUrl(string fileName);
}

