"use client";

import React, { useState, useRef } from 'react';
import Script from 'next/script';
import { CheckCircle, AlertCircle, Play } from 'lucide-react';

const ProductionLineDashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [orders, setOrders] = useState([
    { 
      id: 'ORD-001',
      productName: 'Assembly Unit A-100',
      customer: 'TechCorp Industries',
      quantity: 10,
      unit: 'A',
      status: 'In Queue',
      orderDate: 5,
      currentStep: 1
    },
    {
      id: 'ORD-002',
      productName: 'Assembly Unit A-200',
      customer: 'Manufacturing Plus',
      quantity: 6,
      unit: 'A',
      status: 'In Progress',
      orderDate: 12,
      currentStep: 3
    },
    {
      id: 'ORD-003',
      productName: 'Assembly Unit A-150',
      customer: 'Global Systems',
      quantity: 8,
      unit: 'A',
      status: 'In Queue',
      orderDate: 2,
      currentStep: 0
    }
  ]);
  const [lastRemovedOrder, setLastRemovedOrder] = useState(null);
  const [restoredOrderId, setRestoredOrderId] = useState(null);
  const modelViewerRef = useRef(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/20';
      case 'In Queue': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
      case 'Completed': return 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const handleStartAssembly = () => {
    if (!selectedOrder) return;
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
  };

  const handleCompleteOrder = () => {
    if (!selectedOrder) return;
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== selectedOrder.id)
    );
    setSelectedOrder((prev) =>
      prev ? { ...prev, status: 'Completed' } : prev
    );
  };

  const handleDenyAssembly = () => {
    if (!selectedOrder) return;
    setOrders((prevOrders) => {
      const filtered = prevOrders.filter((order) => order.id !== selectedOrder.id);
      setLastRemovedOrder(selectedOrder);
      return filtered;
    });
    setSelectedOrder(null);
  };

  const handleRestoreLastOrder = () => {
    if (!lastRemovedOrder) return;
    setOrders((prevOrders) => [...prevOrders, lastRemovedOrder]);
    setRestoredOrderId(lastRemovedOrder.id);
    setLastRemovedOrder(null);
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
                ))}
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
    </div>
    </>
  );
};

export default ProductionLineDashboard;
