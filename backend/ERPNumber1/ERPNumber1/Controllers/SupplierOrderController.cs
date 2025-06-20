using ERPNumber1.Data;
using ERPNumber1.Dtos.User;
using ERPNumber1.Dtos.SupplierOrder;
using ERPNumber1.Interfaces;
using ERPNumber1.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERPNumber1.Extensions;
using ERPNumber1.Attributes;
using System.Security.Claims;

namespace ERPNumber1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupplierOrderController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEventLogService _eventLogService;

        public SupplierOrderController(AppDbContext context, IEventLogService eventLogService)
        {
            _context = context;
            _eventLogService = eventLogService;
        }

        // GET: api/SupplierOrder
        [HttpGet]
        [LogEvent("SupplierOrder", "Get All Supplier Orders")]
        public async Task<ActionResult<IEnumerable<SupplierOrder>>> GetSupplierOrders()
        {
            return await _context.SupplierOrders.ToListAsync();
        }

        // GET: api/SupplierOrde/5
        [HttpGet("{id}")]
        [LogEvent("SupplierOrder", "Get Supplier Order by ID")]
        public async Task<ActionResult<SupplierOrder>> GetSupplierOrder(int id)
        {
            var supplierOrder = await _context.SupplierOrders.FindAsync(id);

            if (supplierOrder == null)
            {
                await _eventLogService.LogEventAsync($"SupplierOrder_{id}", "Supplier Order Retrieval Failed", 
                    "SupplierOrderController", "SupplierOrder", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Supplier order not found" }), 
                    id.ToString());
                return NotFound();
            }

            return supplierOrder;
        }

        // PUT: api/SupplierOrder/5
        [HttpPut("{id}")]
        [LogEvent("SupplierOrder", "Update Supplier Order", logRequest: true)]
        public async Task<IActionResult> PutSupplierOrder(int id, UpdateSupplierOrderDto supplierOrderDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var supplierOrder = await _context.SupplierOrders.FindAsync(id);
            if (supplierOrder == null)
            {
                return NotFound();
            }

            supplierOrder.UserId = supplierOrderDto.UserId;
            supplierOrder.Quantity = supplierOrderDto.Quantity;
            supplierOrder.Status = supplierOrderDto.Status;
            supplierOrder.round_number = supplierOrderDto.RoundNumber;
            supplierOrder.OrderDate = supplierOrderDto.OrderDate;

            try
            {
                await _context.SaveChangesAsync();
                
                await _eventLogService.LogEventAsync($"SupplierOrder_{id}", "Supplier Order Updated", 
                    "SupplierOrderController", "SupplierOrder", "Completed", 
                    System.Text.Json.JsonSerializer.Serialize(new { 
                        status = supplierOrder.Status,
                        quantity = supplierOrder.Quantity,
                        roundNumber = supplierOrder.round_number,
                        updatedBy = userId
                    }), id.ToString(), userId: userId);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SupplierOrderExists(id))
                {
                    await _eventLogService.LogEventAsync($"SupplierOrder_{id}", "Supplier Order Update Failed", 
                        "SupplierOrderController", "SupplierOrder", "Failed", 
                        System.Text.Json.JsonSerializer.Serialize(new { reason = "Supplier order not found during update" }), 
                        id.ToString());
                    return NotFound();
                }
                else
                {
                    await _eventLogService.LogEventAsync($"SupplierOrder_{id}", "Supplier Order Update Failed", 
                        "SupplierOrderController", "SupplierOrder", "Failed", 
                        System.Text.Json.JsonSerializer.Serialize(new { reason = "Concurrency conflict" }), 
                        id.ToString());
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/SupplierOrder
        [HttpPost]
        [LogEvent("SupplierOrder", "Create Supplier Order", logRequest: true)]
        public async Task<ActionResult<SupplierOrder>> PostSupplierOrder(CreateSupplierOrderDto supplierOrderDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var supplierOrder = new SupplierOrder
            {
                UserId = supplierOrderDto.UserId,
                Quantity = supplierOrderDto.Quantity,
                Status = supplierOrderDto.Status,
                round_number = supplierOrderDto.RoundNumber,
                OrderDate = supplierOrderDto.OrderDate
            };
            
            _context.SupplierOrders.Add(supplierOrder);
            await _context.SaveChangesAsync();

            await _eventLogService.LogEventAsync($"SupplierOrder_{supplierOrder.Id}", "Supplier Order Created", 
                "SupplierOrderController", "SupplierOrder", "Completed", 
                System.Text.Json.JsonSerializer.Serialize(new { 
                    status = supplierOrder.Status,
                    quantity = supplierOrder.Quantity,
                    roundNumber = supplierOrder.round_number,
                    orderDate = supplierOrder.OrderDate,
                    createdBy = userId
                }), supplierOrder.Id.ToString(), userId: userId);

            return CreatedAtAction("GetSupplierOrder", new { id = supplierOrder.Id }, supplierOrder);
        }

        // DELETE: api/supplierOrder/5
        [HttpDelete("{id}")]
        [LogEvent("SupplierOrder", "Delete Supplier Order")]
        public async Task<IActionResult> DeletesupplierOrder(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var supplierOrder = await _context.SupplierOrders.FindAsync(id);
            
            if (supplierOrder == null)
            {
                await _eventLogService.LogEventAsync($"SupplierOrder_{id}", "Supplier Order Deletion Failed", 
                    "SupplierOrderController", "SupplierOrder", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Supplier order not found" }), 
                    id.ToString());
                return NotFound();
            }

            _context.SupplierOrders.Remove(supplierOrder);
            await _context.SaveChangesAsync();

            await _eventLogService.LogEventAsync($"SupplierOrder_{id}", "Supplier Order Deleted", 
                "SupplierOrderController", "SupplierOrder", "Completed", 
                System.Text.Json.JsonSerializer.Serialize(new { 
                    deletedSupplierOrderData = new { 
                        status = supplierOrder.Status,
                        quantity = supplierOrder.Quantity,
                        roundNumber = supplierOrder.round_number
                    }
                }), id.ToString(), userId: userId);

            return NoContent();
        }

        private bool SupplierOrderExists(int id)
        {
            return _context.SupplierOrders.Any(e => e.Id == id);
        }
    }
}
