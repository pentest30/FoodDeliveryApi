namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Storage;

public class MinioOptions
{
    public string Endpoint { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string BucketName { get; set; } = "foodapp-images";
    public bool UseSSL { get; set; } = false;
}

