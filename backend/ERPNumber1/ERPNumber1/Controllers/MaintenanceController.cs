using ERPNumber1.Attributes;
using ERPNumber1.Dtos.MaintenanceOrder;
using ERPNumber1.Interfaces;
using ERPNumber1.Mapper;
using ERPNumber1.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ERPNumber1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaintenanceController : ControllerBase
    {
        private readonly IMaintenanceOrderRepository _maintenanceRepo;
        private readonly IEventLogService _eventLogService;

        public MaintenanceController(
            IMaintenanceOrderRepository maintenanceRepo,
            IEventLogService eventLogService)
        {
            _maintenanceRepo = maintenanceRepo;
            _eventLogService = eventLogService;
        }

        // GET: api/Maintenance
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MaintenanceOrderDto>>> GetMaintenanceOrders()
        {
            var maintenanceOrders = await _maintenanceRepo.GetAllAsync();
            var maintenanceOrderDtos = maintenanceOrders.Select(mo => mo.ToMaintenanceOrderDto());
            return Ok(maintenanceOrderDtos);
        }

        // GET: api/Maintenance/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MaintenanceOrderDto>> GetMaintenanceOrder(int id)
        {
            var maintenanceOrder = await _maintenanceRepo.GetByIdAsync(id);
            if (maintenanceOrder == null)
            {
                return NotFound();
            }
            return Ok(maintenanceOrder.ToMaintenanceOrderDto());
        }

        // GET: api/Maintenance/round/5
        [HttpGet("round/{roundNumber}")]
        public async Task<ActionResult<IEnumerable<MaintenanceOrderDto>>> GetMaintenanceOrdersByRound(int roundNumber)
        {
            var maintenanceOrders = await _maintenanceRepo.GetByRoundNumberAsync(roundNumber);
            var maintenanceOrderDtos = maintenanceOrders.Select(mo => mo.ToMaintenanceOrderDto());
            return Ok(maintenanceOrderDtos);
        }

        // GET: api/Maintenance/productionline/1
        [HttpGet("productionline/{productionLine}")]
        public async Task<ActionResult<IEnumerable<MaintenanceOrderDto>>> GetMaintenanceOrdersByProductionLine(int productionLine)
        {
            if (productionLine != 1 && productionLine != 2)
            {
                return BadRequest("Production line must be 1 or 2");
            }

            var maintenanceOrders = await _maintenanceRepo.GetByProductionLineAsync(productionLine);
            var maintenanceOrderDtos = maintenanceOrders.Select(mo => mo.ToMaintenanceOrderDto());
            return Ok(maintenanceOrderDtos);
        }

        // GET: api/Maintenance/status/Scheduled
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<MaintenanceOrderDto>>> GetMaintenanceOrdersByStatus(string status)
        {
            var maintenanceOrders = await _maintenanceRepo.GetByStatusAsync(status);
            var maintenanceOrderDtos = maintenanceOrders.Select(mo => mo.ToMaintenanceOrderDto());
            return Ok(maintenanceOrderDtos);
        }

        // GET: api/Maintenance/check/round/5/line/1
        [HttpGet("check/round/{roundNumber}/line/{productionLine}")]
        public async Task<ActionResult<bool>> CheckMaintenanceScheduled(int roundNumber, int productionLine)
        {
            if (productionLine != 1 && productionLine != 2)
            {
                return BadRequest("Production line must be 1 or 2");
            }

            var hasMaintenanceScheduled = await _maintenanceRepo.HasMaintenanceScheduledAsync(roundNumber, productionLine);
            return Ok(hasMaintenanceScheduled);
        }

        // POST: api/Maintenance
        [HttpPost]
        [LogEvent("Maintenance", "Create Maintenance Order", logRequest: true)]
        public async Task<ActionResult<MaintenanceOrderDto>> PostMaintenanceOrder(CreateMaintenanceOrderDto maintenanceOrderDto)
        {
            if (maintenanceOrderDto.ProductionLine != 1 && maintenanceOrderDto.ProductionLine != 2)
            {
                return BadRequest("Production line must be 1 or 2");
            }

            if (maintenanceOrderDto.RoundNumber < 1 || maintenanceOrderDto.RoundNumber > 36)
            {
                return BadRequest("Round number must be between 1 and 36");
            }

            // Check if maintenance is already scheduled for this round and production line
            var hasExistingMaintenance = await _maintenanceRepo.HasMaintenanceScheduledAsync(
                maintenanceOrderDto.RoundNumber, 
                maintenanceOrderDto.ProductionLine);

            if (hasExistingMaintenance)
            {
                return BadRequest($"Maintenance is already scheduled for production line {maintenanceOrderDto.ProductionLine} in round {maintenanceOrderDto.RoundNumber}");
            }

            var maintenanceOrder = maintenanceOrderDto.ToMaintenanceOrderFromCreate();
            var createdMaintenanceOrder = await _maintenanceRepo.CreateAsync(maintenanceOrder);

            return CreatedAtAction(
                nameof(GetMaintenanceOrder),
                new { id = createdMaintenanceOrder.Id },
                createdMaintenanceOrder.ToMaintenanceOrderDto());
        }

        // PUT: api/Maintenance/5
        [HttpPut("{id}")]
        [LogEvent("Maintenance", "Update Maintenance Order", logRequest: true)]
        public async Task<IActionResult> PutMaintenanceOrder(int id, UpdateMaintenanceOrderDto maintenanceOrderDto)
        {
            if (maintenanceOrderDto.ProductionLine != 1 && maintenanceOrderDto.ProductionLine != 2)
            {
                return BadRequest("Production line must be 1 or 2");
            }

            if (maintenanceOrderDto.RoundNumber < 1 || maintenanceOrderDto.RoundNumber > 36)
            {
                return BadRequest("Round number must be between 1 and 36");
            }

            var maintenanceOrder = maintenanceOrderDto.ToMaintenanceOrderFromUpdate();
            var updatedMaintenanceOrder = await _maintenanceRepo.UpdateAsync(id, maintenanceOrder);

            if (updatedMaintenanceOrder == null)
            {
                return NotFound();
            }

            return Ok(updatedMaintenanceOrder.ToMaintenanceOrderDto());
        }

        // DELETE: api/Maintenance/5
        [HttpDelete("{id}")]
        [LogEvent("Maintenance", "Delete Maintenance Order", logRequest: true)]
        public async Task<IActionResult> DeleteMaintenanceOrder(int id)
        {
            var maintenanceOrder = await _maintenanceRepo.DeleteAsync(id);
            if (maintenanceOrder == null)
            {
                return NotFound();
            }

            return Ok(maintenanceOrder.ToMaintenanceOrderDto());
        }
    }
}
