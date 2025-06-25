using ERPNumber1.Attributes;
using ERPNumber1.Data;
using ERPNumber1.Dtos.Product;
using ERPNumber1.Dtos.SupplierOrder;
using ERPNumber1.Dtos.User;
using ERPNumber1.Extensions;
using ERPNumber1.Interfaces;
using ERPNumber1.Mapper;
using ERPNumber1.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ERPNumber1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupplierOrderController : ControllerBase
    {
        public Role[] AllowedRoles => [Role.Admin,Role.inventoryManagement];
        private readonly IEventLogService _eventLogService;
        private readonly ISupplierOrderRepository _supplierOrderRepo;

        public SupplierOrderController(IEventLogService eventLogService, ISupplierOrderRepository supplierOrderRepo)
        {
            
            _eventLogService = eventLogService;
            _supplierOrderRepo = supplierOrderRepo;
            
        }

        // GET: api/SupplierOrder
        [RequireRole(Role.Supplier)]
        [HttpGet]
        [LogEvent("SupplierOrder", "Get All Supplier Orders")]
        public async Task<ActionResult<IEnumerable<SupplierOrder>>> GetSupplierOrders()
        {
               return await _supplierOrderRepo.GetAllAsync();
        }

        // GET: api/SupplierOrde/5
        [RequireRole(Role.Supplier)]
        [HttpGet("{id}")]
        [LogEvent("SupplierOrder", "Get Supplier Order by ID")]
        public async Task<ActionResult<SupplierOrder>> GetSupplierOrder(int id)
        {
            var supplierOrder = await _supplierOrderRepo.GetByIdAsync(id);

            if (supplierOrder == null)
            {
                await _eventLogService.LogEventAsync($"SupplierOrder_{id}", "Supplier Order Retrieval Failed", 
                    "SupplierOrderController", "SupplierOrder", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Supplier order not found" }), 
                    id.ToString());
                return NotFound();
            }

            return Ok(supplierOrder.ToSupplierOrderDto());
        }

        // PUT: api/SupplierOrder/5
        [HttpPut("{id}")]
        [LogEvent("SupplierOrder", "Update Supplier Order", logRequest: true)]
        public async Task<IActionResult> PutSupplierOrder(int id, UpdateSupplierOrderDto supplierOrderDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var supplierOrder = await _supplierOrderRepo.UpdateAsync(id, supplierOrderDto.ToSupplierOrderFromUpdate());
            if (supplierOrder == null)
            {
                return NotFound();
            }

            try
            {
                
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
                if (!await _supplierOrderRepo.SupplierOrderExistsAsync(id))
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

            var supplierOrder = supplierOrderDto.ToSupplierOrderFromCreate();
            await _supplierOrderRepo.CreateAsync(supplierOrder);

            await _eventLogService.LogEventAsync($"SupplierOrder_{supplierOrder.Id}", "Supplier Order Created", 
                "SupplierOrderController", "SupplierOrder", "Completed", 
                System.Text.Json.JsonSerializer.Serialize(new { 
                    status = supplierOrder.Status,
                    quantity = supplierOrder.Quantity,
                    roundNumber = supplierOrder.round_number,
                    orderDate = supplierOrder.OrderDate,
                    createdBy = userId
                }), supplierOrder.Id.ToString(), userId: userId);

            return CreatedAtAction(nameof(GetSupplierOrder), new { id = supplierOrder.Id }, supplierOrder.ToSupplierOrderDto());
        }

        // DELETE: api/supplierOrder/5
        [HttpDelete("{id}")]
        [LogEvent("SupplierOrder", "Delete Supplier Order")]
        public async Task<IActionResult> DeletesupplierOrder(int id)
        {
            var supplierOrder = await _supplierOrderRepo.DeleteAsync(id);
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            
            if (supplierOrder == null)
            {
                await _eventLogService.LogEventAsync($"SupplierOrder_{id}", "Supplier Order Deletion Failed", 
                    "SupplierOrderController", "SupplierOrder", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Supplier order not found" }), 
                    id.ToString());
                return NotFound();
            }


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

    }
}
