'use client';

import React, { useState } from 'react';
import Card from '@CASUSGROEP1/components/Card';
import { api } from '@CASUSGROEP1/utils/api';
import { Clock, MapPin, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const CaseJourneyAnalyzer = () => {
  const [caseId, setCaseId] = useState('');
  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchCaseJourney = async () => {
    if (!caseId.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/api/ProcessMining/case-journey?caseId=${encodeURIComponent(caseId)}`);
      setJourneyData(response);
    } catch (err) {
      setError('Failed to fetch case journey data');
      console.error('Error fetching case journey:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (step) => {
    if (step.toLowerCase().includes('created')) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (step.toLowerCase().includes('failed') || step.toLowerCase().includes('error')) 
      return <XCircle className="h-4 w-4 text-red-600" />;
    if (step.toLowerCase().includes('waiting') || step.toLowerCase().includes('pending')) 
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <MapPin className="h-4 w-4 text-blue-600" />;
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${(duration / 60000).toFixed(1)}m`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card title="Case Journey Analysis" className="border-blue-200 dark:border-blue-800">
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter Case ID (e.g., Order-1, Simulation_123)"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchCaseJourney()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white bg-white text-gray-900"
            />
          </div>
          <button
            onClick={searchCaseJourney}
            disabled={loading || !caseId.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Search className="h-4 w-4" />
            <span>{loading ? 'Searching...' : 'Search'}</span>
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="text-red-600 dark:text-red-400">{error}</div>
          </div>
        )}
      </Card>

      {/* Journey Results */}
      {journeyData && journeyData.caseJourneys && journeyData.caseJourneys.length > 0 && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="flex flex-col">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Cases</div>
              </div>
              <div className="text-3xl font-bold mt-1">{journeyData.totalCases}</div>
            </Card>
            
            <Card className="flex flex-col">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Avg Steps</div>
              </div>
              <div className="text-3xl font-bold mt-1">
                {journeyData.journeySummary?.averageJourneySteps?.toFixed(1) || 0}
              </div>
            </Card>
            
            <Card className="flex flex-col">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Successful</div>
              </div>
              <div className="text-3xl font-bold mt-1 text-green-600">
                {journeyData.journeySummary?.successfulJourneys || 0}
              </div>
            </Card>
            
            <Card className="flex flex-col">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Problematic</div>
              </div>
              <div className="text-3xl font-bold mt-1 text-red-600">
                {journeyData.journeySummary?.problematicJourneys || 0}
              </div>
            </Card>
          </div>

          {/* Journey Details */}
          {journeyData.caseJourneys.map((journey, journeyIndex) => (
            <Card key={journeyIndex} title={`Case Journey: ${journey.caseId}`}>
              <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{journey.totalSteps}</div>
                  <div className="text-sm text-blue-500">Total Steps</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {(journey.totalDuration / 60).toFixed(1)}
                  </div>
                  <div className="text-sm text-purple-500">Duration (min)</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${
                  journey.isSuccessful 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className={`text-lg font-bold ${
                    journey.isSuccessful ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {journey.isSuccessful ? 'Success' : 'Failed'}
                  </div>
                  <div className={`text-sm ${
                    journey.isSuccessful ? 'text-green-500' : 'text-red-500'
                  }`}>
                    Status
                  </div>
                </div>
                <div className={`text-center p-3 rounded-lg ${
                  journey.hasRework 
                    ? 'bg-yellow-50 dark:bg-yellow-900/20' 
                    : 'bg-green-50 dark:bg-green-900/20'
                }`}>
                  <div className={`text-lg font-bold ${
                    journey.hasRework ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {journey.hasRework ? 'Yes' : 'No'}
                  </div>
                  <div className={`text-sm ${
                    journey.hasRework ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    Rework
                  </div>
                </div>
              </div>

              {/* Journey Timeline */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Journey Timeline</h4>
                <div className="relative">
                  {journey.journey?.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start space-x-4 pb-4">
                      {/* Timeline Line */}
                      {stepIndex < journey.journey.length - 1 && (
                        <div className="absolute left-6 top-8 w-0.5 h-12 bg-gray-300 dark:bg-gray-600"></div>
                      )}
                      
                      {/* Step Icon */}
                      <div className="flex-shrink-0 w-12 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full">
                        {getStepIcon(step.step)}
                      </div>
                      
                      {/* Step Details */}
                      <div className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {step.step}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Resource: {step.resource}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {formatTimestamp(step.timestamp)}
                            </div>
                          </div>
                          <div className="text-right">
                            {step.duration && (
                              <div className="text-sm font-medium text-blue-600">
                                {formatDuration(step.duration)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}

          {/* Common Issues */}
          {journeyData.journeySummary?.mostCommonIssues && journeyData.journeySummary.mostCommonIssues.length > 0 && (
            <Card title="Most Common Issues">
              <div className="space-y-2">
                {journeyData.journeySummary.mostCommonIssues.map((issue, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-medium">{issue.issue}</div>
                    <div className="text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                      {issue.count} cases
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* No Results */}
      {journeyData && (!journeyData.caseJourneys || journeyData.caseJourneys.length === 0) && (
        <Card>
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 dark:text-gray-400">No journey data found for case ID: {caseId}</div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CaseJourneyAnalyzer;
