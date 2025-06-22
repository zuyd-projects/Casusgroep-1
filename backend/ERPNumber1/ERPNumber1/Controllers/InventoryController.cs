using ERPNumber1.Attributes;
using ERPNumber1.Data;
using ERPNumber1.Dtos.Inventory;
using ERPNumber1.Dtos.Product;
using ERPNumber1.Dtos.Round;
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
    public class InventoryController : ControllerBase
    {
        
        private readonly IEventLogService _eventLogService;
        private readonly IInventoryRepository _inventoryRepo;

        public InventoryController(IEventLogService eventLogService, IInventoryRepository inventoryRepo)
        {           
            _eventLogService = eventLogService;
            _inventoryRepo = inventoryRepo;
        }

        // GET: api/Inventory
        [HttpGet]
        [LogEvent("Inventory", "Get All Inventories")]
        public async Task<ActionResult<IEnumerable<Inventory>>> GetInventories()
        {
            var inventories = await _inventoryRepo.GetAllAsync();
            var inventoriesDtos = inventories.Select(s => s.ToInventoryDto());
            return Ok(inventoriesDtos);
        }

        // GET: api/Inventory/5
        [HttpGet("{id}")]
        [LogEvent("Inventory", "Get Inventory by ID")]
        public async Task<ActionResult<Inventory>> GetInventory(int id)
        {
            var inventory = await _inventoryRepo.GetByIdAsync(id);

            if (inventory == null)
            {
                await _eventLogService.LogInventoryEventAsync(id, "Inventory Retrieval Failed", 
                    "InventoryController", "Failed", 
                    new { reason = "Inventory not found" });
                return NotFound();
            }

            return Ok(inventory.ToInventoryDto());
        }

        // POST: api/Inventory
        [HttpPost]
        [LogEvent("Inventory", "Create Inventory", logRequest: true)]
        public async Task<ActionResult<Inventory>> PostInventory(CreateInventoryDto inventoryDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var inventory = inventoryDto.ToInventoryFromCreate();
            await _inventoryRepo.CreateAsync(inventory);

            await _eventLogService.LogInventoryEventAsync(inventory.Id, "Inventory Created", 
                "InventoryController", "Completed", 
                new { 
                    materialCount = inventory.Materials?.Count ?? 0,
                    createdBy = userId
                }, userId);

            return CreatedAtAction(nameof(GetInventory), new { id = inventory.Id }, inventory.ToInventoryDto());
        }

        // PUT: api/Inventory/5
        [HttpPut("{id}")]
        [LogEvent("Inventory", "Update Inventory", logRequest: true)]
        public async Task<IActionResult> PutInventory(int id, UpdateInventoryDto inventoryDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var inventory = await _inventoryRepo.UpdateAsync(id, inventoryDto.ToInventoryFromUpdate());
            if (inventory == null)
            {
                return NotFound();
            }

            try
            {               
                await _eventLogService.LogInventoryEventAsync(id, "Inventory Updated", 
                    "InventoryController", "Completed", 
                    new { 
                        materialCount = inventory.Materials?.Count ?? 0,
                        updatedBy = userId
                    }, userId);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _inventoryRepo.InventoryExistsAsync(id))
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
            var inventory = await _inventoryRepo.DeleteAsync(id);
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            
            if (inventory == null)
            {
                await _eventLogService.LogInventoryEventAsync(id, "Inventory Deletion Failed", 
                    "InventoryController", "Failed", 
                    new { reason = "Inventory not found" });
                return NotFound();
            }

            

            await _eventLogService.LogInventoryEventAsync(id, "Inventory Deleted", 
                "InventoryController", "Completed", 
                new { 
                    deletedInventoryData = new { 
                        materialCount = inventory.Materials?.Count ?? 0
                    }
                }, userId);

            return NoContent();
        }


    }
}
