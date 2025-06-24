"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { tokenService } from "../utils/auth";
import LogoutButton from "./LogoutButton";
import { useSimulation } from "@CASUSGROEP1/contexts/SimulationContext";
import { Play, Square, Hash, Timer, Wifi, WifiOff } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // Get simulation context
  const {
    currentSimulation,
    currentRound,
    isRunning,
    isConnected,
    roundTimeLeft,
    stopSimulation,
    connectToSignalR
  } = useSimulation();

  // Debug logging
  useEffect(() => {
    console.log('🎮 Header - Simulation state:', {
      currentSimulation,
      currentRound,
      isRunning,
      isConnected,
      roundTimeLeft
    });
  }, [currentSimulation, currentRound, isRunning, isConnected, roundTimeLeft]);

  useEffect(() => {
    // Get user data from localStorage
    const userData = tokenService.getUserData();
    const token = tokenService.getToken();
    
    if (token && userData) {
      setUser(userData);
    }
  }, []);

  // Auto-connect to SignalR when component mounts
  useEffect(() => {
    connectToSignalR();
  }, [connectToSignalR]);

  const getUserInitials = (name) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopSimulation = async () => {
    if (currentSimulation) {
      try {
        await stopSimulation(currentSimulation);
      } catch (error) {
        console.error('Failed to stop simulation from header:', error);
      }
    }
  };

  return (
    <header className="w-full z-10 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-800 dark:to-pink-800">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6 lg:ml-60">
        {/* Mobile: Logo and menu */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-white/80 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <Link
            href="/dashboard"
            className="ml-3 text-xl font-bold text-white lg:hidden"
          >
            ERPNumber1
          </Link>
          
          {/* Mobile simulation status indicator (compact) */}
          {isRunning && currentSimulation && (
            <div className="ml-auto mr-2 lg:hidden flex items-center space-x-1 bg-white/10 px-2 py-1 rounded">
              <Hash className="h-3 w-3 text-purple-200" />
              <span className="text-xs font-semibold text-white">
                {currentRound ? currentRound.number : '...'}
              </span>
              <Timer className="h-3 w-3 text-orange-200" />
              <span className="text-xs font-mono text-white">
                {formatTime(roundTimeLeft)}
              </span>
            </div>
          )}
        </div>

        {/* Center: Simulation Status - Only show when running */}
        {isRunning && currentSimulation && (
          <div className="hidden lg:flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
            {/* Connection Status */}
            <div className="flex items-center">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-300" title="Connected" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-300" title="Disconnected" />
              )}
            </div>

            {/* Simulation Info */}
            <div className="flex items-center space-x-1 bg-blue-500/30 px-2 py-1 rounded">
              <Play className="h-3 w-3 text-blue-200" />
              <span className="text-xs font-semibold text-white">
                Sim #{currentSimulation}
              </span>
            </div>

            {/* Current Round */}
            <div className="flex items-center space-x-1 bg-purple-500/30 px-2 py-1 rounded">
              <Hash className="h-3 w-3 text-purple-200" />
              <span className="text-xs font-semibold text-white">
                {currentRound ? `Round ${currentRound.number}` : 'Starting...'}
              </span>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center space-x-1 bg-orange-500/30 px-2 py-1 rounded">
              <Timer className="h-3 w-3 text-orange-200" />
              <span className="text-xs font-mono font-semibold text-white">
                {formatTime(roundTimeLeft)}
              </span>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-200 font-medium">
                LIVE
              </span>
            </div>

            {/* Stop Button */}
            <button
              onClick={handleStopSimulation}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-500/30 text-red-200 rounded hover:bg-red-500/50 transition-colors border border-red-400/30"
              title="Stop Simulation"
            >
              <Square className="h-3 w-3" />
              <span className="font-medium">STOP</span>
            </button>
          </div>
        )}

        {/* Right: User info */}
        <div className="flex items-center gap-4 ml-auto">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-700 dark:bg-pink-700 flex items-center justify-center text-sm font-bold text-white">
                  {getUserInitials(user.name)}
                </div>
                <div className="hidden md:block">
                  <span className="text-sm font-semibold text-white">
                    {user.name}
                  </span>
                  <div className="text-xs text-purple-200 capitalize">
                    {user.role}
                  </div>
                </div>
              </div>
              <LogoutButton className="text-sm py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" />
            </>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm bg-white hover:bg-gray-100 text-purple-600 rounded-lg transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors font-medium"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-800 dark:to-pink-800">
          <nav className="px-4 py-4 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-2 text-sm text-purple-100 mb-3">
                  Welcome, <span className="font-medium text-white">{user.name}</span> 
                  <span className="block text-xs text-purple-200 capitalize">({user.role})</span>
                </div>
                
                {/* Mobile Simulation Status */}
                {isRunning && currentSimulation && (
                  <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {isConnected ? (
                            <Wifi className="h-4 w-4 text-green-300" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-red-300" />
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Play className="h-3 w-3 text-blue-200" />
                          <span className="text-xs font-semibold text-white">
                            Simulation #{currentSimulation}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleStopSimulation}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-500/30 text-red-200 rounded hover:bg-red-500/50 transition-colors"
                        title="Stop Simulation"
                      >
                        <Square className="h-3 w-3" />
                        <span>STOP</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <Hash className="h-3 w-3 text-purple-200" />
                        <span className="text-white">
                          {currentRound ? `Round ${currentRound.number}` : 'Starting...'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Timer className="h-3 w-3 text-orange-200" />
                        <span className="font-mono text-white">
                          {formatTime(roundTimeLeft)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {["dashboard", "orders", "customers", "products", "settings"].map(
                  (route) => (
                    <Link
                      key={route}
                      href={`/dashboard/${route === "dashboard" ? "" : route}`}
                      className="block px-4 py-3 rounded-lg text-base font-medium transition-colors bg-purple-500 hover:bg-purple-400 text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {route.charAt(0).toUpperCase() + route.slice(1)}
                    </Link>
                  )
                )}
                <div className="px-3 py-2 pt-4">
                  <LogoutButton className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors" />
                </div>
              </>
            ) : (
              <div className="space-y-3 px-3">
                <Link
                  href="/login"
                  className="block w-full text-center px-4 py-3 bg-white hover:bg-gray-100 text-purple-600 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block w-full text-center px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}