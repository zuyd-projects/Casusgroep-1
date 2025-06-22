# Real-Time Simulation System with SignalR

## Overview

The ERP system includes a comprehensive real-time simulation feature that uses **SignalR** for WebSocket communication. This allows multiple users to see live updates when simulations are running, with new rounds created every 30 seconds (configurable). The system features an integrated header display that shows current simulation status, round information, and a live countdown timer.

## 🔄 How It Works

1. **Start Simulation**: Click "Run" → Creates first round immediately → Timer starts for subsequent rounds
2. **Real-Time Updates**: WebSocket pushes new round data to all connected clients  
3. **Integrated Header Display**: Shows simulation ID, round number, countdown timer, connection status, and stop controls
4. **Round Creation**: Every 30 seconds (configurable), new round is created and broadcast
5. **Stop Simulation**: Available from header bar or simulations page, cancels timer and broadcasts stop event
6. **Auto-Reconnection**: Robust connection handling with automatic reconnection and graceful fallbacks

## 🎨 User Interface Features

### Integrated Header Display

The simulation status is prominently displayed in the main application header when a simulation is running:

#### Desktop Layout
```
[Logo] -------- [🟦 Sim #1 | 🟣 Round 3 | 🟠 0:25 | 🟢 LIVE | 🔴 STOP] -------- [User]
```

- **Connection Status**: Wi-Fi icon (green = connected, red = disconnected)
- **Simulation Badge**: Blue badge showing "Sim #X" with current simulation ID
- **Round Badge**: Purple badge showing "Round X" or "Starting..." when initializing
- **Live Timer**: Orange badge with MM:SS countdown to next round
- **Live Indicator**: Pulsing green dot with "LIVE" text
- **Stop Button**: Red button for immediate simulation termination

#### Mobile Layout
- **Header Bar**: Compact display showing round number and timer next to logo
- **Mobile Menu**: Full simulation status panel when menu is expanded
- **Touch-Friendly**: All controls optimized for touch interaction

### Simulations Management Page

Located at `/dashboard/simulations`, this page provides comprehensive simulation management:

#### Features
- **Create New Simulations**: Form to create simulations with name and date
- **Simulation List**: Table showing all simulations with creation dates
- **Run/Stop Controls**: Context-aware buttons in each table row
- **Real-Time Status**: Current round display for running simulations
- **Quick Actions**: Delete simulations (with confirmation)

#### Real-Time Updates
- **Immediate Feedback**: UI updates instantly when starting/stopping
- **Live Round Display**: Shows current round number in table
- **Status Indicators**: Visual cues for running vs stopped simulations
- **Loading States**: Spinner indicators during API calls

### Dashboard Widgets

The main dashboard includes simulation-related widgets:

- **Recent Simulations**: Quick access to recently created simulations
- **Current Status**: Overview of any running simulation
- **Quick Start**: One-click buttons for frequent simulations

### Visual Design

#### Color Coding
- **Blue**: Simulation information and running status
- **Purple**: Round-specific information
- **Orange**: Timer and countdown elements
- **Green**: Connection status and live indicators
- **Red**: Stop controls and alerts

#### Responsive Behavior
- **Large Screens**: Full header integration with all elements visible
- **Medium Screens**: Compact layout with essential information
- **Small Screens**: Mobile-optimized with collapsible menu

#### Accessibility
- **High Contrast**: All text meets WCAG contrast requirements
- **Icon Labels**: Descriptive tooltips for all interactive elements
- **Keyboard Navigation**: Full keyboard support for all controls
- **Screen Reader**: Semantic HTML with proper ARIA labels

## 🔄 User Workflows

### Starting a Simulation

1. **Navigate** to `/dashboard/simulations`
2. **Click** "Run" button on desired simulation
3. **Header Updates** immediately showing simulation status
4. **First Round** appears within seconds
5. **Timer Starts** counting down to next round

### Monitoring Progress

1. **Header Display** shows current round and timer
2. **Timer Counts Down** in real-time (MM:SS format)
3. **New Rounds** appear automatically every 30 seconds
4. **Connection Status** visible via Wi-Fi icon color

### Stopping a Simulation

1. **Header Stop Button**: Click red "STOP" button in header
2. **Table Stop Button**: Click "Stop" in simulations table
3. **Immediate Feedback**: UI updates instantly
4. **Timer Stops**: Countdown halts and display clears

### Troubleshooting Connection Issues

1. **Check Connection**: Look for red Wi-Fi icon in header
2. **Refresh Page**: Browser refresh triggers auto-reconnection
3. **Console Logs**: Detailed debugging information available
4. **Fallback Transports**: System automatically tries multiple connection types

## 🔧 Troubleshootingrt Simulation**: Click "Run" → Creates first round immediately → Timer starts for subsequent rounds
2. **Real-Time Updates**: WebSocket pushes new round data to all connected clients  
3. **Integrated Header Display**: Shows simulation ID, round number, countdown timer, connection status, and stop controls
4. **Round Creation**: Every 30 seconds (configurable), new round is created and broadcast
5. **Stop Simulation**: Available from header bar or simulations page, cancels timer and broadcasts stop event
6. **Auto-Reconnection**: Robust connection handling with automatic reconnection and graceful fallbacks

## 🎮 Header Integration Features

### Desktop Display
The main header shows a comprehensive simulation status bar when a simulation is running:
- **Connection Status**: Wi-Fi icon showing SignalR connection state
- **Simulation Badge**: "Sim #X" with current simulation ID
- **Round Badge**: "Round X" or "Starting..." when initializing
- **Live Timer**: MM:SS countdown to next round
- **Live Indicator**: Pulsing green dot with "LIVE" text
- **Stop Button**: One-click simulation termination

### Mobile Display
- **Header Bar**: Compact round & timer display next to logo
- **Mobile Menu**: Full simulation status panel with stop functionality
- **Responsive Design**: Adapts to all screen sizes seamlessly

## 📡 Enhanced SignalR Hub Connection

### Connection Endpoint
```
/simulationHub
```

### Robust Connection Handling
The system now includes enhanced connection management:

```javascript
const connection = new signalR.HubConnectionBuilder()
  .withUrl('/simulationHub', {
    accessTokenFactory: () => yourJwtToken,
    skipNegotiation: false,
    transport: signalR.HttpTransportType.WebSockets | 
               signalR.HttpTransportType.ServerSentEvents | 
               signalR.HttpTransportType.LongPolling
  })
  .withAutomaticReconnect([0, 2000, 10000, 30000])
  .configureLogging(signalR.LogLevel.Information)
  .build();
```

### Enhanced Features
- **Transport Fallback**: WebSockets → Server-Sent Events → Long Polling
- **Aggressive Reconnection**: Multiple retry intervals for better reliability
- **Detailed Logging**: Comprehensive debugging information
- **Graceful Degradation**: Continues working even with connection issues

## 🎯 API Endpoints

### Start Simulation
```http
POST /api/Simulations/{id}/run
Authorization: Bearer {jwt-token}
```

**Response:**
```json
{
  "message": "Simulation started successfully",
  "simulationId": 1
}
```

### Stop Simulation
```http
POST /api/Simulations/{id}/stop
Authorization: Bearer {jwt-token}
```

**Response:**
```json
{
  "message": "Simulation stopped successfully", 
  "simulationId": 1
}
```

### Get Simulation Status
```http
GET /api/Simulations/{id}/status
Authorization: Bearer {jwt-token}
```

**Response:**
```json
{
  "simulationId": 1,
  "isRunning": true,
  "currentRound": {
    "id": 5,
    "roundNumber": 3
  },
  "roundDuration": 30
}
```

## 📨 SignalR Events

### SimulationStarted
Broadcasted when a simulation begins:

```javascript
connection.on('SimulationStarted', (data) => {
  // data = { simulationId: 1, roundDuration: 30 }
  console.log('Simulation started:', data);
});
```

### NewRound
Broadcasted every round interval (default 30 seconds):

```javascript
connection.on('NewRound', (data) => {
  // data = { simulationId: 1, roundId: 5, roundNumber: 3, duration: 30 }
  console.log('New round started:', data);
  updateRoundDisplay(data);
});
```

### SimulationStopped
Broadcasted when a simulation ends:

```javascript
connection.on('SimulationStopped', (data) => {
  // data = { simulationId: 1 }
  console.log('Simulation stopped:', data);
});
```

## 💻 Frontend Implementation

### Installing SignalR Client
```bash
npm install @microsoft/signalr
```

### Integrated Header Display System

The application features a sophisticated real-time display system with the simulation status integrated directly into the main header. This provides users with always-visible simulation information and controls.

#### Architecture Overview:
- **SimulationContext**: Central state management for simulation data
- **Header Integration**: Real-time status display in main navigation
- **Responsive Design**: Adapts to desktop and mobile layouts
- **Auto-Connect**: Automatic SignalR connection management
- **Graceful Fallbacks**: Continues working during connection issues

### Enhanced SignalR Service

```javascript
// utils/simulationService.js
import * as signalR from '@microsoft/signalr';
import { tokenService } from './auth';

class SimulationService {
  constructor() {
    this.connection = null;
    this.currentSimulation = null;
    this.listeners = {
      onSimulationStarted: [],
      onSimulationStopped: [],
      onNewRound: [],
      onConnectionStateChanged: []
    };
  }

  async connect() {
    const token = tokenService.getToken();
    
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('/simulationHub', {
        accessTokenFactory: () => token,
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | 
                   signalR.HttpTransportType.ServerSentEvents | 
                   signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Enhanced event handlers with debugging
    this.connection.on('SimulationStarted', (data) => {
      console.log('🚀 Simulation started event received:', data);
      this.listeners.onSimulationStarted.forEach(callback => callback(data));
    });

    this.connection.on('NewRound', (data) => {
      console.log('🎯 New round event received:', data);
      this.listeners.onNewRound.forEach(callback => callback(data));
    });

    this.connection.on('SimulationStopped', (data) => {
      console.log('🛑 Simulation stopped event received:', data);
      this.currentSimulation = null;
      this.listeners.onSimulationStopped.forEach(callback => callback(data));
    });

    // Connection state management
    this.connection.onreconnecting(() => {
      this.listeners.onConnectionStateChanged.forEach(callback => 
        callback({ state: 'reconnecting' }));
    });

    this.connection.onreconnected(() => {
      this.listeners.onConnectionStateChanged.forEach(callback => 
        callback({ state: 'connected', reconnected: true }));
    });

    this.connection.onclose((error) => {
      this.listeners.onConnectionStateChanged.forEach(callback => 
        callback({ state: 'disconnected', error: error?.message }));
    });

    await this.connection.start();
    console.log('SignalR connected successfully via transport:', this.connection.transport);
    
    this.listeners.onConnectionStateChanged.forEach(callback => 
      callback({ state: 'connected', reconnected: false }));
    
    return true;
  }

  async joinSimulation(simulationId) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('JoinSimulationGroup', simulationId.toString());
      this.currentSimulation = simulationId;
      console.log(`✅ Successfully joined simulation group: ${simulationId}`);
    }
  }

  async leaveSimulation(simulationId) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('LeaveSimulationGroup', simulationId.toString());
      if (this.currentSimulation === simulationId) {
        this.currentSimulation = null;
      }
    }
  }

  // Event subscription methods
  onSimulationStarted(callback) {
    this.listeners.onSimulationStarted.push(callback);
    return () => {
      this.listeners.onSimulationStarted = 
        this.listeners.onSimulationStarted.filter(cb => cb !== callback);
    };
  }

  onNewRound(callback) {
    this.listeners.onNewRound.push(callback);
    return () => {
      this.listeners.onNewRound = 
        this.listeners.onNewRound.filter(cb => cb !== callback);
    };
  }

  onSimulationStopped(callback) {
    this.listeners.onSimulationStopped.push(callback);
    return () => {
      this.listeners.onSimulationStopped = 
        this.listeners.onSimulationStopped.filter(cb => cb !== callback);
    };
  }

  onConnectionStateChanged(callback) {
    this.listeners.onConnectionStateChanged.push(callback);
    return () => {
      this.listeners.onConnectionStateChanged = 
        this.listeners.onConnectionStateChanged.filter(cb => cb !== callback);
    };
  }
}

export const simulationService = new SimulationService();
```

    // Set up event handlers
    this.connection.on('SimulationStarted', this.handleSimulationStarted);
    this.connection.on('NewRound', this.handleNewRound);
    this.connection.on('SimulationStopped', this.handleSimulationStopped);

    await this.connection.start();
    console.log('SignalR connected');
  }

  async joinSimulation(simulationId) {
    await this.connection.invoke('JoinSimulationGroup', simulationId.toString());
    this.currentSimulation = simulationId;
  }

  async leaveSimulation(simulationId) {
    await this.connection.invoke('LeaveSimulationGroup', simulationId.toString());
  }

  handleSimulationStarted = (data) => {
    console.log('Simulation started:', data);
    // Update UI state
  }

  handleNewRound = (data) => {
    console.log('New round:', data);
    // Update round display
  }

  handleSimulationStopped = (data) => {
    console.log('Simulation stopped:', data);
    // Reset UI state
  }
}

export const simulationService = new SimulationService();
```

### React Component Example
```javascript
import { useEffect, useState } from 'react';
import { simulationService } from './simulationService';

function SimulationDashboard() {
  const [currentRound, setCurrentRound] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    // Connect to SignalR
    simulationService.connect();

    // Set up event listeners
    const unsubscribeStarted = simulationService.onSimulationStarted((data) => {
      setIsRunning(true);
    });

    const unsubscribeNewRound = simulationService.onNewRound((data) => {
      setCurrentRound({
        id: data.roundId,
        number: data.roundNumber
      });
      setTimeLeft(data.duration);
    });

    const unsubscribeStopped = simulationService.onSimulationStopped(() => {
      setIsRunning(false);
      setCurrentRound(null);
    });

    // Cleanup
    return () => {
      unsubscribeStarted();
      unsubscribeNewRound();
      unsubscribeStopped();
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 30);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const startSimulation = async (simulationId) => {
    try {
      await simulationService.joinSimulation(simulationId);
      
      const response = await fetch(`/api/Simulations/${simulationId}/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getJwtToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to start simulation');
    } catch (error) {
      console.error('Error starting simulation:', error);
    }
  };

  return (
    <div>
      <h1>Simulation Dashboard</h1>
      
      {isRunning && currentRound && (
        <div className="simulation-status">
          <h2>Round {currentRound.number}</h2>
          <p>Time left: {timeLeft}s</p>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      <button onClick={() => startSimulation(1)}>
        Start Simulation
      </button>
    </div>
  );
}
```

## ⚙️ Configuration

### Backend (appsettings.json)
```json
{
  "Simulation": {
    "RoundDurationSeconds": 30
  }
}
```

### CORS Setup (Program.cs)
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for SignalR
    });
});
```

### Next.js Proxy (next.config.mjs)
```javascript
{
  source: '/simulationHub/:path*',
  destination: `${backendUrl}/simulationHub/:path*`
}
```

## 🎪 Features

### Real-Time Header Status
- Connection status indicator (WiFi icon)
- Current simulation ID display
- Round number and countdown timer
- Live status indicator

### Dashboard Integration
- Quick run buttons for recent simulations
- Visual feedback for running simulations
- Disabled controls when appropriate

### Multi-User Support
- All users see the same simulation state
- Automatic group management (join/leave)
- Targeted messaging to simulation participants

## 🚫 Troubleshooting

### Connection Issues
- **Problem**: SignalR connection fails
- **Solution**: Check JWT token validity and CORS configuration

### Missing Events
- **Problem**: Not receiving `NewRound` events
- **Solution**: Ensure you call `JoinSimulationGroup(simulationId)` after connecting

### Header Shows Old Simulation Data
- **Problem**: Header continues showing simulation status after stopping
- **Solution**: Context now clears state immediately when `stopSimulation` is called, providing instant UI feedback

### Simulation Not Visible to All Users
- **Problem**: When one user starts a simulation, other users don't see it automatically
- **Solution**: System now broadcasts to ALL connected clients via `Clients.All` instead of simulation groups
- **Implementation**: Auto-connects all users to SignalR and sends company-wide notifications

### Multiple Connections
- **Problem**: Memory leaks from multiple connections
- **Solution**: Use singleton pattern and proper cleanup in React useEffect

### Authentication Errors
- **Problem**: 401 Unauthorized on SignalR connection
- **Solution**: Verify JWT token is included in `accessTokenFactory`

## 📊 Performance

- **Group Messaging**: Only simulation participants receive events
- **Automatic Reconnection**: Handles network interruptions
- **Resource Cleanup**: Timers disposed when simulations stop
- **Connection Pooling**: SignalR manages connections efficiently

## 🔒 Security

- **JWT Authentication**: All connections require valid tokens
- **Authorization**: User role validation on all endpoints
- **Group Isolation**: Users only receive events for simulations they join
- **Automatic Cleanup**: Resources cleaned up on disconnect
