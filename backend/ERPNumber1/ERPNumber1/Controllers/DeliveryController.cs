using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERPNumber1.Models;
using ERPNumber1.Data;
using ERPNumber1.Interfaces;
using ERPNumber1.Extensions;
using ERPNumber1.Attributes;
using ERPNumber1.Dtos.Delivery;
using System.Security.Claims;

namespace ERPNumber1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeliveryController : ControllerBase, IRequireRole
    {
        public Role[] AllowedRoles => [Role.Admin ];
        private readonly AppDbContext _context;
        private readonly IEventLogService _eventLogService;

        public DeliveryController(AppDbContext context, IEventLogService eventLogService)
        {
            _context = context;
            _eventLogService = eventLogService;
        }

        // GET: api/Delivery
        [RequireRole(Role.Admin)]
        [HttpGet]
        [LogEvent("Delivery", "Get All Deliveries")]
        public async Task<ActionResult<IEnumerable<Delivery>>> GetDeliveries()
        {
            return await _context.Deliveries.ToListAsync();
        }

        // GET: api/Delivery/5
        [HttpGet("{id}")]
        [LogEvent("Delivery", "Get Delivery by ID")]
        public async Task<ActionResult<Delivery>> GetDelivery(int id)
        {
            var delivery = await _context.Deliveries.FindAsync(id);

            if (delivery == null)
            {
                await _eventLogService.LogEventAsync($"Delivery_{id}", "Delivery Retrieval Failed", 
                    "DeliveryController", "Delivery", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Delivery not found" }), 
                    id.ToString());
                return NotFound();
            }

            return delivery;
        }

        // POST: api/Delivery
        [HttpPost]
        [LogEvent("Delivery", "Create Delivery", logRequest: true)]
        public async Task<ActionResult<Delivery>> PostDelivery(CreateDeliveryDto deliveryDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var delivery = new Delivery
            {
                OrderId = deliveryDto.OrderId,
                IsDelivered = deliveryDto.IsDelivered,
                QualityCheckPassed = deliveryDto.QualityCheckPassed,
                ApprovedByCustomer = deliveryDto.ApprovedByCustomer
            };
            
            _context.Deliveries.Add(delivery);
            await _context.SaveChangesAsync();

            await _eventLogService.LogEventAsync($"Delivery_{delivery.Id}", "Delivery Created", 
                "DeliveryController", "Delivery", "Completed", 
                System.Text.Json.JsonSerializer.Serialize(new { 
                    orderId = delivery.OrderId,
                    isDelivered = delivery.IsDelivered,
                    qualityCheckPassed = delivery.QualityCheckPassed,
                    createdBy = userId
                }), delivery.Id.ToString(), userId: userId);

            return CreatedAtAction(nameof(GetDelivery), new { id = delivery.Id }, delivery);
        }

        // PUT: api/Delivery/5
        [HttpPut("{id}")]
        [LogEvent("Delivery", "Update Delivery", logRequest: true)]
        public async Task<IActionResult> PutDelivery(int id, UpdateDeliveryDto deliveryDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var delivery = await _context.Deliveries.FindAsync(id);
            if (delivery == null)
            {
                await _eventLogService.LogEventAsync($"Delivery_{id}", "Delivery Update Failed", 
                    "DeliveryController", "Delivery", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Delivery not found" }), 
                    id.ToString());
                return NotFound();
            }

            delivery.OrderId = deliveryDto.OrderId;
            delivery.IsDelivered = deliveryDto.IsDelivered;
            delivery.QualityCheckPassed = deliveryDto.QualityCheckPassed;
            delivery.ApprovedByCustomer = deliveryDto.ApprovedByCustomer;

            try
            {
                await _context.SaveChangesAsync();
                
                await _eventLogService.LogEventAsync($"Delivery_{id}", "Delivery Updated", 
                    "DeliveryController", "Delivery", "Completed", 
                    System.Text.Json.JsonSerializer.Serialize(new { 
                        orderId = delivery.OrderId,
                        isDelivered = delivery.IsDelivered,
                        qualityCheckPassed = delivery.QualityCheckPassed,
                        approvedByCustomer = delivery.ApprovedByCustomer,
                        updatedBy = userId
                    }), id.ToString(), userId: userId);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Deliveries.Any(e => e.Id == id))
                {
                    await _eventLogService.LogEventAsync($"Delivery_{id}", "Delivery Update Failed", 
                        "DeliveryController", "Delivery", "Failed", 
                        System.Text.Json.JsonSerializer.Serialize(new { reason = "Delivery not found during update" }), 
                        id.ToString());
                    return NotFound();
                }
                else
                {
                    await _eventLogService.LogEventAsync($"Delivery_{id}", "Delivery Update Failed", 
                        "DeliveryController", "Delivery", "Failed", 
                        System.Text.Json.JsonSerializer.Serialize(new { reason = "Concurrency conflict" }), 
                        id.ToString());
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Delivery/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDelivery(int id)
        {
            var delivery = await _context.Deliveries.FindAsync(id);
            if (delivery == null)
            {
                return NotFound();
            }

            _context.Deliveries.Remove(delivery);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
