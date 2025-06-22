# Controller Integration Examples

This guide shows how to integrate process mining event logging into existing controllers.

## Basic Integration Pattern

### 1. Controller Setup

Add the required dependencies to your controller:

```csharp
using ERPNumber1.Interfaces;
using ERPNumber1.Extensions;
using ERPNumber1.Attributes;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class YourController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IEventLogService _eventLogService;

    public YourController(AppDbContext context, IEventLogService eventLogService)
    {
        _context = context;
        _eventLogService = eventLogService;
    }
}
```

## Integration Methods

### Method 1: Attribute-Based Logging (Automatic)

Use the `[LogEvent]` attribute for automatic event logging:

```csharp
[HttpPost]
[LogEvent("Order", "Create Order", logRequest: true)]
public async Task<ActionResult<Order>> CreateOrder(Order order)
{
    _context.Orders.Add(order);
    await _context.SaveChangesAsync();
    return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
}

[HttpGet("{id}")]
[LogEvent("Order", "Get Order by ID")]
public async Task<ActionResult<Order>> GetOrder(int id)
{
    var order = await _context.Orders.FindAsync(id);
    return order == null ? NotFound() : Ok(order);
}
```

### Method 2: Manual Logging (Detailed Control)

Use extension methods for detailed control over event logging:

```csharp
[HttpPost]
public async Task<ActionResult<Order>> CreateOrder(Order order)
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    try
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Log successful creation
        await _eventLogService.LogOrderEventAsync(order.Id, "Order Created", 
            "OrderController", "Completed", 
            new { 
                motorType = order.MotorType, 
                quantity = order.Quantity 
            }, userId);

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
    }
    catch (Exception ex)
    {
        // Log failure
        await _eventLogService.LogOrderEventAsync(order.Id, 
            "Order Creation Failed", "OrderController", "Failed", 
            new { error = ex.Message }, userId);
        throw;
    }
}
```

## Specific Controller Examples

### Order Controller Integration

```csharp
public class OrderController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IEventLogService _eventLogService;

    public OrderController(AppDbContext context, IEventLogService eventLogService)
    {
        _context = context;
        _eventLogService = eventLogService;
    }

    [HttpPost]
    public async Task<ActionResult<Order>> PostOrder(Order order)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        await _eventLogService.LogOrderEventAsync(order.Id, "Order Created", 
            "OrderController", "Completed", 
            new { 
                motorType = order.MotorType,
                quantity = order.Quantity,
                orderDate = order.OrderDate
            }, userId);

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (order == null)
        {
            await _eventLogService.LogOrderEventAsync(id, "Order Deletion Failed", 
                "OrderController", "Failed", new { reason = "Order not found" }, userId);
            return NotFound();
        }

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();

        await _eventLogService.LogOrderEventAsync(id, "Order Deleted", 
            "OrderController", "Completed", 
            new { deletedOrderData = new { motorType = order.MotorType } }, userId);

        return NoContent();
    }
}
```

## Best Practices

### 1. Consistent Event Naming

```csharp
// Good: Descriptive, past tense
"Order Created"
"Payment Processed"
"Inventory Updated"

// Avoid: Vague or present tense
"Order"
"Process Payment"
```

### 2. Meaningful Additional Data

```csharp
// Good: Relevant business context
new { 
    motorType = order.MotorType,
    quantity = order.Quantity,
    customerType = "Premium"
}

// Avoid: Sensitive data
new { 
    password = "...",  // Never log sensitive data
    creditCard = "..." // Security risk
}
```

### 3. Error Handling

```csharp
try
{
    await ProcessOrder(order);
    await _eventLogService.LogOrderEventAsync(order.Id, "Order Processed", 
        "OrderService", "Completed", relevantData, userId);
}
catch (Exception ex)
{
    await _eventLogService.LogOrderEventAsync(order.Id, "Order Processing Failed", 
        "OrderService", "Failed", new { error = ex.Message }, userId);
    throw;
}
```

## Testing Integration

### Unit Tests

```csharp
[Test]
public async Task CreateOrder_ShouldLogEvent()
{
    // Arrange
    var mockEventLogService = new Mock<IEventLogService>();
    var controller = new OrderController(context, mockEventLogService.Object);

    // Act
    await controller.PostOrder(order);

    // Assert
    mockEventLogService.Verify(x => x.LogOrderEventAsync(
        It.IsAny<int>(), "Order Created", "OrderController", 
        "Completed", It.IsAny<object>(), It.IsAny<string>()), Times.Once);
}
```

This integration approach ensures comprehensive process tracking while maintaining clean, maintainable code.
