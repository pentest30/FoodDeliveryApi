using FoodDeliveryApi.FoodDeliveryApi.Domain.Common;

namespace FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;

public interface IUnitOfWork
{
    Task SaveChangesAsync(IDomainEventBus bus, params IHasDomainEvents[] aggregates);
}

