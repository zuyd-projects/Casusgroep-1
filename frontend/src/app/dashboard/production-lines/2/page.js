"use client";

import React, { useState, useRef, useEffect } from 'react';
import Script from 'next/script';
import { CheckCircle, AlertCircle, Play, Clock, Package, Users } from 'lucide-react';
import { api } from '@CASUSGROEP1/utils/api';

const ProductionLine2Dashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRemovedOrder, setLastRemovedOrder] = useState(null);
  const [restoredOrderId, setRestoredOrderId] = useState(null);
  const modelViewerRef = useRef(null);

  // Fetch orders assigned to Production Line 2
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const allOrders = await api.get('/api/Order');
        
        // Filter orders assigned to Production Line 2
        const productionLine2Orders = allOrders
          .filter(order => {
            const prodLine = order.productionLine ? order.productionLine.toString() : null;
            return prodLine === '2';
          })
          .map(order => ({
            id: order.id.toString(),
            productName: `Motor ${order.motorType} - Assembly Unit`,
            customer: order.appUserId ? `Customer ${order.appUserId}` : 'Unknown Customer',
            quantity: order.quantity,
            motorType: order.motorType,
            status: order.productionStatus || order.status || 'In Queue',
            orderDate: order.roundId || 1,
            currentStep: 0,
            originalOrder: order
          }));
          
        setOrders(productionLine2Orders);
      } catch (error) {
        console.error('Failed to fetch Production Line 2 orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'InProduction': 
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
      await api.patch(`/api/Order/${selectedOrder.id}/status`, { 
        status: 'InProduction' 
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
      await api.patch(`/api/Order/${selectedOrder.id}/status`, { 
        status: 'Completed' 
      }).catch(err => {
        console.warn('API status update not supported, updating locally:', err.message);
      });
      
      // Update local state
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== selectedOrder.id)
      );
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  const handleDenyAssembly = async () => {
    if (!selectedOrder) return;
    
    try {
      // Remove from production line assignment
      await api.put(`/api/Order/${selectedOrder.id}`, { 
        productionLine: null 
      }).catch(err => {
        console.warn('API update not supported, updating locally:', err.message);
      });
      
      // Update local state
      setOrders((prevOrders) => {
        const filtered = prevOrders.filter((order) => order.id !== selectedOrder.id);
        setLastRemovedOrder(selectedOrder);
        return filtered;
      });
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error denying assembly:', error);
    }
  };

  const handleRestoreLastOrder = async () => {
    if (!lastRemovedOrder) return;
    
    try {
      // Restore to production line
      await api.put(`/api/Order/${lastRemovedOrder.id}`, { 
        productionLine: '2' 
      }).catch(err => {
        console.warn('API update not supported, updating locally:', err.message);
      });
      
      setOrders((prevOrders) => [...prevOrders, {...lastRemovedOrder, status: 'In Queue'}]);
      setRestoredOrderId(lastRemovedOrder.id);
      setLastRemovedOrder(null);
    } catch (error) {
      console.error('Error restoring order:', error);
    }
  };

  const render3DModel = (motorType) => {
    const modelSrc = motorType === 'A' ? '/models/Ontwerp-A.glb' : 
                     motorType === 'B' ? '/models/Ontwerp-B.glb' : 
                     '/models/Ontwerp-C.glb';
    
    return (
      <div className="w-full h-80 rounded-lg border-2 border-green-300 dark:border-green-600 overflow-hidden relative flex items-center justify-center bg-white dark:bg-gray-800">
        <model-viewer
          ref={modelViewerRef}
          className="model-viewer"
          style={{ width: "100%", height: "100%", background: "transparent" }}
          alt={`Motor ${motorType} Assembly`}
          src={modelSrc}
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
  };

  const renderOrderDetails = (order) => (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
        <label className="text-sm font-medium text-green-700 dark:text-green-400">Customer</label>
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
        <label className="text-sm font-medium text-blue-700 dark:text-blue-400">Round:</label>
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
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Production Line 2</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Orders assigned to Production Line 2</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white text-base font-semibold dark:bg-green-700">
                  <Users className="w-4 h-4 mr-2" />
                  Total: {orders.length}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Live Updates</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Orders Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-green-700 dark:text-green-400">Assigned Orders</h3>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p>No orders assigned to Production Line 2</p>
                  <p className="text-sm text-gray-400">Orders will appear here when assigned by the planner</p>
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
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
                            : restoredOrderId === order.id
                              ? 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-400'
                              : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-400'
                        }`}
                        onMouseEnter={() => {
                          if (restoredOrderId === order.id) setRestoredOrderId(null);
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Order #{order.id}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.productName}</p>
                          </div>
                          <div className="flex space-x-2">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Round: {order.orderDate}
                            </span>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>Qty: {order.quantity}</span>
                          <span>Motor: {order.motorType}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                          <span>{order.customer}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            {/* 3D Model and Order Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              {selectedOrder ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedOrder.productName}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Order #{selectedOrder.id}</p>
                  </div>
                  
                  {/* 3D Product Viewer */}
                  <div className="mb-6 relative">
                    {render3DModel(selectedOrder.motorType)}
                  </div>
                  
                  {/* Conditional rendering based on status */}
                  {(selectedOrder.status === 'In Queue' || selectedOrder.status === 'Pending') && (
                    <>
                      {renderOrderDetails(selectedOrder)}
                      <div className="flex space-x-3">
                        <button
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors"
                          onClick={handleStartAssembly}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Assembly
                        </button>
                        <button
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          onClick={handleDenyAssembly}
                        >
                          Remove from Line
                        </button>
                      </div>
                    </>
                  )}
                  
                  {(selectedOrder.status === 'In Progress' || selectedOrder.status === 'InProduction') && (
                    <>
                      {renderOrderDetails(selectedOrder)}
                      <div className="flex space-x-3">
                        <button
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors"
                          onClick={handleCompleteOrder}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete Order
                        </button>
                        <button
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          onClick={handleDenyAssembly}
                        >
                          Remove from Line
                        </button>
                      </div>
                    </>
                  )}
                  
                  {selectedOrder.status === 'Completed' && (
                    <>
                      <div className="mb-6 text-center">
                        <CheckCircle className="w-10 h-10 mx-auto text-green-600 dark:text-green-400 mb-2" />
                        <p className="text-green-700 dark:text-green-400 font-semibold">Order Completed!</p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                    <p className="text-lg font-medium text-gray-900 dark:text-white">Select an Order</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Choose an order from the list to view 3D model and details</p>
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
              className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg shadow-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
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

export default ProductionLine2Dashboard;
