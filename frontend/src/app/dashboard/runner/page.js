"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, Package, Truck } from 'lucide-react';
import { api } from '@CASUSGROEP1/utils/api';

const RunnerDashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all orders from API when component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const allOrders = await api.get('/api/Order');
        
        // Format all orders for runner view
        const formattedOrders = allOrders.map(order => ({
          id: order.id.toString(),
          productName: `Assembly Unit ${order.motorType}-${order.id}`,
          customer: order.appUserId ? `Customer ${order.appUserId}` : 'Unknown Customer',
          quantity: order.quantity,
          motorType: order.motorType,
          status: order.productionStatus || 'In Queue',
          orderDate: order.roundId || 1,
          assemblyLine: `Production Line ${order.motorType}`,
          originalOrder: order
        }));
          
        setOrders(formattedOrders);
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
      case 'In Progress': return 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/20';
      case 'In Queue': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
      case 'Completed': return 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const getAssemblyLineColor = (motorType) => {
    switch (motorType) {
      case 'A': return 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/30';
      case 'B': return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30';
      case 'C': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      default: return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800';
    }
  };

  const renderOrderDetails = (order) => (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
        <label className="text-sm font-medium text-purple-700 dark:text-purple-400">Customer</label>
        <p className="text-gray-900 dark:text-white font-medium">{order.customer}</p>
      </div>
      <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg">
        <label className="text-sm font-medium text-cyan-700 dark:text-cyan-400">Quantity</label>
        <p className="text-gray-900 dark:text-white font-medium">{order.quantity}</p>
      </div>
      <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg">
        <label className="text-sm font-medium text-pink-700 dark:text-pink-400">Motor Type</label>
        <p className="text-gray-900 dark:text-white font-medium">{order.motorType}</p>
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <label className="text-sm font-medium text-blue-700 dark:text-blue-400">Period Ordered</label>
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-medium">
          {order.orderDate}
        </span>
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

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Runner Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Overview of all orders and delivery destinations</p>
          <div className="flex justify-start mt-4 mb-2">
            <span className="inline-flex items-center px-4 py-2 rounded-lg bg-orange-600 text-white text-base font-semibold dark:bg-orange-700">
              Total Orders: {orders.length}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6 h-full">
          {/* Left Container - All Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex justify-between items-center mt-4 mb-4">
              <h3 className="text-lg font-bold text-orange-700 dark:text-orange-400 mb-0">All Orders</h3>
              <div className="flex items-center m-0">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p>No orders found</p>
                </div>
              ) : (
                orders
                  .slice()
                  .sort((a, b) => a.orderDate - b.orderDate) // Sort by period ordered (earliest first)
                  .map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedOrder?.id === order.id
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-400' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{order.id}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{order.productName}</p>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            Period: {order.orderDate}
                          </span>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Assembly Line Highlight */}
                      <div className="mb-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getAssemblyLineColor(order.motorType)}`}>
                          → {order.assemblyLine}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>Qty: {order.quantity}</span>
                        <span>Type: {order.motorType}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                        <span>{order.customer}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
          
          {/* Right Container - Order Details & Delivery Info / Future Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            {selectedOrder ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-black dark:text-white">{selectedOrder.productName}</h3>
                  <p className="text-gray-600 dark:text-gray-400">Order: {selectedOrder.id}</p>
                </div>
                
                {/* Delivery Information - Highlighted */}
                <div className="mb-6">
                  {renderDeliveryInfo(selectedOrder)}
                </div>
                
                {/* Order Details */}
                {renderOrderDetails(selectedOrder)}
                
                {/* Runner Action Info */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Package className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Runner Instructions</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Deliver this order to <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedOrder.assemblyLine}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Priority: Period {selectedOrder.orderDate} order
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white">Select an Order</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Choose an order to view delivery details and instructions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunnerDashboard;