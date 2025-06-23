'use client';

import { useState, useEffect } from 'react';
import { api } from '@CASUSGROEP1/utils/api';
import { useSimulation } from '@CASUSGROEP1/contexts/SimulationContext';

export default function PlanningPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCurrentRoundOnly, setShowCurrentRoundOnly] = useState(false);

  const { currentRound, currentSimulation, isRunning } = useSimulation();

  // Motor type to block requirements mapping (same as backend)
  const MotorBlockRequirements = {
    'A': { 'Blauw': 3, 'Rood': 4, 'Grijs': 2 },
    'B': { 'Blauw': 2, 'Rood': 2, 'Grijs': 4 },
    'C': { 'Blauw': 3, 'Rood': 3, 'Grijs': 2 }
  };

  // Fetch real orders from API
  const fetchOrders = async () => {
    setLoading(true);
    setMessage('');

    try {
      const apiOrders = await api.get('/api/Order');
      
      // Transform API orders to match the planning table format
      const fetchedOrders = apiOrders.map(order => {
        const blockRequirements = MotorBlockRequirements[order.motorType] || {};
        const totalBlocks = {
          blauw: (blockRequirements.Blauw || 0) * order.quantity,
          rood: (blockRequirements.Rood || 0) * order.quantity,
          grijs: (blockRequirements.Grijs || 0) * order.quantity
        };

        return {
          id: order.id,
          ordernummer: `ORD-${order.id.toString().padStart(3, '0')}`,
          motortype: order.motorType,
          aantal: order.quantity,
          blauw: totalBlocks.blauw,
          rood: totalBlocks.rood,
          grijs: totalBlocks.grijs,
          productielijn: order.productionLine ? order.productionLine.toString() : null,
          status: order.status || 'Pending',
          roundId: order.roundId
        };
      });

      const currentData = JSON.stringify(orders);
      const newData = JSON.stringify(fetchedOrders);

      if (currentData === newData) {
        setMessage('No new data found');
      } else {
        setOrders(fetchedOrders);
        setMessage('✅ Orders loaded from API');
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setMessage('❌ Failed to fetch orders from API');
    } finally {
      setLoading(false);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Refetch orders when round changes
  useEffect(() => {
    if (currentRound) {
      console.log('🔄 Round changed, refetching orders for round:', currentRound.number);
      fetchOrders();
    }
  }, [currentRound?.number]);

  // Update production line assignment
  const updateProductionLine = async (orderId, productionLine) => {
    try {
      // Convert string to char for backend (null/empty for unassigned)
      const productionLineChar = productionLine ? productionLine.charAt(0) : null;
      
      // Get the current order to preserve other properties
      const currentOrder = orders.find(order => order.id === orderId);
      if (!currentOrder) {
        setMessage(`❌ Order ${orderId} not found`);
        return;
      }

      // Update via API with all required fields
      const updateData = {
        roundId: currentOrder.roundId || 1,
        deliveryId: null,
        appUserId: null,
        motorType: currentOrder.motortype,
        quantity: currentOrder.aantal,
        signature: null,
        productionLine: productionLineChar,
        status: currentOrder.status
      };
      
      await api.put(`/api/Order/${orderId}`, updateData);
      
      // Update local state
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, productielijn: productionLine } : order
        )
      );
      
      setMessage(`✅ Production line updated for order ${orderId}`);
    } catch (error) {
      console.error('Failed to update production line:', error);
      setMessage(`❌ Failed to update production line for order ${orderId}`);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Get the current order to preserve other properties
      const currentOrder = orders.find(order => order.id === orderId);
      if (!currentOrder) {
        setMessage(`❌ Order ${orderId} not found`);
        return;
      }

      // Update via API with all required fields
      const updateData = {
        roundId: currentOrder.roundId || 1,
        deliveryId: null,
        appUserId: null,
        motorType: currentOrder.motortype,
        quantity: currentOrder.aantal,
        signature: null,
        productionLine: currentOrder.productielijn ? currentOrder.productielijn.charAt(0) : null,
        status: newStatus
      };
      
      await api.put(`/api/Order/${orderId}`, updateData);
      
      // Update local state
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      setMessage(`✅ Status updated for order ${orderId}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      setMessage(`❌ Failed to update status for order ${orderId}`);
    }
  };

  // Filter orders based on round selection
  const filteredOrders = showCurrentRoundOnly && currentRound 
    ? orders.filter(order => order.roundId === currentRound.id)
    : orders;

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Production Planning & Line Assignment</h1>

      {/* Simulation Status */}
      {isRunning && currentRound ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-green-900 dark:text-green-100">
                Simulation {currentSimulation} - Round {currentRound.number} Active
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Planning assignments for active round. Round ID: {currentRound.id}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
                No Active Simulation
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Start a simulation to plan orders for specific rounds. Currently showing all orders.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Planning Statistics */}
      {filteredOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {showCurrentRoundOnly ? 'Current Round Orders' : 'Total Orders'}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{filteredOrders.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned to Line 1</div>
            <div className="text-2xl font-bold text-green-600">{filteredOrders.filter(o => o.productielijn === '1').length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned to Line 2</div>
            <div className="text-2xl font-bold text-purple-600">{filteredOrders.filter(o => o.productielijn === '2').length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Unassigned</div>
            <div className="text-2xl font-bold text-yellow-600">{filteredOrders.filter(o => !o.productielijn).length}</div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Orders'}
        </button>
        
        {currentRound && (
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={showCurrentRoundOnly}
              onChange={(e) => setShowCurrentRoundOnly(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Show only Round {currentRound.number} orders
            </span>
          </label>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('❌') ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 
          message.includes('✅') ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
        }`}>
          {message}
        </div>
      )}

      {filteredOrders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-900 text-white dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left">Order Number</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left">Round</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left">Motor Type</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left">Quantity</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left">Blue Blocks</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left">Red Blocks</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left">Gray Blocks</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left">Production Line</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={order.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100">
                      {order.ordernummer}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                      {order.roundId ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 rounded-md">
                          Round {order.roundId}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">No Round</span>
                      )}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.motortype === 'A' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        order.motortype === 'B' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                      }`}>
                        {order.motortype}
                      </span>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100">
                      {order.aantal}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100">
                      {order.blauw}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100">
                      {order.rood}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100">
                      {order.grijs}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                      <select
                        value={order.productielijn || ''}
                        onChange={(e) => updateProductionLine(order.id, e.target.value || null)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Unassigned</option>
                        <option value="1">Production Line 1</option>
                        <option value="2">Production Line 2</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="InProduction">In Production</option>
                        <option value="Completed">Completed</option>
                        <option value="error">Error</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2" />
            </svg>
            <p className="text-lg font-medium">
              {showCurrentRoundOnly && currentRound 
                ? `No orders found for Round ${currentRound.number}` 
                : 'No orders found'}
            </p>
            <p className="text-sm">
              {showCurrentRoundOnly && currentRound 
                ? 'Try unchecking the round filter or refresh orders'
                : 'Click "Refresh Orders" to load orders from the system'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
