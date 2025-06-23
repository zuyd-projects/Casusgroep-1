using ERPNumber1.Attributes;
using ERPNumber1.Data;
using ERPNumber1.Dtos.Order;
using ERPNumber1.Dtos.Simulation;
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
        
        private readonly IEventLogService _eventLogService;
        private readonly IOrderRepository _orderRepo;
        //private readonly AppDbContext _context;    

        public OrderController(IEventLogService eventLogService,IOrderRepository orderRepo/*, AppDbContext context*/ )
        {
            
            _eventLogService = eventLogService;
            _orderRepo = orderRepo;
            //_context = context;
        }

        // GET: api/Order
        [HttpGet]
        [LogEvent("Order", "Get All Orders")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            var orders = await _orderRepo.GetAllAsync();
            var orderDtos = orders.Select(s => s.ToOrderDto());
            return Ok(orderDtos);
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

            var orderModel = orderDto.ToOrderFromCreate();
            await _orderRepo.CreateAsync(orderModel);


            // Log the successful order creation
            await _eventLogService.LogOrderEventAsync(orderModel.Id, "Order Created", "OrderController", "Completed", 
                new { 
                    motorType = orderModel.MotorType,
                    quantity = orderModel.Quantity,
                    orderDate = orderModel.OrderDate,
                    signature = orderModel.Signature,
                    roundId = orderModel.RoundId
                }, userId);

            return CreatedAtAction(nameof(GetOrder), new { id = orderModel.Id }, orderModel.ToOrderDto());
        }

        // PUT: api/Order/5
        [HttpPut("{id}")]
        [LogEvent("Order", "Update Order", logRequest: true)]
        public async Task<IActionResult> PutOrder(int id, UpdateOrderDto orderDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var order = await _orderRepo.UpdateAysnc(id, orderDto.ToOrderFromUpdate());
            if (order == null)
            {
                await _eventLogService.LogOrderEventAsync(id, "Order Update Failed", "OrderController", "Failed", 
                    new { reason = "Order not found" });
                return NotFound();
            }

            

            try
            {
                //await _context.SaveChangesAsync();
                
                // Log successful update
                await _eventLogService.LogOrderEventAsync(id, "Order Updated", "OrderController", "Completed", 
                    new { 
                        motorType = order.MotorType,
                        quantity = order.Quantity
                    }, userId);
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
    }
}
