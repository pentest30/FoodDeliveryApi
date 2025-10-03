using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Storage;

public class RestaurantSectionImageService : IRestaurantSectionImageService
{
    private readonly IMinioClient _minioClient;
    private readonly MinioOptions _options;
    private const string BucketName = "restaurant-sections";

    public RestaurantSectionImageService(IMinioClient minioClient, IOptions<MinioOptions> options)
    {
        _minioClient = minioClient;
        _options = options.Value;
    }

    public async Task<string> UploadSectionImageAsync(Stream imageStream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        try
        {
            // Ensure bucket exists
            await EnsureBucketExistsAsync(cancellationToken);

            // Generate unique filename
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var extension = Path.GetExtension(fileName);
            var uniqueFileName = $"section-{timestamp}-{Guid.NewGuid():N}{extension}";

            // Upload to MinIO
            var putObjectArgs = new PutObjectArgs()
                .WithBucket(BucketName)
                .WithObject(uniqueFileName)
                .WithStreamData(imageStream)
                .WithObjectSize(imageStream.Length)
                .WithContentType(contentType);

            await _minioClient.PutObjectAsync(putObjectArgs, cancellationToken);

            // Return the public URL
            return GetSectionImageUrl(uniqueFileName);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to upload section image: {ex.Message}", ex);
        }
    }

    public async Task<bool> DeleteSectionImageAsync(string imageUrl, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(imageUrl))
                return false;

            // Extract object name from URL
            var objectName = ExtractObjectNameFromUrl(imageUrl);
            if (string.IsNullOrEmpty(objectName))
                return false;

            // Delete from MinIO
            var removeObjectArgs = new RemoveObjectArgs()
                .WithBucket(BucketName)
                .WithObject(objectName);

            await _minioClient.RemoveObjectAsync(removeObjectArgs, cancellationToken);
            return true;
        }
        catch (Exception ex)
        {
            // Log the error but don't throw - deletion should be idempotent
            Console.WriteLine($"Failed to delete section image {imageUrl}: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> DeleteSectionImagesAsync(IEnumerable<string> imageUrls, CancellationToken cancellationToken = default)
    {
        if (imageUrls == null || !imageUrls.Any())
            return true;

        var tasks = imageUrls.Select(url => DeleteSectionImageAsync(url, cancellationToken));
        var results = await Task.WhenAll(tasks);
        return results.All(r => r);
    }

    public string GetSectionImageUrl(string fileName)
    {
        if (string.IsNullOrEmpty(fileName))
            return string.Empty;

        var baseUrl = _options.UseSSL ? $"https://{_options.Endpoint}" : $"http://{_options.Endpoint}";
        return $"{baseUrl}/{BucketName}/{fileName}";
    }

    public async Task<bool> ValidateImageAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return false;

        // Check file size (max 10MB)
        if (file.Length > 10 * 1024 * 1024)
            return false;

        // Check content type
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType))
            return false;

        // Check file extension
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
            return false;

        return true;
    }

    private async Task EnsureBucketExistsAsync(CancellationToken cancellationToken)
    {
        try
        {
            var bucketExistsArgs = new BucketExistsArgs().WithBucket(BucketName);
            var exists = await _minioClient.BucketExistsAsync(bucketExistsArgs, cancellationToken);

            if (!exists)
            {
                var makeBucketArgs = new MakeBucketArgs().WithBucket(BucketName);
                await _minioClient.MakeBucketAsync(makeBucketArgs, cancellationToken);

                // Set bucket policy for public read access
                var policy = $@"{{
                    ""Version"": ""2012-10-17"",
                    ""Statement"": [
                        {{
                            ""Effect"": ""Allow"",
                            ""Principal"": {{ ""AWS"": [""*""] }},
                            ""Action"": [""s3:GetObject""],
                            ""Resource"": [""arn:aws:s3:::{BucketName}/*""]
                        }}
                    ]
                }}";

                var setPolicyArgs = new SetPolicyArgs()
                    .WithBucket(BucketName)
                    .WithPolicy(policy);

                await _minioClient.SetPolicyAsync(setPolicyArgs, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to ensure bucket exists: {ex.Message}", ex);
        }
    }

    private static string ExtractObjectNameFromUrl(string imageUrl)
    {
        if (string.IsNullOrEmpty(imageUrl))
            return string.Empty;

        try
        {
            var uri = new Uri(imageUrl);
            var pathSegments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
            
            // Expected format: /bucket-name/object-name
            if (pathSegments.Length >= 2)
            {
                return pathSegments[1]; // Return the object name (second segment)
            }
            
            return string.Empty;
        }
        catch
        {
            return string.Empty;
        }
    }
}
