using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Storage;

public class MinioImageService : IImageService
{
    private readonly IMinioClient _minioClient;
    private readonly MinioOptions _options;
    private readonly ILogger<MinioImageService> _logger;

    public MinioImageService(IMinioClient minioClient, IOptions<MinioOptions> options, ILogger<MinioImageService> logger)
    {
        _minioClient = minioClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<string> UploadImageAsync(Stream imageStream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        try
        {
            // Ensure bucket exists
            await EnsureBucketExistsAsync(cancellationToken);

            // Generate unique filename
            var uniqueFileName = $"{Guid.NewGuid()}-{fileName}";
            var objectName = $"images/{uniqueFileName}";

            // Upload the image
            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_options.BucketName)
                .WithObject(objectName)
                .WithStreamData(imageStream)
                .WithObjectSize(imageStream.Length)
                .WithContentType(contentType);

            await _minioClient.PutObjectAsync(putObjectArgs, cancellationToken);

            // Return the public URL
            return GetImageUrl(objectName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading image {FileName}", fileName);
            throw;
        }
    }

    public async Task<bool> DeleteImageAsync(string imageUrl, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(imageUrl))
                return false;

            // Extract object name from URL
            var objectName = ExtractObjectNameFromUrl(imageUrl);
            if (string.IsNullOrEmpty(objectName))
                return false;

            var removeObjectArgs = new RemoveObjectArgs()
                .WithBucket(_options.BucketName)
                .WithObject(objectName);

            await _minioClient.RemoveObjectAsync(removeObjectArgs, cancellationToken);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image {ImageUrl}", imageUrl);
            return false;
        }
    }

    public async Task<bool> DeleteImagesAsync(IEnumerable<string> imageUrls, CancellationToken cancellationToken = default)
    {
        try
        {
            var objectNames = imageUrls
                .Where(url => !string.IsNullOrEmpty(url))
                .Select(ExtractObjectNameFromUrl)
                .Where(name => !string.IsNullOrEmpty(name))
                .ToList();

            if (!objectNames.Any())
                return true;

            var removeObjectsArgs = new RemoveObjectsArgs()
                .WithBucket(_options.BucketName)
                .WithObjects(objectNames);

            await _minioClient.RemoveObjectsAsync(removeObjectsArgs, cancellationToken);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting images");
            return false;
        }
    }

    public string GetImageUrl(string fileName)
    {
        var baseUrl = _options.UseSSL ? $"https://{_options.Endpoint}" : $"http://{_options.Endpoint}";
        return $"{baseUrl}/{_options.BucketName}/{fileName}";
    }

    private async Task EnsureBucketExistsAsync(CancellationToken cancellationToken)
    {
        try
        {
            var bucketExistsArgs = new BucketExistsArgs()
                .WithBucket(_options.BucketName);

            var exists = await _minioClient.BucketExistsAsync(bucketExistsArgs, cancellationToken);
            
            if (!exists)
            {
                var makeBucketArgs = new MakeBucketArgs()
                    .WithBucket(_options.BucketName);

                await _minioClient.MakeBucketAsync(makeBucketArgs, cancellationToken);

                // Set bucket policy to allow public read access
                var policy = $@"{{
                    ""Version"": ""2012-10-17"",
                    ""Statement"": [
                        {{
                            ""Effect"": ""Allow"",
                            ""Principal"": {{
                                ""AWS"": [""*""]
                            }},
                            ""Action"": [""s3:GetObject""],
                            ""Resource"": [""arn:aws:s3:::{_options.BucketName}/*""]
                        }}
                    ]
                }}";

                var setPolicyArgs = new SetPolicyArgs()
                    .WithBucket(_options.BucketName)
                    .WithPolicy(policy);

                await _minioClient.SetPolicyAsync(setPolicyArgs, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error ensuring bucket exists");
            throw;
        }
    }

    private string ExtractObjectNameFromUrl(string imageUrl)
    {
        try
        {
            var uri = new Uri(imageUrl);
            var pathSegments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
            
            if (pathSegments.Length >= 2)
            {
                // Skip the bucket name and return the rest
                return string.Join("/", pathSegments.Skip(1));
            }
            
            return string.Empty;
        }
        catch
        {
            return string.Empty;
        }
    }
}

