// MongoDB script to insert root tenant
// Run with: mongo fooddelivery insert-tenant.js

use('fooddelivery');

// Check if tenant already exists
var existingTenant = db.tenants.findOne({ "Identifier": "root-tenant" });

if (existingTenant) {
    print("Root tenant already exists with ID: " + existingTenant._id);
} else {
    // Insert root tenant
    var tenant = {
        _id: new ObjectId(),
        Identifier: "root-tenant",
        Name: "Root Tenant",
        Url: "https://root.example.com",
        Email: "admin@root.example.com",
        Mobile: "+1000000000",
        CreatedAt: new Date(),
        IsActive: true
    };
    
    var result = db.tenants.insertOne(tenant);
    print("Root tenant created with ID: " + result.insertedId);
}

print("MongoDB tenant seeding completed!");
