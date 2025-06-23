'use client';

import { useState, useEffect } from 'react';
import Card from '@CASUSGROEP1/components/Card';
import { api } from '@CASUSGROEP1/utils/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter
} from 'recharts';
import { 
  AlertTriangle, TrendingUp, Clock, Activity, 
  Target, AlertCircle, CheckCircle, XCircle 
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ProcessMining() {
  const [statistics, setStatistics] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [flowData, setFlowData] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30'); // days

  useEffect(() => {
    fetchData();
  }, [selectedTimeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(selectedTimeRange));

      const [statsRes, anomaliesRes, flowRes, predictionsRes] = await Promise.all([
        api.get(`/api/ProcessMining/statistics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        api.get(`/api/ProcessMining/anomalies?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        api.get(`/api/ProcessMining/flow?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        api.get('/api/ProcessMining/delivery-predictions')
      ]);

      setStatistics(statsRes);
      setAnomalies(anomaliesRes);
      setFlowData(flowRes);
      setPredictions(predictionsRes);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Process Mining Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Analyze process performance, detect anomalies, and track delivery predictions
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

      {/* Overview Stats */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="flex flex-col">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Events</div>
            </div>
            <div className="text-3xl font-bold mt-1">{statistics.totalEvents?.toLocaleString() || 0}</div>
          </Card>
          
          <Card className="flex flex-col">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Unique Cases</div>
            </div>
            <div className="text-3xl font-bold mt-1">{statistics.uniqueCases || 0}</div>
          </Card>
          
          <Card className="flex flex-col">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Avg Case Duration</div>
            </div>
            <div className="text-3xl font-bold mt-1">
              {statistics.averageCaseDuration ? `${statistics.averageCaseDuration.toFixed(1)}ms` : 'N/A'}
            </div>
          </Card>
          
          <Card className="flex flex-col">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Anomalies</div>
            </div>
            <div className="text-3xl font-bold mt-1 text-red-600">
              {anomalies?.totalAnomalies || 0}
            </div>
          </Card>
        </div>
      )}

      {/* Anomalies Section */}
      {anomalies && anomalies.anomalies && anomalies.anomalies.length > 0 && (
        <Card title="🚨 Process Anomalies & Issues" className="border-red-200 dark:border-red-800">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{anomalies.highSeverity}</div>
              <div className="text-sm text-red-500">High Severity</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{anomalies.mediumSeverity}</div>
              <div className="text-sm text-yellow-500">Medium Severity</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{anomalies.totalAnomalies}</div>
              <div className="text-sm text-blue-500">Total Issues</div>
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {anomalies.anomalies.slice(0, 10).map((anomaly, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getSeverityIcon(anomaly.severity)}
                    <div>
                      <div className="font-semibold">{anomaly.type}</div>
                      <div className="text-sm opacity-75">{anomaly.description}</div>
                      {anomaly.caseId && (
                        <div className="text-xs mt-1">Case: {anomaly.caseId}</div>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                    {anomaly.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Delivery Predictions for Planners */}
      {predictions && predictions.warnings && predictions.warnings.length > 0 && (
        <Card title="📋 Planner Alerts - Delivery Time Warnings" className="border-orange-200 dark:border-orange-800">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{predictions.totalOngoingOrders}</div>
              <div className="text-sm text-orange-500">Ongoing Orders</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{predictions.delayedOrders}</div>
              <div className="text-sm text-red-500">Delayed Orders</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{predictions.atRiskOrders}</div>
              <div className="text-sm text-yellow-500">At Risk Orders</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {predictions.averageDeliveryTime ? predictions.averageDeliveryTime.toFixed(1) : 'N/A'}
              </div>
              <div className="text-sm text-blue-500">Avg Delivery (days)</div>
            </div>
          </div>

          <div className="space-y-3">
            {predictions.warnings.map((warning, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getSeverityColor(warning.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getSeverityIcon(warning.severity)}
                    <div>
                      <div className="font-semibold">{warning.type}</div>
                      <div className="text-sm opacity-75">{warning.message}</div>
                      <div className="text-xs mt-1">
                        Last Activity: {warning.lastActivity} | 
                        Order Age: {warning.orderAge.toFixed(1)} days |
                        Expected: {warning.expectedDelivery.toFixed(1)} days
                      </div>
                      <div className="text-xs mt-1 font-medium text-blue-600">
                        Recommended: {warning.recommendedAction}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(warning.severity)}`}>
                    {warning.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Types Distribution */}
        {statistics && statistics.eventTypes && (
          <Card title="Event Types Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statistics.eventTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ eventType, count }) => `${eventType}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="eventType"
                >
                  {statistics.eventTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Activities Frequency */}
        {statistics && statistics.activities && (
          <Card title="Most Frequent Activities">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.activities.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="activity" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Process Flow Visualization */}
      {flowData && flowData.nodes && (
        <Card title="Process Flow Analysis">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{flowData.totalCases}</div>
                <div className="text-sm text-blue-500">Total Cases</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{flowData.totalActivities}</div>
                <div className="text-sm text-green-500">Total Activities</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{flowData.edges?.length || 0}</div>
                <div className="text-sm text-purple-500">Process Transitions</div>
              </div>
            </div>

            {/* Activity Nodes */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Process Activities</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {flowData.nodes.map((node, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                    <div className="font-medium text-gray-900 dark:text-white">{node.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Occurrences: {node.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Common Transitions */}
            {flowData.edges && flowData.edges.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Most Common Process Transitions</h4>
                <div className="space-y-2">
                  {flowData.edges
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map((edge, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{edge.source}</span>
                          <span className="mx-2 text-gray-500 dark:text-gray-400">→</span>
                          <span className="font-medium text-gray-900 dark:text-white">{edge.target}</span>
                        </div>
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm">
                          {edge.count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
