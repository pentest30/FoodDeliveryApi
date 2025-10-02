namespace FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;

public record Address(string Street, string City, string State, string Zip, double Latitude, double Longitude)
{
    // Parameterless constructor for EF Core
    public Address() : this(string.Empty, string.Empty, string.Empty, string.Empty, 0, 0)
    {
    }
    public static Address Create(string street, string city, string state, string zip, double latitude, double longitude)
    {
        if (string.IsNullOrWhiteSpace(street))
            throw new ArgumentException("Street cannot be null or empty", nameof(street));
        
        if (string.IsNullOrWhiteSpace(city))
            throw new ArgumentException("City cannot be null or empty", nameof(city));
        
        if (string.IsNullOrWhiteSpace(state))
            throw new ArgumentException("State cannot be null or empty", nameof(state));
        
        if (string.IsNullOrWhiteSpace(zip))
            throw new ArgumentException("Zip cannot be null or empty", nameof(zip));
        
        if (latitude < -90 || latitude > 90)
            throw new ArgumentException("Latitude must be between -90 and 90", nameof(latitude));
        
        if (longitude < -180 || longitude > 180)
            throw new ArgumentException("Longitude must be between -180 and 180", nameof(longitude));
        
        return new Address(street, city, state, zip, latitude, longitude);
    }
    
    public string FullAddress => $"{Street}, {City}, {State} {Zip}";
    
    public override string ToString() => FullAddress;
}
