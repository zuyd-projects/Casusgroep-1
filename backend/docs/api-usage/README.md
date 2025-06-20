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

Independent Entities:
- User/AppUser
- Inventory
- SupplierOrder
- Delivery
- Statistics
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
