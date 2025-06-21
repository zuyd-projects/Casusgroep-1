using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERPNumber1.Models;
using ERPNumber1.Data;
using ERPNumber1.Interfaces;
using ERPNumber1.Extensions;
using ERPNumber1.Attributes;
using ERPNumber1.Dtos.Order;
using System.Security.Claims;

namespace ERPNumber1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEventLogService _eventLogService;

        public OrderController(AppDbContext context, IEventLogService eventLogService)
        {
            _context = context;
            _eventLogService = eventLogService;
        }

        // GET: api/Order
        [HttpGet]
        [LogEvent("Order", "Get All Orders")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            return await _context.Orders
                .Include(o => o.Products)
                .ToListAsync();
        }

        // GET: api/Order/5
        [HttpGet("{id}")]
        [LogEvent("Order", "Get Order by ID")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Products)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                // Log the failed attempt
                await _eventLogService.LogOrderEventAsync(id, "Order Retrieval Failed", "OrderController", "Failed", 
                    new { reason = "Order not found" });
                return NotFound();
            }

            return order;
        }

        // POST: api/Order
        [HttpPost]
        [LogEvent("Order", "Create Order", logRequest: true)]
        public async Task<ActionResult<Order>> PostOrder(CreateOrderDto orderDto)
        {
            var startTime = DateTime.UtcNow;
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var order = new Order
            {
                RoundId = orderDto.RoundId,
                DeliveryId = orderDto.DeliveryId,
                AppUserId = orderDto.AppUserId,
                MotorType = orderDto.MotorType,
                Quantity = orderDto.Quantity,
                Signature = orderDto.Signature,
                OrderDate = orderDto.OrderDate
            };
            
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Log the successful order creation
            await _eventLogService.LogOrderEventAsync(order.Id, "Order Created", "OrderController", "Completed", 
                new { 
                    motorType = order.MotorType,
                    quantity = order.Quantity,
                    orderDate = order.OrderDate,
                    signature = order.Signature
                }, userId);

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }

        // PUT: api/Order/5
        [HttpPut("{id}")]
        [LogEvent("Order", "Update Order", logRequest: true)]
        public async Task<IActionResult> PutOrder(int id, UpdateOrderDto orderDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                await _eventLogService.LogOrderEventAsync(id, "Order Update Failed", "OrderController", "Failed", 
                    new { reason = "Order not found" });
                return NotFound();
            }

            order.RoundId = orderDto.RoundId;
            order.DeliveryId = orderDto.DeliveryId;
            order.AppUserId = orderDto.AppUserId;
            order.MotorType = orderDto.MotorType;
            order.Quantity = orderDto.Quantity;
            order.Signature = orderDto.Signature;
            order.OrderDate = orderDto.OrderDate;

            try
            {
                await _context.SaveChangesAsync();
                
                // Log successful update
                await _eventLogService.LogOrderEventAsync(id, "Order Updated", "OrderController", "Completed", 
                    new { 
                        motorType = order.MotorType,
                        quantity = order.Quantity
                    }, userId);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Orders.Any(e => e.Id == id))
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
            var order = await _context.Orders.FindAsync(id);
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (order == null)
            {
                await _eventLogService.LogOrderEventAsync(id, "Order Deletion Failed", "OrderController", "Failed", 
                    new { reason = "Order not found" }, userId);
                return NotFound();
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

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
    }
}
