using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERPNumber1.Data;
using ERPNumber1.Models;
using Microsoft.AspNetCore.Authorization;
using ERPNumber1.Interfaces;
using ERPNumber1.Extensions;
using ERPNumber1.Attributes;
using ERPNumber1.Dtos.Simulation;
using System.Security.Claims;

namespace ERPNumber1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SimulationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEventLogService _eventLogService;

        public SimulationsController(AppDbContext context, IEventLogService eventLogService)
        {
            _context = context;
            _eventLogService = eventLogService;
        }

        // GET: api/Simulations
        [Authorize(Roles ="User")]
        [HttpGet]
        [LogEvent("Simulation", "Get All Simulations")]
        public async Task<ActionResult<IEnumerable<Simulation>>> GetSimulations()
        {
            return await _context.Simulations.ToListAsync();
        }

        // GET: api/Simulations/5
        [HttpGet("{id}")]
        [LogEvent("Simulation", "Get Simulation by ID")]
        public async Task<ActionResult<Simulation>> GetSimulation(int id)
        {
            var simulation = await _context.Simulations.FindAsync(id);

            if (simulation == null)
            {
                await _eventLogService.LogSimulationEventAsync(id, "Simulation Retrieval Failed", 
                    "SimulationsController", "Failed", 
                    new { reason = "Simulation not found" });
                return NotFound();
            }

            return simulation;
        }

        // PUT: api/Simulations/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSimulation(int id, UpdateSimulationDto simulationDto)
        {
            var simulation = await _context.Simulations.FindAsync(id);
            if (simulation == null)
            {
                return NotFound();
            }

            simulation.Name = simulationDto.Name;
            simulation.Date = simulationDto.Date;

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
        public async Task<ActionResult<Simulation>> PostSimulation(CreateSimulationDto simulationDto)
        {
            var simulation = new Simulation
            {
                Name = simulationDto.Name,
                Date = simulationDto.Date
            };
            
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
