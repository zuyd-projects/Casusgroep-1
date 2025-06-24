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
  const [showMissingBlocksModal, setShowMissingBlocksModal] = useState(false);
  const [missingBlocks, setMissingBlocks] = useState({
    blue: 0,
    red: 0,
    gray: 0
  });
  const modelViewerRef = useRef(null);

  // Fetch orders from API when component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const allOrders = await api.get('/api/Order');
        
        // Filter orders for product type A and format them
        const typeAOrders = allOrders
          .filter(order => order.motorType === 'A')
          .map(order => ({
            id: order.id.toString(),
            productName: `Assembly Unit A-${order.id}`,
            customer: order.appUserId ? `Customer ${order.appUserId}` : 'Unknown Customer',
            quantity: order.quantity,
            unit: 'A',
            status: order.productionStatus || 'In Queue', // Default to 'In Queue' if no status
            orderDate: order.roundId || 1, // Use roundId as orderDate if available
            currentStep: 0,
            originalOrder: order // Keep original order data
          }));
          
        setOrders(typeAOrders);
      } catch (error) {
        console.error('Failed to fetch Product A orders:', error);
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
      
      // Log the order status before removing
      console.log("Order completed:", selectedOrder.id, "Status:", 'Completed');

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

  const handleReportMissingBlocks = async () => {
    if (!selectedOrder) return;
    
    // Reset missing blocks state and show modal
    setMissingBlocks({ blue: 0, red: 0, gray: 0 });
    setShowMissingBlocksModal(true);
  };

  const handleSubmitMissingBlocks = async () => {
    if (!selectedOrder) return;
    
    // Check if at least one block is missing
    const totalMissing = missingBlocks.blue + missingBlocks.red + missingBlocks.gray;
    if (totalMissing === 0) {
      alert('Please specify at least one missing block.');
      return;
    }
    
    try {
      // Create missing blocks request via API
      const missingBlocksData = {
        orderId: selectedOrder.id,
        productionLine: 'A',
        motorType: selectedOrder.unit,
        quantity: selectedOrder.quantity,
        blueBlocks: missingBlocks.blue,
        redBlocks: missingBlocks.red,
        grayBlocks: missingBlocks.gray
      };

      // Send to API (this will also update the order status to ProductionError automatically)
      await api.post('/api/MissingBlocks', missingBlocksData);
      
      // Log the production error
      console.log("Production Error reported for order:", selectedOrder.id, "Missing blocks reported");

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: 'ProductionError' }
            : order
        )
      );
      
      setSelectedOrder((prev) =>
        prev ? { ...prev, status: 'ProductionError' } : prev
      );
      
      // Close modal and show success message
      setShowMissingBlocksModal(false);
      alert(`Missing blocks reported for Order ${selectedOrder.id}. Sent to supplier for delivery.`);
      
    } catch (error) {
      console.error('Error reporting missing blocks:', error);
      alert('Failed to report missing blocks. Please try again.');
    }
  };

  const render3DModel = () => (
    <div className="w-full h-80 rounded-lg border-2 border-purple-300 dark:border-purple-600 overflow-hidden relative flex items-center justify-center bg-white dark:bg-gray-800">
      <model-viewer
        ref={modelViewerRef}
        className="model-viewer"
        style={{ width: "100%", height: "100%", background: "transparent" }}
        alt="Ontwerp A"
        src="/models/Ontwerp-A.glb"
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Production Line A</h2>
          <p className="text-gray-600 dark:text-gray-400">Total Orders of Product A</p>
          <div className="flex justify-start mt-4 mb-2">
            <span className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-600 text-white text-base font-semibold dark:bg-purple-700">
              Total: {orders.length}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 h-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex justify-between items-center mt-4 mb-4">
              <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400 mb-0">Incoming Orders</h3>
              <div className="flex items-center m-0">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p>No orders found for Product A</p>
                </div>
              ) : (
                orders
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
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-600'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500'
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
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mr-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            Period Ordered: {order.orderDate}
                          </span>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mr-1 ${getStatusColor(order.status)}`}>
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
                  ))
              )}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            {selectedOrder ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-black dark:text-white">{selectedOrder.productName}</h3>
                  <p className="text-gray-600 dark:text-gray-400">Order: {selectedOrder.id}</p>
                </div>
                <div className="mb-6 relative">
                  {render3DModel()}
                </div>
                {selectedOrder.status === 'In Queue' && (
                  <>
                    {renderOrderDetails(selectedOrder)}
                    <div className="flex space-x-3">
                      <button
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        onClick={handleStartAssembly}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Assembly
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        onClick={handleDenyAssembly}
                      >
                        Deny Assembly
                      </button>
                    </div>
                    <div className="mt-3">
                      <button
                        className="w-full flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        onClick={handleReportMissingBlocks}
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Report Missing Building Blocks
                      </button>
                    </div>
                  </>
                )}
                {selectedOrder.status === 'In Progress' && (
                  <>
                    {renderOrderDetails(selectedOrder)}
                    <div className="flex space-x-3">
                      <button
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                        onClick={handleCompleteOrder}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Order
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        onClick={handleDenyAssembly}
                      >
                        Deny Assembly
                      </button>
                    </div>
                    <div className="mt-3">
                      <button
                        className="w-full flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        onClick={handleReportMissingBlocks}
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Report Missing Building Blocks
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
      {lastRemovedOrder && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg shadow-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
            onClick={handleRestoreLastOrder}
          >
            Restore Last Removed Order
          </button>
        </div>
      )}

      {/* Missing Blocks Modal */}
      {showMissingBlocksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Report Missing Building Blocks
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Order #{selectedOrder?.id} - Specify how many blocks are missing:
            </p>
            
            <div className="space-y-4">
              {/* Blue Blocks */}
              <div>
                <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                  Blue Blocks Missing
                </label>
                <input
                  type="number"
                  min="0"
                  value={missingBlocks.blue}
                  onChange={(e) => setMissingBlocks(prev => ({ ...prev, blue: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                />
              </div>
              
              {/* Red Blocks */}
              <div>
                <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                  Red Blocks Missing
                </label>
                <input
                  type="number"
                  min="0"
                  value={missingBlocks.red}
                  onChange={(e) => setMissingBlocks(prev => ({ ...prev, red: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                />
              </div>
              
              {/* Gray Blocks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gray Blocks Missing
                </label>
                <input
                  type="number"
                  min="0"
                  value={missingBlocks.gray}
                  onChange={(e) => setMissingBlocks(prev => ({ ...prev, gray: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowMissingBlocksModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitMissingBlocks}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Report Missing Blocks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default ProductionLineDashboard;
