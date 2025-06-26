'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@CASUSGROEP1/components/Card';
import StatusBadge from '@CASUSGROEP1/components/StatusBadge';
import { api } from '@CASUSGROEP1/utils/api';
import { useSimulation } from '@CASUSGROEP1/contexts/SimulationContext';
import { AlertTriangle, TrendingUp, Activity, Clock, Play, Plus, BarChart3, PieChart as PieChartIcon, TrendingDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
  const [processMiningData, setProcessMiningData] = useState(null);
  const [deliveryPredictions, setDeliveryPredictions] = useState(null);
  const [recentSimulations, setRecentSimulations] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState({
    profitOverTime: [],
    productsSoldOverTime: [],
    productsByType: [],
    orderStatusDistribution: [],
    revenueBreakdown: []
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProductsSold: 0,
    totalBlocksBought: 0
  });
  const [loading, setLoading] = useState(true);

  const { runSimulation, currentSimulation, currentRound, isRunning } = useSimulation();

  // Generate chart data from orders and stats
  const generateChartData = (orders = [], supplierOrders = [], stats = {}) => {
    // Ensure we have valid data
    const validOrders = Array.isArray(orders) ? orders : [];
    const validSupplierOrders = Array.isArray(supplierOrders) ? supplierOrders : [];

    // Filter for delivered/completed orders only for product counting
    const deliveredCompletedOrders = validOrders.filter(order =>
      order.status === 'Delivered' || order.status === 'Completed'
    );

    // 1. Products by Type (Pie Chart) - Use delivered/completed orders only, fallback to all orders
    const productTypeCount = {};
    const ordersForProductChart = deliveredCompletedOrders.length > 0 ? deliveredCompletedOrders : validOrders;
    const usingFallbackForProducts = deliveredCompletedOrders.length === 0 && validOrders.length > 0;

    console.log('📊 Chart Data Generation:', {
      totalOrders: validOrders.length,
      deliveredCompletedOrders: deliveredCompletedOrders.length,
      usingFallbackForProducts,
      usingFallbackForTime: deliveredCompletedOrders.length === 0 && validOrders.length > 0,
      allOrderStatuses: validOrders.map(o => o.status),
      ordersSample: validOrders.slice(0, 3).map(o => ({ id: o.id, status: o.status, motorType: o.motorType, quantity: o.quantity, roundId: o.roundId }))
    });

    ordersForProductChart.forEach(order => {
      const type = order.motorType || 'Unknown';
      productTypeCount[type] = (productTypeCount[type] || 0) + (order.quantity || 0);
    });

    const totalProductsForChart = Object.values(productTypeCount).reduce((sum, count) => sum + count, 0);
    const productsByType = Object.entries(productTypeCount).map(([type, count]) => ({
      type: usingFallbackForProducts ? `${type} (Pending)` : type,
      count,
      percentage: totalProductsForChart > 0 ? (count / totalProductsForChart * 100) : 0
    }));

    // 2. Order Status Distribution (Pie Chart) - Use all orders
    const statusCount = {};
    validOrders.forEach(order => {
      const status = order.status || 'Unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    const orderStatusDistribution = Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
      percentage: validOrders.length > 0 ? (count / validOrders.length * 100) : 0
    }));

    // 3. Revenue Breakdown (Bar Chart)
    const totalProductsSold = stats.totalProductsSold || 0;
    const productRevenue = totalProductsSold * 70000;
    const supplierCosts = validSupplierOrders.reduce((sum, order) => sum + ((order.quantity || 0) * 3000), 0);
    const supplierDeliveries = validSupplierOrders.length || 0;

    let deliveryCosts = 0;
    if (supplierDeliveries >= 10) {
      deliveryCosts = supplierDeliveries * 1200;
    } else if (supplierDeliveries >= 5) {
      deliveryCosts = supplierDeliveries * 750;
    } else {
      deliveryCosts = supplierDeliveries * 300;
    }

    const revenueBreakdown = [
      { category: 'Product Revenue', amount: productRevenue, color: '#10b981' },
      { category: 'Supplier Costs', amount: -supplierCosts, color: '#ef4444' },
      { category: 'Delivery Costs', amount: -deliveryCosts, color: '#f59e0b' },
      { category: 'Fixed Costs', amount: -450000, color: '#6b7280' }
    ];

    // 4. Products Sold Over Time (Area Chart) - Group by round, use delivered/completed only
    const roundData = {};
    const ordersForTimeChart = deliveredCompletedOrders.length > 0 ? deliveredCompletedOrders : validOrders;

    ordersForTimeChart.forEach(order => {
      const round = order.roundId || 1;
      if (!roundData[round]) {
        roundData[round] = { round, products: 0, cumulativeProducts: 0 };
      }
      roundData[round].products += (order.quantity || 0);
    });

    let cumulative = 0;
    const productsSoldOverTime = Object.values(roundData)
      .sort((a, b) => a.round - b.round)
      .map(data => {
        cumulative += data.products;
        return { ...data, cumulativeProducts: cumulative };
      });

    // Add at least one data point if no orders exist
    if (productsSoldOverTime.length === 0) {
      productsSoldOverTime.push({ round: 1, products: 0, cumulativeProducts: 0 });
    }

    // 5. Profit Over Time (Line Chart) - Simplified version using cumulative revenue
    const profitOverTime = productsSoldOverTime.map(data => ({
      round: data.round,
      profit: (data.cumulativeProducts * 70000) - 450000 // Simplified profit calculation
    }));

    console.log('📊 Generated chart data:', {
      productsByType: productsByType.length,
      orderStatusDistribution: orderStatusDistribution.length,
      revenueBreakdown: revenueBreakdown.length,
      productsSoldOverTime: productsSoldOverTime.length,
      profitOverTime: profitOverTime.length,
      chartDataSample: {
        productsByType: productsByType.slice(0, 2),
        productsSoldOverTime: productsSoldOverTime.slice(0, 3),
        profitOverTime: profitOverTime.slice(0, 3)
      }
    });

    return {
      profitOverTime,
      productsSoldOverTime,
      productsByType,
      orderStatusDistribution,
      revenueBreakdown
    };
  };

  const handleRunSimulation = async (simulationId) => {
    try {
      await runSimulation(simulationId);
    } catch (error) {
      console.error('Failed to run simulation from dashboard:', error);
      // You could add a toast notification here
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [
          anomaliesRes,
          predictionsRes,
          simulationsRes,
          ordersRes,
          supplierOrdersRes
        ] = await Promise.all([
          api.get('/api/ProcessMining/anomalies'),
          api.get('/api/ProcessMining/delivery-predictions'),
          api.get('/api/Simulations'),
          api.get('/api/Order'),
          api.get('/api/SupplierOrder')
        ]);

        setProcessMiningData(anomaliesRes);
        setDeliveryPredictions(predictionsRes);

        // Debug logging
        console.log('📊 Dashboard API Results:', {
          orders: ordersRes?.length || 0,
          supplierOrders: supplierOrdersRes?.length || 0,
          predictions: predictionsRes,
          ordersSample: ordersRes?.slice(0, 2),
          supplierOrdersSample: supplierOrdersRes?.slice(0, 2)
        });

        // Get the 3 most recent simulations
        setRecentSimulations(simulationsRes.slice(-3).reverse());

        // Process orders data
        const formattedOrders = (ordersRes || []).map(order => ({
          id: order.id?.toString() || '',
          customer: order.appUserId || 'Unknown', // Use the actual customer name
          date: new Date(order.orderDate).toLocaleDateString(),
          amount: (order.quantity || 0) * 100, // Calculate price (100 per unit)
          status: order.status || 'Pending', // Use actual status from backend
          motorType: order.motorType || '',
          quantity: order.quantity || 0,
          signature: order.signature || '',
          roundId: order.roundId || 0,
          originalOrder: order
        }));

        // Get 5 most recent orders
        setRecentOrders(formattedOrders.slice(-5).reverse());

        // Calculate totals first
        const totalOrders = ordersRes?.length || 0;

        // Only count products from delivered/completed orders
        const deliveredOrCompleted = ordersRes?.filter(order =>
          order.status === 'Delivered' || order.status === 'Completed'
        ) || [];
        const totalProductsSold = deliveredOrCompleted.reduce((sum, order) => sum + (order.quantity || 0), 0);

        console.log('📈 Calculation Details:', {
          totalOrders,
          totalProductsSold,
          ordersCount: ordersRes?.length,
          supplierOrdersCount: supplierOrdersRes?.length,
          deliveredCompletedCount: deliveredOrCompleted.length,
          allOrderStatuses: ordersRes?.map(o => ({ id: o.id, status: o.status, quantity: o.quantity })) || [],
          deliveredCompletedOrders: deliveredOrCompleted.map(o => ({ id: o.id, status: o.status, quantity: o.quantity }))
        });

        // Calculate complex revenue based on requirements
        const productRevenue = totalProductsSold * 70000; // 70,000 per product sold

        // Calculate supplier costs (3,000 per block)
        const supplierCosts = supplierOrdersRes?.reduce((sum, supplierOrder) => {
          return sum + ((supplierOrder.quantity || 0) * 3000);
        }, 0) || 0;

        // Calculate total blocks bought from suppliers
        const totalBlocksBought = supplierOrdersRes?.reduce((sum, supplierOrder) => {
          return sum + (supplierOrder.quantity || 0);
        }, 0) || 0;

        // Calculate delivery costs based on supplier deliveries (blocks bought), not customer deliveries
        const supplierDeliveries = supplierOrdersRes?.length || 0;

        // Calculate delivery costs using Excel formula: IF(supplierDeliveries>=5;IF(supplierDeliveries>=10;supplierDeliveries*1200;supplierDeliveries*750);supplierDeliveries*300)
        let deliveryCosts = 0;
        if (supplierDeliveries >= 10) {
          deliveryCosts = supplierDeliveries * 1200;
        } else if (supplierDeliveries >= 5) {
          deliveryCosts = supplierDeliveries * 750;
        } else {
          deliveryCosts = supplierDeliveries * 300;
        }

        // Calculate total revenue: product revenue - supplier costs - delivery costs - fixed cost
        const totalRevenue = productRevenue - supplierCosts - deliveryCosts - 450000;

        console.log('💰 Revenue Calculation:', {
          productRevenue,
          supplierCosts,
          deliveryCosts,
          supplierDeliveries,
          totalRevenue,
          detailedBreakdown: {
            'Total Orders': totalOrders,
            'Delivered/Completed Orders': deliveredOrCompleted.length,
            'Total Products Sold (delivered/completed only)': totalProductsSold,
            'Product Revenue (products * 70k)': productRevenue,
            'Supplier Orders Count': supplierOrdersRes?.length || 0,
            'Total Blocks Bought': totalBlocksBought,
            'Supplier Costs (blocks * 3k)': -supplierCosts,
            'Supplier Deliveries': supplierDeliveries,
            'Delivery Cost Formula': supplierDeliveries >= 10 ? `${supplierDeliveries} * 1200` :
              supplierDeliveries >= 5 ? `${supplierDeliveries} * 750` :
                `${supplierDeliveries} * 300`,
            'Delivery Costs': -deliveryCosts,
            'Fixed Cost': -450000,
            'Final Total Revenue': totalRevenue
          },
          supplierOrderDetails: supplierOrdersRes?.map(so => ({
            id: so.id,
            quantity: so.quantity,
            cost: (so.quantity || 0) * 3000
          })) || [],
          deliveredOrderDetails: deliveredOrCompleted.map(o => ({
            id: o.id,
            status: o.status,
            quantity: o.quantity,
            revenue: (o.quantity || 0) * 70000
          }))
        });

        const pendingOrders = predictionsRes?.delayedOrders || 0;

        setDashboardStats({
          totalOrders,
          pendingOrders,
          totalRevenue,
          totalProductsSold,
          totalBlocksBought
        });

        // Generate chart data
        const chartData = generateChartData(ordersRes, supplierOrdersRes, {
          totalOrders,
          pendingOrders,
          totalRevenue,
          totalProductsSold
        });
        setChartData(chartData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Refetch when round changes to get updated data
  useEffect(() => {
    if (currentRound && !loading) {
      console.log('🔄 Round changed, refetching dashboard data for round:', currentRound.number);
      // Only refetch process mining and orders data, not simulations
      const fetchUpdatedData = async () => {
        try {
          const [predictionsRes, ordersRes, supplierOrdersRes] = await Promise.all([
            api.get('/api/ProcessMining/delivery-predictions'),
            api.get('/api/Order'),
            api.get('/api/SupplierOrder')
          ]);

          setDeliveryPredictions(predictionsRes);

          const formattedOrders = (ordersRes || []).map(order => ({
            id: order.id?.toString() || '',
            customer: order.appUserId || 'Unknown', // Use the actual customer name
            date: new Date(order.orderDate).toLocaleDateString(),
            amount: (order.quantity || 0) * 100,
            status: order.status || 'Pending', // Use actual status from backend
            motorType: order.motorType || '',
            quantity: order.quantity || 0,
            signature: order.signature || '',
            roundId: order.roundId || 0,
            originalOrder: order
          }));

          setRecentOrders(formattedOrders.slice(-5).reverse());

          // Calculate complex revenue - only count delivered/completed products
          const deliveredCompletedOrders = ordersRes?.filter(order =>
            order.status === 'Delivered' || order.status === 'Completed'
          ) || [];
          const totalProductsSold = deliveredCompletedOrders.reduce((sum, order) => sum + (order.quantity || 0), 0);
          const productRevenue = totalProductsSold * 70000;

          const supplierCosts = supplierOrdersRes?.reduce((sum, supplierOrder) => {
            return sum + ((supplierOrder.quantity || 0) * 3000);
          }, 0) || 0;

          const totalBlocksBought = supplierOrdersRes?.reduce((sum, supplierOrder) => {
            return sum + (supplierOrder.quantity || 0);
          }, 0) || 0;

          const supplierDeliveries = supplierOrdersRes?.length || 0;

          let deliveryCosts = 0;
          if (supplierDeliveries >= 10) {
            deliveryCosts = supplierDeliveries * 1200;
          } else if (supplierDeliveries >= 5) {
            deliveryCosts = supplierDeliveries * 750;
          } else {
            deliveryCosts = supplierDeliveries * 300;
          }

          const totalRevenue = productRevenue - supplierCosts - deliveryCosts - 450000;
          const totalOrders = ordersRes?.length || 0;
          const pendingOrders = predictionsRes?.delayedOrders || 0;

          setDashboardStats({
            totalOrders,
            pendingOrders,
            totalRevenue,
            totalProductsSold,
            totalBlocksBought
          });

          // Generate updated chart data
          const chartData = generateChartData(ordersRes, supplierOrdersRes, {
            totalOrders,
            pendingOrders,
            totalRevenue,
            totalProductsSold
          });
          setChartData(chartData);
        } catch (error) {
          console.error('Error refreshing dashboard data:', error);
        }
      };

      fetchUpdatedData();
    }
  }, [currentRound?.number, loading]);

  // Periodic refresh when simulation is running to catch new orders
  useEffect(() => {
    if (!isRunning || loading) return;

    const interval = setInterval(async () => {
      console.log('🔄 Periodic dashboard refresh for running simulation');
      try {
        const [predictionsRes, ordersRes, supplierOrdersRes] = await Promise.all([
          api.get('/api/ProcessMining/delivery-predictions'),
          api.get('/api/Order'),
          api.get('/api/SupplierOrder')
        ]);

        setDeliveryPredictions(predictionsRes);

        const formattedOrders = (ordersRes || []).map(order => ({
          id: order.id?.toString() || '',
          customer: order.appUserId || 'Unknown', // Use the actual customer name
          date: new Date(order.orderDate).toLocaleDateString(),
          amount: (order.quantity || 0) * 100,
          status: order.status || 'Pending', // Use actual status from backend
          motorType: order.motorType || '',
          quantity: order.quantity || 0,
          signature: order.signature || '',
          roundId: order.roundId || 0,
          originalOrder: order
        }));

        setRecentOrders(formattedOrders.slice(-5).reverse());

        // Calculate complex revenue - only count delivered/completed products
        const deliveredCompletedOrdersRefresh = ordersRes?.filter(order =>
          order.status === 'Delivered' || order.status === 'Completed'
        ) || [];
        const totalProductsSold = deliveredCompletedOrdersRefresh.reduce((sum, order) => sum + (order.quantity || 0), 0);
        const productRevenue = totalProductsSold * 70000;

        const supplierCosts = supplierOrdersRes?.reduce((sum, supplierOrder) => {
          return sum + ((supplierOrder.quantity || 0) * 3000);
        }, 0) || 0;

        const totalBlocksBought = supplierOrdersRes?.reduce((sum, supplierOrder) => {
          return sum + (supplierOrder.quantity || 0);
        }, 0) || 0;

        const supplierDeliveries = supplierOrdersRes?.length || 0;

        let deliveryCosts = 0;
        if (supplierDeliveries >= 10) {
          deliveryCosts = supplierDeliveries * 1200;
        } else if (supplierDeliveries >= 5) {
          deliveryCosts = supplierDeliveries * 750;
        } else {
          deliveryCosts = supplierDeliveries * 300;
        }

        const totalRevenue = productRevenue - supplierCosts - deliveryCosts - 450000;
        const totalOrders = ordersRes?.length || 0;
        const pendingOrders = predictionsRes?.delayedOrders || 0;

        setDashboardStats({
          totalOrders,
          pendingOrders,
          totalRevenue,
          totalProductsSold,
          totalBlocksBought
        });

        // Generate updated chart data
        const chartData = generateChartData(ordersRes, supplierOrdersRes, {
          totalOrders,
          pendingOrders,
          totalRevenue,
          totalProductsSold
        });
        setChartData(chartData);
      } catch (error) {
        console.error('Error during periodic dashboard refresh:', error);
      }
    }, 5000); // Refresh every 5 seconds when simulation is running

    return () => clearInterval(interval);
  }, [isRunning, loading]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Loading dashboard data...</p>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Overview of your order management system</p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="flex flex-col bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Orders</div>
          <div className="text-3xl font-bold mt-1 text-blue-900 dark:text-blue-100">{dashboardStats.totalOrders}</div>
        </Card>

        <Card className="flex flex-col bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700">
          <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending Orders</div>
          <div className="text-3xl font-bold mt-1 text-yellow-900 dark:text-yellow-100">{dashboardStats.pendingOrders}</div>
        </Card>

        <Card className="flex flex-col bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <div className="text-sm font-medium text-green-600 dark:text-green-400">Total Revenue</div>
          <div className="text-3xl font-bold mt-1 text-green-900 dark:text-green-100">${dashboardStats.totalRevenue.toLocaleString()}</div>
        </Card>

        <Card className="flex flex-col bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Products Sold</div>
          <div className="text-3xl font-bold mt-1 text-purple-900 dark:text-purple-100">{dashboardStats.totalProductsSold}</div>
        </Card>

        <Card className="flex flex-col bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <div className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Blocks Bought</div>
          <div className="text-3xl font-bold mt-1 text-orange-900 dark:text-orange-100">{dashboardStats.totalBlocksBought}</div>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Over Time */}
        <Card title="📈 Profit Over Time">
          <ResponsiveContainer width="100%" height={300}>
            {chartData.profitOverTime.length > 0 ? (
              <LineChart data={chartData.profitOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="round" label={{ value: 'Round', position: 'insideBottom', offset: -10 }} />
                <YAxis label={{ value: 'Profit ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Profit']} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No profit data available</p>
                </div>
              </div>
            )}
          </ResponsiveContainer>
        </Card>

        {/* Products Sold Over Time */}
        <Card title="📦 Products Sold Over Time">
          <ResponsiveContainer width="100%" height={300}>
            {chartData.productsSoldOverTime.length > 0 ? (
              <AreaChart data={chartData.productsSoldOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="round" label={{ value: 'Round', position: 'insideBottom', offset: -10 }} />
                <YAxis label={{ value: 'Products Sold', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [value, 'Products']} />
                <Area
                  type="monotone"
                  dataKey="cumulativeProducts"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No sales data available</p>
                </div>
              </div>
            )}
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products by Type */}
        <Card title={`🔧 Products by Type${chartData.productsByType.some(p => p.type.includes('Pending')) ? ' (Including Pending)' : ''}`}>
          <ResponsiveContainer width="100%" height={250}>
            {chartData.productsByType.length > 0 ? (
              <PieChart>
                <Pie
                  data={chartData.productsByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ type, percentage }) => `${type}: ${percentage.toFixed(1)}%`}
                >
                  {chartData.productsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, 'Products']} />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <PieChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No product data available</p>
                </div>
              </div>
            )}
          </ResponsiveContainer>
        </Card>

        {/* Order Status Distribution */}
        <Card title="📊 Order Status">
          <ResponsiveContainer width="100%" height={250}>
            {chartData.orderStatusDistribution.length > 0 ? (
              <PieChart>
                <Pie
                  data={chartData.orderStatusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ status, percentage }) => `${status}: ${percentage.toFixed(1)}%`}
                >
                  {chartData.orderStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, 'Orders']} />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No order data available</p>
                </div>
              </div>
            )}
          </ResponsiveContainer>
        </Card>

        {/* Revenue Breakdown */}
        <Card title="💰 Revenue Breakdown">
          <ResponsiveContainer width="100%" height={250}>
            {chartData.revenueBreakdown.length > 0 ? (
              <BarChart data={chartData.revenueBreakdown} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={80} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill={(entry) => entry.color || '#8884d8'}>
                  {chartData.revenueBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <TrendingDown className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No revenue data available</p>
                </div>
              </div>
            )}
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Orders (Compact Version) */}
      <Card title="📋 Recent Orders">
        <div className="space-y-3">
          {recentOrders.slice(0, 3).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  #{order.id}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {order.customer} • {order.date}
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  ${order.amount.toFixed(2)}
                </div>
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
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