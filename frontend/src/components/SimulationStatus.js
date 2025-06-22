'use client';

import { useEffect, useState } from 'react';
import { useSimulation } from '@CASUSGROEP1/contexts/SimulationContext';
import { Play, Square, Clock, Wifi, WifiOff, Timer, Hash } from 'lucide-react';

export default function SimulationStatus() {
  const {
    currentSimulation,
    currentRound,
    isRunning,
    isConnected,
    roundTimeLeft,
    roundDuration,
    formatTimeLeft,
    connectToSignalR,
    getSimulationStatus,
    stopSimulation
  } = useSimulation();

  const [localTimeLeft, setLocalTimeLeft] = useState(0);

  // Sync local timer with context
  useEffect(() => {
    setLocalTimeLeft(roundTimeLeft);
  }, [roundTimeLeft]);

  // Reset local timer when simulation stops
  useEffect(() => {
    if (!isRunning) {
      setLocalTimeLeft(0);
    }
  }, [isRunning]);

  // Local countdown timer for smoother updates
  useEffect(() => {
    let timer;
    if (isRunning && localTimeLeft > 0) {
      timer = setInterval(() => {
        setLocalTimeLeft(prev => {
          if (prev <= 1) {
            return roundDuration; // Reset to full duration when timer hits 0
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, localTimeLeft, roundDuration]);

  const handleStopSimulation = async () => {
    if (currentSimulation) {
      try {
        await stopSimulation(currentSimulation);
      } catch (error) {
        console.error('Failed to stop simulation from status bar:', error);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-connect to SignalR when component mounts
  useEffect(() => {
    connectToSignalR();
  }, [connectToSignalR]);

  // Check simulation status on mount if we have a running simulation
  useEffect(() => {
    if (currentSimulation && !currentRound) {
      console.log('🔍 Checking simulation status on mount for simulation:', currentSimulation);
      getSimulationStatus(currentSimulation).catch(console.error);
    }
  }, [currentSimulation, currentRound, getSimulationStatus]);

  // Debug logging
  useEffect(() => {
    console.log('🎮 SimulationStatus state:', {
      currentSimulation,
      currentRound,
      isRunning,
      isConnected,
      roundTimeLeft,
      localTimeLeft,
      roundDuration
    });
  }, [currentSimulation, currentRound, isRunning, isConnected, roundTimeLeft, localTimeLeft, roundDuration]);

  if (!isRunning || !currentSimulation) {
    return (
      <div className="flex items-center space-x-2 text-sm text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center space-x-1">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="hidden sm:inline">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
      {/* Connection Status */}
      <div className="flex items-center">
        {isConnected ? (
          <Wifi className="h-4 w-4 text-green-500" title="Connected" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" title="Disconnected" />
        )}
      </div>

      {/* Simulation Info */}
      <div className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-800/50 px-2 py-1 rounded">
        <Play className="h-3 w-3 text-blue-600" />
        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
          Sim #{currentSimulation}
        </span>
      </div>

      {/* Current Round - Always show even if currentRound is null */}
      <div className="flex items-center space-x-1 bg-indigo-100 dark:bg-indigo-800/50 px-2 py-1 rounded">
        <Hash className="h-3 w-3 text-indigo-600" />
        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          {currentRound ? `Round ${currentRound.number}` : 'Starting...'}
        </span>
      </div>

      {/* Countdown Timer */}
      <div className="flex items-center space-x-1 bg-orange-100 dark:bg-orange-800/50 px-2 py-1 rounded">
        <Timer className="h-3 w-3 text-orange-600" />
        <span className="text-xs font-mono font-semibold text-orange-700 dark:text-orange-300">
          {formatTime(localTimeLeft)}
        </span>
      </div>

      {/* Live Indicator */}
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-green-600 dark:text-green-400 font-medium hidden sm:inline">
          LIVE
        </span>
      </div>

      {/* Stop Button */}
      <button
        onClick={handleStopSimulation}
        className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors border border-red-200 dark:border-red-700"
        title="Stop Simulation"
      >
        <Square className="h-3 w-3" />
        <span className="hidden sm:inline font-medium">STOP</span>
      </button>
    </div>
  );
}
