"use client";

import { useState, useEffect } from "react";
import { api } from "@CASUSGROEP1/utils/api";
import { useSimulation } from "@CASUSGROEP1/contexts/SimulationContext";
import { getMotorTypeColors } from "@CASUSGROEP1/utils/motorColors";
import Link from "next/link";

const legoColors = ["Blauw", "Rood", "Grijs"];

// Motor type to block requirements mapping (same as backend)
const MotorBlockRequirements = {
  A: { Blauw: 3, Rood: 4, Grijs: 2 },
  B: { Blauw: 2, Rood: 2, Grijs: 4 },
  C: { Blauw: 3, Rood: 3, Grijs: 2 },
};

export default function InventoryManagementPage() {
  const [inventoryData, setInventoryData] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [rejectedOrders, setRejectedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentRound, isRunning } = useSimulation();

  // Notification functions - using console.log instead of alerts
  const showSuccessMessage = (title, message) => {
    console.log(`✅ ${title}: ${message}`);
  };

  const showErrorMessage = (title, message) => {
    console.error(`❌ ${title}: ${message}`);
  };

  // Fetch inventory data from API
  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Refetch when round changes
  useEffect(() => {
    if (currentRound) {
      fetchInventoryData();
    }
  }, [currentRound?.number]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch supplier orders, regular orders, and pending orders
      const [supplierOrders, orders, pendingOrdersData] = await Promise.all([
        api.get("/api/SupplierOrder"),
        api.get("/api/Order"),
        api.get("/api/Order").then(orders => orders.filter(order => order.status === "Pending"))
      ]);

      setPendingOrders(pendingOrdersData);

      // Filter and set rejected orders
      const rejectedOrdersData = orders.filter(order => order.status === "RejectedByVoorraadbeheer");
      setRejectedOrders(rejectedOrdersData);

      // Process supplier orders to calculate current inventory
      const inventoryItems = supplierOrders.map((supplierOrder) => {
        const relatedOrder = orders.find(
          (order) => order.id === supplierOrder.orderId
        );

        let blockRequirements = { Blauw: 0, Rood: 0, Grijs: 0 };

        if (relatedOrder && MotorBlockRequirements[relatedOrder.motorType]) {
          const requirements = MotorBlockRequirements[relatedOrder.motorType];
          blockRequirements = {
            Blauw: requirements.Blauw * relatedOrder.quantity,
            Rood: requirements.Rood * relatedOrder.quantity,
            Grijs: requirements.Grijs * relatedOrder.quantity,
          };
        }

        return {
          id: `INV-${supplierOrder.id}`,
          orderNumber: relatedOrder?.id || `SO-${supplierOrder.id}`,
          timestamp: new Date(supplierOrder.orderDate).toLocaleString(),
          motorType: relatedOrder?.motorType || "Unknown",
          orderQuantity: relatedOrder?.quantity || 0,
          expectedBlocks: blockRequirements,
          productionLine: `Lijn ${((relatedOrder?.id || supplierOrder.id) % 3) + 1
            }`, // Simple production line assignment
          isDelivered:
            supplierOrder.status === "Delivered" ||
            supplierOrder.status === "FromOrder",
          supplierOrderId: supplierOrder.id,
          originalOrder: relatedOrder,
          // Use the actual order status instead of supplier order status
          status: relatedOrder?.status || "Unknown", // Use the order status, not supplier order status
          deliveryDate:
            supplierOrder.status === "Delivered" ||
              supplierOrder.status === "FromOrder"
              ? supplierOrder.orderDate
              : null,
          // Add customer name from the related order
          customerName: relatedOrder?.appUserId ? ` ${relatedOrder.appUserId}` : "Unknown Customer",
        };
      });

      setInventoryData(inventoryItems);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      setError("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    await fetchInventoryData();
  };

  // Handle order approval
  const handleApproveOrder = async (orderId) => {
    try {
      console.log(`🟢 Approving order ${orderId}`);
      await api.post(`/api/Order/${orderId}/approve-voorraad`);

      showSuccessMessage(
        "✅ Order Approved!",
        `Order ${orderId} has been approved and sent to supplier and planning.`
      );

      // Refresh data
      await fetchInventoryData();
    } catch (error) {
      console.error("Error approving order:", error);
      showErrorMessage(
        "❌ Approval Failed",
        `Failed to approve order ${orderId}. ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Handle order rejection
  const handleRejectOrder = async (orderId, reason) => {
    try {
      console.log(`🔴 Rejecting order ${orderId} with reason: ${reason}`);
      await api.post(`/api/Order/${orderId}/reject-voorraad`, { reason });

      showSuccessMessage(
        "❌ Order Rejected",
        `Order ${orderId} has been rejected. Reason: ${reason}`
      );

      // Refresh data
      await fetchInventoryData();
    } catch (error) {
      console.error("Error rejecting order:", error);
      showErrorMessage(
        "❌ Rejection Failed",
        `Failed to reject order ${orderId}. ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Handle order deletion - safety mechanism for bad orders
  const handleDeleteOrder = async (orderId) => {
    const isConfirmed = window.confirm(
      `⚠️ WARNING: Are you sure you want to PERMANENTLY delete order ${orderId} from the database?\n\n` +
      `Use only in emergencies or if the order is invalid.`
    );

    if (!isConfirmed) {
      return;
    }

    // Double confirmation for safety
    const isDoubleConfirmed = window.confirm(
      `🔥 FINAL WARNING: Order ${orderId} will be permanently deleted!\n\n` +
      `Click OK to confirm or Cancel to go back.`
    );

    if (!isDoubleConfirmed) {
      return;
    }

    try {
      console.log(`🗑️ Deleting order ${orderId} from database`);
      await api.delete(`/api/Order/${orderId}`);

      showSuccessMessage(
        "🗑️ Order Deleted!",
        `Order ${orderId} has been permanently deleted from the database.`
      );

      // Refresh data to remove the deleted order
      await fetchInventoryData();
    } catch (error) {
      console.error("Error deleting order:", error);
      showErrorMessage(
        "❌ Deletion Failed",
        `Failed to delete order ${orderId}. ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Handle rejection - simplified without prompt
  const handleRejectOrderWithPrompt = (orderId) => {
    // Use a default reason instead of prompting the user
    const reason = "Order rejected by Inventory Management";
    handleRejectOrder(orderId, reason);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Loading inventory data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchInventoryData}
            className="px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-[2000px] mx-auto">
        <div className="bg-white dark:bg-zinc-900 shadow-md overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <div className="bg-zinc-50 dark:bg-zinc-900/50 py-6 px-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-8">
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                    Inventory Management
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-1 text-sm">
                    Monitor and manage incoming orders
                  </p>
                </div>
              </div>
              {/* Refresh button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleManualRefresh}
                  disabled={loading}
                  className="px-3 py-2 bg-zinc-600 hover:bg-zinc-700 disabled:bg-zinc-400 text-white rounded-lg font-medium transition-colors border border-zinc-600 hover:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title="Refresh inventory data"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          </div>

          {/* Pending Orders Section */}
          {pendingOrders.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-700 p-6">
              <div className="max-w-6xl mx-auto">
                <h3 className="text-xl font-bold text-orange-800 dark:text-orange-200 mb-4">
                  📋 Orders waiting for approval
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                  These orders are pending approval from Inventory Management.
                </p>
                <div className="grid gap-4">
                  {pendingOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-zinc-800 rounded-lg border border-orange-200 dark:border-orange-700 p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                            Order #{order.id}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${getMotorTypeColors(order.motorType).full}`}>
                              Motor {order.motorType}
                            </span>
                            {order.quantity}x
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Placed on: {new Date(order.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-4">
                          {MotorBlockRequirements[order.motorType] && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">Benodigde blokjes:</span>
                              {legoColors.map((color) => {
                                const needed = MotorBlockRequirements[order.motorType][color] * order.quantity;
                                return (
                                  <span
                                    key={color}
                                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${color === "Blauw"
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                      : color === "Rood"
                                        ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                                      }`}
                                  >
                                    {color}: {needed}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveOrder(order.id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectOrderWithPrompt(order.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Reject
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="px-4 py-2 bg-gray-700 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 border-2 border-red-300"
                          title="⚠️ EMERGENCY: Delete order permanently from database"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto p-2">
            <table className="w-full border-separate border-spacing-0">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                <tr className="border-b-2 border-zinc-200 dark:border-zinc-800">
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    Order #
                  </th>
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    Motor Type
                  </th>
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    colSpan={3}
                    className="px-6 py-5 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800"
                  >
                    Required Blocks
                  </th>
                </tr>
                <tr>
                  {legoColors.map((color) => (
                    <th
                      key={color}
                      className={`px-6 py-4 text-center text-sm font-medium uppercase tracking-wider ${color === "Blauw"
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
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                {inventoryData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-12 text-center text-zinc-500 dark:text-zinc-400"
                    >
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
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                        <p className="mt-3 text-lg">No data</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  [...inventoryData].reverse().map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`transition-colors duration-150 ${idx % 2 === 0
                        ? 'bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800'
                        : 'bg-gray-100 dark:bg-zinc-800/50 hover:bg-gray-200 dark:hover:bg-zinc-700/50'
                        }`}
                    >
                      {/* Order Number */}
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center gap-2">
                          {item.orderNumber}
                          {item.originalOrder?.isRMA && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                              RMA
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Customer Name */}
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100 text-center">
                        {item.customerName}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${item.status?.toLowerCase() === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : item.status?.toLowerCase() === "inproduction"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : item.status?.toLowerCase() ===
                                "rejectedbyvoorraadbeheer"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : item.status?.toLowerCase() ===
                                  "awaitingaccountmanagerapproval"
                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                                  : item.status?.toLowerCase() ===
                                    "approvedbyaccountmanager"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : item.status?.toLowerCase() ===
                                      "approvedbyvoorraadbeheer"
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                      : item.status?.toLowerCase() ===
                                        "rejectedbyaccountmanager"
                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                        : item.status?.toLowerCase() === "delivered"
                                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                          : item.status?.toLowerCase() === "completed"
                                            ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400"
                                            : item.status?.toLowerCase() === "cancelled"
                                              ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                                              : item.status?.toLowerCase() === "processing"
                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                        >
                          {item.status
                            ? item.status
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())
                              .trim()
                            : "Unknown"}
                        </span>
                      </td>
                      {/* Motor Type */}
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center justify-center h-12 w-12 rounded-full font-bold text-lg ${getMotorTypeColors(item.motorType).full}`}>
                          {item.motorType}
                        </span>
                      </td>
                      {/* Amount of Motors */}
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full font-bold text-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white">
                          {item.orderQuantity}
                        </span>
                      </td>
                      {/* Block Counts */}
                      {legoColors.map((color) => (
                        <td key={color} className="px-6 py-5 text-center">
                          <span
                            className={`inline-flex items-center justify-center h-12 w-12 rounded-full font-bold text-lg ${color === "Blauw"
                              ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                              : color === "Rood"
                                ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                                : color === "Grijs"
                                  ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                                  : ""
                              }`}
                          >
                            {item.expectedBlocks[color]}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rejected Orders Section */}
        {rejectedOrders.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg mt-6">
            <div className="bg-red-100 dark:bg-red-900/50 py-4 px-6 border-b border-red-200 dark:border-red-700">
              <h3 className="text-xl font-bold text-red-800 dark:text-red-200">
                ❌ Rejected Orders
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                These orders were rejected by Inventory Management and will not be processed further.
              </p>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full border-separate border-spacing-0">
                <thead className="bg-red-50 dark:bg-red-900/30">
                  <tr className="border-b-2 border-red-200 dark:border-red-700">
                    <th className="px-6 py-4 text-left text-sm font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                      Motor Type
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                      Order Date
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900">
                  {rejectedOrders.map((order, idx) => (
                    <tr
                      key={order.id}
                      className={`transition-colors duration-150 ${idx % 2 === 0
                        ? 'bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-900/10'
                        : 'bg-gray-100 dark:bg-zinc-800/50 hover:bg-red-100/50 dark:hover:bg-red-900/15'
                        }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMotorTypeColors(order.motorType).full}`}>
                          Motor {order.motorType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-zinc-900 dark:text-zinc-100">
                        {order.quantity} stuks
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-zinc-900 dark:text-zinc-100">
                        Customer {order.appUserId}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        {new Date(order.orderDate).toLocaleDateString('nl-NL')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          Rejected
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
