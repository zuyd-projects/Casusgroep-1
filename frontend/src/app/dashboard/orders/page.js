"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@CASUSGROEP1/components/Card';
import StatusBadge from '@CASUSGROEP1/components/StatusBadge';
import PlannerWarnings from '@CASUSGROEP1/components/PlannerWarnings';
import { useSimulation } from '@CASUSGROEP1/contexts/SimulationContext';
import { api } from '@CASUSGROEP1/utils/api';
import { orderStatuses } from '@CASUSGROEP1/utils/mockData';
import { Plus, AlertCircle, PlayCircle, Hash, Calendar } from 'lucide-react';

export default function Orders() {
  const [filteredStatus, setFilteredStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const { currentRound, currentSimulation, isRunning } = useSimulation();

  // Form state for new order
  const [newOrder, setNewOrder] = useState({
    motorType: 'A',
    quantity: 1,
    signature: '',
    appUserId: '1' // This should come from auth context in real app
  });

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const apiOrders = await api.get('/api/Order');
        // Convert API orders to match display format
        const formattedOrders = apiOrders.map(order => ({
          id: order.id.toString(),
          customer: `User ${order.appUserId}`,
          date: new Date(order.orderDate).toLocaleDateString(),
          amount: order.quantity * 100, // Calculate price (100 per unit)
          status: 'processing', // Default status since API doesn't have status field
          motorType: order.motorType,
          quantity: order.quantity,
          signature: order.signature,
          roundId: order.roundId,
          originalOrder: order
        }));
        setOrders(formattedOrders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
        appUserId: newOrder.appUserId,
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
        customer: `User ${createdOrder.appUserId}`,
        date: new Date(createdOrder.orderDate).toLocaleDateString(),
        amount: createdOrder.quantity * 100,
        status: 'processing',
        motorType: createdOrder.motorType,
        quantity: createdOrder.quantity,
        signature: createdOrder.signature,
        roundId: createdOrder.roundId,
        originalOrder: createdOrder
      };
      
      setOrders(prev => [formattedOrder, ...prev]);
      
      // Reset form
      setNewOrder({
        motorType: 'A',
        quantity: 1,
        signature: '',
        appUserId: '1'
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
                Simulation {currentSimulation} - Round {currentRound.number} Active
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
        <Card title="Create New Order" className="border-blue-200 dark:border-blue-800">
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Motor Type
                </label>
                <select
                  value={newOrder.motorType}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, motorType: e.target.value }))}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="A">Motor Type A</option>
                  <option value="B">Motor Type B</option>
                  <option value="C">Motor Type C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={newOrder.quantity}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Order Signature (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty for auto-generation"
                  value={newOrder.signature}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, signature: e.target.value }))}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {currentRound && (
                <div className="md:col-span-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
                    <Hash className="h-4 w-4" />
                    <span>This order will be linked to Round {currentRound.number} (ID: {currentRound.id})</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowNewOrderForm(false)}
                className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !currentRound}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </form>
        </Card>
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
      
      {/* Planner Warnings Section */}
      <Card title="⚠️ Delivery Warnings for Planners" className="border-orange-200 dark:border-orange-800">
        <PlannerWarnings />
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
                  <th scope="col" className="px-6 py-3 text-left">Round</th>
                  <th scope="col" className="px-6 py-3 text-left">Date</th>
                  <th scope="col" className="px-6 py-3 text-left">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left">Status</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-6 py-4 whitespace-nowrap">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.motorType ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
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
                      {order.roundId ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-md">
                          Round {order.roundId}
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
                      <Link 
                        href={`/dashboard/orders/${order.id}`}
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View
                      </Link>
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
