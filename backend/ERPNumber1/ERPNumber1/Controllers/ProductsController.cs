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
using ERPNumber1.Dtos.Product;
using System.Security.Claims;

namespace ERPNumber1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEventLogService _eventLogService;

        public ProductsController(AppDbContext context, IEventLogService eventLogService)
        {
            _context = context;
            _eventLogService = eventLogService;
        }

        // GET: api/Products
        [HttpGet]
        [LogEvent("Product", "Get All Products")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
        }

        // GET: api/Products/5
        [HttpGet("{id}")]
        [LogEvent("Product", "Get Product by ID")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                await _eventLogService.LogEventAsync($"Product_{id}", "Product Retrieval Failed", 
                    "ProductsController", "Product", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Product not found" }), 
                    id.ToString());
                return NotFound();
            }

            return product;
        }

        // PUT: api/Products/5
        [HttpPut("{id}")]
        [LogEvent("Product", "Update Product", logRequest: true)]
        public async Task<IActionResult> PutProduct(int id, UpdateProductDto productDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                await _eventLogService.LogEventAsync($"Product_{id}", "Product Update Failed", 
                    "ProductsController", "Product", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Product not found" }), 
                    id.ToString());
                return NotFound();
            }

            product.orderId = productDto.OrderId;
            product.type = productDto.Type;

            try
            {
                await _context.SaveChangesAsync();
                
                await _eventLogService.LogEventAsync($"Product_{id}", "Product Updated", 
                    "ProductsController", "Product", "Completed", 
                    System.Text.Json.JsonSerializer.Serialize(new { 
                        orderId = product.orderId,
                        type = product.type,
                        materialCount = product.materials?.Count ?? 0,
                        updatedBy = userId
                    }), id.ToString(), userId: userId);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    await _eventLogService.LogEventAsync($"Product_{id}", "Product Update Failed", 
                        "ProductsController", "Product", "Failed", 
                        System.Text.Json.JsonSerializer.Serialize(new { reason = "Product not found during update" }), 
                        id.ToString());
                    return NotFound();
                }
                else
                {
                    await _eventLogService.LogEventAsync($"Product_{id}", "Product Update Failed", 
                        "ProductsController", "Product", "Failed", 
                        System.Text.Json.JsonSerializer.Serialize(new { reason = "Concurrency conflict" }), 
                        id.ToString());
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Products
        [HttpPost]
        [LogEvent("Product", "Create Product", logRequest: true)]
        public async Task<ActionResult<Product>> PostProduct(CreateProductDto productDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var product = new Product
            {
                orderId = productDto.OrderId,
                type = productDto.Type
            };
            
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            await _eventLogService.LogEventAsync($"Product_{product.Id}", "Product Created", 
                "ProductsController", "Product", "Completed", 
                System.Text.Json.JsonSerializer.Serialize(new { 
                    orderId = product.orderId,
                    type = product.type,
                    materialCount = product.materials?.Count ?? 0
                }), product.Id.ToString(), userId: userId);

            return CreatedAtAction("GetProduct", new { id = product.Id }, product);
        }

        // DELETE: api/Products/5
        [HttpDelete("{id}")]
        [LogEvent("Product", "Delete Product")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var product = await _context.Products.FindAsync(id);
            
            if (product == null)
            {
                await _eventLogService.LogEventAsync($"Product_{id}", "Product Deletion Failed", 
                    "ProductsController", "Product", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Product not found" }), 
                    id.ToString());
                return NotFound();
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            await _eventLogService.LogEventAsync($"Product_{id}", "Product Deleted", 
                "ProductsController", "Product", "Completed", 
                System.Text.Json.JsonSerializer.Serialize(new { 
                    deletedProductData = new { 
                        orderId = product.orderId,
                        type = product.type 
                    }
                }), id.ToString(), userId: userId);

            return NoContent();
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
        }
    }
}
