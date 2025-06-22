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
        private readonly ISimulationService _simulationService;

        public SimulationsController(AppDbContext context, IEventLogService eventLogService, ISimulationService simulationService)
        {
            _context = context;
            _eventLogService = eventLogService;
            _simulationService = simulationService;
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
        [Authorize(Roles ="User")]
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
        [Authorize(Roles ="User")]
        [HttpPut("{id}")]
        [LogEvent("Simulation", "Update Simulation")]
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
        [Authorize(Roles ="User")]
        [HttpPost]
        [LogEvent("Simulation", "Create Simulation")]
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
        [Authorize(Roles ="User")]
        [HttpDelete("{id}")]
        [LogEvent("Simulation", "Delete Simulation")]
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

        // POST: api/Simulations/5/run
        [Authorize(Roles ="User")]
        // POST: api/Simulations/5/run
        [Authorize(Roles ="User")]
        [HttpPost("{id}/run")]
        [LogEvent("Simulation", "Run Simulation")]
        public async Task<IActionResult> RunSimulation(int id)
        {
            var simulation = await _context.Simulations.FindAsync(id);
            if (simulation == null)
            {
                return NotFound();
            }

            var success = await _simulationService.StartSimulationAsync(id);
            if (!success)
            {
                return BadRequest("Failed to start simulation");
            }

            return Ok(new { message = "Simulation started successfully", simulationId = id });
        }

        // POST: api/Simulations/5/stop
        [Authorize(Roles ="User")]
        [HttpPost("{id}/stop")]
        [LogEvent("Simulation", "Stop Simulation")]
        public async Task<IActionResult> StopSimulation(int id)
        {
            var simulation = await _context.Simulations.FindAsync(id);
            if (simulation == null)
            {
                return NotFound();
            }

            var success = await _simulationService.StopSimulationAsync(id);
            if (!success)
            {
                return BadRequest("Simulation is not running");
            }

            return Ok(new { message = "Simulation stopped successfully", simulationId = id });
        }

        // GET: api/Simulations/5/status
        [Authorize(Roles ="User")]
        [HttpGet("{id}/status")]
        [LogEvent("Simulation", "Get Simulation Status")]
        public async Task<IActionResult> GetSimulationStatus(int id)
        {
            var simulation = await _context.Simulations.FindAsync(id);
            if (simulation == null)
            {
                return NotFound();
            }

            var isRunning = await _simulationService.IsSimulationRunningAsync(id);
            var currentRound = await _simulationService.GetCurrentRoundAsync(id);

            return Ok(new { 
                simulationId = id,
                isRunning,
                currentRound = currentRound != null ? new { currentRound.Id, currentRound.RoundNumber } : null,
                roundDuration = _simulationService.GetRoundDurationSeconds()
            });
        }

        private bool SimulationExists(int id)
        {
            return _context.Simulations.Any(e => e.Id == id);
        }
    }
}
