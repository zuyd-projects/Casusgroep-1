using ERPNumber1.Attributes;
using ERPNumber1.Dtos.MissingBlocks;
using ERPNumber1.Interfaces;
using ERPNumber1.Mapper;
using ERPNumber1.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ERPNumber1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MissingBlocksController : ControllerBase
    {
        private readonly IMissingBlocksRepository _missingBlocksRepo;
        private readonly IEventLogService _eventLogService;
        private readonly IOrderRepository _orderRepo;

        public MissingBlocksController(
            IMissingBlocksRepository missingBlocksRepo, 
            IEventLogService eventLogService,
            IOrderRepository orderRepo)
        {
            _missingBlocksRepo = missingBlocksRepo;
            _eventLogService = eventLogService;
            _orderRepo = orderRepo;
        }

        // GET: api/MissingBlocks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MissingBlocksDto>>> GetMissingBlocks()
        {
            var missingBlocks = await _missingBlocksRepo.GetAllAsync();
            var missingBlocksDtos = missingBlocks.Select(mb => mb.ToMissingBlocksDto());
            return Ok(missingBlocksDtos);
        }

        // GET: api/MissingBlocks/pending
        [HttpGet("pending")]
        [LogEvent("MissingBlocks", "Get Pending Missing Blocks")]
        public async Task<ActionResult<IEnumerable<MissingBlocksDto>>> GetPendingMissingBlocks()
        {
            var pendingMissingBlocks = await _missingBlocksRepo.GetPendingAsync();
            var missingBlocksDtos = pendingMissingBlocks.Select(mb => mb.ToMissingBlocksDto());
            return Ok(missingBlocksDtos);
        }

        // GET: api/MissingBlocks/5
        [HttpGet("{id}")]
        [LogEvent("MissingBlocks", "Get Missing Blocks by ID")]
        public async Task<ActionResult<MissingBlocksDto>> GetMissingBlocks(int id)
        {
            var missingBlocks = await _missingBlocksRepo.GetByIdAsync(id);

            if (missingBlocks == null)
            {
                await _eventLogService.LogEventAsync($"MissingBlocks_{id}", "Missing Blocks Retrieval Failed",
                    "MissingBlocksController", "MissingBlocks", "Failed",
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Missing blocks request not found" }),
                    id.ToString());
                return NotFound();
            }

            return Ok(missingBlocks.ToMissingBlocksDto());
        }

        // GET: api/MissingBlocks/order/5
        [HttpGet("order/{orderId}")]
        [LogEvent("MissingBlocks", "Get Missing Blocks by Order ID")]
        public async Task<ActionResult<IEnumerable<MissingBlocksDto>>> GetMissingBlocksByOrderId(int orderId)
        {
            var missingBlocks = await _missingBlocksRepo.GetByOrderIdAsync(orderId);
            var missingBlocksDtos = missingBlocks.Select(mb => mb.ToMissingBlocksDto());
            return Ok(missingBlocksDtos);
        }

        // GET: api/MissingBlocks/runner
        [HttpGet("runner")]
        [LogEvent("MissingBlocks", "Get Missing Blocks for Runner")]
        public async Task<ActionResult<IEnumerable<MissingBlocksDto>>> GetMissingBlocksForRunner()
        {
            var missingBlocks = await _missingBlocksRepo.GetForRunnerAsync();
            var missingBlocksDtos = missingBlocks.Select(mb => mb.ToMissingBlocksDto());
            return Ok(missingBlocksDtos);
        }

        // GET: api/MissingBlocks/supplier
        [HttpGet("supplier")]
        [LogEvent("MissingBlocks", "Get Missing Blocks for Supplier")]
        public async Task<ActionResult<IEnumerable<MissingBlocksDto>>> GetMissingBlocksForSupplier()
        {
            var missingBlocks = await _missingBlocksRepo.GetForSupplierAsync();
            var missingBlocksDtos = missingBlocks.Select(mb => mb.ToMissingBlocksDto());
            return Ok(missingBlocksDtos);
        }

        // POST: api/MissingBlocks
        [HttpPost]
        [LogEvent("MissingBlocks", "Create Missing Blocks Request", logRequest: true)]
        public async Task<ActionResult<MissingBlocksDto>> PostMissingBlocks(CreateMissingBlocksDto missingBlocksDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            try
            {
                // Verify that the order exists
                var order = await _orderRepo.GetByIdAsync(missingBlocksDto.OrderId);
                if (order == null)
                {
                    return BadRequest($"Order with ID {missingBlocksDto.OrderId} does not exist.");
                }

                // Update the order status to ProductionError
                order.Status = OrderStatus.ProductionError;
                await _orderRepo.UpdateAysnc(missingBlocksDto.OrderId, order);

                var missingBlocks = missingBlocksDto.ToMissingBlocksFromCreate();
                await _missingBlocksRepo.CreateAsync(missingBlocks);

                await _eventLogService.LogEventAsync($"MissingBlocks_{missingBlocks.Id}", "Missing Blocks Request Created",
                    "MissingBlocksController", "MissingBlocks", "Completed",
                    System.Text.Json.JsonSerializer.Serialize(new
                    {
                        orderId = missingBlocks.OrderId,
                        productionLine = missingBlocks.ProductionLine,
                        motorType = missingBlocks.MotorType,
                        blueBlocks = missingBlocks.BlueBlocks,
                        redBlocks = missingBlocks.RedBlocks,
                        grayBlocks = missingBlocks.GrayBlocks,
                        totalMissing = missingBlocks.BlueBlocks + missingBlocks.RedBlocks + missingBlocks.GrayBlocks,
                        createdBy = userId
                    }), missingBlocks.Id.ToString(), userId: userId);

                return CreatedAtAction(nameof(GetMissingBlocks), new { id = missingBlocks.Id }, missingBlocks.ToMissingBlocksDto());
            }
            catch (Exception ex)
            {
                await _eventLogService.LogEventAsync($"Order_{missingBlocksDto.OrderId}", "Missing Blocks Request Creation Failed",
                    "MissingBlocksController", "MissingBlocks", "Failed",
                    System.Text.Json.JsonSerializer.Serialize(new
                    {
                        orderId = missingBlocksDto.OrderId,
                        error = ex.Message,
                        createdBy = userId
                    }), missingBlocksDto.OrderId.ToString(), userId: userId);

                return BadRequest($"Error creating missing blocks request: {ex.Message}");
            }
        }

        // PUT: api/MissingBlocks/5
        [HttpPut("{id}")]
        [LogEvent("MissingBlocks", "Update Missing Blocks Request", logRequest: true)]
        public async Task<IActionResult> PutMissingBlocks(int id, UpdateMissingBlocksDto missingBlocksDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            try
            {
                var updatedMissingBlocks = missingBlocksDto.ToMissingBlocksFromUpdate();
                var missingBlocks = await _missingBlocksRepo.UpdateAsync(id, updatedMissingBlocks);

                if (missingBlocks == null)
                {
                    await _eventLogService.LogEventAsync($"MissingBlocks_{id}", "Missing Blocks Update Failed",
                        "MissingBlocksController", "MissingBlocks", "Failed",
                        System.Text.Json.JsonSerializer.Serialize(new { reason = "Missing blocks request not found" }),
                        id.ToString());
                    return NotFound();
                }

                // If resolving the missing blocks request, update the order status back to Pending
                if (missingBlocksDto.Status == "Resolved")
                {
                    var order = await _orderRepo.GetByIdAsync(missingBlocks.OrderId);
                    if (order != null)
                    {
                        order.Status = OrderStatus.Pending;
                        order.WasReturnedFromMissingBlocks = true;  // Mark for prioritization
                        await _orderRepo.UpdateAysnc(missingBlocks.OrderId, order);
                    }
                }

                await _eventLogService.LogEventAsync($"MissingBlocks_{id}", "Missing Blocks Request Updated",
                    "MissingBlocksController", "MissingBlocks", "Completed",
                    System.Text.Json.JsonSerializer.Serialize(new
                    {
                        orderId = missingBlocks.OrderId,
                        status = missingBlocks.Status,
                        resolvedBy = missingBlocks.ResolvedBy,
                        resolvedAt = missingBlocks.ResolvedAt,
                        updatedBy = userId
                    }), id.ToString(), userId: userId);

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _missingBlocksRepo.MissingBlocksExistsAsync(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
        }

        // DELETE: api/MissingBlocks/5
        [HttpDelete("{id}")]
        [LogEvent("MissingBlocks", "Delete Missing Blocks Request")]
        public async Task<IActionResult> DeleteMissingBlocks(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var missingBlocks = await _missingBlocksRepo.DeleteAsync(id);

            if (missingBlocks == null)
            {
                await _eventLogService.LogEventAsync($"MissingBlocks_{id}", "Missing Blocks Deletion Failed",
                    "MissingBlocksController", "MissingBlocks", "Failed",
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Missing blocks request not found" }),
                    id.ToString());
                return NotFound();
            }

            await _eventLogService.LogEventAsync($"MissingBlocks_{id}", "Missing Blocks Request Deleted",
                "MissingBlocksController", "MissingBlocks", "Completed",
                System.Text.Json.JsonSerializer.Serialize(new
                {
                    deletedMissingBlocksData = new
                    {
                        orderId = missingBlocks.OrderId,
                        productionLine = missingBlocks.ProductionLine,
                        motorType = missingBlocks.MotorType,
                        status = missingBlocks.Status
                    }
                }), id.ToString(), userId: userId);

            return NoContent();
        }
    }
}
