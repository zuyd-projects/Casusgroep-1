"use client";

import { useState, useEffect } from 'react';
import { api } from '@CASUSGROEP1/utils/api';
import StatusBadge from '@CASUSGROEP1/components/StatusBadge';
import Card from '@CASUSGROEP1/components/Card';
import { Truck, Package, Calendar, User, CheckCircle, Clock, AlertCircle, MapPin, Users } from 'lucide-react';
import { getMotorTypeColors } from '@CASUSGROEP1/utils/motorColors';

export default function DeliveryDashboard() {
  // Regular delivery orders state
  const [readyForDelivery, setReadyForDelivery] = useState([]);
  const [inTransit, setInTransit] = useState([]);
  const [delivered, setDelivered] = useState([]);
  const [allDeliveryOrders, setAllDeliveryOrders] = useState([]);
  
  // Missing blocks (runner functionality) state
  const [missingBlocksOrders, setMissingBlocksOrders] = useState([]);
  const [selectedMissingBlocksOrder, setSelectedMissingBlocksOrder] = useState(null);
  const [lastDeliveredOrder, setLastDeliveredOrder] = useState(null);
  
  // Common state
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ready');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all orders, rounds, and missing blocks data
      const [allOrdersResponse, apiRounds, missingBlocksData] = await Promise.all([
        api.get('/api/Order'),
        api.get('/api/Rounds'),
        api.get('/api/MissingBlocks/runner')
      ]);
      
      // Store rounds data for lookup
      setRounds(apiRounds);
      
      // Process regular delivery orders
      const deliveryRelevantOrders = allOrdersResponse.filter(order => 
        ['ApprovedByAccountManager', 'Delivered', 'Completed'].includes(order.status)
      );
      
      setAllDeliveryOrders(deliveryRelevantOrders);

      // Categorize orders by delivery status
      const ready = deliveryRelevantOrders.filter(order => 
        order.status === 'ApprovedByAccountManager'
      );
      const deliveredOrders = deliveryRelevantOrders.filter(order => 
        order.status === 'Delivered'
      );
      const completedOrders = deliveryRelevantOrders.filter(order => 
        order.status === 'Completed'
      );

      setReadyForDelivery(ready);
      setInTransit(deliveredOrders);
      setDelivered(completedOrders);

      // Process missing blocks requests (runner functionality)
      const formattedMissingBlocks = missingBlocksData.map(request => ({
        id: `missing-${request.id}`,
        productName: `Missing Blocks - Order ${request.orderId}`,
        customer: 'Production Line',
        quantity: request.quantity,
        motorType: request.motorType,
        status: 'Missing Blocks',
        orderDate: 999, // High priority
        assemblyLine: `Production Line ${request.productionLine}`,
        missingBlocksRequest: request,
        type: 'missing-blocks'
      }));

      setMissingBlocksOrders(formattedMissingBlocks);

    } catch (error) {
      console.error('Failed to fetch delivery data:', error);
      setError('Failed to load delivery data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryStatusUpdate = async (orderId, newStatus) => {
    try {
      // Update order status via API
      await api.patch(`/api/Order/${orderId}/status`, { status: newStatus });
      
      // Update local state
      const updateOrderInList = (list) => 
        list.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        );

      setReadyForDelivery(prev => updateOrderInList(prev));
      setInTransit(prev => updateOrderInList(prev));
      setDelivered(prev => updateOrderInList(prev));
      setAllDeliveryOrders(prev => updateOrderInList(prev));

      // Re-categorize after status update
      setTimeout(fetchData, 500);
      
    } catch (error) {
      console.error('Failed to update delivery status:', error);
      alert('Failed to update delivery status. Please try again.');
    }
  };

  const getStatusCounts = () => {
    return {
      ready: readyForDelivery.length,
      inTransit: inTransit.length,
      delivered: delivered.length,
      total: allDeliveryOrders.length,
      missingBlocks: missingBlocksOrders.length
    };
  };

  // Missing blocks handling functions (from runner page)
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'In Queue': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'Completed': return 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300';
      case 'ProductionError': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 animate-pulse';
      case 'Missing Blocks': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 animate-pulse';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getAssemblyLineColor = (motorType) => {
    switch (motorType) {
      case 'A': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'C': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const handleMissingBlocksDelivery = async () => {
    if (!selectedMissingBlocksOrder) return;

    try {
      const request = selectedMissingBlocksOrder.missingBlocksRequest;
      
      // Update the missing blocks request to mark that runner attempted delivery
      await api.put(`/api/MissingBlocks/${request.id}`, {
        status: 'Pending',
        runnerAttempted: true,
        resolvedBy: null
      });

      // Remove from runner's list (it will now appear on supplier page)
      setMissingBlocksOrders(prev => prev.filter(o => o.id !== selectedMissingBlocksOrder.id));
      setSelectedMissingBlocksOrder(null);
      
      alert(`Cannot deliver missing blocks. Request escalated to supplier for Order ${request.orderId}.`);
    } catch (error) {
      console.error('Error handling missing blocks delivery:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoundInfo = (roundId) => {
    if (!roundId || !rounds.length) return { roundNumber: null, simulationId: null };
    const roundData = rounds.find(round => round.id === roundId);
    return {
      roundNumber: roundData?.roundNumber || null,
      simulationId: roundData?.simulationId || null
    };
  };

  const DeliveryActions = ({ order }) => {
    const canMarkDelivered = order.status === 'ApprovedByAccountManager';
    const canMarkCompleted = order.status === 'Delivered';

    return (
      <div className="flex flex-col gap-2">
      {canMarkDelivered && (
        <button
        onClick={() => handleDeliveryStatusUpdate(order.id, 'Delivered')}
        className="inline-flex items-center justify-center w-40 h-20 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-400 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-md transition-colors"
        >
        <Truck className="h-3 w-3 mr-1" />
        Mark as Delivered
        </button>
      )}
      {canMarkCompleted && (
        <button
        onClick={() => handleDeliveryStatusUpdate(order.id, 'Completed')}
        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-md transition-colors"
        >
        <CheckCircle className="h-3 w-3 mr-1" />
        Mark as Completed
        </button>
      )}
      </div>
    );
  };

  const OrderCard = ({ order, showActions = true }) => {
    const { roundNumber, simulationId } = getRoundInfo(order.roundId);
    
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                Order #{order.id}
              </h3>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center flex-wrap gap-3 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center">
                <Package className="h-4 w-4 mr-1" />
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${getMotorTypeColors(order.motorType).full} rounded-md ml-1`}>
                  Motor {order.motorType}
                </span>
              </span>
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                Qty: {order.quantity}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(order.orderDate)}
              </span>
              {simulationId && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md">
                  Sim {simulationId}
                </span>
              )}
              {roundNumber && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-md">
                  Round {roundNumber}
                </span>
              )}
            </div>
          </div>
          {showActions && (
            <div className="flex items-start ml-4">
              <DeliveryActions order={order} />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Missing Blocks Components (from runner page)
  const renderMissingBlocksOrderDetails = (order) => (
    <div>
      {/* Missing Blocks Alert */}
      {order.status === "Missing Blocks" && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
            <h4 className="text-lg font-bold text-orange-800 dark:text-orange-300">Missing Building Blocks</h4>
          </div>
          <p className="text-orange-700 dark:text-orange-300 font-medium">
            Production Line {order.missingBlocksRequest?.productionLine} is missing building blocks.
          </p>
          {order.missingBlocksRequest && (
            <div className="mt-3 text-sm text-orange-600 dark:text-orange-400">
              <p>Missing: Blue: {order.missingBlocksRequest.blueBlocks}, Red: {order.missingBlocksRequest.redBlocks}, Gray: {order.missingBlocksRequest.grayBlocks}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-50 dark:bg-zinc-900/20 p-3 rounded-lg">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-400">Customer</label>
          <p className="text-zinc-900 dark:text-white font-medium">{order.customer}</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900/20 p-3 rounded-lg">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-400">Quantity</label>
          <p className="text-zinc-900 dark:text-white font-medium">{order.quantity}</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900/20 p-3 rounded-lg">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-400">Motor Type</label>
          <p className="text-zinc-900 dark:text-white font-medium">{order.motorType}</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900/20 p-3 rounded-lg">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-400">Period Ordered</label>
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-medium">
            {order.orderDate === 999 ? 'URGENT' : order.orderDate}
          </span>
        </div>
      </div>
    </div>
  );

  const renderMissingBlocksDeliveryInfo = (order) => (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-700">
      <div className="flex items-center mb-3">
        <Truck className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
        <h4 className="text-lg font-bold text-orange-800 dark:text-orange-300">Delivery Information</h4>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-sm font-medium text-orange-700 dark:text-orange-400">Destination</label>
          <p className="text-lg font-bold text-orange-900 dark:text-orange-200">{order.assemblyLine}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-orange-700 dark:text-orange-400">Priority</label>
          <p className="text-sm text-orange-800 dark:text-orange-300">Period {order.orderDate} - {order.orderDate === 999 ? 'URGENT - Missing Blocks' : 'Standard Priority'}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Clock className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Loading delivery orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12 text-red-500">
          <AlertCircle className="h-8 w-8 mr-2" />
          <span className="text-lg">{error}</span>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Delivery & Runner Management
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Manage order deliveries and missing blocks requests
        </p>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Ready for Delivery</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{statusCounts.ready}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center">
            <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Delivered</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statusCounts.inTransit}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statusCounts.delivered}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Missing Blocks</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{statusCounts.missingBlocks}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Total Orders</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{statusCounts.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('ready')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ready'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
          >
            Ready for Delivery ({statusCounts.ready})
          </button>
          <button
            onClick={() => setActiveTab('transit')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transit'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
          >
            Delivered ({statusCounts.inTransit})
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'delivered'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
          >
            Completed ({statusCounts.delivered})
          </button>
          <button
            onClick={() => setActiveTab('missing-blocks')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'missing-blocks'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
          >
            Missing Blocks ({statusCounts.missingBlocks})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
          >
            All Orders ({statusCounts.total})
          </button>
        </nav>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {activeTab === 'ready' && (
          <>
            {readyForDelivery.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-orange-500" />
                <h3 className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  No orders ready for delivery
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Orders will appear here when they are approved by the account manager and ready to ship.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {readyForDelivery.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'transit' && (
          <>
            {inTransit.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="mx-auto h-12 w-12 text-blue-500" />
                <h3 className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  No delivered orders awaiting completion
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Orders that have been delivered to customers will appear here until completed.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {inTransit.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'delivered' && (
          <>
            {delivered.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  No completed orders
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Orders completed by customers will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {delivered.map((order) => (
                  <OrderCard key={order.id} order={order} showActions={false} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'missing-blocks' && (
          <>
            {missingBlocksOrders.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-orange-500" />
                <h3 className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  No missing blocks requests
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  All production lines have sufficient building blocks.
                </p>
              </div>
            ) : (
              <Card title="🚚 Missing Blocks Queue">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                    <thead className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left">
                          Order
                        </th>
                        <th scope="col" className="px-6 py-3 text-left">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left">
                          Destination
                        </th>
                        <th scope="col" className="px-6 py-3 text-left">
                          Priority
                        </th>
                        <th scope="col" className="px-6 py-3 text-left">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {missingBlocksOrders
                        .slice()
                        .sort((a, b) => {
                          return a.missingBlocksRequest?.orderId - b.missingBlocksRequest?.orderId;
                        })
                        .map((order) => (
                          <tr
                            key={order.id}
                            className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors ${
                              selectedMissingBlocksOrder?.id === order.id
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                                : ''
                            }`}
                            onClick={() => setSelectedMissingBlocksOrder(selectedMissingBlocksOrder?.id === order.id ? null : order)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-zinc-900 dark:text-white">
                                  Order {order.missingBlocksRequest?.orderId}
                                </div>
                                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                  Missing Blocks Request
                                </div>
                              </div>
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-zinc-900 dark:text-white">
                                Motor Type {order.motorType}
                              </div>
                              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                {order.customer}
                              </div>
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAssemblyLineColor(order.motorType)}`}>
                                <Truck className="w-4 h-4 mr-1" />
                                {order.assemblyLine}
                              </span>
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 animate-pulse`}>
                                🚨 URGENT
                              </span>
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {order.status}
                              </span>
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-white">
                              {order.quantity}
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors text-orange-700 bg-orange-100 hover:bg-orange-200 dark:text-orange-300 dark:bg-orange-900/30 dark:hover:bg-orange-900/50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMissingBlocksOrder(order);
                                  handleMissingBlocksDelivery();
                                }}
                              >
                                Escalate to Supplier
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}

        {activeTab === 'all' && (
          <div className="space-y-3">
            {allDeliveryOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Missing Blocks Order Details Panel */}
      {selectedMissingBlocksOrder && (
        <Card title={`Missing Blocks Request: Order ${selectedMissingBlocksOrder.missingBlocksRequest?.orderId}`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-zinc-600 dark:text-zinc-400">{selectedMissingBlocksOrder.productName}</p>
            </div>
            <button
              onClick={() => setSelectedMissingBlocksOrder(null)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Information */}
            <div>
              {renderMissingBlocksDeliveryInfo(selectedMissingBlocksOrder)}
            </div>

            {/* Order Details */}
            <div>
              {renderMissingBlocksOrderDetails(selectedMissingBlocksOrder)}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 flex justify-end">
            <button
              className="px-6 py-3 rounded-lg font-semibold transition-colors bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleMissingBlocksDelivery}
            >
              Can&apos;t Deliver - Escalate to Supplier
            </button>
          </div>
        </Card>
      )}

      {/* Undo Button for Missing Blocks */}
      {lastDeliveredOrder && lastDeliveredOrder.status === "Delivered" && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex justify-end">
            <button
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold shadow-lg transition-colors"
              onClick={async () => {
                try {
                  // Revert status in backend to previousStatus
                  await api.put(`/api/Order/${lastDeliveredOrder.id}/OrderStatus`, { status: lastDeliveredOrder.previousStatus });
                  // Fetch the updated order from the backend
                  const restoredOrder = await api.get(`/api/Order/${lastDeliveredOrder.id}`);
                  // Add back to missing blocks list with previous status
                  setMissingBlocksOrders(prev => [
                    {
                      ...restoredOrder,
                      id: `missing-${restoredOrder.id}`,
                      productName: `Missing Blocks - Order ${restoredOrder.id}`,
                      customer: 'Production Line',
                      quantity: restoredOrder.quantity,
                      motorType: restoredOrder.motorType,
                      status: lastDeliveredOrder.previousStatus,
                      orderDate: 999,
                      assemblyLine: `Production Line ${restoredOrder.motorType}`,
                      missingBlocksRequest: restoredOrder,
                      type: 'missing-blocks'
                    },
                    ...prev
                  ]);
                  setLastDeliveredOrder(null);
                } catch (error) {
                  console.error('Error undoing delivery:', error);
                  alert('Failed to undo delivery. Please try again.');
                }
              }}
            >
              Undo Last Delivered
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
