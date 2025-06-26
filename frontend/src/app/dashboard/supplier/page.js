"use client";

import { useState, useEffect } from "react";
import { api } from '@CASUSGROEP1/utils/api';
import { useSimulation } from '@CASUSGROEP1/contexts/SimulationContext';
import { getMotorTypeColors } from '@CASUSGROEP1/utils/motorColors';
import { AlertCircle, Package, Clock } from 'lucide-react';

const legoColors = ["Blauw", "Rood", "Grijs"];

// Motor type to block requirements mapping (same as backend)
const MotorBlockRequirements = {
  'A': { Blauw: 3, Rood: 4, Grijs: 2 },
  'B': { Blauw: 2, Rood: 2, Grijs: 4 },
  'C': { Blauw: 3, Rood: 3, Grijs: 2 }
};

export default function SupplierPage() {
  const [orderRounds, setOrderRounds] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [missingBlocksRequests, setMissingBlocksRequests] = useState([]);
  const [savedRounds, setSavedRounds] = useState(new Set()); // Track saved rounds

  // Use simulation context to detect when new orders might be created
  const { currentRound, isRunning } = useSimulation();

  // Update supplier order status via API
  const updateSupplierOrderStatus = async (supplierOrderId, delivered, orderData, deliveryRound = null) => {
    try {
      // Get the current supplier order to preserve existing data
      const updateData = {
        AppUserId: orderData.appUserId || null,
        OrderId: orderData.orderId,
        Quantity: orderData.quantity,
        Status: delivered ? "Delivered" : "Pending",
        RoundNumber: orderData.roundNumber,
        IsRMA: orderData.isRMA || false,
        OrderDate: orderData.orderDate
      };
      
      // Add delivery round if provided
      if (deliveryRound !== null) {
        updateData.DeliveryRound = deliveryRound;
      }
      
      await api.put(`/api/SupplierOrder/${supplierOrderId}`, updateData);
    } catch (error) {
      console.error('Error updating supplier order status:', error);
    }
  };

  // Handle resolving missing blocks requests
  const handleResolveMissingBlocks = async (requestId) => {
    try {
      const request = missingBlocksRequests.find(r => r.id === requestId);
      if (!request) return;

      // Mark the missing blocks request as resolved via API (this will also update the order status automatically)
      await api.put(`/api/MissingBlocks/${requestId}`, {
        status: 'Resolved',
        resolvedBy: 'Supplier'
      });

      // Remove from missing blocks requests UI
      setMissingBlocksRequests(prev => prev.filter(r => r.id !== requestId));
      
      console.log(`✅ Resolved missing blocks for order ${request.orderId}, returned to production line ${request.productionLine}`);
      
      // Show success message
      alert(`Missing blocks delivered! Order ${request.orderId} has been returned to ${request.productionLine} and prioritized.`);
      
    } catch (error) {
      console.error('Error resolving missing blocks request:', error);
      alert('Failed to resolve missing blocks request. Please try again.');
    }
  };

  // Toggle geleverdVinkje (only allow marking as delivered, not unmarking)
  const handleToggleGeleverd = async (id) => {
    const order = orderRounds.find(o => o.id === id);
    
    // Prevent unmarking if already delivered
    if (order.geleverdVinkje) {
      return; // Do nothing if already delivered
    }
    
    const newDeliveredStatus = true; // Always mark as delivered when clicked
    
    // Update locally first for immediate UI feedback
    setOrderRounds((prev) =>
      prev.map((order) =>
        order.id === id
          ? { 
              ...order, 
              geleverdVinkje: newDeliveredStatus,
              // If marking as delivered and we have a current round, set the delivery round
              geleverdInPeriode: newDeliveredStatus && currentRound ? currentRound.number : order.geleverdInPeriode
            }
          : order
      )
    );

    // Update on server
    if (order?.supplierOrderId && order?.originalOrder) {
      const relatedOrder = order.originalOrder;
      
      try {
        // First, let's get the current supplier order data to ensure we have all fields correct
        const currentSupplierOrder = await api.get(`/api/SupplierOrder/${order.supplierOrderId}`);
        
        // Update supplier order status with delivery round in a single call
        await updateSupplierOrderStatus(
          order.supplierOrderId, 
          newDeliveredStatus, 
          {
            appUserId: currentSupplierOrder.appUserId,
            orderId: currentSupplierOrder.orderId,
            quantity: currentSupplierOrder.quantity, // Use supplier order quantity
            roundNumber: currentSupplierOrder.roundNumber, // Use supplier order round number
            isRMA: currentSupplierOrder.isRMA,
            orderDate: currentSupplierOrder.orderDate // Use supplier order date
          },
          // Include delivery round when marking as delivered
          newDeliveredStatus && currentRound ? currentRound.number : null
        );

        // If marking as delivered, also update the main order status to Pending
        if (newDeliveredStatus && relatedOrder.id) {
          // Mark the order as saved for this round
          if (currentRound) {
            setSavedRounds(prev => new Set([...prev, `${id}-${currentRound.number}`]));
            console.log(`✅ Order ${id} delivered and scheduled for delivery in Round ${currentRound.number}`);
          }

          // Update the main order status to ApprovedByVoorraadbeheer (ready for production)
          const orderUpdateData = {
            roundId: relatedOrder.roundId || 1,
            deliveryId: relatedOrder.deliveryId,
            appUserId: relatedOrder.appUserId,
            motorType: relatedOrder.motorType,
            quantity: relatedOrder.quantity,
            signature: relatedOrder.signature,
            productionLine: relatedOrder.productionLine,
            status: 'ApprovedByVoorraadbeheer',  // Set to ApprovedByVoorraadbeheer when delivered by supplier (ready for production)
            wasReturnedFromMissingBlocks: false
          };
          
          await api.put(`/api/Order/${relatedOrder.id}`, orderUpdateData);
          console.log(`✅ Order ${relatedOrder.id} status updated to ApprovedByVoorraadbeheer (ready for production) after delivery`);
        }
      } catch (error) {
        console.error('Error updating order status or delivery round:', error);
      }
    }
  };

  // Fetch supplier orders from API
  useEffect(() => {
    fetchSupplierOrders();
  }, []);

  // Refetch when round changes (indicating new orders might be created)
  useEffect(() => {
    if (currentRound) {
      console.log('🔄 Round changed, refetching supplier orders for round:', currentRound.number);
      fetchSupplierOrders();
    }
  }, [currentRound?.number]); // Only trigger when round number changes

  const fetchSupplierOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch supplier orders, related order data, rounds data, and missing blocks requests
      const [supplierOrders, orders, apiRounds, missingBlocksData] = await Promise.all([
        api.get('/api/SupplierOrder'),
        api.get('/api/Order'),
        api.get('/api/Rounds'),
        api.get('/api/MissingBlocks/supplier') // Only get missing blocks that runner attempted
      ]);

      console.log('📦 Fetched supplier orders:', supplierOrders.length, 'orders');
      console.log('📋 Fetched regular orders:', orders.length, 'orders');
      console.log('🔄 Fetched rounds:', apiRounds.length, 'rounds');
      console.log('🚨 Fetched missing blocks (runner attempted):', missingBlocksData.length, 'requests');

      // Store rounds data for lookup
      setRounds(apiRounds);

      // Process missing blocks requests from API
      const missingBlocksRequests = missingBlocksData.map((request) => {
        const order = orders.find(o => o.id === request.orderId);
        const roundData = apiRounds.find(round => round.id === order?.roundId);
        
        return {
          id: request.id,
          orderId: request.orderId,
          productionLine: `Production Line ${request.productionLine}`,
          motorType: request.motorType,
          quantity: request.quantity,
          missingBlocks: {
            blue: request.blueBlocks,
            red: request.redBlocks,
            gray: request.grayBlocks
          },
          status: request.status,
          timestamp: new Date(request.reportedAt).toLocaleString(),
          roundData: roundData,
          originalOrder: order
        };
      });
      
      setMissingBlocksRequests(missingBlocksRequests);

      // Process supplier orders and calculate block requirements
      const processedOrders = supplierOrders.map(supplierOrder => {
        // Find the related order to get motor type
        const relatedOrder = orders.find(order => order.id === supplierOrder.orderId);
        
        // Find round data for this order
        const roundData = apiRounds.find(round => round.id === relatedOrder?.roundId);
        
        let blockRequirements = { Blauw: 0, Rood: 0, Grijs: 0 };
        
        if (relatedOrder && MotorBlockRequirements[relatedOrder.motorType]) {
          const requirements = MotorBlockRequirements[relatedOrder.motorType];
          // Multiply by order quantity
          blockRequirements = {
            Blauw: requirements.Blauw * relatedOrder.quantity,
            Rood: requirements.Rood * relatedOrder.quantity,
            Grijs: requirements.Grijs * relatedOrder.quantity
          };
        }

        return {
          id: `SUP-${supplierOrder.id}`,
          timestamp: new Date(supplierOrder.orderDate).toLocaleString(),
          round: supplierOrder.roundNumber,
          bestelling: blockRequirements,
          geleverdVinkje: supplierOrder.status === "Delivered",
          geleverdInPeriode: supplierOrder.deliveryRound || supplierOrder.roundNumber + 1,
          motorType: relatedOrder?.motorType || "Unknown",
          orderQuantity: relatedOrder?.quantity || 0,
          productionLine: relatedOrder?.productionLine || null,
          originalOrder: relatedOrder,
          supplierOrderId: supplierOrder.id,
          originalOrderId: relatedOrder?.id || "Unknown",
          originalOrderRound: relatedOrder?.roundNumber || "Unknown",
          roundNumber: roundData?.roundNumber || null,
          simulationId: roundData?.simulationId || null
        };
      });

      setOrderRounds(processedOrders);
    } catch (error) {
      console.error('Error fetching supplier orders:', error);
      setError('Failed to load supplier orders');
      // Keep existing mock data as fallback
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading supplier orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchSupplierOrders}
            className="px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supplier Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage and monitor all Lego block deliveries - Automatically calculated based on motor type</p>
        </div>
      </div>

      {/* Missing Blocks Requests Section */}
      {missingBlocksRequests.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
            <h2 className="text-xl font-bold text-red-800 dark:text-red-300">
              Missing Building Blocks - Urgent Requests
            </h2>
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
              {missingBlocksRequests.length} {missingBlocksRequests.length === 1 ? 'Request' : 'Requests'}
            </span>
          </div>
          <p className="text-red-700 dark:text-red-300 mb-4">
            Production lines have reported missing building blocks. These orders require immediate attention.
          </p>
          
          <div className="bg-white dark:bg-red-900/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-red-200 dark:divide-red-800">
                <thead className="bg-red-100 dark:bg-red-900/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                      Production Line
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                      Motor Type
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                      Blue Blocks
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                      Red Blocks
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                      Gray Blocks
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                      Reported
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-red-900/5 divide-y divide-red-100 dark:divide-red-800">
                  {missingBlocksRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-red-50 dark:hover:bg-red-900/10">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                          <span className="text-sm font-medium text-red-900 dark:text-red-200">
                            {request.productionLine}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                          ORD-{request.orderId}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center justify-center h-12 w-12 rounded-full font-bold text-lg ${getMotorTypeColors(request.motorType).full}`}>
                          {request.motorType}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 font-bold text-lg text-red-900 dark:text-red-200">
                          {request.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-lg">
                          {request.missingBlocks.blue}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-bold text-lg">
                          {request.missingBlocks.red}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-lg">
                          {request.missingBlocks.gray}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <Clock className="w-4 h-4 text-red-500 dark:text-red-400 mr-1" />
                          <span className="text-xs text-red-600 dark:text-red-400">
                            {request.timestamp}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleResolveMissingBlocks(request.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          <Package className="w-3 h-3 mr-1" />
                          Delivered
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Motor Requirements Info */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Block Requirements per Motor Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(MotorBlockRequirements).map(([motorType, requirements]) => {
            const colors = getMotorTypeColors(motorType);
            return (
              <div key={motorType} className={`${colors.bg} rounded-lg p-4 border ${colors.border}`}>
                <h4 className={`font-medium ${colors.text} mb-2`}>Motor {motorType}</h4>
                <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                  <p><span className="text-blue-600 dark:text-blue-400">{requirements.Blauw} Blue</span></p>
                  <p><span className="text-red-600 dark:text-red-400">{requirements.Rood} Red</span></p>
                  <p><span className="text-zinc-600 dark:text-zinc-400">{requirements.Grijs} Gray</span></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
              <tr>
                <th rowSpan={2} className="px-6 py-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  ID
                </th>
                <th rowSpan={2} className="px-6 py-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th rowSpan={2} className="px-6 py-4 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th rowSpan={2} className="px-6 py-4 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Simulation
                </th>
                <th rowSpan={2} className="px-6 py-4 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Round
                </th>
                <th rowSpan={2} className="px-6 py-4 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Motor Type
                </th>
                <th rowSpan={2} className="px-6 py-4 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Qty
                </th>
                <th rowSpan={2} className="px-6 py-4 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Production Line
                </th>
                <th colSpan={3} className="px-6 py-4 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800">
                  Required Blocks
                </th>
                <th rowSpan={2} className="px-6 py-4 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Delivered?
                </th>
                <th rowSpan={2} className="px-6 py-4 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Delivery Round
                </th>
              </tr>
              <tr>
                {legoColors.map((color) => (
                  <th
                    key={color}
                    className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                      color === "Blauw"
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : color === "Rood"
                        ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : color === "Grijs"
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        : ""
                    }`}
                  >
                    {color === "Blauw" ? "Blue" : color === "Rood" ? "Red" : "Gray"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
              {orderRounds.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-zinc-300 dark:text-zinc-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="mt-3 text-lg">No orders yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                [...orderRounds].reverse().map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`transition-colors duration-150 ${
                      idx % 2 === 0 
                        ? 'bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700' 
                        : 'bg-gray-100 dark:bg-zinc-700/50 hover:bg-gray-200 dark:hover:bg-zinc-600/50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                      {r.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                      {r.timestamp || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center h-12 w-12 rounded-full text-lg font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        {r.originalOrderId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {r.simulationId ? (
                        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full text-lg font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {r.simulationId}
                        </span>
                      ) : (
                        <span className="text-zinc-400">No Simulation</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {r.roundNumber ? (
                        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full text-lg font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                          {r.roundNumber}
                        </span>
                      ) : (
                        <span className="text-zinc-400">No Round</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center h-12 w-12 rounded-full font-bold text-lg ${getMotorTypeColors(r.motorType).full}`}>
                        {r.motorType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 font-bold text-lg text-zinc-900 dark:text-white">
                        {r.orderQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {r.productionLine ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          r.productionLine === '1' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : r.productionLine === '2'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          <Package className="w-4 h-4 mr-1" />
                          Line {r.productionLine}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-sm">Not Assigned</span>
                      )}
                    </td>
                    {legoColors.map((color) => (
                      <td key={color} className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center h-12 w-12 rounded-full font-bold text-lg ${
                            color === "Blauw"
                              ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                              : color === "Rood"
                              ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                              : color === "Grijs"
                              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                              : ""
                          }`}
                        >
                          {r.bestelling[color]}
                        </span>
                      </td>
                    ))}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleGeleverd(r.id)}
                        className={`focus:outline-none transition-all duration-150 ${
                          r.geleverdVinkje 
                            ? "cursor-not-allowed opacity-75" 
                            : "hover:scale-110 cursor-pointer"
                        }`}
                        disabled={r.geleverdVinkje}
                        title={
                          r.geleverdVinkje
                            ? "Delivery completed - Cannot be undone"
                            : "Click to mark as delivered"
                        }
                      >
                        {r.geleverdVinkje ? (
                          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400 border-2 border-green-300 dark:border-green-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-800/70">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                        Round {r.geleverdInPeriode ? r.geleverdInPeriode : "-"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
