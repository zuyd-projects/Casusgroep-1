using ERPNumber1.Data;
using ERPNumber1.Interfaces;
using ERPNumber1.Models;
using ERPNumber1.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ERPNumber1.Services
{
    public class SimulationService : ISimulationService
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IHubContext<SimulationHub> _hubContext;
        private readonly IConfiguration _configuration;
        private readonly Dictionary<int, Timer> _runningSimulations = new();
        private readonly Dictionary<int, int> _currentRounds = new();
        private readonly Dictionary<int, DateTime> _roundStartTimes = new();
        private readonly Dictionary<int, Timer> _timerUpdateTimers = new();

        public SimulationService(IServiceScopeFactory serviceScopeFactory, IHubContext<SimulationHub> hubContext, IConfiguration configuration)
        {
            _serviceScopeFactory = serviceScopeFactory;
            _hubContext = hubContext;
            _configuration = configuration;
        }

        public int GetRoundDurationSeconds()
        {
            return _configuration.GetValue<int>("Simulation:RoundDurationSeconds", 30);
        }

        public async Task<bool> StartSimulationAsync(int simulationId)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            // Check if simulation exists
            var simulation = await context.Simulations.FindAsync(simulationId);
            if (simulation == null)
            {
                Console.WriteLine($"Simulation {simulationId} not found");
                return false;
            }

            // Stop if already running
            if (_runningSimulations.ContainsKey(simulationId))
            {
                Console.WriteLine($"Stopping existing simulation {simulationId} before starting new one");
                await StopSimulationAsync(simulationId);
            }

            // Initialize first round
            _currentRounds[simulationId] = 0;
            Console.WriteLine($"Starting simulation {simulationId}");
            
            // Create and start the first round immediately
            await CreateAndStartNewRound(simulationId);

            // Set up timer for subsequent rounds
            var roundDurationMs = GetRoundDurationSeconds() * 1000;
            Console.WriteLine($"Setting up timer for simulation {simulationId} with {roundDurationMs}ms intervals");
            var timer = new Timer(async _ => await CreateAndStartNewRound(simulationId), 
                                 null, roundDurationMs, roundDurationMs);
            
            _runningSimulations[simulationId] = timer;

            // Notify ALL clients that simulation started (company-wide notification)
            Console.WriteLine($"Notifying ALL clients that simulation {simulationId} started");
            await _hubContext.Clients.All
                .SendAsync("SimulationStarted", new { 
                    simulationId, 
                    roundDuration = GetRoundDurationSeconds(),
                    startTime = DateTime.UtcNow.ToString("O")
                });

            return true;
        }

        public async Task<bool> StopSimulationAsync(int simulationId)
        {
            if (_runningSimulations.TryGetValue(simulationId, out var timer))
            {
                timer.Dispose();
                _runningSimulations.Remove(simulationId);
                _currentRounds.Remove(simulationId);
                _roundStartTimes.Remove(simulationId);

                // Stop timer update broadcasts
                if (_timerUpdateTimers.TryGetValue(simulationId, out var updateTimer))
                {
                    updateTimer.Dispose();
                    _timerUpdateTimers.Remove(simulationId);
                }

                // Notify ALL clients that simulation stopped (company-wide notification)
                await _hubContext.Clients.All
                    .SendAsync("SimulationStopped", new { simulationId });

                return true;
            }
            return false;
        }

        public async Task<Round?> GetCurrentRoundAsync(int simulationId)
        {
            if (!_currentRounds.ContainsKey(simulationId))
                return null;

            var currentRoundNumber = _currentRounds[simulationId];
            if (currentRoundNumber == 0)
                return null;

            using var scope = _serviceScopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            return await context.Rounds
                .FirstOrDefaultAsync(r => r.SimulationId == simulationId && r.RoundNumber == currentRoundNumber);
        }

        public Task<bool> IsSimulationRunningAsync(int simulationId)
        {
            return Task.FromResult(_runningSimulations.ContainsKey(simulationId));
        }

        public int GetRemainingTimeForCurrentRound(int simulationId)
        {
            if (!_roundStartTimes.ContainsKey(simulationId))
                return 0;

            var roundStart = _roundStartTimes[simulationId];
            var elapsed = DateTime.UtcNow - roundStart;
            var roundDuration = GetRoundDurationSeconds();
            var remaining = roundDuration - (int)elapsed.TotalSeconds;
            
            return Math.Max(0, remaining);
        }

        private async Task CreateAndStartNewRound(int simulationId)
        {
            try
            {
                // Check if simulation is still running before creating a round
                if (!_runningSimulations.ContainsKey(simulationId))
                {
                    return; // Simulation was stopped, don't create new round
                }

                using var scope = _serviceScopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                
                // Double-check simulation exists
                var simulation = await context.Simulations.FindAsync(simulationId);
                if (simulation == null)
                {
                    await StopSimulationAsync(simulationId); // Clean up if simulation no longer exists
                    return;
                }
                
                var nextRoundNumber = _currentRounds.GetValueOrDefault(simulationId, 0) + 1;
                Console.WriteLine($"Creating round {nextRoundNumber} for simulation {simulationId}");
                
                var newRound = new Round
                {
                    SimulationId = simulationId,
                    RoundNumber = nextRoundNumber
                };

                context.Rounds.Add(newRound);
                await context.SaveChangesAsync();
                Console.WriteLine($"Saved round {nextRoundNumber} to database with ID {newRound.Id}");

                _currentRounds[simulationId] = nextRoundNumber;
                _roundStartTimes[simulationId] = DateTime.UtcNow; // Set start time AFTER database save

                // Set up timer to send periodic updates to clients (every second)
                if (_timerUpdateTimers.ContainsKey(simulationId))
                {
                    _timerUpdateTimers[simulationId].Dispose();
                }

                var updateTimer = new Timer(async _ => await SendTimerUpdate(simulationId), 
                                          null, 1000, 1000); // Update every second
                _timerUpdateTimers[simulationId] = updateTimer;

                // Notify ALL clients about the new round (company-wide notification)
                Console.WriteLine($"Notifying ALL clients about new round {nextRoundNumber} for simulation {simulationId}");
                await _hubContext.Clients.All
                    .SendAsync("NewRound", new 
                    { 
                        simulationId, 
                        roundId = newRound.Id,
                        roundNumber = nextRoundNumber,
                        duration = GetRoundDurationSeconds(),
                        startTime = DateTime.UtcNow.ToString("O") // ISO 8601 format
                    });
            }
            catch (Exception ex)
            {
                // Log the error (you might want to use ILogger here)
                Console.WriteLine($"Error creating round for simulation {simulationId}: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                // If there's an error, stop the simulation to prevent further errors
                await StopSimulationAsync(simulationId);
            }
        }

        private async Task SendTimerUpdate(int simulationId)
        {
            try
            {
                if (!_runningSimulations.ContainsKey(simulationId))
                    return;

                var remainingTime = GetRemainingTimeForCurrentRound(simulationId);
                
                // Send timer update to all clients in the simulation group
                await _hubContext.Clients.Group($"simulation_{simulationId}")
                    .SendAsync("TimerUpdate", new { 
                        simulationId, 
                        timeLeft = remainingTime,
                        timestamp = DateTime.UtcNow.ToString("O"),
                        syncType = "periodic"
                    });
                
                // Log periodically to track timer broadcasts
                if (remainingTime % 10 == 0 || remainingTime <= 5)
                {
                    Console.WriteLine($"Broadcasted timer update to simulation_{simulationId}: {remainingTime}s remaining");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending timer update for simulation {simulationId}: {ex.Message}");
            }
        }
    }
}
