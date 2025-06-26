'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Timer, TrendingDown, Zap
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ProcessMining() {
  const [simulationAnalysis, setSimulationAnalysis] = useState(null);
  const [simulationPerformance, setSimulationPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30'); // days
  const [activeTab, setActiveTab] = useState('simulation'); // Default to simulation tab

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
        simulationAnalysisRes,
        simulationPerformanceRes
      ] = await Promise.all([
        api.get(`/api/ProcessMining/simulation-analysis?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        api.get(`/api/ProcessMining/simulation-performance?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      ]);

      setSimulationAnalysis(simulationAnalysisRes);
      setSimulationPerformance(simulationPerformanceRes);
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
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${isActive
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
            Simulation Process Analysis
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            School project simulation dashboard with metrics per product type, quantity, and production line
          </p>
        </div>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white bg-white text-gray-900"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Current simulation</option>
        </select>
      </div>

      {/* Process Mining Navigation */}
      <div className="flex space-x-4 mb-6">
        <Link href="/dashboard/process-mining" className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/40">
          <BarChart3 className="h-4 w-4" />
          <span>Main Dashboard</span>
        </Link>
        <Link href="/dashboard/process-mining/detailed-timing" className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
          <Timer className="h-4 w-4" />
          <span>Detailed Timing</span>
        </Link>
      </div>

      {/* Tab Navigation - Only Simulation */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 pb-4">
        <TabButton
          id="simulation"
          label="Simulation"
          icon={<Activity className="h-4 w-4" />}
          isActive={activeTab === 'simulation'}
          onClick={setActiveTab}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      ) : (
        <>
          {/* Simulation Tab */}
          {activeTab === 'simulation' && (
            <div className="space-y-6">
              {/* Simulation Progress */}
              {simulationPerformance?.simulationProgress && (
                <Card title="📊 Simulation Progress">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {simulationPerformance.simulationProgress.currentRound}
                      </div>
                      <div className="text-sm text-blue-500">Current Round</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {simulationPerformance.simulationProgress.completionPercentage?.toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-500">Progress</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {simulationPerformance.simulationProgress.orderingPhaseRounds}
                      </div>
                      <div className="text-sm text-purple-500">Ordering Rounds</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {simulationPerformance.simulationProgress.productionPhaseRounds}
                      </div>
                      <div className="text-sm text-orange-500">Production Rounds</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${simulationPerformance.simulationProgress.completionPercentage || 0}%` }}
                    ></div>
                  </div>
                  <div className="text-center mt-2 text-sm text-gray-600">
                    {simulationPerformance.simulationProgress.isInOrderingPhase ? 'Ordering Phase' : 'Production Phase'}
                  </div>
                </Card>
              )}

              {/* Key Simulation Metrics */}
              {simulationAnalysis?.simulationMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Orders</div>
                    </div>
                    <div className="text-3xl font-bold mt-1">
                      {simulationAnalysis.simulationMetrics.totalOrders || 0}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Avg: {simulationAnalysis.simulationMetrics.averageOrdersPerRound?.toFixed(1) || 0}/round
                    </div>
                  </Card>

                  <Card className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Avg Cycle Time</div>
                    </div>
                    <div className="text-3xl font-bold mt-1">
                      {simulationAnalysis?.cycleTimeAnalysis?.overallStats?.averageCycleTime?.toFixed(1) || 0} sec
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Median: {simulationAnalysis?.cycleTimeAnalysis?.overallStats?.medianCycleTime?.toFixed(1) || 0} sec
                    </div>
                  </Card>

                  <Card className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <Timer className="h-5 w-5 text-purple-600" />
                      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Rounds</div>
                    </div>
                    <div className="text-3xl font-bold mt-1">
                      {simulationAnalysis.simulationMetrics.totalRounds || 0}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      / 36 rounds total
                    </div>
                  </Card>

                  <Card className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-orange-600" />
                      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Periods</div>
                    </div>
                    <div className="text-3xl font-bold mt-1">
                      {simulationAnalysis.simulationMetrics.totalPeriods || 0}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      20 sec/round
                    </div>
                  </Card>
                </div>
              )}

              {/* Product Distribution Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Type Distribution */}
                {simulationAnalysis?.simulationMetrics?.productTypeDistribution && (
                  <Card title="Product Type Distribution">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={simulationAnalysis.simulationMetrics.productTypeDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                          label={({ type, percentage }) => `${type}: ${percentage.toFixed(1)}%`}
                        >
                          {simulationAnalysis.simulationMetrics.productTypeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, 'Orders']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                {/* Quantity Distribution */}
                {simulationAnalysis?.simulationMetrics?.quantityDistribution && (
                  <Card title="Quantity Distribution">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={simulationAnalysis.simulationMetrics.quantityDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quantity" />
                        <YAxis />
                        <Tooltip formatter={(value) => [value, 'Orders']} />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                {/* Production Line Distribution */}
                {simulationAnalysis?.simulationMetrics?.productionLineDistribution && (
                  <Card title="Production Line Distribution">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={simulationAnalysis.simulationMetrics.productionLineDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                          label={({ line, percentage }) => `Line ${line}: ${percentage.toFixed(1)}%`}
                        >
                          {simulationAnalysis.simulationMetrics.productionLineDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, 'Orders']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                )}
              </div>

              {/* Cycle Time Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cycle Time by Product Type */}
                {simulationAnalysis?.cycleTimeAnalysis?.byProductType && (
                  <Card title="Cycle Time by Product Type">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={simulationAnalysis.cycleTimeAnalysis.byProductType}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="productType" />
                        <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => [`${value.toFixed(1)} sec`, 'Avg Cycle Time']} />
                        <Bar dataKey="averageCycleTime" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                {/* Cycle Time by Production Line */}
                {simulationAnalysis?.cycleTimeAnalysis?.byProductionLine && (
                  <Card title="Cycle Time by Production Line">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={simulationAnalysis.cycleTimeAnalysis.byProductionLine}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="productionLine" />
                        <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => [`${value.toFixed(1)} sec`, 'Avg Cycle Time']} />
                        <Bar dataKey="averageCycleTime" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                )}
              </div>

              {/* Production Line Performance */}
              {simulationPerformance?.productionLineMetrics && (
                <Card title="Production Line Performance">
                  <div className="space-y-4">
                    {simulationPerformance.productionLineMetrics.map((line, index) => (
                      <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">Production Line {line.productionLine}</h4>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {line.totalOrders} total orders • {line.completedOrders} completed
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded text-sm font-medium ${line.completionRate >= 90 ? 'bg-green-50 text-green-700' :
                            line.completionRate >= 70 ? 'bg-yellow-50 text-yellow-700' :
                              'bg-red-50 text-red-700'
                            }`}>
                            {line.completionRate?.toFixed(1)}% completion
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Product A: {line.productTypes?.find(p => p.type === 'A')?.count || 0}</div>
                          </div>
                          <div>
                            <div className="font-medium">Product B: {line.productTypes?.find(p => p.type === 'B')?.count || 0}</div>
                          </div>
                          <div>
                            <div className="font-medium">Product C: {line.productTypes?.find(p => p.type === 'C')?.count || 0}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          Average Quantity: {line.averageQuantity?.toFixed(1) || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Round Performance Chart */}
              {simulationPerformance?.roundPerformance && (
                <Card title="Round-by-Round Performance">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={simulationPerformance.roundPerformance.slice(-20)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="roundId" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="ordersCreated" stroke="#8884d8" name="Orders Created" />
                      <Line type="monotone" dataKey="productionCompleted" stroke="#22c55e" name="Production Completed" />
                      <Line type="monotone" dataKey="productionLine1Orders" stroke="#10b981" name="Line 1" />
                      <Line type="monotone" dataKey="productionLine2Orders" stroke="#f59e0b" name="Line 2" />
                      <Line type="monotone" dataKey="ordersInProduction" stroke="#ef4444" name="In Production" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
