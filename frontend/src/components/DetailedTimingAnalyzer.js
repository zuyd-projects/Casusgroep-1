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

// Helper function to format status names nicely
const formatStatusName = (status) => {
  const statusMap = {
    'Pending': 'Pending',
    'ApprovedByVoorraadbeheer': 'Inventory Approved',
    'ToProduction': 'To Production',
    'InProduction': 'In Production',
    'AwaitingAccountManagerApproval': 'Awaiting Manager',
    'ApprovedByAccountManager': 'Manager Approved',
    'Delivered': 'Delivered',
    'Completed': 'Completed'
  };
  return statusMap[status] || status;
};

const DetailedTimingAnalyzer = () => {
  const [caseId, setCaseId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timingData, setTimingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCases, setExpandedCases] = useState(new Set());

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

      const response = await api.get(url);      // Filter to only include Order-* cases (exclude Simulation_* and SupplierOrder_*)
      if (response.detailedCaseAnalysis) {
        response.detailedCaseAnalysis = response.detailedCaseAnalysis.filter(
          caseAnalysis => caseAnalysis.caseId.startsWith('Order-')
        );
      }

      // Also filter fastest and slowest processes to only include Order-* cases
      if (response.summary) {
        if (response.summary.fastestProcess && !response.summary.fastestProcess.caseId.startsWith('Order-')) {
          // Find fastest Order-* case from filtered detailed analysis
          const orderCases = response.detailedCaseAnalysis || [];
          if (orderCases.length > 0) {
            response.summary.fastestProcess = orderCases.reduce((fastest, current) =>
              current.totalDurationMinutes < fastest.totalDurationMinutes ? current : fastest
            );
          } else {
            response.summary.fastestProcess = null;
          }
        }

        if (response.summary.slowestProcess && !response.summary.slowestProcess.caseId.startsWith('Order-')) {
          // Find slowest Order-* case from filtered detailed analysis
          const orderCases = response.detailedCaseAnalysis || [];
          if (orderCases.length > 0) {
            response.summary.slowestProcess = orderCases.reduce((slowest, current) =>
              current.totalDurationMinutes > slowest.totalDurationMinutes ? current : slowest
            );
          } else {
            response.summary.slowestProcess = null;
          }
        }
      }

      setTimingData(response);

      // Debug: Log efficiency data to understand the calculations
      console.log('Timing Data Debug:', {
        summary: response.summary,
        sampleCase: response.detailedCaseAnalysis?.[0],
        efficiencyValues: response.detailedCaseAnalysis?.map(c => ({
          caseId: c.caseId,
          efficiency: c.processEfficiency,
          totalDuration: c.totalDurationMinutes,
          stages: c.stages?.length
        }))
      });
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

  // Calculate a more meaningful efficiency score based on process characteristics
  const calculateImprovedEfficiency = (caseAnalysis) => {
    if (!caseAnalysis.stages || caseAnalysis.stages.length === 0) return 50;

    const totalDuration = caseAnalysis.totalDurationMinutes;
    const stageCount = caseAnalysis.stages.length;

    // Factors that reduce efficiency:
    // 1. Excessive number of stages (indicates rework/complications)
    // 2. Long total duration relative to stage count
    // 3. Status changes that indicate rework (going backwards in process)

    let efficiencyScore = 100;

    // Penalize excessive stages (ideal is 5-8 stages for an order)
    const idealStageCount = 6;
    if (stageCount > idealStageCount) {
      const excessStages = stageCount - idealStageCount;
      efficiencyScore -= (excessStages * 5); // -5% per excess stage
    }

    // Penalize long duration (benchmark: 30 minutes for typical order)
    const benchmarkDuration = 30; // minutes
    if (totalDuration > benchmarkDuration) {
      const excessTime = totalDuration - benchmarkDuration;
      const timesPenalty = (excessTime / benchmarkDuration) * 20; // Up to -20% for very long processes
      efficiencyScore -= Math.min(timesPenalty, 30); // Cap penalty at 30%
    }

    // Check for rework patterns (status reversals)
    const statusChanges = caseAnalysis.stages.filter(s => s.activity.includes('Order Status Changed'));
    const hasRework = statusChanges.some(stage => {
      return stage.activity.includes('to ApprovedByVoorraadbeheer') &&
        !stage.activity.includes('from Pending to ApprovedByVoorraadbeheer');
    });

    if (hasRework) {
      efficiencyScore -= 15; // -15% for rework
    }

    return Math.max(10, Math.min(100, efficiencyScore)); // Keep between 10-100%
  };

  const getEfficiencyColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Function to filter meaningful stages and calculate bottlenecks based on all Order-* cases
  const filterMeaningfulStages = (stages, caseAnalysis, allCasesData = []) => {
    // Collect all activity durations from all Order-* cases for bottleneck comparison
    const activityDurations = {};
    allCasesData.forEach(otherCase => {
      if (otherCase.caseId.startsWith('Order-')) {
        otherCase.stages.forEach(stage => {
          if (stage.durationMinutes > 0) {
            if (!activityDurations[stage.activity]) {
              activityDurations[stage.activity] = [];
            }
            activityDurations[stage.activity].push(stage.durationMinutes);
          }
        });
      }
    });

    // Calculate averages for bottleneck detection
    const activityAverages = {};
    Object.keys(activityDurations).forEach(activity => {
      const durations = activityDurations[activity];
      activityAverages[activity] = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    });

    // Process stages and calculate proper durations
    const processedStages = stages.map((stage, index, allStages) => {
      let actualDuration = stage.durationMinutes;

      // For stages with 0 duration or "Order Created", calculate time to next stage
      if ((actualDuration === 0 || stage.activity === 'Order Created') && index < allStages.length - 1) {
        const nextStage = allStages[index + 1];
        if (nextStage) {
          const startTime = new Date(stage.startTime);
          const nextTime = new Date(nextStage.startTime);
          actualDuration = (nextTime - startTime) / (1000 * 60); // Convert to minutes
        }
      }

      // Improve activity names for better readability
      let friendlyName = stage.activity;
      if (stage.activity.includes('Order Status Changed')) {
        // Extract from/to status from activity name
        const match = stage.activity.match(/from (\w+) to (\w+)/);
        if (match) {
          const fromStatus = formatStatusName(match[1]);
          const toStatus = formatStatusName(match[2]);
          friendlyName = `${fromStatus} → ${toStatus}`;
        }
      } else if (stage.activity === 'Order Created') {
        friendlyName = 'Order Created';
      } else if (stage.activity === 'Order Approved by VoorraadBeheer') {
        friendlyName = 'Inventory Approval';
      } else if (stage.activity === 'Production Started') {
        friendlyName = 'Production Started';
      } else if (stage.activity === 'Order Delivered') {
        friendlyName = 'Order Delivered';
      }

      // Determine if this is a bottleneck (compared to average for same activity)
      const avgDuration = activityAverages[stage.activity] || 0;
      const isBottleneck = actualDuration > 0 && avgDuration > 0 && actualDuration > (avgDuration * 1.5);

      return {
        ...stage,
        actualDuration,
        friendlyName,
        isBottleneck: isBottleneck && actualDuration > 1, // Only mark as bottleneck if > 1 minute
        formattedDuration: formatDuration(actualDuration * 60), // Convert minutes to seconds for formatting
        durationSeconds: actualDuration * 60
      };
    });

    // Filter meaningful stages (exclude generic "Order Updated" unless it's a status change)
    const meaningfulStages = processedStages.filter(stage =>
      !stage.activity.toLowerCase().includes('order updated') ||
      stage.activity.includes('Order Status Changed')
    );

    // Ensure "Order Created" is always first if it exists
    const orderCreatedIndex = meaningfulStages.findIndex(s => s.activity === 'Order Created');
    if (orderCreatedIndex > 0) {
      const orderCreatedStage = meaningfulStages.splice(orderCreatedIndex, 1)[0];
      meaningfulStages.unshift(orderCreatedStage);
    }

    return meaningfulStages;
  };

  const renderCollapsibleStageTimeline = (caseAnalysis, index) => {
    const isExpanded = expandedCases.has(index);

    const toggleExpanded = () => {
      const newExpanded = new Set(expandedCases);
      if (isExpanded) {
        newExpanded.delete(index);
      } else {
        newExpanded.add(index);
      }
      setExpandedCases(newExpanded);
    };

    const filteredStages = filterMeaningfulStages(
      caseAnalysis.stages,
      caseAnalysis,
      timingData.detailedCaseAnalysis || []
    );

    // Calculate improved efficiency
    const improvedEfficiency = calculateImprovedEfficiency(caseAnalysis);

    return (
      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg">
        {/* Collapsible Header */}
        <button
          onClick={toggleExpanded}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg"
        >
          <div className="flex items-center space-x-4">
            <div className="text-left">
              <div className="font-semibold text-gray-900 dark:text-white">
                {caseAnalysis.caseId}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formatDuration(caseAnalysis.totalDurationMinutes * 60)} •
                {filteredStages.length} meaningful stages •
                {filteredStages.filter(s => s.isBottleneck).length} bottlenecks
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className={`text-lg font-bold ${getEfficiencyColor(improvedEfficiency)}`}>
                {improvedEfficiency.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">efficiency</div>
              <div className="text-xs text-gray-400">
                Backend: {caseAnalysis.processEfficiency.toFixed(1)}%
              </div>
            </div>
            <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            <div className="pt-4 space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Status Progression</h4>
              <div className="space-y-2">
                {filteredStages.map((stage, stageIndex) => (
                  <div key={stageIndex} className={`flex items-center justify-between p-3 rounded-lg ${stage.isBottleneck
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-gray-800'
                    }`}>
                    <div className="flex items-center space-x-3">
                      {stage.isBottleneck ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        getStatusIcon(stage.status)
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {stage.friendlyName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {stage.resource} • {formatTimestamp(stage.startTime)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${stage.isBottleneck ? 'text-red-600' : 'text-blue-600'}`}>
                        {stage.formattedDuration}
                      </div>
                      {stage.isBottleneck && (
                        <div className="text-xs text-red-500">bottleneck detected</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
                placeholder="e.g., Order-1"
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
              {formatDuration(timingData.summary.averageProcessDuration * 60)}
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
                    {formatDuration(timingData.summary.fastestProcess.totalDurationMinutes * 60)}
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
                    {formatDuration(timingData.summary.slowestProcess.totalDurationMinutes * 60)}
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
            Order-by-Order Analysis
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Click on any order to expand detailed timing information. Only Order-* cases are shown. Bottlenecks are highlighted in red and identified by comparing stage durations to averages across all orders.
          </p>

          <div className="space-y-3">
            {timingData.detailedCaseAnalysis.slice(0, 10).map((caseAnalysis, index) =>
              renderCollapsibleStageTimeline(caseAnalysis, index)
            )}
          </div>

          {timingData.detailedCaseAnalysis.length > 10 && (
            <Card>
              <div className="text-center py-4">
                <div className="text-gray-500 dark:text-gray-400">
                  Showing 10 of {timingData.detailedCaseAnalysis.length} orders
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Use filters to narrow down the analysis
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* No Results */}
      {timingData && (!timingData.detailedCaseAnalysis || timingData.detailedCaseAnalysis.length === 0) && (
        <Card>
          <div className="text-center py-8">
            <Timer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 dark:text-gray-400">
              No timing data found for the specified criteria
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Try adjusting your date range or removing the case ID filter
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DetailedTimingAnalyzer;
