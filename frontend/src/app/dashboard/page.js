'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@CASUSGROEP1/components/Card';
import StatusBadge from '@CASUSGROEP1/components/StatusBadge';
import { orders, dashboardStats } from '@CASUSGROEP1/utils/mockData';
import { api } from '@CASUSGROEP1/utils/api';
import { AlertTriangle, TrendingUp, Activity, Clock, Play, Plus } from 'lucide-react';

export default function Dashboard() {
  const [processMiningData, setProcessMiningData] = useState(null);
  const [deliveryPredictions, setDeliveryPredictions] = useState(null);
  const [recentSimulations, setRecentSimulations] = useState([]);

  useEffect(() => {
    // Fetch process mining overview data
    const fetchProcessMiningData = async () => {
      try {
        const [anomaliesRes, predictionsRes] = await Promise.all([
          api.get('/api/ProcessMining/anomalies'),
          api.get('/api/ProcessMining/delivery-predictions')
        ]);
        setProcessMiningData(anomaliesRes);
        setDeliveryPredictions(predictionsRes);
      } catch (error) {
        console.error('Error fetching process mining data:', error);
      }
    };

    // Fetch recent simulations
    const fetchRecentSimulations = async () => {
      try {
        const simulations = await api.get('/api/Simulations');
        // Get the 3 most recent simulations
        setRecentSimulations(simulations.slice(-3).reverse());
      } catch (error) {
        console.error('Error fetching simulations:', error);
      }
    };

    fetchProcessMiningData();
    fetchRecentSimulations();
  }, []);

  // Get just the 5 most recent orders
  const recentOrders = orders.slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Overview of your order management system</p>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Orders</div>
          <div className="text-3xl font-bold mt-1">{dashboardStats.totalOrders}</div>
          <div className="text-sm text-green-600 dark:text-green-400 mt-1">+12% from last month</div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Pending Orders</div>
          <div className="text-3xl font-bold mt-1">{dashboardStats.pendingOrders}</div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Requires attention</div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Revenue</div>
          <div className="text-3xl font-bold mt-1">${dashboardStats.totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-green-600 dark:text-green-400 mt-1">+8% from last month</div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Customers</div>
          <div className="text-3xl font-bold mt-1">78</div>
          <div className="text-sm text-green-600 dark:text-green-400 mt-1">+5 new this week</div>
        </Card>
      </div>

      {/* Simulations Overview */}
      <Card title="🎯 Recent Simulations" className="border-purple-200 dark:border-purple-800">
        <div className="space-y-4">
          {recentSimulations.length === 0 ? (
            <div className="text-center py-6">
              <Play className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-zinc-500 dark:text-zinc-400 mb-3">No simulations created yet</p>
              <Link 
                href="/dashboard/simulations"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Simulation
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {recentSimulations.map((simulation) => (
                  <div key={simulation.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{simulation.name}</div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        Created {new Date(simulation.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
                        <Play className="h-3 w-3 mr-1" />
                        Run
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2">
                <Link 
                  href="/dashboard/simulations"
                  className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                >
                  View all simulations &rarr;
                </Link>
                <Link 
                  href="/dashboard/simulations"
                  className="inline-flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  New Simulation
                </Link>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Process Mining & Planner Overview */}
      {(processMiningData || deliveryPredictions) && (
        <Card title="🔍 Process Mining & Planner Overview" className="border-blue-200 dark:border-blue-800">
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {processMiningData && (
                <>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-lg font-bold text-red-600">{processMiningData.highSeverity || 0}</span>
                    </div>
                    <div className="text-xs text-red-500">Critical Issues</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Activity className="h-4 w-4 text-yellow-600" />
                      <span className="text-lg font-bold text-yellow-600">{processMiningData.totalAnomalies || 0}</span>
                    </div>
                    <div className="text-xs text-yellow-500">Total Anomalies</div>
                  </div>
                </>
              )}
              {deliveryPredictions && (
                <>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Clock className="h-4 w-4 text-red-600" />
                      <span className="text-lg font-bold text-red-600">{deliveryPredictions.delayedOrders || 0}</span>
                    </div>
                    <div className="text-xs text-red-500">Delayed Orders</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <TrendingUp className="h-4 w-4 text-yellow-600" />
                      <span className="text-lg font-bold text-yellow-600">{deliveryPredictions.atRiskOrders || 0}</span>
                    </div>
                    <div className="text-xs text-yellow-500">At Risk Orders</div>
                  </div>
                </>
              )}
            </div>

            {/* Recent Warnings */}
            {deliveryPredictions && deliveryPredictions.warnings && deliveryPredictions.warnings.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ⚠️ Latest Planner Alerts:
                </div>
                {deliveryPredictions.warnings.slice(0, 2).map((warning, index) => (
                  <div key={index} className="text-xs p-3 bg-orange-50 dark:bg-orange-900/20 rounded border-l-4 border-orange-400">
                    <div className="font-medium">Order {warning.caseId}</div>
                    <div className="text-orange-600">Levertijd wordt later - {warning.orderAge.toFixed(1)} dagen</div>
                    <div className="text-gray-600 dark:text-gray-400 mt-1">{warning.recommendedAction}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Link 
                href="/dashboard/process-mining"
                className="flex-1 text-center py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                📊 View Process Analysis
              </Link>
              <Link 
                href="/dashboard/orders"
                className="flex-1 text-center py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
              >
                📋 View Planner Alerts
              </Link>
            </div>
          </div>
        </Card>
      )}
      
      {/* Monthly sales chart */}
      <Card title="Monthly Sales">
        <div className="h-64 flex items-end justify-between space-x-2 px-6">
          {dashboardStats.monthlySales.map((item) => {
            const height = (item.sales / 3200) * 100;
            return (
              <div key={item.month} className="flex flex-col items-center">
                <div 
                  className="w-12 bg-blue-500 rounded-t" 
                  style={{ height: `${height}%` }}
                ></div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{item.month}</div>
              </div>
            );
          })}
        </div>
      </Card>
      
      {/* Recent orders */}
      <Card title="Recent Orders">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">Order ID</th>
                <th scope="col" className="px-6 py-3 text-left">Customer</th>
                <th scope="col" className="px-6 py-3 text-left">Date</th>
                <th scope="col" className="px-6 py-3 text-left">Amount</th>
                <th scope="col" className="px-6 py-3 text-left">Status</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-6 py-4 whitespace-nowrap">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${order.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link 
                      href={`/dashboard/orders/${order.id}`}
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <Link 
            href="/dashboard/orders"
            className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View all orders &rarr;
          </Link>
        </div>
      </Card>
    </div>
  );
}