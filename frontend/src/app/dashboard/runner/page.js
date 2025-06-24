"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, Package, Truck, Users } from 'lucide-react';
import { api } from '@CASUSGROEP1/utils/api';
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
        // Fetch regular orders and missing blocks requests
        const [allOrders, missingBlocksData] = await Promise.all([
          api.get('/api/Order'),
          api.get('/api/MissingBlocks/runner')
        ]);

        // Filter regular orders by status
        const filteredOrders = allOrders.filter(order =>
          order.status === "ApprovedByAccountManager"
        );

        const formattedOrders = filteredOrders.map(order => ({
          id: order.id.toString(),
          productName: `Assembly Unit ${order.motorType}-${order.id}`,
          customer: order.appUserId ? `Customer ${order.appUserId}` : 'Unknown Customer',
          quantity: order.quantity,
          motorType: order.motorType,
          status: order.status || 'In Queue',
          orderDate: order.roundId || order.orderDate || 1,
          assemblyLine: `Production Line ${order.motorType}`,
          originalOrder: order,
          type: 'regular'
        }));

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

        // Combine both types of orders
        const allFormattedOrders = [...formattedOrders, ...formattedMissingBlocks];
        setOrders(allFormattedOrders);
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
      case 'In Progress': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'In Queue': return 'text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-900/20';
      case 'Completed': return 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/20';
      case 'ProductionError': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'Missing Blocks': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20 animate-pulse';
      default: return 'text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-800';
    }
  };

  const getAssemblyLineColor = (motorType) => {
    switch (motorType) {
      case 'A': return 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/30';
      case 'B': return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30';
      case 'C': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      default: return 'text-zinc-700 bg-zinc-100 dark:text-zinc-300 dark:bg-zinc-800';
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
      if (selectedOrder.type === 'missing-blocks') {
        // For missing blocks requests, escalate to supplier instead of marking as delivered
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
        
      } else {
        // Regular order delivery logic
        // Save the current order and its previous status for undo
        setLastDeliveredOrder({
          ...selectedOrder,
          previousStatus: selectedOrder.status,
          status: "Delivered"
        });

        // Update status in the API - Set to Pending so production lines can start working
        await api.patch(`/api/Order/${selectedOrder.id}/status`, { status: "Pending" })
          .catch(err => {
            console.warn('API status update not supported, updating locally:', err.message);
          });

        // Optionally, update the local selectedOrder status before removing
        setSelectedOrder(prev =>
          prev ? { ...prev, status: "Pending" } : prev
        );

        // Remove from list
        setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
      }
    } catch (error) {
      console.error('Error handling delivery:', error);
    }
  };

  return (
    <div className="h-screen bg-black">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Runner Dashboard</h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">Overview of all orders and delivery destinations</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-4 py-2 rounded-lg bg-zinc-600 text-white text-base font-semibold dark:bg-zinc-700">
                <Users className="w-4 h-4 mr-2" />
                Total: {orders.length}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Live Updates</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6 h-full">
          {/* Left Container - All Orders */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-400">All Orders</h3>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p>No orders found</p>
                </div>
              ) : (
                orders
                  .slice()
                  .sort((a, b) => {
                    // Missing blocks requests (orderDate: 999) should appear at top
                    if (a.orderDate === 999 && b.orderDate !== 999) return -1;
                    if (a.orderDate !== 999 && b.orderDate === 999) return 1;
                    return a.orderDate - b.orderDate;
                  })
                  .map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedOrder?.id === order.id
                          ? 'border-zinc-500 bg-zinc-50 dark:bg-zinc-900/20 dark:border-zinc-400' 
                          : order.status === 'Missing Blocks'
                          ? 'border-orange-300 dark:border-orange-600 hover:border-orange-400 dark:hover:border-orange-500 bg-orange-25 dark:bg-orange-900/10'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-zinc-900 dark:text-white">
                            {order.type === 'missing-blocks' ? `Order ${order.missingBlocksRequest?.orderId}` : order.id}
                          </h4>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">{order.productName}</p>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            order.orderDate === 999 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          }`}>
                            {order.orderDate === 999 ? 'URGENT' : `Period: ${order.orderDate}`}
                          </span>
                        </div>
                      </div>
                      
                      <div className={`mb-2 flex items-center gap-2`}>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getAssemblyLineColor(order.motorType)}`}>
                          → {order.assemblyLine}
                        </span>
                        {/* Visual flair for Missing Blocks */}
                        {order.status === "Missing Blocks" ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-400 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-600 animate-pulse">
                            Missing Blocks
                          </span>
                        ) : order.status === "ProductionError" ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-400 dark:bg-red-900 dark:text-red-200 dark:border-red-600 animate-pulse">
                            Production Error
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                            {order.status}
                          </span>
                        )}
                      </div>
                
                      <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
                        <span>Qty: {order.quantity}</span>
                        <span>Type: {order.motorType}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
          
          {/* Right Container - Order Details & Delivery Info / Future Notifications */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 mb-6">
            {selectedOrder ? (
              selectedOrder.status === "Delivered" ? (
                <div className="flex flex-col items-center justify-center h-full">
                  {/* Delivery Complete Icon */}
                  <Package className="w-16 h-16 text-green-500 dark:text-green-400 mb-4" />
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">Order Delivered!</p>
                  <p className="text-zinc-600 dark:text-zinc-400">This order has been marked as delivered and is no longer active.</p>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{selectedOrder.productName}</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">Order: {selectedOrder.id}</p>
                  </div>
                  
                  {/* Delivery Information - Highlighted */}
                  <div className="mb-6">
                    {renderDeliveryInfo(selectedOrder)}
                  </div>
                  
                  {/* Order Details */}
                  {renderOrderDetails(selectedOrder)}
                  
                  {/* Runner Action Info */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Package className="w-5 h-5 text-zinc-600 dark:text-zinc-400 mr-2" />
                      <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Runner Instructions</h4>
                    </div>
                    {selectedOrder.type === 'missing-blocks' ? (
                      <>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Try to deliver missing blocks to <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedOrder.assemblyLine}</span>
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                          If you cannot deliver, click "Can't Deliver" to escalate to supplier
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Deliver this order to <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedOrder.assemblyLine}</span>
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                          Priority: Period {selectedOrder.orderDate} order
                        </p>
                      </>
                    )}
                  </div>

                  {/* Delivered Button */}
                  <div className="flex flex-col items-stretch justify-start gap-2 mt-4 pl-2">
                    <button
                      className={`w-full px-6 py-3 text-lg text-white rounded-md font-bold disabled:opacity-50 transition-all ${
                        selectedOrder.type === 'missing-blocks'
                          ? 'bg-orange-600 hover:bg-orange-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                      onClick={handleDeliveredOrder}
                      disabled={selectedOrder?.status === "Delivered"}
                    >
                      {selectedOrder.type === 'missing-blocks' ? "Can't Deliver - Escalate to Supplier" : "Delivered"}
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
                <div className="text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-zinc-400 dark:text-zinc-500" />
                  <p className="text-lg font-medium text-zinc-900 dark:text-white">Select an Order</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Choose an order to view delivery details and instructions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Move Undo Last Delivered button OUTSIDE and BELOW the right container */}
      {lastDeliveredOrder && lastDeliveredOrder.status === "Delivered" && (
        <div className="flex justify-end mt-4 mb-8 pr-8">
          <button
            className="px-6 py-3 bg-yellow-500 text-white rounded-md font-bold hover:bg-yellow-600 shadow-lg transition-all"
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
      )}
    </div>
  );
};

export default RunnerDashboard;