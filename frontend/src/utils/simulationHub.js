import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { tokenService } from './auth';

class SimulationHubService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.currentSimulationId = null;
    this.listeners = new Map();
  }

  async connect() {
    if (this.isConnected) {
      return;
    }

    try {
      const token = tokenService.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      this.connection = new HubConnectionBuilder()
        .withUrl('/simulationHub', {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      this.connection.on('RoundStarted', this.handleRoundStarted.bind(this));
      this.connection.on('RoundTick', this.handleRoundTick.bind(this));
      this.connection.on('RoundCompleted', this.handleRoundCompleted.bind(this));
      this.connection.on('SimulationStopped', this.handleSimulationStopped.bind(this));

      await this.connection.start();
      this.isConnected = true;
      console.log('SignalR connected');
    } catch (error) {
      console.error('Error connecting to SignalR:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.isConnected = false;
      this.currentSimulationId = null;
      console.log('SignalR disconnected');
    }
  }

  async joinSimulation(simulationId) {
    await this.ensureConnected();
    
    if (this.currentSimulationId && this.currentSimulationId !== simulationId) {
      await this.leaveSimulation();
    }

    await this.connection.invoke('JoinSimulationGroup', simulationId.toString());
    this.currentSimulationId = simulationId;
    console.log(`Joined simulation ${simulationId}`);
  }

  async leaveSimulation() {
    if (this.currentSimulationId && this.isConnected) {
      await this.connection.invoke('LeaveSimulationGroup', this.currentSimulationId.toString());
      console.log(`Left simulation ${this.currentSimulationId}`);
      this.currentSimulationId = null;
    }
  }

  // Event handler registration
  onRoundStarted(callback) {
    this.addListener('roundStarted', callback);
  }

  onRoundTick(callback) {
    this.addListener('roundTick', callback);
  }

  onRoundCompleted(callback) {
    this.addListener('roundCompleted', callback);
  }

  onSimulationStopped(callback) {
    this.addListener('simulationStopped', callback);
  }

  // Remove event listeners
  offRoundStarted(callback) {
    this.removeListener('roundStarted', callback);
  }

  offRoundTick(callback) {
    this.removeListener('roundTick', callback);
  }

  offRoundCompleted(callback) {
    this.removeListener('roundCompleted', callback);
  }

  offSimulationStopped(callback) {
    this.removeListener('simulationStopped', callback);
  }

  // Internal methods
  async ensureConnected() {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeListener(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emitToListeners(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  // SignalR event handlers
  handleRoundStarted(status) {
    console.log('Round started:', status);
    this.emitToListeners('roundStarted', status);
  }

  handleRoundTick(status) {
    this.emitToListeners('roundTick', status);
  }

  handleRoundCompleted(data) {
    console.log('Round completed:', data);
    this.emitToListeners('roundCompleted', data);
  }

  handleSimulationStopped(simulationId) {
    console.log('Simulation stopped:', simulationId);
    this.emitToListeners('simulationStopped', simulationId);
  }
}

// Export singleton instance
export const simulationHub = new SimulationHubService();
