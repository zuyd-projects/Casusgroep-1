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

  // Timer for countdown
  useEffect(() => {
    let timer;
    if (isRunning && roundTimeLeft > 0) {
      timer = setInterval(() => {
        setRoundTimeLeft(prev => {
          const newTime = Math.max(0, prev - 1);
          console.log('⏰ Timer tick:', newTime, 'seconds left');
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
      console.log('📢 Context: Simulation started event', data);
      setCurrentSimulation(data.simulationId);
      setIsRunning(true);
      setRoundDuration(data.roundDuration || 30);
      setRoundTimeLeft(data.roundDuration || 30);
    });

    const unsubscribeStopped = simulationService.onSimulationStopped((data) => {
      console.log('📢 Context: Simulation stopped event', data);
      setCurrentSimulation(null);
      setCurrentRound(null);
      setIsRunning(false);
      setRoundTimeLeft(0);
    });

    const unsubscribeNewRound = simulationService.onNewRound((data) => {
      console.log('📢 Context: New round event', data);
      setCurrentRound({
        id: data.roundId,
        number: data.roundNumber,
        simulationId: data.simulationId
      });
      const newDuration = data.duration || roundDuration;
      console.log('⏰ Setting round timer to:', newDuration, 'seconds');
      setRoundTimeLeft(newDuration);
    });

    const unsubscribeConnection = simulationService.onConnectionStateChanged((data) => {
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
  }, [roundDuration]);

  const runSimulation = useCallback(async (simulationId) => {
    try {
      console.log(`🎮 Starting simulation ${simulationId}...`);
      await api.post(`/api/Simulations/${simulationId}/run`);
      console.log(`✅ API call successful, joining SignalR group...`);
      await simulationService.joinSimulation(simulationId);
      
      // Set initial state immediately to show UI feedback
      setCurrentSimulation(simulationId);
      setIsRunning(true);
      setRoundTimeLeft(roundDuration);
      
      console.log(`✅ Successfully started simulation ${simulationId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to run simulation:', error);
      throw error;
    }
  }, [roundDuration]);

  const stopSimulation = useCallback(async (simulationId) => {
    try {
      await api.post(`/api/Simulations/${simulationId}/stop`);
      await simulationService.leaveSimulation(simulationId);
      return true;
    } catch (error) {
      console.error('Failed to stop simulation:', error);
      throw error;
    }
  }, []);

  const getSimulationStatus = useCallback(async (simulationId) => {
    try {
      console.log('🔍 Getting simulation status for:', simulationId);
      const status = await api.get(`/api/Simulations/${simulationId}/status`);
      console.log('📊 Simulation status response:', status);
      
      // Update local state with server state
      setIsRunning(status.isRunning);
      if (status.currentRound) {
        console.log('🎯 Setting current round from status:', status.currentRound);
        setCurrentRound({
          id: status.currentRound.Id,
          number: status.currentRound.RoundNumber,
          simulationId: simulationId
        });
      }
      setRoundDuration(status.roundDuration || 30);
      
      // If simulation is running, start the timer
      if (status.isRunning) {
        console.log('⏰ Simulation is running, setting timer');
        setCurrentSimulation(simulationId);
        setRoundTimeLeft(status.roundDuration || 30);
      }
      
      return status;
    } catch (error) {
      console.error('Failed to get simulation status:', error);
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
