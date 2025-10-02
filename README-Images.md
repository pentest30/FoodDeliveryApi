# Image Management with MinIO

## Overview

The Food Delivery API now supports image management for restaurants and sections using MinIO as the object storage solution. Images are stored as lists of URLs instead of single cover images.

## Features

### 🖼️ **Image Storage**
- **Restaurant Images**: Multiple images per restaurant
- **Section Images**: Multiple images per menu section
- **MinIO Integration**: Scalable object storage
- **File Validation**: Type and size restrictions
- **Public URLs**: Direct access to uploaded images

### 🔧 **Technical Implementation**
- **Domain Entities**: Updated `Restaurant` and `Section` with `List<string> Images`
- **API Models**: Updated response models to include image lists
- **MinIO Service**: Handles upload, delete, and URL generation
- **CRUD Operations**: Full image management in API endpoints

## Services

### MinIO Configuration
- **Endpoint**: `localhost:9000` (API)
- **Console**: `localhost:9001` (Web UI)
- **Credentials**: `minioadmin` / `minioadmin123`
- **Bucket**: `foodapp-images`

### Docker Services
```yaml
minio:
  image: minio/minio:latest
  ports:
    - "9000:9000"  # API
    - "9001:9001"  # Console
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin123
```

## API Endpoints

### Restaurant Images

#### Upload Restaurant Image
```http
POST /api/v1/restaurants/{id}/images
Content-Type: multipart/form-data

file: [image file]
```

**Response:**
```json
{
  "imageUrl": "http://localhost:9000/foodapp-images/images/unique-filename.jpg"
}
```

#### Delete Restaurant Image
```http
DELETE /api/v1/restaurants/{id}/images/{imageUrl}
```

### Section Images

#### Upload Section Image
```http
POST /api/v1/restaurants/{restaurantId}/sections/{sectionId}/images
Content-Type: multipart/form-data

file: [image file]
```

#### Delete Section Image
```http
DELETE /api/v1/restaurants/{restaurantId}/sections/{sectionId}/images/{imageUrl}
```

### User Profile Images

#### Upload User Profile Image
```http
POST /api/v1/users/{id}/images
Content-Type: multipart/form-data

file: [image file]
```

**Response:**
```json
{
  "imageUrl": "http://localhost:9000/foodapp-images/images/unique-filename.jpg"
}
```

#### Delete User Profile Image
```http
DELETE /api/v1/users/{id}/images/{imageUrl}
```

## File Restrictions

- **Allowed Types**: JPEG, PNG, GIF, WebP
- **Max Size**: 5MB per file
- **Storage**: MinIO object storage
- **URLs**: Public access URLs

## Updated Data Models

### Restaurant Entity
```csharp
public class Restaurant
{
    public Guid Id { get; set; }
    public string ExternalId { get; set; }
    public string Name { get; set; }
    public List<string> Images { get; set; } = new(); // ✅ Multiple images
    // ... other properties
}
```

### Section Entity
```csharp
public class Section
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public List<string> Images { get; set; } = new(); // ✅ Multiple images
    public List<MenuItem> Items { get; set; } = new();
}
```

### API Response Models
```csharp
public class Restaurant
{
    public string Id { get; set; }
    public string Name { get; set; }
    public List<string> Images { get; set; } = new(); // ✅ Image list
    // ... other properties
}

public class MenuSection
{
    public string Id { get; set; }
    public string Name { get; set; }
    public List<string> Images { get; set; } = new(); // ✅ Image list
    public List<MenuItem> Items { get; set; } = new();
}
```

## Usage Examples

### 1. Upload Restaurant Image
```bash
curl -X POST "http://localhost:5000/api/v1/restaurants/restaurant-id/images" \
  -F "file=@restaurant-photo.jpg"
```

### 2. Upload Section Image
```bash
curl -X POST "http://localhost:5000/api/v1/restaurants/restaurant-id/sections/section-id/images" \
  -F "file=@menu-section-photo.jpg"
```

### 3. Upload User Profile Image
```bash
curl -X POST "http://localhost:5000/api/v1/users/user-id/images" \
  -F "file=@profile-photo.jpg"
```

### 4. Get Restaurant with Images
```bash
curl "http://localhost:5000/api/v1/restaurants/restaurant-id"
```

**Response:**
```json
{
  "id": "restaurant-id",
  "name": "Pizza Palace",
  "images": [
    "http://localhost:9000/foodapp-images/images/restaurant-1.jpg",
    "http://localhost:9000/foodapp-images/images/restaurant-2.jpg"
  ],
  "sections": [
    {
      "id": "section-id",
      "name": "Pizzas",
      "images": [
        "http://localhost:9000/foodapp-images/images/pizza-section.jpg"
      ],
      "items": [...]
    }
  ]
}
```

## MinIO Management

### Access MinIO Console
- **URL**: http://localhost:9001
- **Username**: `minioadmin`
- **Password**: `minioadmin123`

### Bucket Structure
```
foodapp-images/
├── images/
│   ├── restaurant-1.jpg
│   ├── restaurant-2.jpg
│   ├── section-1.jpg
│   └── ...
```

## Error Handling

### Upload Errors
- **400**: Invalid file type or size
- **404**: Restaurant/Section not found
- **500**: Upload/storage errors

### Delete Errors
- **404**: Image not found
- **500**: Delete/storage errors

## Configuration

### appsettings.json
```json
{
  "Minio": {
    "Endpoint": "localhost:9000",
    "AccessKey": "minioadmin",
    "SecretKey": "minioadmin123",
    "BucketName": "foodapp-images",
    "UseSSL": false
  }
}
```

## Development

### Start Services
```bash
# Start MinIO
docker-compose up -d minio

# Start API
dotnet run
```

### Test Image Upload
```bash
# Test restaurant image upload
curl -X POST "http://localhost:5000/api/v1/restaurants/test-id/images" \
  -F "file=@test-image.jpg"

# Test section image upload
curl -X POST "http://localhost:5000/api/v1/restaurants/test-id/sections/test-section-id/images" \
  -F "file=@test-section.jpg"
```

## Benefits

✅ **Multiple Images**: Support for multiple images per restaurant/section  
✅ **Scalable Storage**: MinIO provides scalable object storage  
✅ **Public URLs**: Direct access to images via URLs  
✅ **File Validation**: Type and size restrictions for security  
✅ **CRUD Operations**: Full image management through API  
✅ **Docker Integration**: Easy setup with Docker Compose  

## Next Steps

- **Image Optimization**: Add image resizing/compression
- **CDN Integration**: Use CDN for better performance
- **Image Processing**: Add thumbnail generation
- **Batch Upload**: Support multiple file uploads
- **Image Metadata**: Store additional image information
