"use client";
import '../styles.css';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Play, RotateCcw, ZoomIn, ZoomOut, Move3D } from 'lucide-react';

const ProductionLineDashboard = () => {
  // TODO: Replace with backend data in the future
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([
    { 
      id: 'ORD-001',
      productName: 'Assembly Unit A-100',
      customer: 'TechCorp Industries',
      quantity: 2,
      unit: 'A',
      priority: 'High',
      status: 'In Queue',
      orderDate: '2025-05-26T09:00:00Z',
      dueDate: '2025-05-26T15:00:00Z',
      currentStep: 1
    },
    {
      id: 'ORD-002',
      productName: 'Assembly Unit A-200',
      customer: 'Manufacturing Plus',
      quantity: 2,
      unit: 'B',
      priority: 'Medium',
      status: 'In Progress',
      orderDate: '2025-05-26T10:30:00Z',
      dueDate: '2025-05-26T16:00:00Z',
      currentStep: 4
    },
    {
      id: 'ORD-003',
      productName: 'Assembly Unit A-150',
      customer: 'Global Systems',
      quantity: 3,
      unit: 'C',
      priority: 'High',
      status: 'In Queue',
      orderDate: '2025-05-26T11:00:00Z',
      dueDate: '2025-05-26T17:30:00Z',
      currentStep: 0
    }
  ]);

  // Progress steps for the delivery-like progress bar
  const progressSteps = [
    { id: 1, name: 'Customer', description: 'Order Placed' },
    { id: 2, name: 'Inventory', description: 'Materials Ready' },
    { id: 3, name: 'Order', description: 'Order Processed' },
    { id: 4, name: 'Manager', description: 'Approved' },
    { id: 5, name: 'Production', description: 'Assembly Started' },
    { id: 6, name: 'Check', description: 'Quality Control' },
    { id: 7, name: 'Complete', description: 'Order Finished' }
  ];

  // Simulate real-time updates (dummy data only)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (Math.random() > 0.7) {
        const newOrder = {
          id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
          productName: `Assembly Unit A-${Math.floor(Math.random() * 300) + 100}`,
          customer: ['TechCorp Industries', 'Manufacturing Plus', 'Global Systems', 'Industrial Co.'][Math.floor(Math.random() * 4)],
          quantity: Math.floor(Math.random() * 100) + 10,
          unit: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
          priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
          status: 'In Queue',
          orderDate: now.toISOString(),
          dueDate: new Date(now.getTime() + (Math.random() * 8 + 4) * 60 * 60 * 1000).toISOString(),
          currentStep: Math.floor(Math.random() * 4) + 1
        };
        setOrders(prev => [...prev, newOrder]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [orders.length]);

  // Placeholder functions for future backend integration
  const completeOrder = (orderId) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(null);
    }
  };

  const startOrder = (order) => {
    const updatedOrder = { ...order, status: 'In Progress', currentStep: Math.max(order.currentStep, 5) };
    setOrders(prev => prev.map(o => 
      o.id === order.id ? updatedOrder : o
    ));
    setSelectedOrder(updatedOrder);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-pink-600 bg-pink-100';
      case 'Medium': return 'text-purple-600 bg-purple-100';
      case 'Low': return 'text-cyan-600 bg-cyan-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'text-cyan-600 bg-cyan-100';
      case 'In Queue': return 'text-purple-600 bg-purple-100';
      case 'Completed': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="h-screen bg-white">
      <div className="w-full overflow-hidden">
        {/* Progress Bar */}
        {selectedOrder && (
          <div className="bg-purple-50 border-b border-purple-200 p-4">
            <div className="w-full">
              <h3 className="text-sm font-medium text-black mb-3">Order Progress - {selectedOrder.id}</h3>
              <div className="flex items-center w-full">
                {progressSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center w-full">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.id <= selectedOrder.currentStep 
                          ? 'bg-cyan-500 text-white' 
                          : step.id === selectedOrder.currentStep + 1
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step.id <= selectedOrder.currentStep ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-xs font-medium text-black">{step.name}</p>
                        <p className="text-xs text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    {index < progressSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 ${
                        step.id < selectedOrder.currentStep ? 'bg-cyan-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-black">Production Line A</h2>
            <p className="text-gray-600">Total Orders of Product A</p>
            {/* Move the badge here and align left */}
            <div className="left-aligned-badge-container">
              <span className="total-product-orders-badge">
                Total: {orders.length} {/* Replace with backend data in the future */}
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
                {orders.map((order) => (
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
                        <span className={`status-pill ${getPriorityColor(order.priority)}`}>
                          {order.priority}
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
                      <span>Due: {formatTime(order.dueDate)}</span>
                    </div>
                    {/* Mini progress indicator */}
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
                      {/* 3D Controls Placeholder */}
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
                  {/* Order Information */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-purple-700">Customer</label>
                      <p className="text-black font-medium">{selectedOrder.customer}</p>
                    </div>
                    <div className="bg-cyan-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-cyan-700">Quantity</label>
                      <p className="text-black font-medium">{selectedOrder.quantity}</p>
                    </div>
                    <div className="bg-pink-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-pink-700">Unit</label>
                      <p className="text-black font-medium">{selectedOrder.unit}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-purple-700">Priority</label>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedOrder.priority)}`}>
                        {selectedOrder.priority}
                      </span>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    {selectedOrder.status === 'In Queue' && (
                      <button
                        onClick={() => startOrder(selectedOrder)}
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Assembly
                      </button>
                    )}
                    {selectedOrder.status === 'In Progress' && (
                      <button
                        onClick={() => completeOrder(selectedOrder.id)}
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Order
                      </button>
                    )}
                  </div>
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
    </div>
  );
};

export default ProductionLineDashboard;