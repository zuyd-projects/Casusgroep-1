using ERPNumber1.Data;
using ERPNumber1.Dtos.User;
using ERPNumber1.Interfaces;
using ERPNumber1.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERPNumber1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupplierOrderController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SupplierOrderController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/SupplierOrder
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SupplierOrder>>> GetSupplierOrders()
        {
            return await _context.SupplierOrders.ToListAsync();
        }

        // GET: api/SupplierOrde/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SupplierOrder>> GetSupplierOrder(int id)
        {
            var supplierOrder = await _context.SupplierOrders.FindAsync(id);

            if (supplierOrder == null)
            {
                return NotFound();
            }

            return supplierOrder;
        }

        // PUT: api/SupplierOrder/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSupplierOrder(int id, SupplierOrder supplierOrder)
        {
            if (id != supplierOrder.Id)
            {
                return BadRequest();
            }

            _context.Entry(supplierOrder).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SupplierOrderExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/SupplierOrder
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Statistics>> PostSupplierOrder(SupplierOrder supplierOrder)
        {
            _context.SupplierOrders.Add(supplierOrder);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSupplierOrder", new { id = supplierOrder.Id }, supplierOrder);
        }

        // DELETE: api/supplierOrder/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletesupplierOrder(int id)
        {
            var supplierOrder = await _context.SupplierOrders.FindAsync(id);
            if (supplierOrder == null)
            {
                return NotFound();
            }

            _context.SupplierOrders.Remove(supplierOrder);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SupplierOrderExists(int id)
        {
            return _context.SupplierOrders.Any(e => e.Id == id);
        }
    }
}
