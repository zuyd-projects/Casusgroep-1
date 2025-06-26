'use client';

import React, { useState, useEffect } from 'react';
import Card from '@CASUSGROEP1/components/Card';
import { api } from '@CASUSGROEP1/utils/api';
import { 
  Clock, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  BarChart3,
  Timer,
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
  Zap
} from 'lucide-react';

const DetailedTimingAnalyzer = () => {
  const [caseId, setCaseId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timingData, setTimingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-fetch data on component mount
  useEffect(() => {
    fetchTimingData();
  }, []);

  const fetchTimingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = '/api/ProcessMining/detailed-timing';
      const params = new URLSearchParams();
      
      if (caseId.trim()) params.append('caseId', caseId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      setTimingData(response);
    } catch (err) {
      setError('Failed to fetch detailed timing analysis');
      console.error('Error fetching timing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '0s';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
    return `${(seconds / 86400).toFixed(1)}d`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (status) => {
    if (status === 'Completed') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'Failed' || status === 'Cancelled') return <XCircle className="h-4 w-4 text-red-600" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  };

  const getEfficiencyColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderStageTimeline = (stages) => {
    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Stage-by-Stage Timeline</h4>
        <div className="relative">
          {stages.map((stage, index) => (
            <div key={index} className="flex items-start space-x-4 pb-4">
              {/* Timeline Line */}
              {index < stages.length - 1 && (
                <div className="absolute left-6 top-8 w-0.5 h-16 bg-gray-300 dark:bg-gray-600"></div>
              )}
              
              {/* Stage Icon */}
              <div className={`flex-shrink-0 w-12 h-8 flex items-center justify-center rounded-full border-2 ${
                stage.isBottleneck 
                  ? 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700' 
                  : 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600'
              }`}>
                {stage.isBottleneck ? (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                ) : (
                  getStatusIcon(stage.status)
                )}
              </div>
              
              {/* Stage Details */}
              <div className={`flex-1 min-w-0 rounded-lg p-4 ${
                stage.isBottleneck 
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                  : 'bg-gray-50 dark:bg-gray-800'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="font-medium text-gray-900 dark:text-white">
                        Stage {stage.stageNumber}: {stage.activity}
                      </div>
                      {stage.isBottleneck && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                          Bottleneck
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Resource: {stage.resource}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatTimestamp(stage.startTime)}
                      {stage.endTime && ` → ${formatTimestamp(stage.endTime)}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {formatDuration(stage.durationSeconds)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {stage.percentageOfTotal.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card title="Detailed Process Timing Analysis" className="border-purple-200 dark:border-purple-800">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Case ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Order-1, SupplierOrder_1"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white bg-white text-gray-900"
              />
            </div>
          </div>
          
          <button
            onClick={fetchTimingData}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Search className="h-4 w-4" />
            <span>{loading ? 'Analyzing...' : 'Analyze Timing'}</span>
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="text-red-600 dark:text-red-400">{error}</div>
          </div>
        )}
      </Card>

      {/* Summary Dashboard */}
      {timingData && timingData.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="flex flex-col">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Cases</div>
            </div>
            <div className="text-3xl font-bold mt-1">{timingData.summary.totalCases}</div>
          </Card>
          
          <Card className="flex flex-col">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Avg Duration</div>
            </div>
            <div className="text-3xl font-bold mt-1">
              {formatDuration(timingData.summary.averageProcessDuration)}
            </div>
          </Card>
          
          <Card className="flex flex-col">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Bottlenecks</div>
            </div>
            <div className="text-3xl font-bold mt-1 text-orange-600">
              {timingData.summary.totalBottlenecks}
            </div>
          </Card>
          
          <Card className="flex flex-col">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-green-600" />
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Efficiency</div>
            </div>
            <div className={`text-3xl font-bold mt-1 ${getEfficiencyColor(timingData.summary.processEfficiencyScore)}`}>
              {timingData.summary.processEfficiencyScore.toFixed(1)}%
            </div>
          </Card>
        </div>
      )}

      {/* Fastest vs Slowest Process Comparison */}
      {timingData && timingData.summary && timingData.summary.fastestProcess && timingData.summary.slowestProcess && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="⚡ Fastest Process" className="border-green-200 dark:border-green-800">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {timingData.summary.fastestProcess.caseId}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {timingData.summary.fastestProcess.totalStages} stages
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatDuration(timingData.summary.fastestProcess.totalDurationSeconds)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {timingData.summary.fastestProcess.processEfficiency.toFixed(1)}% efficient
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          <Card title="🐌 Slowest Process" className="border-red-200 dark:border-red-800">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {timingData.summary.slowestProcess.caseId}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {timingData.summary.slowestProcess.totalStages} stages
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {formatDuration(timingData.summary.slowestProcess.totalDurationSeconds)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {timingData.summary.slowestProcess.processEfficiency.toFixed(1)}% efficient
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Detailed Case Analysis */}
      {timingData && timingData.detailedCaseAnalysis && timingData.detailedCaseAnalysis.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Detailed Case-by-Case Analysis
          </h2>
          
          {timingData.detailedCaseAnalysis.slice(0, 5).map((caseAnalysis, index) => (
            <Card key={index} title={`📊 ${caseAnalysis.caseId}`}>
              {/* Case Metrics */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {formatDuration(caseAnalysis.totalDurationSeconds)}
                  </div>
                  <div className="text-sm text-blue-500">Total Duration</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {caseAnalysis.totalStages}
                  </div>
                  <div className="text-sm text-purple-500">Stages</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${getEfficiencyColor(caseAnalysis.processEfficiency) === 'text-green-600' 
                  ? 'bg-green-50 dark:bg-green-900/20' 
                  : getEfficiencyColor(caseAnalysis.processEfficiency) === 'text-yellow-600'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className={`text-lg font-bold ${getEfficiencyColor(caseAnalysis.processEfficiency)}`}>
                    {caseAnalysis.processEfficiency.toFixed(1)}%
                  </div>
                  <div className={`text-sm ${getEfficiencyColor(caseAnalysis.processEfficiency).replace('text-', 'text-').replace('-600', '-500')}`}>
                    Efficiency
                  </div>
                </div>
                <div className={`text-center p-3 rounded-lg ${
                  caseAnalysis.bottleneckCount > 0 
                    ? 'bg-orange-50 dark:bg-orange-900/20' 
                    : 'bg-green-50 dark:bg-green-900/20'
                }`}>
                  <div className={`text-lg font-bold ${
                    caseAnalysis.bottleneckCount > 0 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {caseAnalysis.bottleneckCount}
                  </div>
                  <div className={`text-sm ${
                    caseAnalysis.bottleneckCount > 0 ? 'text-orange-500' : 'text-green-500'
                  }`}>
                    Bottlenecks
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className={`text-lg font-bold ${
                    caseAnalysis.waitTimePercentage > 50 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {caseAnalysis.waitTimePercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Wait Time</div>
                </div>
              </div>

              {/* Timeline */}
              {renderStageTimeline(caseAnalysis.stages)}
            </Card>
          ))}

          {timingData.detailedCaseAnalysis.length > 5 && (
            <Card>
              <div className="text-center py-4">
                <div className="text-gray-500 dark:text-gray-400">
                  Showing 5 of {timingData.detailedCaseAnalysis.length} cases
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Use filters to narrow down the analysis
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Stage Performance Analysis */}
      {timingData && timingData.stagePerformanceAnalysis && timingData.stagePerformanceAnalysis.length > 0 && (
        <Card title="📈 Stage Performance Analysis">
          <div className="space-y-4">
            {timingData.stagePerformanceAnalysis.slice(0, 10).map((stage, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {stage.activity}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stage.occurrences} occurrences • {stage.bottleneckPercentage.toFixed(1)}% bottleneck rate
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {formatDuration(stage.averageDuration)}
                  </div>
                  <div className="text-sm text-gray-500">
                    avg duration
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* No Results */}
      {timingData && (!timingData.detailedCaseAnalysis || timingData.detailedCaseAnalysis.length === 0) && (
        <Card>
          <div className="text-center py-8">
            <Timer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 dark:text-gray-400">
              No timing data found for the specified criteria
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DetailedTimingAnalyzer;
