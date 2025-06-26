"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@CASUSGROEP1/components/Card';
import StatusBadge from '@CASUSGROEP1/components/StatusBadge';
import { useSimulation } from '@CASUSGROEP1/contexts/SimulationContext';
import { api } from '@CASUSGROEP1/utils/api';
import { orderStatuses } from '@CASUSGROEP1/utils/mockData';
import { Plus, AlertCircle, PlayCircle, Hash, Calendar, CheckCircle } from 'lucide-react';
import { getMotorTypeColors } from '@CASUSGROEP1/utils/motorColors';

// Customer options
const CUSTOMER_OPTIONS = [
  'yes',
  'maybe', 
  'tomorrow',
  'Take a break',
  'empty',
  'no'
];

// Motor type options
const MOTOR_TYPES = ['A', 'B', 'C'];

// Quantity probability distribution helper
const getRandomQuantity = () => {
  const random = Math.random();
  if (random < 1/6) return 3;      // 1/6 chance
  if (random < 3/6) return 2;      // 2/6 chance  
  return 1;                        // 3/6 chance
};

// Random selection helpers
const getRandomCustomer = () => CUSTOMER_OPTIONS[Math.floor(Math.random() * CUSTOMER_OPTIONS.length)];
const getRandomMotorType = () => MOTOR_TYPES[Math.floor(Math.random() * MOTOR_TYPES.length)];

export default function Orders() {
  const [filteredStatus, setFilteredStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const { currentRound, currentSimulation, currentSimulationDetails, isRunning } = useSimulation();

  // Form state for new order
  const [newOrder, setNewOrder] = useState({
    motorType: 'A',
    quantity: 1,
    signature: '',
    customer: 'yes' // Default to first customer option
  });

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch orders, rounds, and simulations data
      const [apiOrders, apiRounds, apiSimulations] = await Promise.all([
        api.get('/api/Order'),
        api.get('/api/Rounds'),
        api.get('/api/Simulations')
      ]);
      
      // Store rounds data for lookup
      setRounds(apiRounds);
      
      // Convert API orders to match display format
      const formattedOrders = apiOrders.map(order => {
        // Find the round data for this order
        const roundData = apiRounds.find(round => round.id === order.roundId);
        // Find the simulation data for this round
        const simulationData = roundData ? apiSimulations.find(sim => sim.id === roundData.simulationId) : null;
        
        return {
          id: order.id.toString(),
          customer: order.appUserId, // Use the actual customer name
          date: new Date(order.orderDate).toLocaleDateString(),
          amount: order.quantity * 100, // Calculate price (100 per unit)
          status: order.status || 'Pending', // Use actual status from backend
          motorType: order.motorType,
          quantity: order.quantity,
          signature: order.signature,
          roundId: order.roundId,
          roundNumber: roundData?.roundNumber || null,
          simulationId: roundData?.simulationId || null,
          simulationName: simulationData?.name || null,
          originalOrder: order
        };
      });
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Refetch orders when round changes
  useEffect(() => {
    if (currentRound) {
      console.log('🔄 Round changed, refetching orders for round:', currentRound.number);
      fetchOrders();
    }
  }, [currentRound?.number]); // Only trigger when round number changes

  // Also refetch when simulation starts/stops
  useEffect(() => {
    if (isRunning !== null) { // Only refetch after initial load
      console.log('🔄 Simulation state changed, refetching orders. Running:', isRunning);
      fetchOrders();
    }
  }, [isRunning]);

  // Handle new order creation
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    
    if (!currentRound) {
      alert('No active round! Please start a simulation first.');
      return;
    }

    try {
      setCreating(true);
      
      const orderData = {
        roundId: currentRound.id,
        deliveryId: null,
        appUserId: newOrder.customer, // Use selected customer
        motorType: newOrder.motorType,
        quantity: parseInt(newOrder.quantity),
        signature: newOrder.signature || `order-${Date.now()}`,
        orderDate: new Date().toISOString()
      };

      console.log('🛍️ Creating order for round', currentRound.number, ':', orderData);
      
      const createdOrder = await api.post('/api/Order', orderData);
      
      console.log('✅ Created order response:', createdOrder);
      
      // Defensive check for ID
      if (!createdOrder || !createdOrder.id) {
        throw new Error('Invalid response from server: missing order ID');
      }
      
      // Add to local state
      const formattedOrder = {
        id: createdOrder.id.toString(),
        customer: createdOrder.appUserId, // Use the actual customer name
        date: new Date(createdOrder.orderDate).toLocaleDateString(),
        amount: createdOrder.quantity * 100,
        status: 'Pending', // Show correct status
        motorType: createdOrder.motorType,
        quantity: createdOrder.quantity,
        signature: createdOrder.signature,
        roundId: createdOrder.roundId,
        originalOrder: createdOrder
      };
      
      // Refetch orders to ensure we have the latest data from server
      await fetchOrders();
      
      // Reset form
      setNewOrder({
        motorType: 'A',
        quantity: 1,
        signature: '',
        customer: 'yes'
      });
      setShowNewOrderForm(false);
      
      console.log('✅ Order created successfully!');
      
    } catch (error) {
      console.error('❌ Failed to create order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Handle randomizing order values
  const handleRandomizeOrder = () => {
    setNewOrder({
      motorType: getRandomMotorType(),
      quantity: getRandomQuantity(),
      signature: `random-order-${Date.now()}`,
      customer: getRandomCustomer()
    });
  };

  // Auto-randomize when opening the form
  useEffect(() => {
    if (showNewOrderForm) {
      handleRandomizeOrder();
    }
  }, [showNewOrderForm]);

  // Handle order completion
  const handleCompleteOrder = async (orderId) => {
    try {
      // Update order status to completed
      await api.patch(`/api/Order/${orderId}/status`, { status: 'Completed' });
      
      // Refresh orders list
      await fetchOrders();
      
      console.log('✅ Order completed successfully!');
      
    } catch (error) {
      console.error('❌ Failed to complete order:', error);
      alert('Failed to complete order. Please try again.');
    }
  };

  // Filter orders based on status and search query
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filteredStatus === 'all' || order.status === filteredStatus;
    const matchesSearch = 
      order.id.includes(searchQuery) || 
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage and track your customer orders</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNewOrderForm(true)}
            disabled={!currentRound}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </button>
        </div>
      </div>

      {/* Simulation Status */}
      {isRunning && currentRound ? (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center space-x-4">
            <PlayCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-medium text-green-900 dark:text-green-100">
                {currentSimulationDetails?.name || `Simulation ${currentSimulation}`} - Round {currentRound.number} Active
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                You can create orders for this round. Orders will be linked to Round ID: {currentRound.id}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-center space-x-4">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
                No Active Simulation
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Start a simulation to create orders linked to specific rounds.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* New Order Form Modal */}
      {showNewOrderForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Create New Order
                </h2>
                <button
                  onClick={() => setShowNewOrderForm(false)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateOrder} className="p-6">
              <div className="space-y-6">
                {/* Auto-randomization Info */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="text-sm text-green-700 dark:text-green-300">
                    <p className="font-medium mb-1">🎲 Auto-Randomized Values:</p>
                    <ul className="text-xs space-y-0.5">
                      <li>• Quantity: 1 (50%), 2 (33%), 3 (17%)</li>
                      <li>• Customer & Motor Type: Random selection</li>
                      <li>• You can edit any values before creating the order</li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Customer
                    </label>
                    <select
                      value={newOrder.customer}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, customer: e.target.value }))}
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      {CUSTOMER_OPTIONS.map((customer) => (
                        <option key={customer} value={customer}>
                          {customer}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Motor Type
                    </label>
                    <div className="relative">
                      <select
                        value={newOrder.motorType}
                        onChange={(e) => setNewOrder(prev => ({ ...prev, motorType: e.target.value }))}
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                        required
                      >
                        <option value="A">Motor Type A</option>
                        <option value="B">Motor Type B</option>
                        <option value="C">Motor Type C</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${getMotorTypeColors(newOrder.motorType).full} rounded-md`}>
                          {newOrder.motorType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Quantity
                      <span className="text-xs text-zinc-500 ml-2">
                        (Price: ${(newOrder.quantity * 100).toFixed(2)})
                      </span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={newOrder.quantity}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Order Signature
                      <span className="text-xs text-zinc-500 ml-2">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Leave empty for auto-generation"
                      value={newOrder.signature}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, signature: e.target.value }))}
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3">Order Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-600 dark:text-zinc-400">Customer:</span>
                      <span className="ml-2 font-medium">{newOrder.customer}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 dark:text-zinc-400">Motor Type:</span>
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium ${getMotorTypeColors(newOrder.motorType).full} rounded-md`}>
                        Motor {newOrder.motorType}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-600 dark:text-zinc-400">Quantity:</span>
                      <span className="ml-2 font-medium">{newOrder.quantity} units</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 dark:text-zinc-400">Total Price:</span>
                      <span className="ml-2 font-medium text-green-600">${(newOrder.quantity * 100).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {currentRound && (
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                      <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
                        <Hash className="h-4 w-4" />
                        <span>This order will be linked to Round {currentRound.number} (ID: {currentRound.id})</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-zinc-200 dark:border-zinc-700 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewOrderForm(false)}
                  className="px-6 py-3 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !currentRound}
                  className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {creating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="w-full md:w-64">
            <label htmlFor="status-filter" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={filteredStatus}
              onChange={(e) => setFilteredStatus(e.target.value)}
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {orderStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by order ID or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Orders table */}
      <Card>
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-zinc-500 dark:text-zinc-400">Loading orders...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">Order ID</th>
                  <th scope="col" className="px-6 py-3 text-left">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left">Motor Type</th>
                  <th scope="col" className="px-6 py-3 text-left">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left">Simulation</th>
                  <th scope="col" className="px-6 py-3 text-left">Round</th>
                  <th scope="col" className="px-6 py-3 text-left">Date</th>
                  <th scope="col" className="px-6 py-3 text-left">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-6 py-4 whitespace-nowrap">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.motorType ? (
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${getMotorTypeColors(order.motorType).full} rounded-md`}>
                          Motor {order.motorType}
                        </span>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.quantity || <span className="text-zinc-400">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.simulationName ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md">
                          {order.simulationName}
                        </span>
                      ) : order.simulationId ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md">
                          Sim {order.simulationId}
                        </span>
                      ) : (
                        <span className="text-zinc-400">No Simulation</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.roundNumber ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-md">
                          Round {order.roundNumber}
                        </span>
                      ) : (
                        <span className="text-zinc-400">No Round</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${order.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {order.status === 'Delivered' && (
                          <button
                            onClick={() => handleCompleteOrder(order.id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-md transition-colors"
                            title="Complete Order"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="py-20 text-center text-zinc-500 dark:text-zinc-400">
                No orders found.
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
