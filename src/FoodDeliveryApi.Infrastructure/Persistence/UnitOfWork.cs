using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Common;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly FoodAppContext _context;

    public UnitOfWork(FoodAppContext context)
    {
        _context = context;
    }

    public async Task SaveChangesAsync(IDomainEventBus bus, params IHasDomainEvents[] aggregates)
    {
        // Collect all domain events from aggregates
        var allEvents = new List<IDomainEvent>();
        foreach (var aggregate in aggregates)
        {
            allEvents.AddRange(aggregate.DomainEvents);
        }

        // Save changes to database
        await _context.SaveChangesAsync();

        // Publish domain events
        if (allEvents.Any())
        {
            bus.PublishRange(allEvents);
            
            // Clear domain events after publishing
            foreach (var aggregate in aggregates)
            {
                aggregate.ClearDomainEvents();
            }
        }
    }
}

