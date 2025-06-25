# Automatic Simulation Pause Feature

## Overview

The simulation system now automatically pauses after reaching a configurable round limit (default: 36 rounds). This feature ensures simulations don't run indefinitely and provides a controlled stopping point for analysis.

## How It Works

### Backend Implementation

1. **Configuration**: The maximum round limit is configured in `appsettings.json`:
   ```json
   {
     "Simulation": {
       "RoundDurationSeconds": 20,
       "MaxRounds": 36
     }
   }
   ```

2. **Round Check**: Before creating each new round, the system checks if the next round number would exceed the maximum limit.

3. **Auto-Pause**: When the limit is reached, the simulation automatically stops and broadcasts a `SimulationPaused` event to all connected clients.

### Frontend Implementation

1. **Event Handling**: The frontend listens for the `SimulationPaused` event via SignalR.

2. **User Notification**: When a simulation is paused due to round limit, users receive a toast notification with details.

3. **State Management**: The simulation context is cleared, returning the UI to a non-running state.

## Configuration

### Changing the Round Limit

Edit the `MaxRounds` value in `backend/ERPNumber1/ERPNumber1/appsettings.json`:

```json
{
  "Simulation": {
    "RoundDurationSeconds": 20,
    "MaxRounds": 50  // New limit
  }
}
```

### API Endpoint

Get current simulation configuration:
```
GET /api/Simulations/config
```

Response:
```json
{
  "roundDurationSeconds": 20,
  "maxRounds": 36
}
```

## Events

### SimulationPaused

Broadcasted when a simulation is paused due to reaching the round limit:

```javascript
{
  "simulationId": 1,
  "reason": "Round 36 completed",
  "finalRoundNumber": 36,
  "maxRounds": 36
}
```

## User Experience

1. **During Simulation**: Users see normal round progression (Round 1, 2, 3... 36).

2. **At Round Limit**: After completing the final round (e.g., Round 36), the simulation automatically pauses.

3. **Notification**: Users receive a toast notification: "Simulation X has been automatically paused after completing round 36."

4. **UI State**: The simulation status indicators are cleared, and users can start new simulations.

## Benefits

- **Prevents Runaway Simulations**: Ensures simulations don't consume resources indefinitely
- **Consistent Testing**: Provides a standard endpoint for simulation analysis
- **User Control**: Configurable limit allows different simulation durations
- **Clear Feedback**: Users are informed when and why a simulation paused

## Implementation Details

### Files Modified

#### Backend
- `Services/SimulationService.cs`: Added round limit check and pause logic
- `Interfaces/ISimulationService.cs`: Added `GetMaxRounds()` method
- `Controllers/SimulationsController.cs`: Added configuration endpoint and max rounds to status
- `appsettings.json`: Added `MaxRounds` configuration

#### Frontend
- `utils/simulationService.js`: Added `SimulationPaused` event handling
- `contexts/SimulationContext.js`: Added paused event listener with toast notification
- `components/Toast.js`: New toast notification component
- `contexts/ToastContext.js`: Toast management context
- `app/dashboard/layout.js`: Added ToastProvider wrapper

### Technical Notes

- The pause check occurs before creating a new round, so the simulation completes exactly at the specified round limit
- The `SimulationPaused` event is broadcast to all connected clients, ensuring consistent state across users
- The configuration is read from `appsettings.json` and can be changed without code modifications
- Toast notifications provide a non-intrusive user experience compared to modal alerts
