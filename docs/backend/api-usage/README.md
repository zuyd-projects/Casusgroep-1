# ERP API Usage Guide

## Overview

This guide explains how to use the ERP API endpoints, the entity dependency chain, and the Data Transfer Objects (DTOs) that were implemented to simplify API usage.

## 🔄 Entity Dependency Chain

The ERP system has a hierarchical structure where entities depend on each other through foreign key relationships. You must create entities in the correct order to satisfy these dependencies.

### Dependency Hierarchy

```
Simulation (Root - No dependencies)
    ↓
Round (depends on Simulation)
    ↓
Order (depends on Round)
    ↓
Product (depends on Order)
    ↓
Material (depends on Product)


# TODO: Add these relationships from the diagram
Independent Entities (can be created anytime):
- User/AppUser (no dependencies - base user entities)
- Inventory (depends on AppUserId - references user)
- SupplierOrder (depends on UserId - references user) 
- Delivery (optional OrderId - can exist independently)
- Statistics (no dependencies - standalone metrics)
```

## 📝 Complete Creation Workflow

### Step 1: Create Simulation
**Endpoint**: `POST /api/Simulations`
```json
{
  "name": "Production Simulation Q2 2025",
  "date": "2025-06-20T10:00:00"
}
```
**Response**: `{"id": 1, "name": "Production Simulation Q2 2025", "date": "2025-06-20T10:00:00"}`

### Step 2: Create Round
**Endpoint**: `POST /api/Rounds`
```json
{
  "simulationId": 1,
  "roundNumber": 1
}
```
**Response**: `{"id": 1, "simulationId": 1, "roundNumber": 1}`

### Step 3: Create Order
**Endpoint**: `POST /api/Order`
```json
{
  "roundId": 1,
  "deliveryId": null,
  "appUserId": "user123",
  "motorType": "A",
  "quantity": 10,
  "signature": "order-signature-001",
  "orderDate": "2025-06-20T10:00:00"
}
```
**Response**: `{"id": 1, "roundId": 1, "deliveryId": null, "appUserId": "user123", "motorType": "A", "quantity": 10, "signature": "order-signature-001", "orderDate": "2025-06-20T10:00:00"}`

### Step 4: Create Product
**Endpoint**: `POST /api/Products`
```json
{
  "orderId": 1,
  "type": "A"
}
```
**Response**: `{"id": 1, "orderId": 1, "type": "A"}`

### Step 5: Create Material
**Endpoint**: `POST /api/Materials`
```json
{
  "productId": 1,
  "name": "Steel Rod",
  "cost": 15.75,
  "quantity": 250
}
```
**Response**: `{"id": 1, "productId": 1, "name": "Steel Rod", "cost": 15.75, "quantity": 250}`

## 🔧 DTO Implementation

### What are DTOs?

Data Transfer Objects (DTOs) are simplified objects used for API communication. They solve several problems:

1. **Circular Reference Prevention**: Navigation properties can cause infinite loops during JSON serialization
2. **Simplified Input**: API consumers don't need to provide complex nested object graphs
3. **Validation Control**: Only required fields are exposed for creation/updates
4. **Type Safety**: Prevents "could not convert to System.Char" errors by using proper types

### DTO Structure

Each entity has two DTOs:
- **CreateDto**: For POST endpoints (entity creation)
- **UpdateDto**: For PUT endpoints (entity updates)

#### Example: Material DTOs

**CreateMaterialDto**:
```csharp
public class CreateMaterialDto
{
    public int ProductId { get; set; }        // Reference to parent Product
    public string? Name { get; set; }         // Material name
    public float Cost { get; set; }           // Cost per unit
    public int Quantity { get; set; }         // Available quantity
}
```

**UpdateMaterialDto**:
```csharp
public class UpdateMaterialDto
{
    public int ProductId { get; set; }
    public string? Name { get; set; }
    public float Cost { get; set; }
    public int Quantity { get; set; }
}
```

## 📋 All Available DTOs

### Core Business Entities

| Entity | Create DTO | Update DTO | Dependencies |
|--------|------------|------------|--------------|
| Simulation | CreateSimulationDto | UpdateSimulationDto | None |
| Round | CreateRoundDto | UpdateRoundDto | SimulationId |
| Order | CreateOrderDto | UpdateOrderDto | RoundId |
| Product | CreateProductDto | UpdateProductDto | OrderId |
| Material | CreateMaterialDto | UpdateMaterialDto | ProductId |

### Supporting Entities

| Entity | Create DTO | Update DTO | Dependencies |
|--------|------------|------------|--------------|
| Inventory | CreateInventoryDto | UpdateInventoryDto | AppUserId |
| SupplierOrder | CreateSupplierOrderDto | UpdateSupplierOrderDto | UserId |
| Delivery | CreateDeliveryDto | UpdateDeliveryDto | None (optional OrderId) |
| Statistics | CreateStatisticsDto | UpdateStatisticsDto | None |

## 🚫 Common Errors and Solutions

### 1. Foreign Key Constraint Errors
**Error**: `The INSERT statement conflicted with the FOREIGN KEY constraint`

**Cause**: Trying to reference an entity that doesn't exist

**Solution**: Create parent entities first following the dependency chain

### 2. Field Required Errors
**Error**: `The field X is required`

**Cause**: Missing required fields in DTO

**Solution**: Check DTO structure and provide all non-nullable fields

### 3. Type Conversion Errors
**Error**: `Could not convert to System.Char`

**Cause**: Sending wrong data type (e.g., string instead of char)

**Solution**: Use correct types as defined in DTOs

## 📋 Sample API Test Sequence

Here's a complete sequence to test all endpoints:

```bash
# 1. Create Simulation
curl -X POST "http://localhost:5045/api/Simulations" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Sim", "date": "2025-06-20T10:00:00"}'

# 2. Create Round
curl -X POST "http://localhost:5045/api/Rounds" \
  -H "Content-Type: application/json" \
  -d '{"simulationId": 1, "roundNumber": 1}'

# 3. Create Order
curl -X POST "http://localhost:5045/api/Order" \
  -H "Content-Type: application/json" \
  -d '{"roundId": 1, "appUserId": "user1", "motorType": "A", "quantity": 10, "orderDate": "2025-06-20T10:00:00"}'

# 4. Create Product
curl -X POST "http://localhost:5045/api/Products" \
  -H "Content-Type: application/json" \
  -d '{"orderId": 1, "type": "A"}'

# 5. Create Material
curl -X POST "http://localhost:5045/api/Materials" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "name": "Steel Rod", "cost": 15.75, "quantity": 250}'

# Independent entities (can be created anytime)
# Create Inventory
curl -X POST "http://localhost:5045/api/Inventory" \
  -H "Content-Type: application/json" \
  -d '{"name": "Main Warehouse", "quantity": 1000, "appUserId": 1}'

# Create SupplierOrder
curl -X POST "http://localhost:5045/api/SupplierOrder" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "quantity": 500, "status": "Pending", "roundNumber": 1, "orderDate": "2025-06-20T10:00:00"}'
```

## 🔍 Entity Models vs DTOs

### Before Refactoring (Problems)
- Navigation properties caused circular references
- API required complex nested object graphs
- Type conversion errors with chars and complex types
- "Field required" errors for navigation properties

### After Refactoring (Solutions)
- Navigation properties marked with `[JsonIgnore]` and nullable
- DTOs use simple, flat structures
- Proper type definitions prevent conversion errors
- Only essential fields required in DTOs

## 📊 Benefits of This Approach

1. **Simplified API Consumption**: Clients send simple JSON
2. **No Circular References**: Navigation properties ignored in serialization
3. **Better Validation**: Clear field requirements
4. **Type Safety**: Proper type definitions prevent runtime errors
5. **Maintainability**: Clear separation between data models and API contracts

## 🔧 Technical Implementation Notes

### Navigation Properties
All entity navigation properties are:
- Made nullable (`List<Entity>?`)
- Decorated with `[JsonIgnore]` attribute
- Initialized to prevent null reference exceptions

### Controller Pattern
All controllers follow the same pattern:
```csharp
[HttpPost]
public async Task<ActionResult<Entity>> PostEntity(CreateEntityDto entityDto)
{
    var entity = new Entity
    {
        // Map DTO properties to entity
        Property1 = entityDto.Property1,
        Property2 = entityDto.Property2
    };
    
    _context.Entities.Add(entity);
    await _context.SaveChangesAsync();
    
    return CreatedAtAction(nameof(GetEntity), new { id = entity.Id }, entity);
}
```

This documentation should help developers understand and use the API effectively!

## 🔄 Real-Time Features

The ERP system includes a **real-time simulation system** using SignalR WebSockets for live updates during simulation runs.

### Key Features
- **Live Round Updates**: New rounds created every 30 seconds (configurable)  
- **WebSocket Communication**: Real-time events via SignalR
- **Multi-User Support**: All users see synchronized simulation state
- **Header Status Display**: Current simulation and round info always visible

### Quick Start
```bash
# Start a simulation
POST /api/Simulations/{id}/run

# Stop a simulation  
POST /api/Simulations/{id}/stop

# Check simulation status
GET /api/Simulations/{id}/status
```

### Documentation
For complete real-time implementation details, see:
**📖 [Real-Time Simulations Guide](../real-time-simulations.md)**

Covers:
- SignalR connection setup
- WebSocket event handling  
- Frontend React integration
- Configuration options
- Troubleshooting guide

## 🎮 Simulation-Integrated Order Creation

The ERP system now supports **round-based order creation** where orders are automatically linked to the current active simulation round.

### Frontend Integration

The order creation form is integrated with the simulation context:

```javascript
// Frontend: Using simulation context for order creation
const { currentRound, currentSimulation, isRunning } = useSimulation();

const createOrder = async (orderData) => {
  if (!currentRound) {
    throw new Error('No active round for order creation');
  }

  const orderPayload = {
    roundId: currentRound.id,           // Link to current round
    deliveryId: null,                   // Optional delivery
    appUserId: orderData.appUserId,     // User creating the order
    motorType: orderData.motorType,     // Motor type (A, B, C)
    quantity: orderData.quantity,       // Order quantity
    signature: orderData.signature,     // Order signature
    orderDate: new Date().toISOString() // Current timestamp
  };

  return await api.post('/api/Order', orderPayload);
};
```

### Order-Round Relationship

- **Round Validation**: Orders can only be created during active simulation rounds
- **Automatic Linking**: Frontend automatically links orders to `currentRound.id`
- **Real-Time Context**: Uses live simulation state for order placement
- **Business Logic**: Orders are timestamped within specific round timeframes

### Enhanced Order Display

The orders interface now shows:
- **Round Badge**: Which round the order belongs to
- **Motor Type**: Clear display of motor type (A, B, C)
- **Simulation Status**: Visual indicator of active simulation state
- **Quantity Information**: Order quantities prominently displayed

### API Workflow with Simulations

```bash
# 1. Start a simulation (creates rounds every 30 seconds)
POST /api/Simulations/1/run

# 2. Create orders linked to current round
POST /api/Order
{
  "roundId": 5,                    # From simulation context
  "motorType": "A",
  "quantity": 25,
  "appUserId": "user123",
  "orderDate": "2025-06-22T10:00:00"
}

# 3. Orders are automatically linked to simulation rounds
GET /api/Order
# Returns orders with round information
```

### Business Benefits

- **Process Timing**: Orders are tied to specific simulation timeframes
- **Training Accuracy**: Realistic order placement during simulation rounds  
- **Data Integrity**: Clear traceability between orders and simulation phases
- **Team Coordination**: All users create orders for the same active round

## 📋 Order Status Management

The ERP system now includes comprehensive order status tracking to support Account Manager workflows and order lifecycle management.

### Order Status States

Orders can have the following statuses:

- **Pending**: Default status when an order is created
- **InProduction**: Order is being manufactured
- **AwaitingAccountManagerApproval**: Order requires Account Manager review
- **ApprovedByAccountManager**: Order approved and can proceed
- **RejectedByAccountManager**: Order rejected by Account Manager
- **Delivered**: Order has been delivered to customer
- **Completed**: Order lifecycle completed
- **Cancelled**: Order was cancelled

### Account Manager Endpoints

#### Get Orders Pending Approval
**Endpoint**: `GET /api/Order/pending-approval`
**Role Required**: AccountManager
```json
{
  "method": "GET",
  "headers": {
    "Authorization": "Bearer <jwt-token>"
  }
}
```

#### Approve Order
**Endpoint**: `PATCH /api/Order/{id}/approve`
**Role Required**: AccountManager
```json
{
  "method": "PATCH",
  "headers": {
    "Authorization": "Bearer <jwt-token>"
  }
}
```

#### Reject Order
**Endpoint**: `PATCH /api/Order/{id}/reject`
**Role Required**: AccountManager
```json
{
  "method": "PATCH",
  "headers": {
    "Authorization": "Bearer <jwt-token>"
  }
}
```

#### Update Order Status
**Endpoint**: `PATCH /api/Order/{id}/status`
```json
{
  "method": "PATCH",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "status": "InProduction"
  }
}
```

### Updated Order DTOs

#### OrderDto (Response)
```json
{
  "id": 1,
  "roundId": 1,
  "deliveryId": null,
  "appUserId": "user123",
  "motorType": "A",
  "quantity": 10,
  "signature": "order-signature-001",
  "orderDate": "2025-06-20T10:00:00",
  "status": "Pending"
}
```

#### CreateOrderDto (Request)
```json
{
  "roundId": 1,
  "appUserId": "user123",
  "motorType": "A",
  "quantity": 10,
  "signature": "order-signature-001",
  "productionLine": "A",
  "status": "Pending"  // Optional - defaults to Pending
}
```

### Workflow Example

1. **Order Creation**: Order starts with "Pending" status
2. **Production**: Status updated to "InProduction"
3. **Quality Check**: Status updated to "AwaitingAccountManagerApproval"
4. **Account Manager Review**: Account Manager approves/rejects
5. **Delivery**: Status updated to "Delivered"
6. **Completion**: Status updated to "Completed"

### Event Logging

All status changes are automatically logged in the EventLog system with:
- Case ID: Order-{orderId}
- Activity: Status change description
- Resource: User who made the change
- Additional Data: Previous and new status
