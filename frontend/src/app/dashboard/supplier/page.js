"use client";

import { useState, useEffect } from "react";
import { api } from '@CASUSGROEP1/utils/api';
import { useSimulation } from '@CASUSGROEP1/contexts/SimulationContext';

const legoColors = ["Blauw", "Rood", "Grijs"];

// Motor type to block requirements mapping (same as backend)
const MotorBlockRequirements = {
  'A': { Blauw: 3, Rood: 4, Grijs: 2 },
  'B': { Blauw: 2, Rood: 2, Grijs: 4 },
  'C': { Blauw: 3, Rood: 3, Grijs: 2 }
};

export default function SupplierPage() {
  const [orderRounds, setOrderRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use simulation context to detect when new orders might be created
  const { currentRound, isRunning } = useSimulation();

  // Update supplier order status via API
  const updateSupplierOrderStatus = async (supplierOrderId, delivered, orderData) => {
    try {
      // Get the current supplier order to preserve existing data
      const updateData = {
        appUserId: orderData.appUserId || "system",
        orderId: orderData.orderId,
        quantity: orderData.quantity,
        status: delivered ? "Delivered" : "Pending",
        roundNumber: orderData.roundNumber,
        isRMA: orderData.isRMA || false,
        orderDate: orderData.orderDate
      };
      
      await api.put(`/api/SupplierOrder/${supplierOrderId}`, updateData);
    } catch (error) {
      console.error('Error updating supplier order status:', error);
    }
  };

  // Toggle geleverdVinkje
  const handleToggleGeleverd = async (id) => {
    const order = orderRounds.find(o => o.id === id);
    const newDeliveredStatus = !order.geleverdVinkje;
    
    // Update locally first for immediate UI feedback
    setOrderRounds((prev) =>
      prev.map((order) =>
        order.id === id
          ? { ...order, geleverdVinkje: newDeliveredStatus }
          : order
      )
    );

    // Update on server
    if (order?.supplierOrderId) {
      // Get supplier order data from the stored info
      const supplierOrderData = orderRounds.find(o => o.id === id);
      const relatedOrder = supplierOrderData?.originalOrder;
      
      if (relatedOrder) {
        await updateSupplierOrderStatus(order.supplierOrderId, newDeliveredStatus, {
          appUserId: relatedOrder.appUserId || "system",
          orderId: relatedOrder.id,
          quantity: Object.values(supplierOrderData.bestelling).reduce((sum, count) => sum + count, 0),
          roundNumber: supplierOrderData.round,
          isRMA: false,
          orderDate: new Date(relatedOrder.orderDate).toISOString()
        });
      }
    }
  };

  // Update note
  const handleNoteChange = (id, value) => {
    setOrderRounds((prev) =>
      prev.map((order) => (order.id === id ? { ...order, note: value } : order))
    );
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
      
      // Fetch supplier orders and related order data
      const [supplierOrders, orders] = await Promise.all([
        api.get('/api/SupplierOrder'),
        api.get('/api/Order')
      ]);

      console.log('📦 Fetched supplier orders:', supplierOrders.length, 'orders');
      console.log('📋 Fetched regular orders:', orders.length, 'orders');

      // Process supplier orders and calculate block requirements
      const processedOrders = supplierOrders.map(supplierOrder => {
        // Find the related order to get motor type
        const relatedOrder = orders.find(order => order.id === supplierOrder.orderId);
        
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
          note: "",
          motorType: relatedOrder?.motorType || "Unknown",
          orderQuantity: relatedOrder?.quantity || 0,
          originalOrder: relatedOrder,
          supplierOrderId: supplierOrder.id
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

      {/* Motor Requirements Info */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Block Requirements per Motor Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(MotorBlockRequirements).map(([motorType, requirements]) => (
            <div key={motorType} className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-4">
              <h4 className="font-medium text-zinc-900 dark:text-white mb-2">Motor {motorType}</h4>
              <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <p><span className="text-blue-600 dark:text-blue-400">{requirements.Blauw} Blue</span></p>
                <p><span className="text-red-600 dark:text-red-400">{requirements.Rood} Red</span></p>
                <p><span className="text-zinc-600 dark:text-zinc-400">{requirements.Grijs} Gray</span></p>
              </div>
            </div>
          ))}
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
                  Round
                </th>
                <th rowSpan={2} className="px-6 py-4 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Motor Type
                </th>
                <th rowSpan={2} className="px-6 py-4 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Qty
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
                <th rowSpan={2} className="px-6 py-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Note
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
                  <td colSpan={10} className="py-12 text-center text-zinc-500 dark:text-zinc-400">
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
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                      {r.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                      {r.timestamp || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-700 font-medium text-sm text-zinc-900 dark:text-white">
                        {r.round}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        Motor {r.motorType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-700 font-medium text-xs text-zinc-900 dark:text-white">
                        {r.orderQuantity}
                      </span>
                    </td>
                    {legoColors.map((color) => (
                      <td key={color} className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center h-8 w-8 rounded-full font-medium text-sm ${
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
                        className="focus:outline-none transition-transform hover:scale-110 duration-150"
                        title={
                          r.geleverdVinkje
                            ? "Delivery received"
                            : "Not yet delivered"
                        }
                      >
                        {r.geleverdVinkje ? (
                          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
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
                          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400">
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
                    <td className="px-6 py-4 text-sm">
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 shadow-sm text-xs leading-5 font-medium rounded-md text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-all duration-150"
                        onClick={() => {
                          const newNote = window.prompt(
                            "Add note",
                            r.note || ""
                          );
                          if (newNote !== null) {
                            handleNoteChange(r.id, newNote);
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        {r.note ? "Edit" : "Note"}
                      </button>
                      {r.note && (
                        <div
                          className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs truncate"
                          title={r.note}
                        >
                          {r.note}
                        </div>
                      )}
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
