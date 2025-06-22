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
        console.log('🚀 Simulation started event received:', data);
        this.listeners.onSimulationStarted.forEach(callback => callback(data));
      });

      this.connection.on('SimulationStopped', (data) => {
        console.log('🛑 Simulation stopped event received:', data);
        this.currentSimulation = null;
        this.listeners.onSimulationStopped.forEach(callback => callback(data));
      });

      this.connection.on('NewRound', (data) => {
        console.log('🎯 New round event received:', data);
        this.listeners.onNewRound.forEach(callback => callback(data));
      });

      this.connection.onreconnecting(() => {
        console.log('📡 SignalR reconnecting...');
        this.listeners.onConnectionStateChanged.forEach(callback => 
          callback({ state: 'reconnecting' }));
      });

      this.connection.onreconnected(() => {
        console.log('📡 SignalR reconnected');
        this.listeners.onConnectionStateChanged.forEach(callback => 
          callback({ state: 'connected', reconnected: true }));
      });

      this.connection.onclose((error) => {
        if (error) {
          console.warn('📡 SignalR disconnected:', error.message);
        }
        this.listeners.onConnectionStateChanged.forEach(callback => 
          callback({ state: 'disconnected', error: error?.message }));
      });

      await this.connection.start();
      console.log('📡 SignalR connected via', this.connection.transport);
      
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

  async joinSimulation(simulationId) {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.log('⚠️ Connection not ready, attempting to connect first...');
      await this.connect();
    }

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log(`📡 Joining simulation group: ${simulationId}`);
      await this.connection.invoke('JoinSimulationGroup', simulationId.toString());
      this.currentSimulation = simulationId;
      console.log(`✅ Successfully joined simulation group: ${simulationId}`);
    } else {
      console.error('❌ Failed to join simulation group - connection not established');
    }
  }

  async leaveSimulation(simulationId) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('LeaveSimulationGroup', simulationId.toString());
      if (this.currentSimulation === simulationId) {
        this.currentSimulation = null;
      }
      console.log(`Left simulation group: ${simulationId}`);
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

  getCurrentSimulation() {
    return this.currentSimulation;
  }

  isConnected() {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Export singleton instance
export const simulationService = new SimulationService();
