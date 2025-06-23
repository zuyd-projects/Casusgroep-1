# Process Mining System

## Overview

The Process Mining system in ERPNumber1 provides comprehensive event logging and analysis capabilities to track, monitor, and analyze business processes across the ERP system. It captures detailed event logs of all business activities and provides tools for process discovery, conformance checking, and performance analysis.

## What is Process Mining?

Process Mining is a data science technique that enables organizations to:

- **Discover** actual business processes from event logs
- **Monitor** process performance in real-time
- **Improve** processes by identifying bottlenecks and inefficiencies
- **Ensure compliance** by checking process conformance to defined models

## System Architecture

### Core Components

1. **Event Logging Infrastructure**
   - `EventLog` model for storing process events
   - `IEventLogService` interface for event management
   - `EventLogService` implementation with comprehensive logging capabilities

2. **Automatic Event Capture**
   - `LogEventAttribute` for declarative event logging
   - Extension methods for domain-specific event logging
   - Integration with all major controllers

3. **Process Mining API**
   - `ProcessMiningController` for event retrieval and analysis
   - XES export functionality for external process mining tools
   - Real-time process statistics and analytics

4. **Data Export**
   - XES (eXtensible Event Stream) format support
   - Integration with popular process mining tools (ProM, Disco, Celonis)

## How It Works

### 1. Event Capture

The system automatically captures events through two methods:

#### Attribute-Based Logging (Recommended)

```csharp
[HttpPost]
[LogEvent("Order", "Create Order", logRequest: true)]
public async Task<ActionResult<Order>> CreateOrder(Order order)
{
    // Your business logic here
    // Events are automatically logged
}
```

#### Manual Logging (Advanced Control)

```csharp
[HttpPost]
public async Task<ActionResult<Order>> CreateOrder(Order order)
{
    // Your business logic here
    
    await _eventLogService.LogOrderEventAsync(order.Id, "Order Created", 
        "OrderController", "Completed", 
        new { motorType = order.MotorType, quantity = order.Quantity }, userId);
}
```

### 2. Event Storage

Each event is stored with comprehensive metadata:

- **Case ID**: Unique identifier for the process instance (e.g., `Order_123`)
- **Activity**: What happened (e.g., "Order Created", "Payment Processed")
- **Resource**: Who/what performed the activity (e.g., user ID, system component)
- **Timestamp**: When the event occurred
- **Event Type**: Category of the event (Order, Inventory, Delivery, etc.)
- **Status**: Event outcome (Started, Completed, Failed, Cancelled)
- **Additional Data**: Business context stored as JSON

### 3. Process Analysis

#### Real-time Statistics

```http
GET /api/processmining/statistics?eventType=Order&startDate=2025-01-01
```

#### Event Log Retrieval

```http
GET /api/processmining?eventType=Order&status=Completed&take=100
```

#### Case-specific Analysis

```http
GET /api/processmining/case/Order_123
```

### 4. Data Export

Export event logs for analysis in external tools:

```http
GET /api/processmining/export/xes?startDate=2025-01-01&endDate=2025-12-31
```

## Supported Business Processes

The system currently tracks the following business processes:

### Order Management

- Order creation, modification, deletion
- Order status changes
- Payment processing
- Order fulfillment

### Inventory Management

- Stock level changes
- Material movements
- Inventory updates
- Supplier order processing

### Production & Simulation

- Simulation runs
- Production planning
- Round execution
- Performance metrics

### Delivery Management

- Delivery scheduling
- Status updates
- Completion tracking

### User Management

- User registration and authentication
- Permission changes
- Session tracking

## Event Types and Patterns

### Standard Event Types

- `Order` - Order lifecycle events
- `Inventory` - Stock and material events
- `Simulation` - Production simulation events
- `Delivery` - Shipping and delivery events
- `User` - User and authentication events
- `SupplierOrder` - Supplier interaction events

### Event Status Values

- `Started` - Activity has begun
- `Completed` - Activity finished successfully
- `Failed` - Activity encountered an error
- `Cancelled` - Activity was cancelled
- `In Progress` - Long-running activity update

### Case ID Patterns

- Orders: `Order_{orderId}`
- Simulations: `Simulation_{simulationId}`
- Deliveries: `Delivery_{deliveryId}`
- Users: `User_{userId}`

## Integration Guide

### Quick Start

1. **Add dependencies to your controller:**

```csharp
private readonly IEventLogService _eventLogService;

public YourController(IEventLogService eventLogService)
{
    _eventLogService = eventLogService;
}
```

2. **Use the LogEvent attribute:**

```csharp
[HttpPost]
[LogEvent("YourEntityType", "Your Activity Description")]
public async Task<ActionResult> YourAction()
{
    // Your code here
}
```

3. **Or use extension methods for detailed control:**

```csharp
await _eventLogService.LogOrderEventAsync(orderId, "Order Updated", 
    "OrderController", "Completed", additionalData, userId);
```

### Best Practices

1. **Consistent Naming**
   - Use past tense for activities ("Order Created", not "Create Order")
   - Be descriptive and specific
   - Follow domain terminology

2. **Meaningful Context**
   - Include relevant business data in `additionalData`
   - Avoid sensitive information (passwords, tokens)
   - Structure data consistently

3. **Error Handling**
   - Always log both success and failure events
   - Include error details for failed events
   - Use appropriate status values

## Process Mining Tools Integration

The system exports data in XES format, compatible with:

### Open Source Tools

- **ProM Framework** - Academic process mining toolkit
- **PM4Py** - Python process mining library
- **Apromore** - Advanced process mining platform

### Commercial Tools

- **Celonis** - Enterprise process mining platform
- **Disco** - User-friendly process discovery tool
- **QPR ProcessAnalyzer** - Business process analysis

### Analysis Capabilities

With exported data, you can perform:

- **Process Discovery**: Automatically discover process models from event logs
- **Conformance Checking**: Compare actual processes with designed models
- **Performance Analysis**: Identify bottlenecks and optimization opportunities
- **Variant Analysis**: Understand different process execution paths
- **Social Network Analysis**: Analyze resource interactions and handovers

## Performance Considerations

- Event logging is asynchronous and non-blocking
- Database indexes are optimized for common query patterns
- Bulk operations are supported for large-scale analysis
- Data retention policies can be configured

## Security and Privacy

- User consent and data protection compliance
- Sensitive data filtering
- Audit trail integrity
- Role-based access to process mining data

## Monitoring and Maintenance

- Built-in logging for troubleshooting
- Performance metrics tracking
- Data quality validation
- Automated cleanup processes

## Examples and Use Cases

For detailed integration examples, see:

- [Controller Integration Examples](examples/controller-integration.md)

## Future Enhancements

- Real-time process monitoring dashboard
- Machine learning-based process prediction
- Advanced analytics and reporting
- Process optimization recommendations
- Integration with external workflow engines

---

For questions or support, refer to the development team or check the examples directory for detailed implementation patterns.
