using ERPNumber1.Attributes;
using ERPNumber1.Data;
using ERPNumber1.Dtos.Material;
using ERPNumber1.Dtos.Product;
using ERPNumber1.Extensions;
using ERPNumber1.Interfaces;
using ERPNumber1.Mapper;
using ERPNumber1.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ERPNumber1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaterialsController : ControllerBase
    {
        public Role[] AllowedRoles => [Role.Admin];
        private readonly IEventLogService _eventLogService;
        private readonly IMaterialRepository _materialRepo;

        public MaterialsController(IEventLogService eventLogService, IMaterialRepository materialRepo)
        {
            
            _eventLogService = eventLogService;
            _materialRepo = materialRepo;   
        }

        // GET: api/Materials
        [HttpGet]
        [LogEvent("Material", "Get All Materials")]
        public async Task<ActionResult<IEnumerable<Material>>> GetMaterials()
        {
            return await _materialRepo.GetAllAsync();
        }

        // GET: api/Materials/5
        [HttpGet("{id}")]
        [LogEvent("Material", "Get Material by ID")]
        public async Task<ActionResult<Material>> GetMaterial(int id)
        {
            var material = await _materialRepo.GetByIdAsync(id);

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
        public async Task<IActionResult> PutMaterial(int id, UpdateMaterialDto materialDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var material = await _materialRepo.UpdateAsync(id, materialDto.ToMaterialFromUpdate());
            if (material == null)
            {
                await _eventLogService.LogEventAsync($"Material_{id}", "Material Update Failed", 
                    "MaterialsController", "Material", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Material not found" }), 
                    id.ToString());
                return NotFound();
            }

            

            try
            {
               
                
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
                if (! await _materialRepo.MaterialExistsAsync(id))
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
        public async Task<ActionResult<Material>> PostMaterial(CreateMaterialDto materialDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var material = materialDto.ToMaterialFromCreate();
            await _materialRepo.CreateAsync(material);

            await _eventLogService.LogEventAsync($"Material_{material.Id}", "Material Created", 
                "MaterialsController", "Material", "Completed", 
                System.Text.Json.JsonSerializer.Serialize(new { 
                    name = material.name,
                    cost = material.cost,
                    quantity = material.quantity,
                    productId = material.productId
                }), material.Id.ToString(), userId: userId);

            return CreatedAtAction("GetMaterial", new { id = material.Id }, material.ToMaterialDto());
        }

        // DELETE: api/Materials/5
        [HttpDelete("{id}")]
        [LogEvent("Material", "Delete Material")]
        public async Task<IActionResult> DeleteMaterial(int id)
        {
            var material = await _materialRepo.DeleteAsync(id);
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            
            if (material == null)
            {
                await _eventLogService.LogEventAsync($"Material_{id}", "Material Deletion Failed", 
                    "MaterialsController", "Material", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Material not found" }), 
                    id.ToString());
                return NotFound();
            }

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

    }
}
