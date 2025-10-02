namespace FoodDeliveryApi.FoodDeliveryApi.Domain.ValueObjects;

public class UserAddressValueObject
{
    public string ExternalId { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string Neighborhood { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public bool IsDefault { get; set; }

    public UserAddressValueObject() { }

    public UserAddressValueObject(string externalId, string label, string street, string neighborhood, string city, string state, string zipCode, bool isDefault = false)
    {
        ExternalId = externalId;
        Label = label;
        Street = street;
        Neighborhood = neighborhood;
        City = city;
        State = state;
        ZipCode = zipCode;
        IsDefault = isDefault;
    }
}


