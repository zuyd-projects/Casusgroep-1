using ERPNumber1.Attributes;
using ERPNumber1.Data;
using ERPNumber1.Dtos.Order;
using ERPNumber1.Dtos.Simulation;
using ERPNumber1.Dtos.SupplierOrder;
using ERPNumber1.Extensions;
using ERPNumber1.Interfaces;
using ERPNumber1.Mapper;
using ERPNumber1.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ERPNumber1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderRepository _orderRepo;
        private readonly IEventLogService _eventLogService;
        private readonly ISupplierOrderRepository _supplierOrderRepo;

        // Motor type to block requirements mapping 
        private static readonly Dictionary<char, Dictionary<string, int>> MotorBlockRequirements = new()
        {
            ['A'] = new Dictionary<string, int> { ["Blauw"] = 3, ["Rood"] = 4, ["Grijs"] = 2 },
            ['B'] = new Dictionary<string, int> { ["Blauw"] = 2, ["Rood"] = 2, ["Grijs"] = 4 },
            ['C'] = new Dictionary<string, int> { ["Blauw"] = 3, ["Rood"] = 3, ["Grijs"] = 2 }
        };

        public OrderController(IOrderRepository orderRepo, IEventLogService eventLogService, ISupplierOrderRepository supplierOrderRepo)
        {
            _orderRepo = orderRepo;
            _eventLogService = eventLogService;
            _supplierOrderRepo = supplierOrderRepo;
        }

        // GET: api/Order
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            var orders = await _orderRepo.GetAllAsync();
            var orderDtos = orders.Select(s => s.ToOrderDto());
            return Ok(orderDtos);
        }

        // GET: api/Order/pending-approval
        [HttpGet("pending-approval")]
        [LogEvent("Order", "Get Orders Pending Approval")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrdersPendingApproval()
        {
            try
            {
                var orders = await _orderRepo.GetAllAsync();
                var pendingOrders = orders.Where(o => o.Status == OrderStatus.AwaitingAccountManagerApproval)
                                         .Select(o => o.ToOrderDto());
                
                return Ok(pendingOrders);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving pending orders: {ex.Message}");
            }
        }

        // GET: api/Order/5
        [HttpGet("{id}")]
        [LogEvent("Order", "Get Order by ID")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _orderRepo.GetByIdAsync(id);

            if (order == null)
            {
                // Log the failed attempt
                await _eventLogService.LogOrderEventAsync(id, "Order Retrieval Failed", "OrderController", "Failed", 
                    new { reason = "Order not found" });
                return NotFound();
            }

            return Ok(order.ToOrderDto());
        }

        // POST: api/Order
        [HttpPost]
        [LogEvent("Order", "Create Order", logRequest: true)]
        public async Task<ActionResult<Order>> PostOrder(CreateOrderDto orderDto)
        {
            
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            Console.WriteLine($"🛍️ Creating order: MotorType={orderDto.MotorType}, Quantity={orderDto.Quantity}, RoundId={orderDto.RoundId}");

            var orderModel = orderDto.ToOrderFromCreate();
            // Set initial status to Pending (waiting for voorraadBeheer approval)
            orderModel.Status = OrderStatus.Pending;
            var createdOrder = await _orderRepo.CreateAsync(orderModel);

            Console.WriteLine($"✅ Order created with ID: {createdOrder.Id} - Status: Pending (awaiting voorraadBeheer approval)");

            // Don't create supplier order immediately - wait for voorraadBeheer approval

            // Log the successful order creation
            await _eventLogService.LogOrderEventAsync(createdOrder.Id, "Order Created", "OrderController", "Completed", 
                new { 
                    motorType = createdOrder.MotorType,
                    quantity = createdOrder.Quantity,
                    orderDate = createdOrder.OrderDate,
                    signature = createdOrder.Signature,
                    roundId = createdOrder.RoundId,
                    status = "Pending",
                    note = "Order created and sent to voorraadBeheer for approval"
                }, userId);

            return CreatedAtAction(nameof(GetOrder), new { id = createdOrder.Id }, createdOrder.ToOrderDto());
        }

        private async Task CreateSupplierOrderForMotorType(Order order, string? userId)
        {
            try
            {
                Console.WriteLine($"🔧 Creating supplier order for Order ID: {order.Id}, Motor Type: {order.MotorType}");
                
                // Check if a supplier order already exists for this order (due to 1-to-1 relationship)
                var existingSupplierOrders = await _supplierOrderRepo.GetAllAsync();
                var existingSupplierOrder = existingSupplierOrders.FirstOrDefault(so => so.OrderId == order.Id);
                
                if (existingSupplierOrder != null)
                {
                    Console.WriteLine($"⚠️ Supplier order already exists for Order ID: {order.Id}, SupplierOrder ID: {existingSupplierOrder.Id}");
                    await _eventLogService.LogEventAsync($"Order_{order.Id}", "Supplier Order Already Exists", 
                        "OrderController", "Order", "Warning", 
                        System.Text.Json.JsonSerializer.Serialize(new { 
                            orderId = order.Id,
                            existingSupplierOrderId = existingSupplierOrder.Id,
                            message = "Supplier order already exists for this order due to 1-to-1 relationship"
                        }), order.Id.ToString(), userId: userId);
                    return;
                }
                
                // Get block requirements for this motor type
                if (!MotorBlockRequirements.TryGetValue(order.MotorType, out var blockRequirements))
                {
                    Console.WriteLine($"❌ Unknown motor type: {order.MotorType}");
                    await _eventLogService.LogEventAsync($"Order_{order.Id}", "Unknown Motor Type", 
                        "OrderController", "Order", "Warning", 
                        System.Text.Json.JsonSerializer.Serialize(new { 
                            motorType = order.MotorType,
                            message = "No block requirements defined for this motor type"
                        }), order.Id.ToString(), userId: userId);
                    return;
                }

                Console.WriteLine($"✅ Found block requirements for motor {order.MotorType}: {string.Join(", ", blockRequirements.Select(b => $"{b.Key}={b.Value}"))}");

                // Calculate total blocks needed (multiply by order quantity)
                var totalBlocks = new Dictionary<string, int>();
                foreach (var block in blockRequirements)
                {
                    totalBlocks[block.Key] = block.Value * order.Quantity;
                }

                Console.WriteLine($"📊 Total blocks needed: {string.Join(", ", totalBlocks.Select(b => $"{b.Key}={b.Value}"))}");

                // Create supplier order
                var supplierOrder = new SupplierOrder
                {
                    AppUserId = null, // Don't require a specific user for auto-created supplier orders
                    OrderId = order.Id,
                    Quantity = totalBlocks.Values.Sum(), // Total blocks needed
                    Status = "FromOrder", // Automatic status for orders from production
                    round_number = order.RoundId,
                    IsRMA = false,
                    OrderDate = DateTime.UtcNow
                };

                Console.WriteLine($"🏭 Creating supplier order: AppUserId={supplierOrder.AppUserId}, OrderId={supplierOrder.OrderId}, Quantity={supplierOrder.Quantity}, Status={supplierOrder.Status}, RoundNumber={supplierOrder.round_number}");

                var createdSupplierOrder = await _supplierOrderRepo.CreateAsync(supplierOrder);
                
                Console.WriteLine($"✅ Supplier order created successfully with ID: {createdSupplierOrder.Id}");

                // Log supplier order creation with block details
                await _eventLogService.LogEventAsync($"SupplierOrder_{createdSupplierOrder.Id}", "Supplier Order Auto-Created", 
                    "OrderController", "SupplierOrder", "Completed", 
                    System.Text.Json.JsonSerializer.Serialize(new { 
                        orderId = order.Id,
                        motorType = order.MotorType,
                        orderQuantity = order.Quantity,
                        blockRequirements = totalBlocks,
                        totalBlocks = createdSupplierOrder.Quantity,
                        supplierOrderId = createdSupplierOrder.Id,
                        autoCreated = true
                    }), createdSupplierOrder.Id.ToString(), userId: userId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error creating supplier order: {ex.Message}");
                Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                
                await _eventLogService.LogEventAsync($"Order_{order.Id}", "Supplier Order Creation Failed", 
                    "OrderController", "Order", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { 
                        error = ex.Message,
                        stackTrace = ex.StackTrace,
                        motorType = order.MotorType,
                        orderId = order.Id
                    }), order.Id.ToString(), userId: userId);
                
                // Re-throw the exception so we can see what's wrong
                throw;
            }
        }

        // PUT: api/Order/5
        [HttpPut("{id}")]
        [LogEvent("Order", "Update Order", logRequest: true)]
        public async Task<IActionResult> PutOrder(int id, UpdateOrderDto orderDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Get the current order to track status changes
            var currentOrder = await _orderRepo.GetByIdAsync(id);
            if (currentOrder == null)
            {
                await _eventLogService.LogOrderEventAsync(id, "Order Update Failed", "OrderController", "Failed", 
                    new { reason = "Order not found" });
                return NotFound();
            }

            // Track the old status for logging
            var oldStatus = currentOrder.Status;
            var newOrderData = orderDto.ToOrderFromUpdate();
            var newStatus = newOrderData.Status;

            var order = await _orderRepo.UpdateAysnc(id, newOrderData);
            if (order == null)
            {
                await _eventLogService.LogOrderEventAsync(id, "Order Update Failed", "OrderController", "Failed", 
                    new { reason = "Order not found" });
                return NotFound();
            }

            try
            {
                // Log successful update
                await _eventLogService.LogOrderEventAsync(id, "Order Updated", "OrderController", "Completed", 
                    new { 
                        motorType = order.MotorType,
                        quantity = order.Quantity,
                        oldStatus = oldStatus.ToString(),
                        newStatus = newStatus.ToString(),
                        statusChanged = oldStatus != newStatus
                    }, userId);

                // If status changed, log the specific status change
                if (oldStatus != newStatus)
                {
                    await LogOrderStatusChange(id, oldStatus, newStatus, "OrderController", userId);
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (! await _orderRepo.OrderExistsAsync(id))
                {
                    await _eventLogService.LogOrderEventAsync(id, "Order Update Failed", "OrderController", "Failed", 
                        new { reason = "Order not found" }, userId);
                    return NotFound();
                }
                else
                {
                    await _eventLogService.LogOrderEventAsync(id, "Order Update Failed", "OrderController", "Failed", 
                        new { reason = "Concurrency exception" }, userId);
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Order/5
        [HttpDelete("{id}")]
        [LogEvent("Order", "Delete Order")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _orderRepo.DeleteAsync(id);
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (order == null)
            {
                await _eventLogService.LogOrderEventAsync(id, "Order Deletion Failed", "OrderController", "Failed", 
                    new { reason = "Order not found" }, userId);
                return NotFound();
            }

            

            // Log successful deletion
            await _eventLogService.LogOrderEventAsync(id, "Order Deleted", "OrderController", "Completed", 
                new { 
                    deletedOrderData = new {
                        motorType = order.MotorType,
                        quantity = order.Quantity,
                        orderDate = order.OrderDate
                    }
                }, userId);

            return NoContent();
        }

        // Helper method to check and log round-based delivery delays
        private Task CheckRoundBasedDelaysAsync()
        {
            // This could be called periodically or after order operations
            // For now, we'll let the ProcessMining service handle this via the delivery predictions endpoint
            return Task.CompletedTask;
        }

        // Helper method to log order status changes consistently
        private async Task LogOrderStatusChange(int orderId, OrderStatus oldStatus, OrderStatus newStatus, string resource, string? userId = null)
        {
            try
            {
                await _eventLogService.LogEventAsync(
                    caseId: $"Order-{orderId}",
                    activity: $"Order Status Changed from {oldStatus} to {newStatus}",
                    resource: resource,
                    eventType: "Order",
                    status: "Completed",
                    additionalData: System.Text.Json.JsonSerializer.Serialize(new 
                    { 
                        OrderId = orderId, 
                        OldStatus = oldStatus.ToString(), 
                        NewStatus = newStatus.ToString(),
                        ChangeTimestamp = DateTime.UtcNow,
                        ChangedBy = userId ?? "System"
                    }),
                    entityId: orderId.ToString(),
                    userId: userId
                );

                Console.WriteLine($"📝 Status change logged for Order {orderId}: {oldStatus} → {newStatus}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to log status change for Order {orderId}: {ex.Message}");
                // Don't throw - logging should not break the main process
            }
        }

        // GET: api/Order/round-delays
        [HttpGet("round-delays")]
        [LogEvent("Order", "Check Round Delays")]
        public ActionResult GetRoundBasedDelays()
        {
            try
            {
                // This endpoint can be called to specifically check for round-based delays
                // The actual logic is implemented in the ProcessMining delivery predictions
                return Ok(new { message = "Round-based delay checking is integrated into delivery predictions endpoint" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error checking round delays: {ex.Message}");
            }
        }

        // PATCH: api/Order/5/approve
        [HttpPatch("{id}/approve")]
        [LogEvent("Order", "Approve Order")]
        public async Task<IActionResult> ApproveOrder(int id)
        {
            try
            {
                var order = await _orderRepo.GetByIdAsync(id);
                if (order == null)
                {
                    return NotFound($"Order with ID {id} not found.");
                }

                var oldStatus = order.Status;
                order.Status = OrderStatus.ApprovedByAccountManager;
                var updatedOrder = await _orderRepo.UpdateAysnc(id, order);

                if (updatedOrder == null)
                {
                    return BadRequest("Failed to approve order.");
                }

                // Log the status change using the centralized method
                await LogOrderStatusChange(id, oldStatus, OrderStatus.ApprovedByAccountManager, "OrderController", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                return Ok(updatedOrder.ToOrderDto());
            }
            catch (Exception ex)
            {
                return BadRequest($"Error approving order: {ex.Message}");
            }
        }

        // PATCH: api/Order/5/reject
        [HttpPatch("{id}/reject")]
        [LogEvent("Order", "Reject Order")]
        public async Task<IActionResult> RejectOrder(int id)
        {
            try
            {
                var order = await _orderRepo.GetByIdAsync(id);
                if (order == null)
                {
                    return NotFound($"Order with ID {id} not found.");
                }

                var oldStatus = order.Status;
                order.Status = OrderStatus.RejectedByAccountManager;
                var updatedOrder = await _orderRepo.UpdateAysnc(id, order);

                if (updatedOrder == null)
                {
                    return BadRequest("Failed to reject order.");
                }

                // Log the status change using the centralized method
                await LogOrderStatusChange(id, oldStatus, OrderStatus.RejectedByAccountManager, "OrderController", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                return Ok(updatedOrder.ToOrderDto());
            }
            catch (Exception ex)
            {
                return BadRequest($"Error rejecting order: {ex.Message}");
            }
        }

        // PATCH: api/Order/5/status
        [HttpPatch("{id}/status")]
        [LogEvent("Order", "Update Order Status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto statusDto)
        {
            try
            {
                var order = await _orderRepo.GetByIdAsync(id);
                if (order == null)
                {
                    return NotFound($"Order with ID {id} not found.");
                }

                if (!Enum.TryParse<OrderStatus>(statusDto.Status, out var newStatus))
                {
                    return BadRequest($"Invalid status: {statusDto.Status}");
                }

                var oldStatus = order.Status;
                order.Status = newStatus;
                var updatedOrder = await _orderRepo.UpdateAysnc(id, order);

                if (updatedOrder == null)
                {
                    return BadRequest("Failed to update order status.");
                }

                // Use the centralized status change logging method
                await LogOrderStatusChange(id, oldStatus, newStatus, User.Identity?.Name ?? "System", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                return Ok(updatedOrder.ToOrderDto());
            }
            catch (Exception ex)
            {
                return BadRequest($"Error updating order status: {ex.Message}");
            }
        }

        // POST: api/Order/{id}/approve-voorraad
        [HttpPost("{id}/approve-voorraad")]
        [LogEvent("Order", "Approve Order by VoorraadBeheer")]
        public async Task<IActionResult> ApproveOrderByVoorraadBeheer(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            try
            {
                var order = await _orderRepo.GetByIdAsync(id);
                if (order == null)
                {
                    await _eventLogService.LogOrderEventAsync(id, "Order Approval Failed", "OrderController", "Failed", 
                        new { reason = "Order not found" }, userId);
                    return NotFound();
                }

                if (order.Status != OrderStatus.Pending)
                {
                    await _eventLogService.LogOrderEventAsync(id, "Order Approval Failed", "OrderController", "Failed", 
                        new { reason = $"Order status is {order.Status}, expected Pending" }, userId);
                    return BadRequest($"Order cannot be approved. Current status: {order.Status}");
                }

                // Update order status to ApprovedByVoorraadbeheer
                var oldStatus = order.Status;
                order.Status = OrderStatus.ApprovedByVoorraadbeheer;
                await _orderRepo.UpdateAysnc(id, order);

                Console.WriteLine($"✅ Order {id} approved by voorraadBeheer - Status: ApprovedByVoorraadbeheer");

                // Log the status change using the centralized method
                await LogOrderStatusChange(id, oldStatus, OrderStatus.ApprovedByVoorraadbeheer, "OrderController", userId);

                // Create supplier order after approval
                try
                {
                    await CreateSupplierOrderForMotorType(order, userId);
                    Console.WriteLine($"✅ Supplier order creation completed for approved Order ID: {order.Id}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Failed to create supplier order for approved Order ID: {order.Id}, Error: {ex.Message}");
                    // Continue with approval even if supplier order fails
                }

                // Log successful approval
                await _eventLogService.LogOrderEventAsync(id, "Order Approved by VoorraadBeheer", "OrderController", "Completed", 
                    new { 
                        previousStatus = "Pending",
                        newStatus = "ApprovedByVoorraadBeheer",
                        approvedBy = "VoorraadBeheer",
                        supplierOrderCreated = true
                    }, userId);

                return Ok(new { message = "Order approved and sent to supplier and planning", status = "ApprovedByVoorraadBeheer" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error approving order {id}: {ex.Message}");
                await _eventLogService.LogOrderEventAsync(id, "Order Approval Failed", "OrderController", "Failed", 
                    new { error = ex.Message }, userId);
                return StatusCode(500, "Internal server error during order approval");
            }
        }

        // POST: api/Order/{id}/reject-voorraad
        [HttpPost("{id}/reject-voorraad")]
        [LogEvent("Order", "Reject Order by VoorraadBeheer")]
        public async Task<IActionResult> RejectOrderByVoorraadBeheer(int id, [FromBody] RejectOrderDto rejectDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            try
            {
                var order = await _orderRepo.GetByIdAsync(id);
                if (order == null)
                {
                    await _eventLogService.LogOrderEventAsync(id, "Order Rejection Failed", "OrderController", "Failed", 
                        new { reason = "Order not found" }, userId);
                    return NotFound();
                }

                if (order.Status != OrderStatus.Pending)
                {
                    await _eventLogService.LogOrderEventAsync(id, "Order Rejection Failed", "OrderController", "Failed", 
                        new { reason = $"Order status is {order.Status}, expected Pending" }, userId);
                    return BadRequest($"Order cannot be rejected. Current status: {order.Status}");
                }

                // Update order status to RejectedByVoorraadbeheer
                var oldStatus = order.Status;
                order.Status = OrderStatus.RejectedByVoorraadbeheer;
                await _orderRepo.UpdateAysnc(id, order);

                Console.WriteLine($"❌ Order {id} rejected by voorraadBeheer - Reason: {rejectDto?.Reason ?? "No reason provided"}");

                // Log the status change using the centralized method
                await LogOrderStatusChange(id, oldStatus, OrderStatus.RejectedByVoorraadbeheer, "OrderController", userId);

                // Log successful rejection
                await _eventLogService.LogOrderEventAsync(id, "Order Rejected by VoorraadBeheer", "OrderController", "Completed", 
                    new { 
                        previousStatus = "Pending",
                        newStatus = "RejectedByVoorraadBeheer",
                        rejectedBy = "VoorraadBeheer",
                        reason = rejectDto?.Reason ?? "No reason provided"
                    }, userId);

                return Ok(new { message = "Order rejected", status = "RejectedByVoorraadBeheer", reason = rejectDto?.Reason });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error rejecting order {id}: {ex.Message}");
                await _eventLogService.LogOrderEventAsync(id, "Order Rejection Failed", "OrderController", "Failed", 
                    new { error = ex.Message }, userId);
                return StatusCode(500, "Internal server error during order rejection");
            }
        }

        // POST: api/Order/{id}/start-production
        [HttpPost("{id}/start-production")]
        [LogEvent("Order", "Start Production for Order")]
        public async Task<IActionResult> StartProductionForOrder(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            try
            {
                var order = await _orderRepo.GetByIdAsync(id);
                if (order == null)
                {
                    await _eventLogService.LogOrderEventAsync(id, "Start Production Failed", "OrderController", "Failed", 
                        new { reason = "Order not found" }, userId);
                    return NotFound();
                }

                if (order.Status != OrderStatus.ApprovedByVoorraadbeheer && order.Status != OrderStatus.ToProduction)
                {
                    await _eventLogService.LogOrderEventAsync(id, "Start Production Failed", "OrderController", "Failed", 
                        new { reason = $"Order status is {order.Status}, expected ApprovedByVoorraadbeheer or ToProduction" }, userId);
                    return BadRequest($"Order cannot start production. Current status: {order.Status}. Expected: ApprovedByVoorraadbeheer or ToProduction");
                }

                // Update order status to InProduction
                var oldStatus = order.Status;
                order.Status = OrderStatus.InProduction;
                await _orderRepo.UpdateAysnc(id, order);

                Console.WriteLine($"🏭 Order {id} production started - Status: InProduction");

                // Log the status change using the centralized method
                await LogOrderStatusChange(id, oldStatus, OrderStatus.InProduction, "OrderController", userId);

                // Log successful production start
                await _eventLogService.LogOrderEventAsync(id, "Production Started", "OrderController", "Completed", 
                    new { 
                        previousStatus = oldStatus.ToString(),
                        newStatus = "InProduction",
                        startedBy = "ProductionLine"
                    }, userId);

                return Ok(new { message = "Production started for order", status = "InProduction" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error starting production for order {id}: {ex.Message}");
                await _eventLogService.LogOrderEventAsync(id, "Start Production Failed", "OrderController", "Failed", 
                    new { error = ex.Message }, userId);
                return StatusCode(500, "Internal server error during production start");
            }
        }

        // POST: api/Order/{id}/complete
        [HttpPost("{id}/complete")]
        [LogEvent("Order", "Complete Order")]
        public async Task<IActionResult> CompleteOrder(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            try
            {
                var order = await _orderRepo.GetByIdAsync(id);
                if (order == null)
                {
                    await _eventLogService.LogOrderEventAsync(id, "Order Completion Failed", "OrderController", "Failed", 
                        new { reason = "Order not found" }, userId);
                    return NotFound();
                }

                if (order.Status != OrderStatus.InProduction)
                {
                    await _eventLogService.LogOrderEventAsync(id, "Order Completion Failed", "OrderController", "Failed", 
                        new { reason = $"Order status is {order.Status}, expected InProduction" }, userId);
                    return BadRequest($"Order cannot be completed. Current status: {order.Status}. Expected: InProduction");
                }

                // Update order status to Completed
                var oldStatus = order.Status;
                order.Status = OrderStatus.Completed;
                await _orderRepo.UpdateAysnc(id, order);

                Console.WriteLine($"✅ Order {id} completed - Status: Completed");

                // Log the status change using the centralized method
                await LogOrderStatusChange(id, oldStatus, OrderStatus.Completed, "OrderController", userId);

                // Log successful order completion
                await _eventLogService.LogOrderEventAsync(id, "Order Completed", "OrderController", "Completed", 
                    new { 
                        previousStatus = "InProduction",
                        newStatus = "Completed",
                        completedBy = "ProductionLine",
                        motorType = order.MotorType,
                        quantity = order.Quantity,
                        completionDate = DateTime.UtcNow
                    }, userId);

                return Ok(new { message = "Order completed successfully", status = "Completed" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error completing order {id}: {ex.Message}");
                await _eventLogService.LogOrderEventAsync(id, "Order Completion Failed", "OrderController", "Failed", 
                    new { error = ex.Message }, userId);
                return StatusCode(500, "Internal server error during order completion");
            }
        }
    }
}
