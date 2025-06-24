'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { simulationService } from '@CASUSGROEP1/utils/simulationService';
import { api } from '@CASUSGROEP1/utils/api';

const SimulationContext = createContext();

    const unsubscribeStarted = simulationService.onSimulationStarted((data) => {
      console.log('🎮 Simulation started:', data.simulationId);
      setCurrentSimulation(data.simulationId);
      setIsRunning(true);
      setRoundDuration(data.roundDuration || 20);
      setRoundTimeLeft(data.roundDuration || 20);
      
      // Persist the simulation state (without round info initially)
      persistSimulationState({
        simulationId: data.simulationId,
        roundDuration: data.roundDuration || 20
      });
    });

    const unsubscribeStopped = simulationService.onSimulationStopped((data) => {
      console.log('🎮 Simulation stopped:', data.simulationId);
      // Clear all simulation state
      setCurrentSimulation(null);
      setCurrentRound(null);
      setIsRunning(false);
      setRoundTimeLeft(0);
      
      // Clear persisted state
      clearPersistedState();
    });

export function SimulationProvider({ children }) {
  const [currentSimulation, setCurrentSimulation] = useState(null);
  const [currentRound, setCurrentRound] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [roundTimeLeft, setRoundTimeLeft] = useState(0);
  const [roundDuration, setRoundDuration] = useState(20);
  const [serverTimerActive, setServerTimerActive] = useState(false);

  // Persist simulation state to localStorage
  const persistSimulationState = useCallback((simulationData) => {
    try {
      const stateToSave = {
        simulationId: simulationData.simulationId,
        timestamp: Date.now(),
        roundDuration: simulationData.roundDuration || roundDuration,
        currentRound: simulationData.currentRound || currentRound
      };
      localStorage.setItem('simulationState', JSON.stringify(stateToSave));
      console.log('💾 Simulation state persisted:', stateToSave);
    } catch (error) {
      console.warn('Failed to persist simulation state:', error);
    }
  }, [roundDuration, currentRound]);

  // Clear persisted state when simulation stops
  const clearPersistedState = useCallback(() => {
    try {
      localStorage.removeItem('simulationState');
      console.log('🗑️ Cleared persisted simulation state');
    } catch (error) {
      console.warn('Failed to clear persisted state:', error);
    }
  }, []);

  const getSimulationStatus = useCallback(async (simulationId) => {
    try {
      const status = await api.get(`/api/Simulations/${simulationId}/status`);
      console.log('📊 Simulation status received:', {
        simulationId,
        isRunning: status.isRunning,
        currentRound: status.currentRound,
        timeLeft: status.timeLeft,
        roundDuration: status.roundDuration
      });
      
      // Update local state with server state
      setIsRunning(status.isRunning);
      
      // Handle current round information - be more conservative about clearing it
      if (status.currentRound) {
        console.log('🎯 Setting current round from server:', status.currentRound);
        const roundInfo = {
          id: status.currentRound.Id,
          number: status.currentRound.RoundNumber,
          simulationId: simulationId
        };
        setCurrentRound(roundInfo);
        
        // Immediately persist this round info
        persistSimulationState({
          simulationId,
          roundDuration: status.roundDuration || 20,
          currentRound: roundInfo
        });
      } else {
        console.log('⚠️ No current round in server status response');
        // Don't clear the round unless we're absolutely sure the simulation stopped
        if (!status.isRunning) {
          console.log('🛑 Simulation stopped, clearing round');
          setCurrentRound(null);
        } else {
          console.log('⏳ Simulation running but no round in response - keeping existing round if any');
          // Keep the existing round - don't clear it
        }
      }
      
      setRoundDuration(status.roundDuration || 20);
      
      // If simulation is running, start the timer and ensure we're in the SignalR group
      if (status.isRunning) {
        setCurrentSimulation(simulationId);
        // Use server's time left if available and reasonable
        if (status.timeLeft !== undefined && status.timeLeft > 0) {
          setRoundTimeLeft(status.timeLeft);
          console.log(`⏱️ Set timer to ${status.timeLeft}s from server status`);
        } else if (status.currentRound && status.timeLeft === 0) {
          // Don't immediately set to 0 if we have a current round - wait for timer sync
          console.log(`⏳ Current round exists but timeLeft is 0, keeping existing timer until sync`);
        } else {
          // No current round, safe to set to default duration or 0
          setRoundTimeLeft(status.roundDuration || 20);
          console.log(`⏱️ Set timer to default duration: ${status.roundDuration || 20}s`);
        }
        
        // Ensure we're connected to SignalR and joined to the simulation group
        if (simulationService.isConnected()) {
          await simulationService.joinSimulation(simulationId);
        }
      }
      
      return status;
    } catch (error) {
      console.error('❌ Failed to get simulation status:', error);
      throw error;
    }
  }, []);

  // Restore simulation state from localStorage and server
  const restoreSimulationState = useCallback(async () => {
    try {
      const savedState = localStorage.getItem('simulationState');
      if (!savedState) {
        console.log('📝 No saved simulation state found');
        return;
      }

      const parsedState = JSON.parse(savedState);
      const timeSinceLastSave = Date.now() - parsedState.timestamp;
      
      // Only try to restore if the saved state is less than 10 minutes old
      if (timeSinceLastSave > 10 * 60 * 1000) {
        console.log('📝 Saved simulation state is too old, clearing...');
        localStorage.removeItem('simulationState');
        return;
      }

      console.log('🔄 Attempting to restore simulation state:', parsedState);
      
      // Check if the simulation is still running on the server
      const status = await getSimulationStatus(parsedState.simulationId);
      
      if (status.isRunning) {
        console.log('✅ Active simulation found, restoring state and rejoining SignalR group');
        
        // FIRST: Restore round information from saved state (more reliable than server)
        if (parsedState.currentRound) {
          console.log('🎯 Restoring round from saved state:', parsedState.currentRound);
          setCurrentRound(parsedState.currentRound);
        }
        
        // Rejoin the SignalR group first
        await simulationService.joinSimulation(parsedState.simulationId);
        
        // Set current simulation
        setCurrentSimulation(parsedState.simulationId);
        
        // Handle timer restoration with smart logic
        if (status.timeLeft !== undefined && status.timeLeft > 0) {
          setRoundTimeLeft(status.timeLeft);
          console.log(`🕒 Restored timer with ${status.timeLeft} seconds remaining`);
        } else if (parsedState.currentRound || status.currentRound) {
          // If we have a round (from saved state or server) but timeLeft is 0
          console.log(`⏳ Round exists but timeLeft is ${status.timeLeft}, waiting for timer sync...`);
          // Keep existing timer value until sync arrives
        } else {
          console.log(`⏳ No current round and timeLeft is ${status.timeLeft}`);
          setRoundTimeLeft(0);
        }
        
        // If no current round but simulation is running, we're probably between rounds
        // Keep the UI in a "waiting for next round" state
        if (!status.currentRound && status.isRunning) {
          console.log('⏳ Simulation running but no current round - checking saved state');
          // Try to restore round from saved state as fallback
          if (parsedState.currentRound) {
            console.log('🔄 Restoring round from saved state:', parsedState.currentRound);
            setCurrentRound(parsedState.currentRound);
          } else {
            console.log('⏳ No saved round either - likely between rounds');
            setRoundTimeLeft(0); // No timer during transition
          }
        }
        
        // Update round duration if we have it saved
        if (parsedState.roundDuration) {
          setRoundDuration(parsedState.roundDuration);
        }
        
        // Fallback: If we still have 0 time after a brief delay, request another sync
        setTimeout(() => {
          // Use a closure to capture current values since state might change
          if (simulationService.isConnected()) {
            simulationService.connection?.invoke('RequestTimerSync', parsedState.simulationId.toString())
              .then(() => console.log('🔄 Sent fallback timer sync request'))
              .catch(err => console.warn('Fallback timer sync failed:', err));
          }
        }, 500);
        
        // Additional fallback: If timer is still 0 after 2 seconds and we have a current round, try again
        setTimeout(() => {
          if (simulationService.isConnected()) {
            console.log('🚨 Sending emergency timer sync request...');
            simulationService.connection?.invoke('RequestTimerSync', parsedState.simulationId.toString())
              .then(() => console.log('🚨 Sent emergency timer sync request'))
              .catch(err => console.warn('Emergency timer sync failed:', err));
          }
        }, 2000);
        
        console.log('🎮 Successfully restored simulation state');
      } else {
        console.log('🛑 Simulation is no longer running, clearing saved state');
        localStorage.removeItem('simulationState');
      }
    } catch (error) {
      console.error('❌ Failed to restore simulation state:', error);
      // Clear invalid saved state
      localStorage.removeItem('simulationState');
    }
  }, [getSimulationStatus]);

  // Auto-connect to SignalR and restore simulation state when provider mounts
  useEffect(() => {
    console.log('🔌 Auto-connecting to SignalR on provider mount...');
    const autoConnectAndRestore = async () => {
      try {
        const connected = await simulationService.connect();
        setIsConnected(connected);
        console.log('✅ Auto-connection result:', connected);
        
        if (connected) {
          // Try to restore simulation state from localStorage
          await restoreSimulationState();
        }
      } catch (error) {
        console.error('❌ Auto-connection failed:', error);
        setIsConnected(false);
      }
    };
    autoConnectAndRestore();
  }, []);

  // Timer for countdown - now only used as fallback
  useEffect(() => {
    let timer;
    // Only use local timer if we haven't received a server update in the last 3 seconds
    if (isRunning && roundTimeLeft > 0 && !serverTimerActive) {
      timer = setInterval(() => {
        setRoundTimeLeft(prev => {
          const newTime = Math.max(0, prev - 1);
          // Only log at important intervals to reduce noise
          if (newTime % 10 === 0 || newTime <= 5) {
            console.log('⏰ Local Timer (fallback):', newTime, 'seconds left');
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
  }, [isRunning, roundTimeLeft, serverTimerActive]);

  // Set up event listeners
  useEffect(() => {
    const unsubscribeStarted = simulationService.onSimulationStarted((data) => {
      console.log('🎮 Simulation started:', data.simulationId);
      setCurrentSimulation(data.simulationId);
      setIsRunning(true);
      setRoundDuration(data.roundDuration || 20);
      setRoundTimeLeft(data.roundDuration || 20);
      
      // Persist the simulation state (without round info initially)
      persistSimulationState({
        simulationId: data.simulationId,
        roundDuration: data.roundDuration || 20
      });
    });

    const unsubscribeStopped = simulationService.onSimulationStopped((data) => {
      console.log('🎮 Simulation stopped:', data.simulationId);
      // Clear all simulation state
      setCurrentSimulation(null);
      setCurrentRound(null);
      setIsRunning(false);
      setRoundTimeLeft(0);
      
      // Clear persisted state
      clearPersistedState();
    });

    const unsubscribeNewRound = simulationService.onNewRound((data) => {
      console.log('🎯 Round', data.roundNumber, 'started');
      const newRoundInfo = {
        id: data.roundId,
        number: data.roundNumber,
        simulationId: data.simulationId
      };
      setCurrentRound(newRoundInfo);
      const newDuration = data.duration || roundDuration;
      setRoundDuration(newDuration);
      setRoundTimeLeft(newDuration); // Start with full duration, server will sync
      setServerTimerActive(false); // Reset until we get server updates
      
      // Persist the updated state with round information
      persistSimulationState({
        simulationId: data.simulationId,
        roundDuration: newDuration,
        currentRound: newRoundInfo
      });
    });

    const unsubscribeConnection = simulationService.onConnectionStateChanged((data) => {
      if (data.state === 'connected' && data.reconnected) {
        console.log('📡 Reconnected to SignalR');
        // Try to restore state and rejoin groups after reconnection
        restoreSimulationState().catch(console.error);
      }
      setIsConnected(data.state === 'connected');
    });

    const unsubscribeTimerUpdate = simulationService.onTimerUpdate((data) => {
      if (data.simulationId === currentSimulation) {
        // Log timer updates for debugging, especially on-demand syncs and significant changes
        if (data.syncType === 'onDemand' || data.timeLeft === 0 || data.timeLeft % 10 === 0 || data.timeLeft <= 5) {
          console.log(`⏰ Timer update: ${data.timeLeft}s (${data.syncType || 'unknown'} sync) for round ${currentRound?.number || 'unknown'}`);
        }
        
        setRoundTimeLeft(data.timeLeft);
        setServerTimerActive(true);
        
        // Reset server timer active flag after 3 seconds of no updates
        setTimeout(() => setServerTimerActive(false), 3000);
      }
    });

    return () => {
      unsubscribeStarted();
      unsubscribeStopped();
      unsubscribeNewRound();
      unsubscribeConnection();
      unsubscribeTimerUpdate();
    };
  }, [roundDuration, persistSimulationState, clearPersistedState, restoreSimulationState, currentSimulation]);

  const runSimulation = useCallback(async (simulationId) => {
    try {
      console.log(`🎮 Starting simulation ${simulationId}`);
      await api.post(`/api/Simulations/${simulationId}/run`);
      
      // Set initial state immediately to show UI feedback
      setCurrentSimulation(simulationId);
      setIsRunning(true);
      setRoundTimeLeft(roundDuration);
      
      // Join the SignalR group for this simulation, but don't request timer sync
      // since we'll get the SimulationStarted event with the correct timing
      if (simulationService.isConnected()) {
        await simulationService.joinSimulation(simulationId, { skipTimerSync: true });
      }
      
      // Persist the simulation state
      persistSimulationState({
        simulationId,
        roundDuration
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to run simulation:', error);
      throw error;
    }
  }, [roundDuration, persistSimulationState]);

  const stopSimulation = useCallback(async (simulationId) => {
    try {
      console.log(`🛑 Stopping simulation ${simulationId}`);
      
      // Clear local state immediately for instant UI feedback
      setCurrentSimulation(null);
      setCurrentRound(null);
      setIsRunning(false);
      setRoundTimeLeft(0);
      
      // Clear persisted state
      clearPersistedState();
      
      await api.post(`/api/Simulations/${simulationId}/stop`);
      return true;
    } catch (error) {
      console.error('❌ Failed to stop simulation:', error);
      // If API call fails, we might want to restore state, but for now keep it cleared
      // since the user intended to stop the simulation
      throw error;
    }
  }, [clearPersistedState]);

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
    },
    
    // Helper for order creation
    getCurrentRoundId: () => currentRound?.id || null,
    
    // Helper for round number
    getCurrentRoundNumber: () => currentRound?.number || 0
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
      roundDuration: 20,
      runSimulation: async () => false,
      stopSimulation: async () => false,
      getSimulationStatus: async () => ({}),
      connectToSignalR: async () => false,
      formatTimeLeft: () => '0:00',
      getCurrentRoundId: () => null,
      getCurrentRoundNumber: () => 0
    };
  }
  return context;
}
