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
      onConnectionStateChanged: [],
      onTimerUpdate: []
    };
  }

  async connect() {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return true;
    }

    try {
      const token = tokenService.getToken();
      if (!token) {
        console.warn('No authentication token available for SignalR connection');
        return false;
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl('/simulationHub', {
          accessTokenFactory: () => token,
          skipNegotiation: false, // Allow negotiation to find best transport
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000]) // More aggressive reconnection
        .configureLogging(signalR.LogLevel.Warning) // Reduced logging - only warnings and errors
        .build();

      // Set up event handlers
      this.connection.on('SimulationStarted', (data) => {
        console.log('🚀 Simulation started');
        this.listeners.onSimulationStarted.forEach(callback => callback(data));
      });

      this.connection.on('SimulationStopped', (data) => {
        console.log('🛑 Simulation stopped');
        this.currentSimulation = null;
        this.listeners.onSimulationStopped.forEach(callback => callback(data));
      });

      this.connection.on('NewRound', (data) => {
        console.log('🎯 New round started');
        this.listeners.onNewRound.forEach(callback => callback(data));
      });

      this.connection.on('TimerUpdate', (data) => {
        // Only log important timer updates to reduce noise
        if (data.syncType === 'onDemand' || data.timeLeft <= 3) {
          console.log(`⏰ Timer: ${data.timeLeft}s`);
        }
        
        this.listeners.onTimerUpdate.forEach(callback => callback(data));
      });

      this.connection.onreconnecting(() => {
        console.log('📡 Reconnecting...');
        this.listeners.onConnectionStateChanged.forEach(callback => 
          callback({ state: 'reconnecting' }));
      });

      this.connection.onreconnected(() => {
        console.log('📡 Reconnected');
        this.listeners.onConnectionStateChanged.forEach(callback => 
          callback({ state: 'connected', reconnected: true }));
      });

      this.connection.onclose((error) => {
        if (error) {
          console.warn('📡 Disconnected:', error.message);
        }
        this.listeners.onConnectionStateChanged.forEach(callback => 
          callback({ state: 'disconnected', error: error?.message }));
      });

      await this.connection.start();
      console.log('📡 Connected via', this.connection.transport);
      
      this.listeners.onConnectionStateChanged.forEach(callback => 
        callback({ state: 'connected', reconnected: false }));
      
      return true;
    } catch (error) {
      console.error('SignalR connection failed:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.currentSimulation = null;
    }
  }

  async joinSimulation(simulationId, options = {}) {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      await this.connect();
    }

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log(`📡 Joining simulation: ${simulationId}`);
      await this.connection.invoke('JoinSimulationGroup', simulationId.toString());
      this.currentSimulation = simulationId;
      
      // Request immediate timer sync after joining (unless explicitly skipped)
      if (!options.skipTimerSync) {
        try {
          await this.connection.invoke('RequestTimerSync', simulationId.toString());
        } catch (error) {
          // Fallback with delay if immediate fails
          setTimeout(async () => {
            try {
              await this.connection.invoke('RequestTimerSync', simulationId.toString());
            } catch (retryError) {
              console.warn('Timer sync failed:', retryError.message);
            }
          }, 100);
        }
      }
    } else {
      console.error('❌ Failed to join simulation - connection not established');
    }
  }

  async rejoinSimulation(simulationId) {
    // Use the new RejoinSimulationGroup method for reconnection scenarios
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log(`📡 Rejoining simulation: ${simulationId}`);
      await this.connection.invoke('RejoinSimulationGroup', simulationId.toString());
      this.currentSimulation = simulationId;
      
      // Request immediate timer sync after rejoining
      try {
        await this.connection.invoke('RequestTimerSync', simulationId.toString());
      } catch (error) {
        // Fallback with delay if immediate fails
        setTimeout(async () => {
          try {
            await this.connection.invoke('RequestTimerSync', simulationId.toString());
          } catch (retryError) {
            console.warn('Timer sync failed on rejoin:', retryError.message);
          }
        }, 100);
      }
    } else {
      console.error('❌ Failed to rejoin simulation - connection not established');
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

  // Event listener methods
  onSimulationStarted(callback) {
    this.listeners.onSimulationStarted.push(callback);
    return () => {
      this.listeners.onSimulationStarted = this.listeners.onSimulationStarted.filter(cb => cb !== callback);
    };
  }

  onSimulationStopped(callback) {
    this.listeners.onSimulationStopped.push(callback);
    return () => {
      this.listeners.onSimulationStopped = this.listeners.onSimulationStopped.filter(cb => cb !== callback);
    };
  }

  onNewRound(callback) {
    this.listeners.onNewRound.push(callback);
    return () => {
      this.listeners.onNewRound = this.listeners.onNewRound.filter(cb => cb !== callback);
    };
  }

  onConnectionStateChanged(callback) {
    this.listeners.onConnectionStateChanged.push(callback);
    return () => {
      this.listeners.onConnectionStateChanged = this.listeners.onConnectionStateChanged.filter(cb => cb !== callback);
    };
  }

  onTimerUpdate(callback) {
    this.listeners.onTimerUpdate.push(callback);
    return () => {
      this.listeners.onTimerUpdate = this.listeners.onTimerUpdate.filter(cb => cb !== callback);
    };
  }

  getCurrentSimulation() {
    return this.currentSimulation;
  }

  isConnected() {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Export singleton instance
export const simulationService = new SimulationService();
