using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERPNumber1.Models;
using ERPNumber1.Data;
using ERPNumber1.Interfaces;
using ERPNumber1.Extensions;
using ERPNumber1.Attributes;
using ERPNumber1.Dtos.Inventory;
using System.Security.Claims;

namespace ERPNumber1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEventLogService _eventLogService;

        public InventoryController(AppDbContext context, IEventLogService eventLogService)
        {
            _context = context;
            _eventLogService = eventLogService;
        }

        // GET: api/Inventory
        [HttpGet]
        [LogEvent("Inventory", "Get All Inventories")]
        public async Task<ActionResult<IEnumerable<Inventory>>> GetInventories()
        {
            return await _context.Inventories
                .Include(i => i.Materials)
                .ToListAsync();
        }

        // GET: api/Inventory/5
        [HttpGet("{id}")]
        [LogEvent("Inventory", "Get Inventory by ID")]
        public async Task<ActionResult<Inventory>> GetInventory(int id)
        {
            var inventory = await _context.Inventories
                .Include(i => i.Materials)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (inventory == null)
            {
                await _eventLogService.LogInventoryEventAsync(id, "Inventory Retrieval Failed", 
                    "InventoryController", "Failed", 
                    new { reason = "Inventory not found" });
                return NotFound();
            }

            return inventory;
        }

        // POST: api/Inventory
        [HttpPost]
        [LogEvent("Inventory", "Create Inventory", logRequest: true)]
        public async Task<ActionResult<Inventory>> PostInventory(CreateInventoryDto inventoryDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var inventory = new Inventory
            {
                Name = inventoryDto.Name,
                Quantity = inventoryDto.Quantity,
                AppUserId = inventoryDto.AppUserId
            };
            
            _context.Inventories.Add(inventory);
            await _context.SaveChangesAsync();

            await _eventLogService.LogInventoryEventAsync(inventory.Id, "Inventory Created", 
                "InventoryController", "Completed", 
                new { 
                    materialCount = inventory.Materials?.Count ?? 0,
                    createdBy = userId
                }, userId);

            return CreatedAtAction(nameof(GetInventory), new { id = inventory.Id }, inventory);
        }

        // PUT: api/Inventory/5
        [HttpPut("{id}")]
        [LogEvent("Inventory", "Update Inventory", logRequest: true)]
        public async Task<IActionResult> PutInventory(int id, UpdateInventoryDto inventoryDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var inventory = await _context.Inventories.FindAsync(id);
            if (inventory == null)
            {
                return NotFound();
            }

            inventory.Name = inventoryDto.Name;
            inventory.Quantity = inventoryDto.Quantity;
            inventory.AppUserId = inventoryDto.AppUserId;

            try
            {
                await _context.SaveChangesAsync();
                
                await _eventLogService.LogInventoryEventAsync(id, "Inventory Updated", 
                    "InventoryController", "Completed", 
                    new { 
                        materialCount = inventory.Materials?.Count ?? 0,
                        updatedBy = userId
                    }, userId);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InventoryExists(id))
                {
                    await _eventLogService.LogInventoryEventAsync(id, "Inventory Update Failed", 
                        "InventoryController", "Failed", 
                        new { reason = "Inventory not found during update" });
                    return NotFound();
                }
                else
                {
                    await _eventLogService.LogInventoryEventAsync(id, "Inventory Update Failed", 
                        "InventoryController", "Failed", 
                        new { reason = "Concurrency conflict" });
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Inventory/5
        [HttpDelete("{id}")]
        [LogEvent("Inventory", "Delete Inventory")]
        public async Task<IActionResult> DeleteInventory(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var inventory = await _context.Inventories.FindAsync(id);
            
            if (inventory == null)
            {
                await _eventLogService.LogInventoryEventAsync(id, "Inventory Deletion Failed", 
                    "InventoryController", "Failed", 
                    new { reason = "Inventory not found" });
                return NotFound();
            }

            _context.Inventories.Remove(inventory);
            await _context.SaveChangesAsync();

            await _eventLogService.LogInventoryEventAsync(id, "Inventory Deleted", 
                "InventoryController", "Completed", 
                new { 
                    deletedInventoryData = new { 
                        materialCount = inventory.Materials?.Count ?? 0
                    }
                }, userId);

            return NoContent();
        }

        private bool InventoryExists(int id)
        {
            return _context.Inventories.Any(e => e.Id == id);
        }
    }
}
