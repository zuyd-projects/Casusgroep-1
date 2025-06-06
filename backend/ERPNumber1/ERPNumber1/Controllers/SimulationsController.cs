using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERPNumber1.Data;
using ERPNumber1.Models;

namespace ERPNumber1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SimulationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SimulationsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Simulations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Simulation>>> GetSimulations()
        {
            return await _context.Simulations.ToListAsync();
        }

        // GET: api/Simulations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Simulation>> GetSimulation(int id)
        {
            var simulation = await _context.Simulations.FindAsync(id);

            if (simulation == null)
            {
                return NotFound();
            }

            return simulation;
        }

        // PUT: api/Simulations/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSimulation(int id, Simulation simulation)
        {
            if (id != simulation.Id)
            {
                return BadRequest();
            }

            _context.Entry(simulation).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SimulationExists(id))
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

        // POST: api/Simulations
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Simulation>> PostSimulation(Simulation simulation)
        {
            _context.Simulations.Add(simulation);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSimulation", new { id = simulation.Id }, simulation);
        }

        // DELETE: api/Simulations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSimulation(int id)
        {
            var simulation = await _context.Simulations.FindAsync(id);
            if (simulation == null)
            {
                return NotFound();
            }

            _context.Simulations.Remove(simulation);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SimulationExists(int id)
        {
            return _context.Simulations.Any(e => e.Id == id);
        }
    }
}
