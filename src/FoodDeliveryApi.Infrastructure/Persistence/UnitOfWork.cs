using FoodDeliveryApi.FoodDeliveryApi.Application.Interfaces;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Common;
using Finbuckle.MultiTenant;
using FoodDeliveryApi.FoodDeliveryApi.Domain.Tenants;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace FoodDeliveryApi.FoodDeliveryApi.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly FoodAppContext _context;
    private readonly IMultiTenantContextAccessor<Tenant> _tenantAccessor;

    public UnitOfWork(FoodAppContext context, IMultiTenantContextAccessor<Tenant> tenantAccessor)
    {
        _context = context;
        _tenantAccessor = tenantAccessor;
    }

    public async Task SaveChangesAsync(IDomainEventBus bus, params IHasDomainEvents[] aggregates)
    {
        EnforceTenantOnTrackedEntities();

        // Collect all domain events from aggregates
        var allEvents = new List<IDomainEvent>();
        foreach (var aggregate in aggregates)
            allEvents.AddRange(aggregate.DomainEvents);

        await _context.SaveChangesAsync();

        if (allEvents.Any())
        {
            bus.PublishRange(allEvents);
            foreach (var aggregate in aggregates)
                aggregate.ClearDomainEvents();
        }
    }

    private void EnforceTenantOnTrackedEntities()
    {
        var tenantId = _tenantAccessor.MultiTenantContext?.TenantInfo?.Id
            ?? throw new InvalidOperationException("Tenant courant introuvable pour appliquer le TenantId.");

        foreach (var entry in _context.ChangeTracker.Entries().Where(e => e.State is EntityState.Added or EntityState.Modified))
        {
            // Détecter la propriété TenantId si présente
            var tenantProp = entry.Properties.FirstOrDefault(p => string.Equals(p.Metadata.Name, "TenantId", StringComparison.OrdinalIgnoreCase));
            if (tenantProp is null) continue; // entité non multi-tenant

            // Si Added: setter toujours TenantId
            if (entry.State == EntityState.Added)
            {
                tenantProp.CurrentValue = tenantId;
            }
            else if (entry.State == EntityState.Modified)
            {
                // Empêcher le changement de tenant
                if (!Equals(tenantProp.OriginalValue, tenantProp.CurrentValue) && tenantProp.OriginalValue is not null)
                    throw new InvalidOperationException("Changement de TenantId interdit sur une entité existante.");
            }

            // Optionnel: propager aux entités enfants du graphe suivies
            PropagateTenantToOwnedOrChildren(entry, tenantId);
        }
    }

    private void PropagateTenantToOwnedOrChildren(EntityEntry rootEntry, string tenantId)
    {
        // Pour les entités possédées ou enfants chargées dans le graphe, si elles exposent TenantId, l’aligner.
        foreach (var reference in rootEntry.References)
        {
            if (reference.TargetEntry is null) continue;
            var tenantProp = reference.TargetEntry.Properties.FirstOrDefault(p => string.Equals(p.Metadata.Name, "TenantId", StringComparison.OrdinalIgnoreCase));
            if (tenantProp != null && (reference.TargetEntry.State == EntityState.Added || tenantProp.CurrentValue is null))
                tenantProp.CurrentValue = tenantId;
        }

        foreach (var collection in rootEntry.Collections)
        {
            foreach (var entry in _context.ChangeTracker.Entries())
            {
                var tenantProp = entry.Properties.FirstOrDefault(p => string.Equals(p.Metadata.Name, "TenantId", StringComparison.OrdinalIgnoreCase));
                if (tenantProp != null && (entry.State == EntityState.Added || tenantProp.CurrentValue is null))
                    tenantProp.CurrentValue = tenantId;
            }
        }
    }
}

