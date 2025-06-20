'use client';

import { useState, useEffect } from 'react';
import { api } from '@CASUSGROEP1/utils/api';
import { AlertTriangle, Clock, TrendingDown, CheckCircle } from 'lucide-react';

export default function PlannerWarnings({ compact = false }) {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await api.get('/api/ProcessMining/delivery-predictions');
        setPredictions(response);
      } catch (error) {
        console.error('Error fetching delivery predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchPredictions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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

  const getSeverityIcon = (severity) => {
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
            {predictions.delayedOrders} delayed, {predictions.atRiskOrders} at risk
          </span>
        </div>
        
        {highPriorityWarnings.slice(0, 3).map((warning, index) => (
          <div key={index} className={`p-2 rounded border ${getSeverityColor(warning.severity)}`}>
            <div className="flex items-center space-x-2">
              {getSeverityIcon(warning.severity)}
              <div className="text-xs">
                <div className="font-medium">Order {warning.caseId}</div>
                <div className="text-gray-600 dark:text-gray-400">
                  Levertijd wordt later - {warning.orderAge.toFixed(1)} dagen
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{predictions.totalOngoingOrders}</div>
          <div className="text-sm text-blue-500">Ongoing Orders</div>
        </div>
        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{predictions.delayedOrders}</div>
          <div className="text-sm text-red-500">Delayed Orders</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{predictions.atRiskOrders}</div>
          <div className="text-sm text-yellow-500">At Risk Orders</div>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {predictions.averageDeliveryTime ? predictions.averageDeliveryTime.toFixed(1) : 'N/A'}
          </div>
          <div className="text-sm text-green-500">Avg Delivery (days)</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-lg">Active Delivery Warnings</h4>
        {predictions.warnings.map((warning, index) => (
          <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(warning.severity)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {getSeverityIcon(warning.severity)}
                <div>
                  <div className="font-semibold">{warning.type}</div>
                  <div className="text-sm opacity-75 mb-2">{warning.message}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div>Last Activity: {warning.lastActivity}</div>
                    <div>Order Age: {warning.orderAge.toFixed(1)} days | Expected: {warning.expectedDelivery.toFixed(1)} days</div>
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
    </div>
  );
}
