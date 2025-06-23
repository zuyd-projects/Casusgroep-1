"use client";

import React, { useState, useRef, useEffect } from 'react';
import Script from 'next/script';
import { CheckCircle, AlertCircle, Play } from 'lucide-react';
import { api } from '@CASUSGROEP1/utils/api';

const ProductionLineDashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRemovedOrder, setLastRemovedOrder] = useState(null);
  const [restoredOrderId, setRestoredOrderId] = useState(null);
  const modelViewerRef = useRef(null);

  // Fetch orders from API when component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const allOrders = await api.get('/api/Order');
        
        // Filter orders for product type C and format them
        const typeCOrders = allOrders
          .filter(order => order.motorType === 'C')
          .map(order => ({
            id: order.id.toString(),
            productName: `Assembly Unit C-${order.id}`,
            customer: order.appUserId ? `Customer ${order.appUserId}` : 'Unknown Customer',
            quantity: order.quantity,
            unit: 'C',
            status: order.productionStatus || 'In Queue', // Default to 'In Queue' if no status
            orderDate: order.roundId || 1, // Use roundId as orderDate if available
            currentStep: 0,
            originalOrder: order // Keep original order data
          }));
          
        setOrders(typeCOrders);
      } catch (error) {
        console.error('Failed to fetch Product C orders:', error);
        // Fallback to empty array if API fails
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

  const handleStartAssembly = async () => {
    if (!selectedOrder) return;
    
    try {
      // Update status in the API
      await api.put(`/api/Order/${selectedOrder.id}/status`, { 
        productionStatus: 'In Progress' 
      }).catch(err => {
        console.warn('API status update not supported, updating locally:', err.message);
      });
      
      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: 'In Progress' }
            : order
        )
      );
      setSelectedOrder((prev) =>
        prev ? { ...prev, status: 'In Progress' } : prev
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleCompleteOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      // Update status in the API
      await api.put(`/api/Order/${selectedOrder.id}/status`, { 
        productionStatus: 'Completed' 
      }).catch(err => {
        console.warn('API status update not supported, updating locally:', err.message);
      });
      
      // Update local state
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== selectedOrder.id)
      );
      setSelectedOrder((prev) =>
        prev ? { ...prev, status: 'Completed' } : prev
      );
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  const handleDenyAssembly = async () => {
    if (!selectedOrder) return;
    
    try {
      // Update status in the API
      await api.put(`/api/Order/${selectedOrder.id}/status`, { 
        productionStatus: 'Denied' 
      }).catch(err => {
        console.warn('API status update not supported, updating locally:', err.message);
      });
      
      // Update local state
      setOrders((prevOrders) => {
        const filtered = prevOrders.filter((order) => order.id !== selectedOrder.id);
        setLastRemovedOrder(selectedOrder);
        return filtered;
      });
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error denying order:', error);
    }
  };

  const handleRestoreLastOrder = async () => {
    if (!lastRemovedOrder) return;
    
    try {
      // Update status in the API back to In Queue
      await api.put(`/api/Order/${lastRemovedOrder.id}/status`, { 
        productionStatus: 'In Queue' 
      }).catch(err => {
        console.warn('API status update not supported, updating locally:', err.message);
      });
      
      // Update local state
      setOrders((prevOrders) => [...prevOrders, {...lastRemovedOrder, status: 'In Queue'}]);
      setRestoredOrderId(lastRemovedOrder.id);
      setLastRemovedOrder(null);
    } catch (error) {
      console.error('Error restoring order:', error);
    }
  };

  const render3DModel = () => (
    <div className="w-full h-80 rounded-lg border-2 border-purple-300 dark:border-purple-600 overflow-hidden relative flex items-center justify-center bg-white dark:bg-gray-800">
      <model-viewer
        ref={modelViewerRef}
        className="model-viewer"
        style={{ width: "100%", height: "100%", background: "transparent" }}
        alt="Ontwerp C"
        src="/models/Ontwerp-C.glb"
        camera-controls
        interaction-prompt="none"
        auto-rotate
        auto-rotate-delay="200"
        rotation-per-second="30deg"
        shadow-intensity="1"
        exposure="0.7"
        camera-orbit="0rad 1.57rad 2.5m"
        onLoad={() => setIsModelLoaded(true)}
      ></model-viewer>
    </div>
  );

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
        <label className="text-sm font-medium text-pink-700 dark:text-pink-400">Unit</label>
        <p className="text-gray-900 dark:text-white font-medium">{order.unit}</p>
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <label className="text-sm font-medium text-blue-700 dark:text-blue-400">Period Ordered:</label>
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-medium">
          {order.orderDate}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <Script
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
        type="module"
        strategy="afterInteractive"
      />
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Production Line C</h2>
            <p className="text-gray-600 dark:text-gray-400">Total Orders of Product C</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-600 text-white text-base font-semibold dark:bg-purple-700">
                Total: {orders.length}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Orders Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400">Incoming Orders</h3>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p>No orders found for Product C</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {orders
                    .slice()
                    .sort((a, b) => a.orderDate - b.orderDate)
                    .map((order) => (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedOrder?.id === order.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-400'
                            : restoredOrderId === order.id
                              ? 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-400'
                              : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400'
                        }`}
                        onMouseEnter={() => {
                          if (restoredOrderId === order.id) setRestoredOrderId(null);
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{order.id}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.productName}</p>
                          </div>
                          <div className="flex space-x-2">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              Period Ordered: {order.orderDate}
                            </span>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>{order.quantity}</span>
                          <span>{order.unit}</span>
                        </div>
                      
                        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                          <span>{order.customer}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            {/* 3D Product Placeholder and Order Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              {selectedOrder ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedOrder.productName}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Order: {selectedOrder.id}</p>
                  </div>
                  
                  {/* 3D Product Viewer */}
                  <div className="mb-6 relative">
                    {render3DModel()}
                  </div>
                  
                  {/* Conditional rendering based on status */}
                  {selectedOrder.status === 'In Queue' && (
                    <>
                      {renderOrderDetails(selectedOrder)}
                      <div className="flex space-x-3">
                        <button
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 transition-colors"
                          onClick={handleStartAssembly}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Assembly
                        </button>
                        <button
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors"
                          onClick={handleDenyAssembly}
                        >
                          Deny Assembly
                        </button>
                      </div>
                    </>
                  )}
                  
                  {selectedOrder.status === 'In Progress' && (
                    <>
                      {renderOrderDetails(selectedOrder)}
                      <div className="flex space-x-3">
                        <button
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 transition-colors"
                          onClick={handleCompleteOrder}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete Order
                        </button>
                        <button
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors"
                          onClick={handleDenyAssembly}
                        >
                          Deny Assembly
                        </button>
                      </div>
                    </>
                  )}
                  
                  {selectedOrder.status === 'Completed' && (
                    <>
                      <div className="mb-6 text-center">
                        <CheckCircle className="w-10 h-10 mx-auto text-pink-600 dark:text-pink-400 mb-2" />
                        <p className="text-pink-700 dark:text-pink-400 font-semibold">Order Completed!</p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                    <p className="text-lg font-medium text-gray-900 dark:text-white">Select an Order</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Choose an order from the queue to view 3D model and details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Restore button for last removed order */}
        {lastRemovedOrder && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 transition-colors"
              onClick={handleRestoreLastOrder}
            >
              Restore Last Removed Order
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductionLineDashboard;