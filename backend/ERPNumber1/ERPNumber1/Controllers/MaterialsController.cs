using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERPNumber1.Data;
using ERPNumber1.Models;
using ERPNumber1.Interfaces;
using ERPNumber1.Extensions;
using ERPNumber1.Attributes;
using System.Security.Claims;

namespace ERPNumber1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaterialsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEventLogService _eventLogService;

        public MaterialsController(AppDbContext context, IEventLogService eventLogService)
        {
            _context = context;
            _eventLogService = eventLogService;
        }

        // GET: api/Materials
        [HttpGet]
        [LogEvent("Material", "Get All Materials")]
        public async Task<ActionResult<IEnumerable<Material>>> GetMaterials()
        {
            return await _context.Materials.ToListAsync();
        }

        // GET: api/Materials/5
        [HttpGet("{id}")]
        [LogEvent("Material", "Get Material by ID")]
        public async Task<ActionResult<Material>> GetMaterial(int id)
        {
            var material = await _context.Materials.FindAsync(id);

            if (material == null)
            {
                await _eventLogService.LogEventAsync($"Material_{id}", "Material Retrieval Failed", 
                    "MaterialsController", "Material", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Material not found" }), 
                    id.ToString());
                return NotFound();
            }

            return material;
        }

        // PUT: api/Materials/5
        [HttpPut("{id}")]
        [LogEvent("Material", "Update Material", logRequest: true)]
        public async Task<IActionResult> PutMaterial(int id, Material material)
        {
            if (id != material.Id)
            {
                await _eventLogService.LogEventAsync($"Material_{id}", "Material Update Failed", 
                    "MaterialsController", "Material", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "ID mismatch" }), 
                    id.ToString());
                return BadRequest();
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _context.Entry(material).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                
                await _eventLogService.LogEventAsync($"Material_{id}", "Material Updated", 
                    "MaterialsController", "Material", "Completed", 
                    System.Text.Json.JsonSerializer.Serialize(new { 
                        name = material.name,
                        cost = material.cost,
                        quantity = material.quantity,
                        updatedBy = userId
                    }), id.ToString(), userId: userId);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MaterialExists(id))
                {
                    await _eventLogService.LogEventAsync($"Material_{id}", "Material Update Failed", 
                        "MaterialsController", "Material", "Failed", 
                        System.Text.Json.JsonSerializer.Serialize(new { reason = "Material not found during update" }), 
                        id.ToString());
                    return NotFound();
                }
                else
                {
                    await _eventLogService.LogEventAsync($"Material_{id}", "Material Update Failed", 
                        "MaterialsController", "Material", "Failed", 
                        System.Text.Json.JsonSerializer.Serialize(new { reason = "Concurrency conflict" }), 
                        id.ToString());
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Materials
        [HttpPost]
        [LogEvent("Material", "Create Material", logRequest: true)]
        public async Task<ActionResult<Material>> PostMaterial(Material material)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            _context.Materials.Add(material);
            await _context.SaveChangesAsync();

            await _eventLogService.LogEventAsync($"Material_{material.Id}", "Material Created", 
                "MaterialsController", "Material", "Completed", 
                System.Text.Json.JsonSerializer.Serialize(new { 
                    name = material.name,
                    cost = material.cost,
                    quantity = material.quantity,
                    productId = material.productId
                }), material.Id.ToString(), userId: userId);

            return CreatedAtAction("GetMaterial", new { id = material.Id }, material);
        }

        // DELETE: api/Materials/5
        [HttpDelete("{id}")]
        [LogEvent("Material", "Delete Material")]
        public async Task<IActionResult> DeleteMaterial(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var material = await _context.Materials.FindAsync(id);
            
            if (material == null)
            {
                await _eventLogService.LogEventAsync($"Material_{id}", "Material Deletion Failed", 
                    "MaterialsController", "Material", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Material not found" }), 
                    id.ToString());
                return NotFound();
            }

            _context.Materials.Remove(material);
            await _context.SaveChangesAsync();

            await _eventLogService.LogEventAsync($"Material_{id}", "Material Deleted", 
                "MaterialsController", "Material", "Completed", 
                System.Text.Json.JsonSerializer.Serialize(new { 
                    deletedMaterialData = new { 
                        name = material.name,
                        cost = material.cost
                    }
                }), id.ToString(), userId: userId);

            return NoContent();
        }

        private bool MaterialExists(int id)
        {
            return _context.Materials.Any(e => e.Id == id);
        }
    }
}
