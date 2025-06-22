using ERPNumber1.Attributes;
using ERPNumber1.Data;
using ERPNumber1.Dtos.Order;
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
    public class ProductsController : ControllerBase
    {
        //private readonly AppDbContext _context;
        private readonly IEventLogService _eventLogService;
        private readonly IProductRepository _productRepo;

        public ProductsController(IEventLogService eventLogService, IProductRepository productRepo)
        {
            //_context = context;
            _eventLogService = eventLogService;
            _productRepo  = productRepo;
        }

        // GET: api/Products
        [HttpGet]
        [LogEvent("Product", "Get All Products")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _productRepo.GetAllAsync();
        }

        // GET: api/Products/5
        [HttpGet("{id}")]
        [LogEvent("Product", "Get Product by ID")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _productRepo.GetByIdAsync(id);

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
            
            var product = await _productRepo.UpdateAsync(id, productDto.ToProductFromUpdate());
            if (product == null)
            {
                await _eventLogService.LogEventAsync($"Product_{id}", "Product Update Failed", 
                    "ProductsController", "Product", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Product not found" }), 
                    id.ToString());
                return NotFound();
            }

            try
            {
                //await _context.SaveChangesAsync();
                
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
                if (! await _productRepo.ProductExistsAsync(id))
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

            var product = productDto.ToProductFromCreate();
            await _productRepo.CreateAsync(product);


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
            var product = await _productRepo.DeleteAsync(id);
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            
            if (product == null)
            {
                await _eventLogService.LogEventAsync($"Product_{id}", "Product Deletion Failed", 
                    "ProductsController", "Product", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Product not found" }), 
                    id.ToString());
                return NotFound();
            }

            

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

        
    }
}
