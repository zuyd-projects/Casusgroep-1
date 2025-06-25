using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ERPNumber1.Interfaces;
using ERPNumber1.Extensions;
using ERPNumber1.Attributes;
using ERPNumber1.Mapper;
using ERPNumber1.Dtos.Simulation;

namespace ERPNumber1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SimulationsController : ControllerBase
    {
        private readonly ISimulationRepository _simulationRepo;
        private readonly IEventLogService _eventLogService;
        private readonly ISimulationService _simulationService;

        public SimulationsController(
            IEventLogService eventLogService,
            ISimulationRepository simulationRepo,
            ISimulationService simulationService)
        {
            _eventLogService = eventLogService;
            _simulationRepo = simulationRepo;
            _simulationService = simulationService;
        }

        [HttpGet]
        [LogEvent("Simulation", "Get All Simulations")]
        public async Task<ActionResult<IEnumerable<SimulationDto>>> GetSimulations()
        {
            var simulations = await _simulationRepo.GetAllAsync();
            var simulationDtos = simulations.Select(s => s.ToSimulationDto());
            return Ok(simulationDtos);
        }

        [HttpGet("{id}")]
        [LogEvent("Simulation", "Get Simulation by ID")]
        public async Task<ActionResult<SimulationDto>> GetSimulation(int id)
        {
            var simulation = await _simulationRepo.GetByIdAsync(id);

            if (simulation == null)
            {
                await _eventLogService.LogSimulationEventAsync(id, "Simulation Retrieval Failed",
                    "SimulationsController", "Failed",
                    new { reason = "Simulation not found" });

                return NotFound();
            }

            return Ok(simulation.ToSimulationDto());
        }

        [HttpPut("{id}")]
        [LogEvent("Simulation", "Update Simulation")]
        public async Task<IActionResult> PutSimulation(int id, UpdateSimulationDto simulationDto)
        {
            var updatedSimulation = await _simulationRepo.UpdateAysnc(id, simulationDto.ToSimulationFromUpdate());

            if (updatedSimulation == null)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPost]
        [LogEvent("Simulation", "Create Simulation")]
        public async Task<ActionResult<SimulationDto>> PostSimulation(CreateSimulationDto simulationDto)
        {
            var simulationModel = simulationDto.ToSimulationFromCreate();
            await _simulationRepo.CreateAsync(simulationModel);

            return CreatedAtAction(nameof(GetSimulation), new { id = simulationModel.Id }, simulationModel.ToSimulationDto());
        }

        [HttpDelete("{id}")]
        [LogEvent("Simulation", "Delete Simulation")]
        public async Task<IActionResult> DeleteSimulation(int id)
        {
            var deletedSimulation = await _simulationRepo.DeleteAsync(id);

            if (deletedSimulation == null)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPost("{id}/run")]
        [LogEvent("Simulation", "Run Simulation")]
        public async Task<IActionResult> RunSimulation(int id)
        {
            var simulation = await _simulationRepo.GetByIdAsync(id);
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

        [HttpPost("{id}/stop")]
        [LogEvent("Simulation", "Stop Simulation")]
        public async Task<IActionResult> StopSimulation(int id)
        {
            var simulation = await _simulationRepo.GetByIdAsync(id);
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

        [HttpGet("config")]
        [LogEvent("Simulation", "Get Simulation Configuration")]
        public IActionResult GetSimulationConfig()
        {
            return Ok(new
            {
                roundDurationSeconds = _simulationService.GetRoundDurationSeconds(),
                maxRounds = _simulationService.GetMaxRounds()
            });
        }

        [HttpGet("{id}/status")]
        [LogEvent("Simulation", "Get Simulation Status")]
        public async Task<IActionResult> GetSimulationStatus(int id)
        {
            var simulation = await _simulationRepo.GetByIdAsync(id);
            if (simulation == null)
            {
                return NotFound();
            }

            var isRunning = await _simulationService.IsSimulationRunningAsync(id);
            var currentRound = await _simulationService.GetCurrentRoundAsync(id);
            var remainingTime = isRunning ? _simulationService.GetRemainingTimeForCurrentRound(id) : 0;

            Console.WriteLine($"Status request for simulation {id}: isRunning={isRunning}, currentRound={currentRound?.RoundNumber ?? 0}, remainingTime={remainingTime}");

            return Ok(new
            {
                simulationId = id,
                isRunning,
                currentRound = currentRound != null
                    ? new { currentRound.Id, currentRound.RoundNumber }
                    : null,
                roundDuration = _simulationService.GetRoundDurationSeconds(),
                maxRounds = _simulationService.GetMaxRounds(),
                timeLeft = remainingTime,
                timestamp = DateTime.UtcNow.ToString("O")
            });
        }
    }
}