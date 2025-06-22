using ERPNumber1.Attributes;
using ERPNumber1.Data;
using ERPNumber1.Dtos.Round;
using ERPNumber1.Dtos.Statistics;
using ERPNumber1.Extensions;
using ERPNumber1.Interfaces;
using ERPNumber1.Mapper;
using ERPNumber1.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Elfie.Diagnostics;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ERPNumber1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : ControllerBase
    {
       
        private readonly IEventLogService _eventLogService;
        private readonly IStatisticsRepository _statisticsRepository;

        public StatisticsController( IEventLogService eventLogService, IStatisticsRepository statisticsRepo)
        {
            
            _eventLogService = eventLogService;
            _statisticsRepository = statisticsRepo;
        }

        // GET: api/Statistics
        [HttpGet]
        [LogEvent("Statistics", "Get All Statistics")]
        public async Task<ActionResult<IEnumerable<Statistics>>> GetStatistics()
        {
            return await _statisticsRepository.GetAllAsync();
        }

        // GET: api/Statistics/5
        [HttpGet("{id}")]
        [LogEvent("Statistics", "Get Statistics by ID")]
        public async Task<ActionResult<Statistics>> GetStatistics(int id)
        {
            var statistics = await _statisticsRepository.GetByIdAsync(id);

            if (statistics == null)
            {
                await _eventLogService.LogEventAsync($"Statistics_{id}", "Statistics Retrieval Failed", 
                    "StatisticsController", "Statistics", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Statistics not found" }), 
                    id.ToString());
                return NotFound();
            }

            return Ok(statistics.ToStatisticsDto());
        }

        // PUT: api/Statistics/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStatistics(int id, UpdateStatisticsDto statisticsDto)
        {
            var statistics = await _statisticsRepository.GetByIdAsync(id);
            if (statistics == null)
            {
                return NotFound();
            }

            try
            {
                await _statisticsRepository.UpdateAsync(id, statisticsDto.ToStatisticsFromUpdate());
            }
            catch (DbUpdateConcurrencyException)
            {
                if (! await _statisticsRepository.StatisticsExistsAsync(id))
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

            var statistics = statisticsDto.ToStatisticsFromCreate();
            await _statisticsRepository.CreateAsync(statistics);
            return CreatedAtAction("GetStatistics", new { id = statistics.Id }, statistics.ToStatisticsDto());
        }

        // DELETE: api/Statistics/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStatistics(int id)
        {
            var statistics = await _statisticsRepository.GetByIdAsync(id);
            if (statistics == null)
            {
                return NotFound();
            }

            await _statisticsRepository.DeleteAsync(id);

            return NoContent();
        }
    }
}
