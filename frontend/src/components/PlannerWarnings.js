'use client';

import { useState, useEffect } from 'react';
import { api } from '@CASUSGROEP1/utils/api';
import { AlertTriangle, Clock, TrendingDown, CheckCircle, ChevronDown, ChevronRight, XCircle } from 'lucide-react';
import { useSimulation } from '@CASUSGROEP1/contexts/SimulationContext';

export default function PlannerWarnings({ compact = false }) {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWarnings, setShowWarnings] = useState(false); // Default to hidden
  const { currentRound, isRunning } = useSimulation();

  const fetchPredictions = async () => {
    try {
      const response = await api.get('/api/ProcessMining/delivery-predictions');
      console.log('🔍 Delivery predictions response:', response);
      if (response.warnings && response.warnings.length > 0) {
        console.log('🔍 First warning object:', response.warnings[0]);
      }
      setPredictions(response);
    } catch (error) {
      console.error('Error fetching delivery predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  // Refetch when round changes
  useEffect(() => {
    if (currentRound) {
      console.log('🔄 Round changed, refetching delivery predictions for round:', currentRound.number);
      fetchPredictions();
    }
  }, [currentRound?.number]); // Only trigger when round number changes

  // Also refetch when simulation starts/stops
  useEffect(() => {
    if (isRunning !== null) { // Only refetch after initial load
      console.log('🔄 Simulation state changed, refetching delivery predictions. Running:', isRunning);
      fetchPredictions();
    }
  }, [isRunning]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!predictions || !predictions.warnings || predictions.warnings.length === 0) {
    return compact ? (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">All deliveries on track</span>
      </div>
    ) : (
      <div className="text-center p-4 text-green-600">
        <CheckCircle className="h-8 w-8 mx-auto mb-2" />
        <div className="font-medium">All deliveries on track</div>
        <div className="text-sm opacity-75">No delivery delays detected</div>
      </div>
    );
  }

  const getSeverityIcon = (severity, warningType) => {
    // Special icon for rejected orders
    if (warningType === 'Rejected Order') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    switch (severity) {
      case 'High': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'Medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <TrendingDown className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'Medium': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      default: return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
    }
  };

  if (compact) {
    const highPriorityWarnings = predictions.warnings.filter(w => w.severity === 'High');
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Delivery Warnings</span>
          <span className="text-xs text-gray-500">
            {predictions.delayedOrders} delayed, {predictions.atRiskOrders} at risk, {predictions.rejectedOrders || 0} rejected
          </span>
        </div>
        
        {highPriorityWarnings.slice(0, 3).map((warning, index) => (
          <div key={index} className={`p-2 rounded border ${getSeverityColor(warning.severity)}`}>
            <div className="flex items-center space-x-2">
              {getSeverityIcon(warning.severity, warning.type)}
              <div className="text-xs">
                <div className="font-medium">Order {warning.caseId}</div>
                <div className="text-gray-600 dark:text-gray-400">
                  {warning.roundsDelay !== undefined && warning.roundsDelay > 0 ? 
                    `${warning.roundsDelay} rounds overdue - Expected completion within 3 rounds` :
                    `${warning.orderRoundAge > 0 ? `${warning.orderRoundAge} rounds have passed` : `${warning.orderAge.toFixed(1)} days old`} - Expected completion within 3 rounds`
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {predictions.warnings.length > 3 && (
          <div className="text-xs text-center text-gray-500">
            +{predictions.warnings.length - 3} more warnings
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{predictions.totalOngoingOrders}</div>
          <div className="text-sm text-blue-500">Ongoing Orders</div>
        </div>
        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{predictions.delayedOrders}</div>
          <div className="text-sm text-red-500">Delayed Orders (3+ Rounds)</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{predictions.atRiskOrders}</div>
          <div className="text-sm text-yellow-500">At Risk Orders</div>
        </div>
        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{predictions.rejectedOrders || 0}</div>
          <div className="text-sm text-orange-500">Rejected Orders</div>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {predictions.averageDeliveryRounds ? predictions.averageDeliveryRounds.toFixed(1) : '3.0'}
          </div>
          <div className="text-sm text-green-500">Avg Delivery (rounds)</div>
        </div>
      </div>

      <div className="space-y-3">
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
          onClick={() => setShowWarnings(!showWarnings)}
        >
          <h4 className="font-semibold text-lg flex items-center space-x-2">
            {showWarnings ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
            <span>Active Delivery Warnings</span>
          </h4>
          <span className="text-xl font-bold text-red-600 dark:text-red-200 animate-pulse">
            {predictions.warnings.length} warning{predictions.warnings.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {showWarnings && (
          <div className="space-y-3">
            {predictions.warnings.map((warning, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(warning.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getSeverityIcon(warning.severity, warning.type)}
                    <div>
                      <div className="font-semibold">{warning.type}</div>
                      <div className="text-sm opacity-75 mb-2">{warning.message}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div>Last Activity: {warning.lastActivity}</div>
                        <div>Order Age: {warning.orderRoundAge > 0 ? `${warning.orderRoundAge} rounds have passed` : `${warning.orderAge.toFixed(1)} days old`} | Expected: completion within {warning.expectedDelivery.toFixed(0)} rounds</div>
                        {warning.roundsDelay !== undefined && warning.roundsDelay > 0 && (
                          <div className="text-red-600 font-medium">
                            <span>Rounds Overdue: {warning.roundsDelay} rounds past expected completion (Expected by Round {warning.expectedDeliveryRound})</span>
                          </div>
                        )}
                        <div className="font-medium text-blue-600">Action: {warning.recommendedAction}</div>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    warning.severity === 'High' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : warning.severity === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {warning.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
