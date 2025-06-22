'use client';

import { useState, useEffect } from 'react';
import Card from '@CASUSGROEP1/components/Card';
import { api } from '@CASUSGROEP1/utils/api';
import { useSimulation } from '@CASUSGROEP1/contexts/SimulationContext';
import { Plus, Calendar, Play, Trash2, Square, Loader2 } from 'lucide-react';

export default function SimulationsPage() {
  const [simulations, setSimulations] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const { runSimulation, stopSimulation, currentSimulation, currentRound, isRunning } = useSimulation();

  // Fetch simulations on component mount
  useEffect(() => {
    fetchSimulations();
  }, []);

  const fetchSimulations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/api/Simulations');
      setSimulations(data);
    } catch (error) {
      console.error('Error fetching simulations:', error);
      setError('Failed to load simulations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSimulation = async (simulationData) => {
    try {
      const newSimulation = await api.post('/api/Simulations', simulationData);
      setSimulations([...simulations, newSimulation]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating simulation:', error);
      throw error;
    }
  };

  const handleDeleteSimulation = async (simulationId) => {
    if (!confirm('Are you sure you want to delete this simulation?')) {
      return;
    }

    try {
      // Stop simulation if it's running
      if (currentSimulation === simulationId && isRunning) {
        await stopSimulation(simulationId);
      }
      
      await api.delete(`/api/Simulations/${simulationId}`);
      setSimulations(simulations.filter(sim => sim.id !== simulationId));
    } catch (error) {
      console.error('Error deleting simulation:', error);
      alert('Failed to delete simulation');
    }
  };

  const handleRunSimulation = async (simulationId) => {
    setActionLoading(prev => ({ ...prev, [simulationId]: 'running' }));
    try {
      await runSimulation(simulationId);
    } catch (error) {
      console.error('Error running simulation:', error);
      alert('Failed to start simulation');
    } finally {
      setActionLoading(prev => ({ ...prev, [simulationId]: null }));
    }
  };

  const handleStopSimulation = async (simulationId) => {
    setActionLoading(prev => ({ ...prev, [simulationId]: 'stopping' }));
    try {
      await stopSimulation(simulationId);
    } catch (error) {
      console.error('Error stopping simulation:', error);
      alert('Failed to stop simulation');
    } finally {
      setActionLoading(prev => ({ ...prev, [simulationId]: null }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Simulations</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage and create process simulations</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-zinc-500">Loading simulations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Simulations</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage and create process simulations</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Simulation
        </button>
      </div>

      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <div className="text-red-600 dark:text-red-400">{error}</div>
        </Card>
      )}

      {/* Create Simulation Form */}
      {showCreateForm && (
        <CreateSimulationForm
          onSubmit={handleCreateSimulation}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Simulations List */}
      <Card title="Your Simulations">
        {simulations.length === 0 ? (
          <div className="text-center py-12">
            <Play className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              No simulations yet
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              Get started by creating your first simulation
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Simulation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">ID</th>
                  <th scope="col" className="px-6 py-3 text-left">Name</th>
                  <th scope="col" className="px-6 py-3 text-left">Date Created</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {simulations.map((simulation) => (
                  <tr key={simulation.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-6 py-4 whitespace-nowrap">#{simulation.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{simulation.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(simulation.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        {currentSimulation === simulation.id && isRunning ? (
                          <div className="flex items-center space-x-2">
                            {currentRound && (
                              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md">
                                Round {currentRound.number}
                              </span>
                            )}
                            <button
                              onClick={() => handleStopSimulation(simulation.id)}
                              disabled={actionLoading[simulation.id] === 'stopping'}
                              className="inline-flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {actionLoading[simulation.id] === 'stopping' ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Square className="h-3 w-3 mr-1" />
                              )}
                              Stop
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRunSimulation(simulation.id)}
                            disabled={actionLoading[simulation.id] === 'running' || (isRunning && currentSimulation !== simulation.id)}
                            className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionLoading[simulation.id] === 'running' ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Play className="h-3 w-3 mr-1" />
                            )}
                            Run
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteSimulation(simulation.id)}
                          disabled={currentSimulation === simulation.id && isRunning}
                          className="inline-flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// Create Simulation Form Component
function CreateSimulationForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().slice(0, 16) // Default to current date/time
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validate form
    if (!formData.name.trim()) {
      setError('Simulation name is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const simulationData = {
        name: formData.name.trim(),
        date: new Date(formData.date).toISOString()
      };
      
      await onSubmit(simulationData);
    } catch (error) {
      setError(error.message || 'Failed to create simulation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card title="Create New Simulation" className="border-blue-200 dark:border-blue-800">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Simulation Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter simulation name"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Date & Time
          </label>
          <input
            type="datetime-local"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Simulation'}
          </button>
        </div>
      </form>
    </Card>
  );
}
