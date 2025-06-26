"use client";

import { useState, useEffect } from 'react';
import { api } from '@CASUSGROEP1/utils/api';
import OrderStatusManager from '@CASUSGROEP1/components/OrderStatusManager';
import StatusBadge from '@CASUSGROEP1/components/StatusBadge';
import { Clock, AlertCircle, CheckCircle, Calendar, Package, User } from 'lucide-react';
import { getMotorTypeColors } from '@CASUSGROEP1/utils/motorColors';

export default function AccountManagerDashboard() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

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
      
      setAllOrders(allOrdersResponse);

      // Try to fetch orders pending approval, but fall back to filtering if unauthorized
      try {
        const pendingResponse = await api.get('/api/Order/pending-approval');
        setPendingOrders(pendingResponse);
      } catch (pendingError) {
        console.warn('Could not fetch pending orders directly, filtering from all orders:', pendingError);
        // Filter pending orders from all orders as fallback
        const pendingFromAll = allOrdersResponse.filter(order => 
          order.status === 'AwaitingAccountManagerApproval'
        );
        setPendingOrders(pendingFromAll);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    // Update both lists
    setPendingOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ).filter(order => order.status === 'AwaitingAccountManagerApproval') // Remove from pending if no longer awaiting
    );
    
    setAllOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getStatusCounts = () => {
    const counts = {
      pending: allOrders.filter(o => o.status === 'AwaitingAccountManagerApproval').length,
      approved: allOrders.filter(o => o.status === 'ApprovedByAccountManager').length,
      rejected: allOrders.filter(o => o.status === 'RejectedByAccountManager').length,
      inProduction: allOrders.filter(o => o.status === 'InProduction').length,
      completed: allOrders.filter(o => o.status === 'Completed').length,
    };
    return counts;
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Clock className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Loading orders...</span>
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
          Account Manager Dashboard
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Manage and review order statuses, approvals, and rejections
        </p>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Pending Approval</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{statusCounts.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">Approved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statusCounts.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Rejected</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{statusCounts.rejected}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">In Production</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statusCounts.inProduction}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Completed</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{statusCounts.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
          >
            Pending Approval ({statusCounts.pending})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
          >
            All Orders ({allOrders.length})
          </button>
        </nav>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {activeTab === 'pending' && (
          <>
            {pendingOrders.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  No pending approvals
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  All orders have been reviewed and processed.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOrders.map((order, index) => {
                  const { roundNumber, simulationId } = getRoundInfo(order.roundId);
                  return (
                    <div
                      key={order.id}
                      className={`border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm transition-colors ${
                        index % 2 === 0
                          ? 'bg-white dark:bg-zinc-900'
                          : 'bg-gray-50 dark:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                            Order #{order.id}
                          </h3>
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
                        <div className="flex items-start ml-4">
                          <OrderStatusManager 
                            order={order} 
                            onStatusUpdate={handleStatusUpdate}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'all' && (
          <div className="space-y-3">
            {allOrders.map((order, index) => {
              const { roundNumber, simulationId } = getRoundInfo(order.roundId);
              return (
                <div
                  key={order.id}
                  className={`border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm transition-colors ${
                    index % 2 === 0
                      ? 'bg-white dark:bg-zinc-900'
                      : 'bg-gray-50 dark:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                        Order #{order.id}
                      </h3>
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
                    <div className="flex items-start ml-4">
                      <OrderStatusManager 
                        order={order} 
                        onStatusUpdate={handleStatusUpdate}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
