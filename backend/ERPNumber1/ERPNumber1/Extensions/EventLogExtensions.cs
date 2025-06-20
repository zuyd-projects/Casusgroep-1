using ERPNumber1.Interfaces;
using System.Text.Json;

namespace ERPNumber1.Extensions
{
    public static class EventLogExtensions
    {
        /// <summary>
        /// Log an order-related event
        /// </summary>
        public static async Task LogOrderEventAsync(this IEventLogService eventLogService, 
            int orderId, string activity, string resource, string status = "Completed", 
            object? additionalData = null, string? userId = null)
        {
            await eventLogService.LogEventAsync(
                caseId: $"Order_{orderId}",
                activity: activity,
                resource: resource,
                eventType: "Order",
                status: status,
                additionalData: additionalData != null ? JsonSerializer.Serialize(additionalData) : null,
                entityId: orderId.ToString(),
                userId: userId
            );
        }

        /// <summary>
        /// Log a simulation-related event
        /// </summary>
        public static async Task LogSimulationEventAsync(this IEventLogService eventLogService, 
            int simulationId, string activity, string resource, string status = "Completed", 
            object? additionalData = null, string? userId = null)
        {
            await eventLogService.LogEventAsync(
                caseId: $"Simulation_{simulationId}",
                activity: activity,
                resource: resource,
                eventType: "Simulation",
                status: status,
                additionalData: additionalData != null ? JsonSerializer.Serialize(additionalData) : null,
                entityId: simulationId.ToString(),
                userId: userId
            );
        }

        /// <summary>
        /// Log an inventory-related event
        /// </summary>
        public static async Task LogInventoryEventAsync(this IEventLogService eventLogService, 
            int inventoryId, string activity, string resource, string status = "Completed", 
            object? additionalData = null, string? userId = null)
        {
            await eventLogService.LogEventAsync(
                caseId: $"Inventory_{inventoryId}",
                activity: activity,
                resource: resource,
                eventType: "Inventory",
                status: status,
                additionalData: additionalData != null ? JsonSerializer.Serialize(additionalData) : null,
                entityId: inventoryId.ToString(),
                userId: userId
            );
        }

        /// <summary>
        /// Log a delivery-related event
        /// </summary>
        public static async Task LogDeliveryEventAsync(this IEventLogService eventLogService, 
            int deliveryId, string activity, string resource, string status = "Completed", 
            object? additionalData = null, string? userId = null)
        {
            await eventLogService.LogEventAsync(
                caseId: $"Delivery_{deliveryId}",
                activity: activity,
                resource: resource,
                eventType: "Delivery",
                status: status,
                additionalData: additionalData != null ? JsonSerializer.Serialize(additionalData) : null,
                entityId: deliveryId.ToString(),
                userId: userId
            );
        }

        /// <summary>
        /// Log a user-related event
        /// </summary>
        public static async Task LogUserEventAsync(this IEventLogService eventLogService, 
            string userId, string activity, string resource, string status = "Completed", 
            object? additionalData = null)
        {
            await eventLogService.LogEventAsync(
                caseId: $"User_{userId}",
                activity: activity,
                resource: resource,
                eventType: "User",
                status: status,
                additionalData: additionalData != null ? JsonSerializer.Serialize(additionalData) : null,
                entityId: userId,
                userId: userId
            );
        }

        /// <summary>
        /// Log a supplier order-related event
        /// </summary>
        public static async Task LogSupplierOrderEventAsync(this IEventLogService eventLogService, 
            int supplierOrderId, string activity, string resource, string status = "Completed", 
            object? additionalData = null, string? userId = null)
        {
            await eventLogService.LogEventAsync(
                caseId: $"SupplierOrder_{supplierOrderId}",
                activity: activity,
                resource: resource,
                eventType: "SupplierOrder",
                status: status,
                additionalData: additionalData != null ? JsonSerializer.Serialize(additionalData) : null,
                entityId: supplierOrderId.ToString(),
                userId: userId
            );
        }
    }
}
