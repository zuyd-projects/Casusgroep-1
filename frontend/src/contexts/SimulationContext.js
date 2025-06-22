'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { simulationService } from '@CASUSGROEP1/utils/simulationService';
import { api } from '@CASUSGROEP1/utils/api';

const SimulationContext = createContext();

export function SimulationProvider({ children }) {
  const [currentSimulation, setCurrentSimulation] = useState(null);
  const [currentRound, setCurrentRound] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [roundTimeLeft, setRoundTimeLeft] = useState(0);
  const [roundDuration, setRoundDuration] = useState(30);

  // Auto-connect to SignalR when provider mounts
  useEffect(() => {
    console.log('🔌 Auto-connecting to SignalR on provider mount...');
    const autoConnect = async () => {
      try {
        const connected = await simulationService.connect();
        setIsConnected(connected);
        console.log('✅ Auto-connection result:', connected);
      } catch (error) {
        console.error('❌ Auto-connection failed:', error);
        setIsConnected(false);
      }
    };
    autoConnect();
  }, []);

  // Timer for countdown
  useEffect(() => {
    let timer;
    if (isRunning && roundTimeLeft > 0) {
      timer = setInterval(() => {
        setRoundTimeLeft(prev => {
          const newTime = Math.max(0, prev - 1);
          // Only log at important intervals to reduce noise
          if (newTime % 10 === 0 || newTime <= 5) {
            console.log('⏰ Timer:', newTime, 'seconds left');
          }
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRunning, roundTimeLeft]);

  // Set up event listeners
  useEffect(() => {
    const unsubscribeStarted = simulationService.onSimulationStarted((data) => {
      console.log('🎮 Simulation started:', data.simulationId);
      setCurrentSimulation(data.simulationId);
      setIsRunning(true);
      setRoundDuration(data.roundDuration || 30);
      setRoundTimeLeft(data.roundDuration || 30);
    });

    const unsubscribeStopped = simulationService.onSimulationStopped((data) => {
      console.log('🎮 Simulation stopped:', data.simulationId);
      // Clear all simulation state
      setCurrentSimulation(null);
      setCurrentRound(null);
      setIsRunning(false);
      setRoundTimeLeft(0);
    });

    const unsubscribeNewRound = simulationService.onNewRound((data) => {
      console.log('🎯 Round', data.roundNumber, 'started');
      setCurrentRound({
        id: data.roundId,
        number: data.roundNumber,
        simulationId: data.simulationId
      });
      const newDuration = data.duration || roundDuration;
      setRoundTimeLeft(newDuration);
    });

    const unsubscribeConnection = simulationService.onConnectionStateChanged((data) => {
      if (data.state === 'connected' && data.reconnected) {
        console.log('📡 Reconnected to SignalR');
      }
      setIsConnected(data.state === 'connected');
      if (data.state === 'connected' && data.reconnected && currentSimulation) {
        // Rejoin simulation group after reconnection
        simulationService.joinSimulation(currentSimulation).catch(console.error);
      }
    });

    return () => {
      unsubscribeStarted();
      unsubscribeStopped();
      unsubscribeNewRound();
      unsubscribeConnection();
    };
  }, [roundDuration, currentSimulation]);

  const runSimulation = useCallback(async (simulationId) => {
    try {
      console.log(`🎮 Starting simulation ${simulationId}`);
      await api.post(`/api/Simulations/${simulationId}/run`);
      
      // Set initial state immediately to show UI feedback
      setCurrentSimulation(simulationId);
      setIsRunning(true);
      setRoundTimeLeft(roundDuration);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to run simulation:', error);
      throw error;
    }
  }, [roundDuration]);

  const stopSimulation = useCallback(async (simulationId) => {
    try {
      console.log(`🛑 Stopping simulation ${simulationId}`);
      
      // Clear local state immediately for instant UI feedback
      setCurrentSimulation(null);
      setCurrentRound(null);
      setIsRunning(false);
      setRoundTimeLeft(0);
      
      await api.post(`/api/Simulations/${simulationId}/stop`);
      return true;
    } catch (error) {
      console.error('❌ Failed to stop simulation:', error);
      // If API call fails, we might want to restore state, but for now keep it cleared
      // since the user intended to stop the simulation
      throw error;
    }
  }, []);

  const getSimulationStatus = useCallback(async (simulationId) => {
    try {
      const status = await api.get(`/api/Simulations/${simulationId}/status`);
      
      // Update local state with server state
      setIsRunning(status.isRunning);
      if (status.currentRound) {
        setCurrentRound({
          id: status.currentRound.Id,
          number: status.currentRound.RoundNumber,
          simulationId: simulationId
        });
      }
      setRoundDuration(status.roundDuration || 30);
      
      // If simulation is running, start the timer
      if (status.isRunning) {
        setCurrentSimulation(simulationId);
        setRoundTimeLeft(status.roundDuration || 30);
      }
      
      return status;
    } catch (error) {
      console.error('❌ Failed to get simulation status:', error);
      throw error;
    }
  }, []);

  const connectToSignalR = useCallback(async () => {
    try {
      const connected = await simulationService.connect();
      setIsConnected(connected);
      return connected;
    } catch (error) {
      console.error('Failed to connect to SignalR:', error);
      return false;
    }
  }, []);

  const value = {
    // State
    currentSimulation,
    currentRound,
    isRunning,
    isConnected,
    roundTimeLeft,
    roundDuration,
    
    // Actions
    runSimulation,
    stopSimulation,
    getSimulationStatus,
    connectToSignalR,
    
    // Utils
    formatTimeLeft: () => {
      const minutes = Math.floor(roundTimeLeft / 60);
      const seconds = roundTimeLeft % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    console.warn('useSimulation must be used within a SimulationProvider');
    // Return a default context to prevent crashes
    return {
      currentSimulation: null,
      currentRound: null,
      isRunning: false,
      isConnected: false,
      roundTimeLeft: 0,
      roundDuration: 30,
      runSimulation: async () => false,
      stopSimulation: async () => false,
      getSimulationStatus: async () => ({}),
      connectToSignalR: async () => false,
      formatTimeLeft: () => '0:00'
    };
  }
  return context;
}
