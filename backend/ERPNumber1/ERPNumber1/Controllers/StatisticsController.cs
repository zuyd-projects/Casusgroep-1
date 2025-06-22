using ERPNumber1.Data;
using ERPNumber1.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Elfie.Diagnostics;
using Microsoft.EntityFrameworkCore;
using ERPNumber1.Interfaces;
using ERPNumber1.Extensions;
using ERPNumber1.Attributes;
using ERPNumber1.Dtos.Statistics;
using System.Security.Claims;

namespace ERPNumber1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEventLogService _eventLogService;

        public StatisticsController(AppDbContext context, IEventLogService eventLogService)
        {
            _context = context;
            _eventLogService = eventLogService;
        }

        // GET: api/Statistics
        [HttpGet]
        [LogEvent("Statistics", "Get All Statistics")]
        public async Task<ActionResult<IEnumerable<Statistics>>> GetStatistics()
        {
            return await _context.Statistics.ToListAsync();
        }

        // GET: api/Statistics/5
        [HttpGet("{id}")]
        [LogEvent("Statistics", "Get Statistics by ID")]
        public async Task<ActionResult<Statistics>> GetStatistics(int id)
        {
            var statistics = await _context.Statistics.FindAsync(id);

            if (statistics == null)
            {
                await _eventLogService.LogEventAsync($"Statistics_{id}", "Statistics Retrieval Failed", 
                    "StatisticsController", "Statistics", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Statistics not found" }), 
                    id.ToString());
                return NotFound();
            }

            return statistics;
        }

        // PUT: api/Statistics/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStatistics(int id, UpdateStatisticsDto statisticsDto)
        {
            var statistics = await _context.Statistics.FindAsync(id);
            if (statistics == null)
            {
                return NotFound();
            }

            statistics.SimulationId = statisticsDto.SimulationId;
            statistics.TotalOrders = statisticsDto.TotalOrders;
            statistics.DeliveryRate = statisticsDto.DeliveryRate;
            statistics.Revenue = statisticsDto.Revenue;
            statistics.Cost = statisticsDto.Cost;
            statistics.NetProfit = statisticsDto.NetProfit;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StatisticsExists(id))
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

        // POST: api/Statistics
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Statistics>> PostStatistics(CreateStatisticsDto statisticsDto)
        {
            var statistics = new Statistics
            {
                SimulationId = statisticsDto.SimulationId,
                TotalOrders = statisticsDto.TotalOrders,
                DeliveryRate = statisticsDto.DeliveryRate,
                Revenue = statisticsDto.Revenue,
                Cost = statisticsDto.Cost,
                NetProfit = statisticsDto.NetProfit
            };
            
            _context.Statistics.Add(statistics);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetStatistics", new { id = statistics.Id }, statistics);
        }

        // DELETE: api/Statistics/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStatistics(int id)
        {
            var statistics = await _context.Statistics.FindAsync(id);
            if (statistics == null)
            {
                return NotFound();
            }

            _context.Statistics.Remove(statistics);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool StatisticsExists(int id)
        {
            return _context.Statistics.Any(e => e.Id == id);
        }
    }
}
