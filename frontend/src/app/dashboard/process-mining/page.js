'use client';

import { useState, useEffect } from 'react';
import Card from '@CASUSGROEP1/components/Card';
import { api } from '@CASUSGROEP1/utils/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, AreaChart, Area
} from 'recharts';
import { 
  AlertTriangle, TrendingUp, Clock, Activity, 
  Target, AlertCircle, CheckCircle, XCircle, 
  Users, BarChart3, Settings, Lightbulb, 
  MapPin, Timer, TrendingDown, Zap 
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ProcessMining() {
  const [statistics, setStatistics] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [flowData, setFlowData] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [businessAnalysis, setBusinessAnalysis] = useState(null);
  const [activityPerformance, setActivityPerformance] = useState(null);
  const [conformanceAnalysis, setConformanceAnalysis] = useState(null);
  const [resourceUtilization, setResourceUtilization] = useState(null);
  const [caseJourneys, setCaseJourneys] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30'); // days
  const [activeTab, setActiveTab] = useState('overview'); // overview, performance, conformance, resources, optimization

  useEffect(() => {
    fetchData();
  }, [selectedTimeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(selectedTimeRange));

      const [
        statsRes, 
        anomaliesRes, 
        flowRes, 
        predictionsRes,
        businessRes,
        activityRes,
        conformanceRes,
        resourceRes,
        journeyRes,
        recommendationsRes
      ] = await Promise.all([
        api.get(`/api/ProcessMining/statistics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        api.get(`/api/ProcessMining/anomalies?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        api.get(`/api/ProcessMining/flow?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        api.get('/api/ProcessMining/delivery-predictions'),
        api.get(`/api/ProcessMining/business-analysis?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        api.get(`/api/ProcessMining/activity-performance?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        api.get(`/api/ProcessMining/conformance?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        api.get(`/api/ProcessMining/resource-utilization?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        api.get(`/api/ProcessMining/case-journey?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        api.get(`/api/ProcessMining/optimization-recommendations?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      ]);

      setStatistics(statsRes);
      setAnomalies(anomaliesRes);
      setFlowData(flowRes);
      setPredictions(predictionsRes);
      setBusinessAnalysis(businessRes);
      setActivityPerformance(activityRes);
      setConformanceAnalysis(conformanceRes);
      setResourceUtilization(resourceRes);
      setCaseJourneys(journeyRes);
      setRecommendations(recommendationsRes);
    } catch (error) {
      console.error('Error fetching process mining data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'High': return <XCircle className="h-4 w-4" />;
      case 'Medium': return <AlertTriangle className="h-4 w-4" />;
      case 'Low': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPerformanceColor = (value, good = 90, warning = 70) => {
    if (value >= good) return 'text-green-600';
    if (value >= warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUtilizationColor = (utilization) => {
    if (utilization < 30) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    if (utilization < 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    if (utilization < 80) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
  };

  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Business Process Analysis
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Comprehensive process mining dashboard with advanced analytics and optimization insights
          </p>
        </div>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white bg-white text-gray-900"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 pb-4">
        <TabButton
          id="overview"
          label="Overview"
          icon={<BarChart3 className="h-4 w-4" />}
          isActive={activeTab === 'overview'}
          onClick={setActiveTab}
        />
        <TabButton
          id="performance"
          label="Performance"
          icon={<TrendingUp className="h-4 w-4" />}
          isActive={activeTab === 'performance'}
          onClick={setActiveTab}
        />
        <TabButton
          id="conformance"
          label="Conformance"
          icon={<Target className="h-4 w-4" />}
          isActive={activeTab === 'conformance'}
          onClick={setActiveTab}
        />
        <TabButton
          id="resources"
          label="Resources"
          icon={<Users className="h-4 w-4" />}
          isActive={activeTab === 'resources'}
          onClick={setActiveTab}
        />
        <TabButton
          id="optimization"
          label="Optimization"
          icon={<Lightbulb className="h-4 w-4" />}
          isActive={activeTab === 'optimization'}
          onClick={setActiveTab}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Business KPIs */}
              {businessAnalysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Avg Cycle Time</div>
                    </div>
                    <div className="text-3xl font-bold mt-1">
                      {businessAnalysis.overallMetrics?.averageCycleTime?.toFixed(1) || 0} min
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Median: {businessAnalysis.overallMetrics?.medianCycleTime?.toFixed(1) || 0} min
                    </div>
                  </Card>
                  
                  <Card className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Process Efficiency</div>
                    </div>
                    <div className={`text-3xl font-bold mt-1 ${getPerformanceColor(businessAnalysis.overallMetrics?.processEfficiency || 0)}`}>
                      {businessAnalysis.overallMetrics?.processEfficiency?.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Rework Rate: {businessAnalysis.overallMetrics?.reworkRate?.toFixed(1) || 0}%
                    </div>
                  </Card>
                  
                  <Card className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Throughput</div>
                    </div>
                    <div className="text-3xl font-bold mt-1">
                      {businessAnalysis.overallMetrics?.throughputPerDay?.toFixed(1) || 0}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">orders/day</div>
                  </Card>
                  
                  <Card className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Completion Rate</div>
                    </div>
                    <div className="text-3xl font-bold mt-1">
                      {businessAnalysis.overallMetrics ? 
                        ((businessAnalysis.overallMetrics.completedCases / businessAnalysis.overallMetrics.totalCases) * 100).toFixed(1) 
                        : 0}%
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {businessAnalysis.overallMetrics?.completedCases || 0} / {businessAnalysis.overallMetrics?.totalCases || 0}
                    </div>
                  </Card>
                </div>
              )}

              {/* Stage Performance Chart */}
              {businessAnalysis?.stagePerformance && (
                <Card title="Stage Performance Analysis">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={businessAnalysis.stagePerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" angle={-45} textAnchor="end" height={100} fontSize={12} />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          `${value.toFixed(1)} min`,
                          name === 'averageTime' ? 'Average Time' : name
                        ]}
                      />
                      <Bar dataKey="averageTime" fill="#8884d8" name="Average Time (min)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Anomalies and Delivery Warnings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Anomalies Section */}
                {anomalies && anomalies.anomalies && anomalies.anomalies.length > 0 && (
                  <Card title="🚨 Process Anomalies" className="border-red-200 dark:border-red-800">
                    <div className="mb-4 grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-xl font-bold text-red-600">{anomalies.highSeverity}</div>
                        <div className="text-xs text-red-500">High</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="text-xl font-bold text-yellow-600">{anomalies.mediumSeverity}</div>
                        <div className="text-xs text-yellow-500">Medium</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">{anomalies.totalAnomalies}</div>
                        <div className="text-xs text-blue-500">Total</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {anomalies.anomalies.slice(0, 5).map((anomaly, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(anomaly.severity)}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              {getSeverityIcon(anomaly.severity)}
                              <div>
                                <div className="font-medium text-sm">{anomaly.type}</div>
                                <div className="text-xs opacity-75">{anomaly.description}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Delivery Predictions */}
                {predictions && predictions.warnings && predictions.warnings.length > 0 && (
                  <Card title="📋 Delivery Warnings" className="border-orange-200 dark:border-orange-800">
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-xl font-bold text-red-600">{predictions.delayedOrders}</div>
                        <div className="text-xs text-red-500">Delayed</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="text-xl font-bold text-yellow-600">{predictions.atRiskOrders}</div>
                        <div className="text-xs text-yellow-500">At Risk</div>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {predictions.warnings.slice(0, 5).map((warning, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(warning.severity)}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-sm">{warning.type}</div>
                              <div className="text-xs opacity-75">{warning.caseId}</div>
                              <div className="text-xs mt-1">Age: {warning.orderAge?.toFixed(1)} days</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Activity Performance */}
              {activityPerformance && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card title="Activity Frequency">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={activityPerformance.activityDetails?.slice(0, 8) || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="activity" angle={-45} textAnchor="end" height={100} fontSize={10} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="totalOccurrences" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card title="Success Rate by Activity">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={activityPerformance.activityDetails?.slice(0, 8) || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="activity" angle={-45} textAnchor="end" height={100} fontSize={10} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Success Rate']} />
                        <Bar dataKey="successRate" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </div>
              )}

              {/* Bottleneck Activities */}
              {activityPerformance?.performanceSummary && (
                <Card title="Performance Summary">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">Bottleneck Activities</h4>
                      <div className="space-y-1">
                        {activityPerformance.performanceSummary.bottleneckActivities?.length > 0 ? (
                          activityPerformance.performanceSummary.bottleneckActivities.map((activity, index) => (
                            <div key={index} className="text-sm text-red-600 dark:text-red-400">{activity}</div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No bottlenecks detected</div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <h4 className="font-medium text-yellow-700 dark:text-yellow-300 mb-2">High Error Activities</h4>
                      <div className="space-y-1">
                        {activityPerformance.performanceSummary.highErrorActivities?.length > 0 ? (
                          activityPerformance.performanceSummary.highErrorActivities.map((activity, index) => (
                            <div key={index} className="text-sm text-yellow-600 dark:text-yellow-400">
                              {activity.activity}: {activity.errorRate?.toFixed(1)}%
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No high error activities</div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Most Frequent</h4>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        {activityPerformance.performanceSummary.mostFrequentActivity || 'N/A'}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Conformance Tab */}
          {activeTab === 'conformance' && conformanceAnalysis && (
            <div className="space-y-6">
              {/* Conformance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Avg Conformance</div>
                  </div>
                  <div className={`text-3xl font-bold mt-1 ${getPerformanceColor(conformanceAnalysis.overallConformance?.averageConformanceScore || 0)}`}>
                    {conformanceAnalysis.overallConformance?.averageConformanceScore?.toFixed(1) || 0}%
                  </div>
                </Card>
                
                <Card className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Fully Conformant</div>
                  </div>
                  <div className="text-3xl font-bold mt-1 text-green-600">
                    {conformanceAnalysis.overallConformance?.fullyConformantCases || 0}
                  </div>
                </Card>
                
                <Card className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Non-Conformant</div>
                  </div>
                  <div className="text-3xl font-bold mt-1 text-red-600">
                    {conformanceAnalysis.overallConformance?.nonConformantCases || 0}
                  </div>
                </Card>
                
                <Card className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Deviations</div>
                  </div>
                  <div className="text-3xl font-bold mt-1 text-orange-600">
                    {conformanceAnalysis.overallConformance?.totalDeviations || 0}
                  </div>
                </Card>
              </div>

              {/* Process Variants */}
              {conformanceAnalysis.processVariants && (
                <Card title="Process Variants">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={conformanceAnalysis.processVariants.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="variant" angle={-45} textAnchor="end" height={100} fontSize={10} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="caseCount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Common Deviations */}
              {conformanceAnalysis.commonDeviations && (
                <Card title="Common Deviations">
                  <div className="space-y-3">
                    {conformanceAnalysis.commonDeviations.map((deviation, index) => (
                      <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{deviation.deviationType}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {deviation.count} occurrences ({deviation.percentage?.toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && resourceUtilization && (
            <div className="space-y-6">
              {/* Resource Utilization Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Resources</div>
                  </div>
                  <div className="text-3xl font-bold mt-1">{resourceUtilization.totalResources || 0}</div>
                </Card>
                
                <Card className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Avg Utilization</div>
                  </div>
                  <div className="text-3xl font-bold mt-1">
                    {resourceUtilization.utilizationSummary?.averageUtilization?.toFixed(1) || 0}%
                  </div>
                </Card>
                
                <Card className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Efficiency</div>
                  </div>
                  <div className="text-3xl font-bold mt-1">
                    {resourceUtilization.utilizationSummary?.resourceEfficiency?.toFixed(1) || 0}%
                  </div>
                </Card>
                
                <Card className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Highly Utilized</div>
                  </div>
                  <div className="text-3xl font-bold mt-1 text-red-600">
                    {resourceUtilization.utilizationSummary?.highlyUtilizedResources?.length || 0}
                  </div>
                </Card>
              </div>

              {/* Resource Details */}
              <Card title="Resource Utilization Details">
                <div className="space-y-3">
                  {resourceUtilization.resourceDetails?.map((resource, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{resource.resource}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {resource.totalActivities} activities • {resource.uniqueCases} cases
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Success Rate: {resource.performanceMetrics?.successRate?.toFixed(1)}% • 
                            Error Rate: {resource.performanceMetrics?.errorRate?.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getUtilizationColor(resource.utilizationScore)}`}>
                            {resource.utilizationScore?.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Optimization Tab */}
          {activeTab === 'optimization' && recommendations && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card title="Quick Actions">
                <div className="flex space-x-4">
                  <a
                    href="/dashboard/process-mining/case-journey"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Analyze Case Journey</span>
                  </a>
                  <button
                    onClick={() => window.open('/api/ProcessMining/export/xes', '_blank')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Activity className="h-4 w-4" />
                    <span>Export XES Data</span>
                  </button>
                </div>
              </Card>

              {/* Recommendations Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Recommendations</div>
                  </div>
                  <div className="text-3xl font-bold mt-1">{recommendations.totalRecommendations || 0}</div>
                </Card>
                
                <Card className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">High Priority</div>
                  </div>
                  <div className="text-3xl font-bold mt-1 text-red-600">
                    {recommendations.highPriorityRecommendations || 0}
                  </div>
                </Card>
                
                <Card className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Expected Improvement</div>
                  </div>
                  <div className="text-3xl font-bold mt-1 text-green-600">
                    {recommendations.expectedBenefits?.cycleTimeReduction || 'N/A'}
                  </div>
                </Card>
              </div>

              {/* Recommendations List */}
              <Card title="Process Optimization Recommendations">
                <div className="space-y-4">
                  {recommendations.recommendations?.map((rec, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(rec.priority)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="font-semibold">{rec.type}</div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(rec.priority)}`}>
                            {rec.priority}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">{rec.category}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm"><strong>Issue:</strong> {rec.issue}</div>
                        <div className="text-sm"><strong>Impact:</strong> {rec.impact}</div>
                        <div className="text-sm"><strong>Recommendation:</strong> {rec.recommendation}</div>
                        <div className="text-sm text-green-600">
                          <strong>Expected Improvement:</strong> {rec.estimatedImprovement}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Implementation Roadmap */}
              {recommendations.implementationRoadmap && (
                <Card title="Implementation Roadmap">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="font-medium text-blue-700 dark:text-blue-300">Phase 1</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        {recommendations.implementationRoadmap.phase1}
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="font-medium text-green-700 dark:text-green-300">Phase 2</div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        {recommendations.implementationRoadmap.phase2}
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="font-medium text-purple-700 dark:text-purple-300">Phase 3</div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">
                        {recommendations.implementationRoadmap.phase3}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Expected Benefits */}
              {recommendations.expectedBenefits && (
                <Card title="Expected Benefits">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                      <div className="text-lg font-bold text-green-600">
                        {recommendations.expectedBenefits.cycleTimeReduction}
                      </div>
                      <div className="text-sm text-green-500">Cycle Time Reduction</div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {recommendations.expectedBenefits.efficiencyImprovement}
                      </div>
                      <div className="text-sm text-blue-500">Efficiency Improvement</div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {recommendations.expectedBenefits.costSavings}
                      </div>
                      <div className="text-sm text-purple-500">Cost Savings</div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
