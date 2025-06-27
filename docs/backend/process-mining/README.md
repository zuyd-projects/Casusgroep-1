# Process Mining System

## Overview

The Process Mining system in ERPNumber1 provides comprehensive event logging and analysis capabilities to track, monitor, and analyze business processes across the ERP system. It captures detailed event logs of all business activities and provides tools for process discovery, conformance checking, and performance analysis.

## What is Process Mining?

Process Mining is a data science technique that enables organizations to:

- **Discover** actual business processes from event logs
- **Monitor** process performance in real-time
- **Improve** processes by identifying bottlenecks and inefficiencies
- **Ensure compliance** by checking process conformance to defined models

## Business Process Analysis Features

### New Analysis Capabilities

The system now includes advanced business process analysis features:

#### 1. Comprehensive Business Process Analysis
- **Endpoint**: `GET /api/ProcessMining/business-analysis`
- **Purpose**: Provides overall process performance metrics including cycle times, throughput, and efficiency
- **Key Metrics**:
  - Total and completed cases
  - Average and median cycle times
  - Throughput per day
  - Process efficiency and rework rates
  - Stage performance analysis
  - Process variants identification

#### 2. Activity Performance Analysis
- **Endpoint**: `GET /api/ProcessMining/activity-performance`
- **Purpose**: Detailed analysis of individual activities and their performance
- **Key Metrics**:
  - Activity frequency and resource utilization
  - Success and error rates per activity
  - Average execution times
  - Bottleneck identification
  - Process impact assessment

#### 3. Process Conformance Analysis
- **Endpoint**: `GET /api/ProcessMining/conformance`
- **Purpose**: Analyzes how well actual processes conform to expected flows
- **Key Metrics**:
  - Conformance scores per case
  - Process variants and their frequency
  - Common deviations from expected flow
  - Non-conformant case identification

#### 4. Resource Utilization Analysis
- **Endpoint**: `GET /api/ProcessMining/resource-utilization`
- **Purpose**: Analyzes workload distribution and resource efficiency
- **Key Metrics**:
  - Resource workload and activity distribution
  - Performance metrics per resource
  - Utilization scores and recommendations
  - Over/under-utilized resource identification

#### 5. Case Journey Analysis
- **Endpoint**: `GET /api/ProcessMining/case-journey`
- **Purpose**: Detailed analysis of individual case journeys through the process
- **Key Metrics**:
  - Individual case timelines and steps
  - Journey duration and success rates
  - Common journey issues identification
  - Problematic vs successful journey comparison

#### 6. Process Optimization Recommendations
- **Endpoint**: `GET /api/ProcessMining/optimization-recommendations`
- **Purpose**: AI-driven recommendations for process improvements
- **Key Features**:
  - Bottleneck resolution suggestions
  - Rework reduction strategies
  - Resource optimization recommendations
  - Implementation roadmap with expected benefits

### Real-World Business Value

Based on your order processing workflow (Order Created → Approval → Production → Delivery), these analyses provide:

1. **Order Cycle Time Analysis**: Track how long orders take from creation to completion
2. **Bottleneck Detection**: Identify which approval or production steps cause delays
3. **Resource Efficiency**: See which controllers/systems are over/under-utilized
4. **Quality Metrics**: Monitor rework rates and process deviations
5. **Delivery Predictions**: Forecast potential delays and delivery issues

### Example Usage Scenarios

#### 1. Daily Operations Dashboard
```http
GET /api/ProcessMining/business-analysis?startDate=2025-06-25&endDate=2025-06-26
```
Returns comprehensive metrics for orders processed in the last day.

#### 2. Performance Monitoring
```http
GET /api/ProcessMining/activity-performance?startDate=2025-06-01
```
Identifies which activities are performing well vs poorly.

#### 3. Process Compliance Check
```http
GET /api/ProcessMining/conformance?startDate=2025-06-01
```
Shows how well orders follow the expected approval workflow.

#### 4. Resource Planning
```http
GET /api/ProcessMining/resource-utilization?startDate=2025-06-01
```
Helps plan resource allocation and identify bottlenecks.

#### 5. Order-Specific Analysis
```http
GET /api/ProcessMining/case-journey?caseId=Order-1
```
Deep dive into a specific order's journey through the system.

#### 6. Process Improvement Planning
```http
GET /api/ProcessMining/optimization-recommendations
```
Get AI-driven suggestions for improving your order processing workflow.

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

## Expected Order Processing Flow

Based on your event logs, the expected order flow is:
1. **Order Created** - Customer places order
2. **Order Approved by VoorraadBeheer** - Inventory approval
3. **To Production** - Order moves to production queue
4. **In Production** - Manufacturing begins
5. **Awaiting Account Manager Approval** - Final approval step
6. **Approved by Account Manager** - Final approval granted
7. **Delivered** - Order shipped to customer
8. **Completed** - Order fully processed

The conformance analysis will measure how well actual orders follow this expected path and identify deviations.
