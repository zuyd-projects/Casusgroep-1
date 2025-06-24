"use client";

import { useState, useEffect } from 'react';
import { api } from '@CASUSGROEP1/utils/api';
import StatusBadge from '@CASUSGROEP1/components/StatusBadge';
import { Truck, Package, Calendar, User, CheckCircle, Clock, AlertCircle, MapPin } from 'lucide-react';
import { getMotorTypeColors } from '@CASUSGROEP1/utils/motorColors';

export default function DeliveryDashboard() {
  const [readyForDelivery, setReadyForDelivery] = useState([]);
  const [inTransit, setInTransit] = useState([]);
  const [delivered, setDelivered] = useState([]);
  const [allDeliveryOrders, setAllDeliveryOrders] = useState([]);
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

      // Fetch all orders and rounds data
      const [allOrdersResponse, apiRounds] = await Promise.all([
        api.get('/api/Order'),
        api.get('/api/Rounds')
      ]);
      
      // Store rounds data for lookup
      setRounds(apiRounds);
      
      // Filter orders that are ready for delivery or already delivered
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
      setInTransit(deliveredOrders); // Using delivered as "awaiting completion"
      setDelivered(completedOrders); // Using completed as final state

    } catch (error) {
      console.error('Failed to fetch delivery orders:', error);
      setError('Failed to load delivery orders. Please try again.');
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
      total: allDeliveryOrders.length
    };
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
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-md transition-colors"
          >
            <Truck className="h-3 w-3 mr-1" />
            Mark as Delivered
          </button>
        )}
        {canMarkCompleted && (
          <button
            onClick={() => handleDeliveryStatusUpdate(order.id, 'Completed')}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-md transition-colors"
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
          Delivery Management
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Manage order deliveries and track shipping status
        </p>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        {activeTab === 'all' && (
          <div className="space-y-3">
            {allDeliveryOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
