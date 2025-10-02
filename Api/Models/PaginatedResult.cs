namespace FoodDeliveryApi.Api.Models;

public class PaginatedResult<T>
{
    public List<T> Items { get; set; } = new();
    public List<T> Data { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasPreviousPage { get; set; }
    public bool HasNextPage { get; set; }
}
