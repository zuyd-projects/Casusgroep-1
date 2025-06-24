"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, Package, Truck, Users } from 'lucide-react';
import { api } from '@CASUSGROEP1/utils/api';
import Card from '@CASUSGROEP1/components/Card';
import StatusBadge from '@CASUSGROEP1/components/StatusBadge';

const RunnerDashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [missingBlocksRequests, setMissingBlocksRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDeliveredOrder, setLastDeliveredOrder] = useState(null);

  // Fetch all orders from API when component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Fetch only missing blocks requests for the runner
        const missingBlocksData = await api.get('/api/MissingBlocks/runner');

        // Format missing blocks requests as orders for the runner
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

        setOrders(formattedMissingBlocks);
        setMissingBlocksRequests(missingBlocksData);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  const renderOrderDetails = (order) => (
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

      {/* Production Error Alert */}
      {order.status === "ProductionError" && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <h4 className="text-lg font-bold text-red-800 dark:text-red-300">Production Error</h4>
          </div>
          <p className="text-red-700 dark:text-red-300 font-medium">
            This production line is missing building blocks and needs supplies delivered.
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            Contact the supplier to arrange delivery of missing components.
          </p>
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

  const renderDeliveryInfo = (order) => (
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
          <p className="text-sm text-orange-800 dark:text-orange-300">Period {order.orderDate} - {order.orderDate === 1 ? 'Highest Priority' : 'Standard Priority'}</p>
        </div>
      </div>
    </div>
  );

  const handleDeliveredOrder = async () => {
    if (!selectedOrder) return;

    try {
      // All orders are missing blocks requests, escalate to supplier
      const request = selectedOrder.missingBlocksRequest;
      
      // Update the missing blocks request to mark that runner attempted delivery
      await api.put(`/api/MissingBlocks/${request.id}`, {
        status: 'Pending',
        runnerAttempted: true,
        resolvedBy: null
      });

      // Remove from runner's list (it will now appear on supplier page)
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
      setSelectedOrder(null);
      
      alert(`Cannot deliver missing blocks. Request escalated to supplier for Order ${request.orderId}.`);
    } catch (error) {
      console.error('Error handling delivery:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Runner Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage missing blocks deliveries to production lines
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold">
              <Package className="w-4 h-4 mr-2" />
              Missing Blocks Requests: {orders.length}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live Updates</span>
          </div>
        </div>
      </div>

      {/* Runner Statistics */}
      {orders.length > 0 && (
        <Card title="📊 Runner Overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {orders.length}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Missing Blocks Requests
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {orders.filter(o => o.status === 'Missing Blocks').length}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Urgent Requests
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.motorType).length}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Production Lines Affected
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Orders Table */}
      <Card title="🚚 Missing Blocks Queue">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-zinc-500 dark:text-zinc-400">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 dark:text-zinc-400">
            <AlertCircle className="w-12 h-12 mb-4 mx-auto" />
            <p className="text-lg font-medium">No missing blocks requests found</p>
            <p className="text-sm">All production lines have sufficient blocks</p>
          </div>
        ) : (
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
                  {orders
                    .slice()
                    .sort((a, b) => {
                      // All orders are missing blocks requests, sort by order ID
                      return a.missingBlocksRequest?.orderId - b.missingBlocksRequest?.orderId;
                    })
                    .map((order) => (
                      <tr
                        key={order.id}
                        className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors ${
                          selectedOrder?.id === order.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                            : ''
                        }`}
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
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
                              setSelectedOrder(order);
                              handleDeliveredOrder();
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
          )}
      </Card>

      {/* Order Details Panel */}
      {selectedOrder && (
        <Card title={`Missing Blocks Request: Order ${selectedOrder.missingBlocksRequest?.orderId}`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-zinc-600 dark:text-zinc-400">{selectedOrder.productName}</p>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Information */}
            <div>
              {renderDeliveryInfo(selectedOrder)}
            </div>

            {/* Order Details */}
            <div>
              {renderOrderDetails(selectedOrder)}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 flex justify-end">
            <button
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                selectedOrder.type === 'missing-blocks'
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              onClick={handleDeliveredOrder}
              disabled={selectedOrder?.status === "Delivered"}
            >
              {selectedOrder.type === 'missing-blocks' ? "Can't Deliver - Escalate to Supplier" : "Mark as Delivered"}
            </button>
          </div>
        </Card>
      )}

      {/* Undo Button */}
      {lastDeliveredOrder && lastDeliveredOrder.status === "Delivered" && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex justify-end">
            <button
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold shadow-lg transition-colors"
              onClick={async () => {
                // Revert status in backend to previousStatus
                await api.put(`/api/Order/${lastDeliveredOrder.id}/OrderStatus`, { status: lastDeliveredOrder.previousStatus });
                // Fetch the updated order from the backend
                const restoredOrder = await api.get(`/api/Order/${lastDeliveredOrder.id}`);
                // Add back to list with previous status
                setOrders(prev => [
                  {
                    ...restoredOrder,
                    id: restoredOrder.id.toString(),
                    productName: `Assembly Unit ${restoredOrder.motorType}-${restoredOrder.id}`,
                    customer: restoredOrder.appUserId ? `Customer ${restoredOrder.appUserId}` : 'Unknown Customer',
                    quantity: restoredOrder.quantity,
                    motorType: restoredOrder.motorType,
                    status: lastDeliveredOrder.previousStatus,
                    orderDate: restoredOrder.roundId || restoredOrder.orderDate || 1,
                    assemblyLine: `Production Line ${restoredOrder.motorType}`,
                    originalOrder: restoredOrder
                  },
                  ...prev
                ]);
                setLastDeliveredOrder(null);
              }}
            >
              Undo Last Delivered
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RunnerDashboard;