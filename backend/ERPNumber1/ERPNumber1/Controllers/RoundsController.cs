using ERPNumber1.Attributes;
using ERPNumber1.Data;
using ERPNumber1.Dtos.Order;
using ERPNumber1.Dtos.Round;
using ERPNumber1.Extensions;
using ERPNumber1.Interfaces;
using ERPNumber1.Mapper;
using ERPNumber1.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ERPNumber1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoundsController : ControllerBase
    {
        private readonly IEventLogService _eventLogService;
        private readonly IRoundRepository _roundRepo;

        public RoundsController(IEventLogService eventLogService, IRoundRepository roundRepo)
        {
            //_context = context;
            _eventLogService = eventLogService;
            _roundRepo = roundRepo; 
        }

        // GET: api/Rounds
        [HttpGet]
        [LogEvent("Round", "Get All Rounds")]
        public async Task<ActionResult<IEnumerable<Round>>> GetRounds()
        {
            var rounds = await _roundRepo.GetAllAsync();
            var roundDtos = rounds.Select(s => s.ToRoundDto());
            return Ok(roundDtos);
        }

        // GET: api/Rounds/5
        [HttpGet("{id}")]
        [LogEvent("Round", "Get Round by ID")]
        public async Task<ActionResult<Round>> GetRound(int id)
        {
            var round = await _roundRepo.GetByIdAsync(id);

            if (round == null)
            {
                await _eventLogService.LogEventAsync($"Round_{id}", "Round Retrieval Failed", 
                    "RoundsController", "Round", "Failed", 
                    System.Text.Json.JsonSerializer.Serialize(new { reason = "Round not found" }), 
                    id.ToString());
                return NotFound();
            }

            return Ok(round.ToRoundDto());
        }

        // PUT: api/Rounds/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRound(int id, UpdateRoundDto roundDto)
        {
            var round = await _roundRepo.GetByIdAsync(id);
            if (round == null)
            {
                return NotFound();
            }

            try
            {
                await _roundRepo.UpdateAsync(id, roundDto.ToRoundFromUpdate());
            }
            catch (DbUpdateConcurrencyException)
            {
                if (! await _roundRepo.RoundExistsAsync(id))
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

        // POST: api/Rounds
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Round>> PostRound(CreateRoundDto roundDto)
        {
            var roundModel = roundDto.ToRoundFromCreate();
            await _roundRepo.CreateAsync(roundModel);

            return CreatedAtAction(nameof(GetRound), new { id = roundModel.Id }, roundModel.ToRoundDto());
        }

        // DELETE: api/Rounds/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRound(int id)
        {
            var round = await _roundRepo.GetByIdAsync(id);
            if (round == null)
            {
                return NotFound();
            }

            await _roundRepo.DeleteAsync(id);

            return NoContent();
        }

    }
}
