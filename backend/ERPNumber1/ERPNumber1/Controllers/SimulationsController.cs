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

        public SimulationsController(IEventLogService eventLogService, ISimulationRepository simulationRepo)
        {
            _eventLogService = eventLogService;
            _simulationRepo = simulationRepo;
        }

        [Authorize(Roles = "User")]
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
        public async Task<IActionResult> PutSimulation(int id, UpdateSimulationDto simulationDto)
        {
            var updatedSimulation = await _simulationRepo.UpdateAysnc(id, simulationDto.ToCommentFromUpdate());

            if (updatedSimulation == null)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<SimulationDto>> PostSimulation(CreateSimulationDto simulationDto)
        {
            var simulationModel = simulationDto.ToSimulationFromCreate();
            await _simulationRepo.CreateAsync(simulationModel);

            return CreatedAtAction(nameof(GetSimulation), new { id = simulationModel.Id }, simulationModel.ToSimulationDto());
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSimulation(int id)
        {
            var deletedSimulation = await _simulationRepo.DeleteAsync(id);

            if (deletedSimulation == null)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
