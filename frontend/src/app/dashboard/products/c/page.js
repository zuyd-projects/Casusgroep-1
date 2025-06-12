"use client";
import '../styles.css';

import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Play, RotateCcw, ZoomIn, ZoomOut, Move3D } from 'lucide-react';

const ProductionLineDashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([
    { 
      id: 'ORD-201',
      productName: 'Assembly Unit C-100',
      customer: 'TechCorp Industries',
      quantity: 7,
      unit: 'C',
      status: 'In Queue',
      orderDate: 6,
      currentStep: 1
    },
    {
      id: 'ORD-202',
      productName: 'Assembly Unit C-200',
      customer: 'Manufacturing Plus',
      quantity: 4,
      unit: 'C',
      status: 'In Progress',
      orderDate: 18,
      currentStep: 4
    },
    {
      id: 'ORD-203',
      productName: 'Assembly Unit C-150',
      customer: 'Global Systems',
      quantity: 2,
      unit: 'C',
      status: 'In Queue',
      orderDate: 1,
      currentStep: 0
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'text-cyan-600 bg-cyan-100';
      case 'In Queue': return 'text-purple-600 bg-purple-100';
      case 'Completed': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
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
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== selectedOrder.id)
    );
    setSelectedOrder(null);
  };

  const handleBackToAssembly = () => {
    if (!selectedOrder) return;
    setSelectedOrder((prev) =>
      prev ? { ...prev, status: 'In Progress' } : prev
    );
  };

  const renderOrderDetails = (order) => (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-purple-50 p-3 rounded-lg">
        <label className="text-sm font-medium text-purple-700">Customer</label>
        <p className="text-black font-medium">{order.customer}</p>
      </div>
      <div className="bg-cyan-50 p-3 rounded-lg">
        <label className="text-sm font-medium text-cyan-700">Quantity</label>
        <p className="text-black font-medium">{order.quantity}</p>
      </div>
      <div className="bg-pink-50 p-3 rounded-lg">
        <label className="text-sm font-medium text-pink-700">Unit</label>
        <p className="text-black font-medium">{order.unit}</p>
      </div>
      <div className="bg-blue-50 p-3 rounded-lg">
        <label className="text-sm font-medium text-blue-700">Period Ordered:</label>
        <span className="px-2 py-1 text-xs rounded-full period-pill">
          {order.orderDate}
        </span>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-white">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black">Production Line C</h2>
          <p className="text-gray-600">Total Orders of Product C</p>
          <div className="left-aligned-badge-container">
            <span className="total-product-orders-badge">
              Total: {orders.length}
            </span>
          </div>
        </div>
        <div className="dashboard-grid">
          {/* Orders Overview */}
          <div className="order-card">
            <div className="order-header-text">
              <h3 className="section-header-order">Incoming Orders</h3>
              <div className="live-indicator-satus-text">
                <div className="live-indicator"></div>
                <span className="text-sm text-gray-600">Live</span>
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
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-black">{order.id}</h4>
                        <p className="text-sm text-gray-600">{order.productName}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className="status-pill period-pill">
                          Period Ordered: {order.orderDate}
                        </span>
                        <span className={`status-pill ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{order.quantity}</span>
                      <span>{order.unit}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{order.customer}</span>
                    </div>
                    <div className="mt-2">
                      <div className="mini-progress-bar">
                        <div 
                          className="mini-progress-bar-fill" 
                          style={{ width: `${(order.currentStep / 7) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          {/* 3D Product Placeholder and Order Details */}
          <div className="order-card">
            {selectedOrder ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-black">{selectedOrder.productName}</h3>
                  <p className="text-gray-600">Order: {selectedOrder.id}</p>
                </div>
                {/* 3D Product Viewer Placeholder */}
                <div className="mb-6">
                  <div className="w-full h-80 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-300 relative">
                    <div className="text-center text-purple-600">
                      <Move3D className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-lg font-medium">3D Product Viewer</p>
                      <p className="text-sm text-gray-600">Interactive 3D model will be displayed here</p>
                      <p className="text-xs text-gray-500 mt-2">Rotate • Zoom • Inspect</p>
                    </div>
                    <div className="absolute top-4 right-4 flex flex-col space-y-2">
                      <button className="p-2 bg-white rounded-lg shadow-md hover:bg-purple-50 transition-colors">
                        <RotateCcw className="w-4 h-4 text-purple-600" />
                      </button>
                      <button className="p-2 bg-white rounded-lg shadow-md hover:bg-purple-50 transition-colors">
                        <ZoomIn className="w-4 h-4 text-purple-600" />
                      </button>
                      <button className="p-2 bg-white rounded-lg shadow-md hover:bg-purple-50 transition-colors">
                        <ZoomOut className="w-4 h-4 text-purple-600" />
                      </button>
                    </div>
                  </div>
                </div>
                {/* Conditional rendering based on status */}
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
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                      <CheckCircle className="w-10 h-10 mx-auto text-pink-600 mb-2" />
                      <p className="text-pink-700 font-semibold">Order Completed!</p>
                    </div>
                    {/* Remove the action buttons here */}
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-black">Select an Order</p>
                  <p className="text-sm text-gray-600">Choose an order from the queue to view 3D model and details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionLineDashboard;