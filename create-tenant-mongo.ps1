# PowerShell script to create tenant in MongoDB
Write-Host "Creating tenant in MongoDB..." -ForegroundColor Green

# MongoDB connection string
$connectionString = "mongodb://localhost:27017"
$databaseName = "fooddelivery"
$collectionName = "tenants"

# Create tenant document
$tenantId = [System.Guid]::NewGuid().ToString()
$tenantDocument = @{
    _id = $tenantId
    Identifier = "root-tenant"
    Name = "Root Tenant"
    Url = "https://root.example.com"
    Email = "admin@root.example.com"
    Mobile = "+1000000000"
    CreatedAt = [System.DateTime]::UtcNow
    IsActive = $true
}

Write-Host "Tenant document:" -ForegroundColor Yellow
$tenantDocument | ConvertTo-Json -Depth 10

# Try to connect to MongoDB and insert the document
try {
    # Check if MongoDB is running
    $mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        Write-Host "MongoDB is running" -ForegroundColor Green
        
        # Create a simple JavaScript file to insert the tenant
        $jsContent = @"
use('$databaseName');

// Check if tenant already exists
var existingTenant = db.$collectionName.findOne({ "Identifier": "root-tenant" });

if (existingTenant) {
    print("Root tenant already exists with ID: " + existingTenant._id);
} else {
    // Insert root tenant
    var tenant = {
        _id: "$tenantId",
        Identifier: "root-tenant",
        Name: "Root Tenant",
        Url: "https://root.example.com",
        Email: "admin@root.example.com",
        Mobile: "+1000000000",
        CreatedAt: new Date(),
        IsActive: true
    };
    
    var result = db.$collectionName.insertOne(tenant);
    print("Root tenant created with ID: " + result.insertedId);
}

print("MongoDB tenant seeding completed!");
"@
        
        $jsContent | Out-File -FilePath "temp-tenant-insert.js" -Encoding UTF8
        
        Write-Host "JavaScript file created. Run the following command to insert the tenant:" -ForegroundColor Cyan
        Write-Host "mongo fooddelivery temp-tenant-insert.js" -ForegroundColor White
        
        # Try to run the command if mongo is available
        try {
            & mongo fooddelivery temp-tenant-insert.js
            Write-Host "Tenant inserted successfully!" -ForegroundColor Green
        } catch {
            Write-Host "MongoDB CLI not found. Please run the command manually:" -ForegroundColor Yellow
            Write-Host "mongo fooddelivery temp-tenant-insert.js" -ForegroundColor White
        }
        
        # Clean up
        Remove-Item "temp-tenant-insert.js" -ErrorAction SilentlyContinue
        
    } else {
        Write-Host "MongoDB is not running. Please start MongoDB first." -ForegroundColor Red
        Write-Host "You can start MongoDB with: mongod" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Script completed!" -ForegroundColor Green
