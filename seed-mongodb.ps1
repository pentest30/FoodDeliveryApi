# PowerShell script to seed MongoDB with tenant data
Write-Host "Starting MongoDB tenant seeding..." -ForegroundColor Green

# MongoDB connection details
$connectionString = "mongodb://localhost:27017"
$databaseName = "fooddelivery"
$collectionName = "tenants"

# Create the tenant document
$tenantDocument = @{
    _id = [System.Guid]::NewGuid().ToString()
    Identifier = "root-tenant"
    Name = "Root Tenant"
    Url = "https://root.example.com"
    Email = "admin@root.example.com"
    Mobile = "+1000000000"
    CreatedAt = [System.DateTime]::UtcNow
    IsActive = $true
} | ConvertTo-Json -Depth 10

Write-Host "Tenant document to insert:" -ForegroundColor Yellow
Write-Host $tenantDocument

Write-Host "To insert this tenant into MongoDB, run the following command:" -ForegroundColor Cyan
Write-Host "mongo $databaseName --eval `"db.$collectionName.insertOne($tenantDocument)`"" -ForegroundColor White

Write-Host "Or use MongoDB Compass to manually insert the document." -ForegroundColor Cyan
Write-Host "MongoDB seeding instructions completed!" -ForegroundColor Green
