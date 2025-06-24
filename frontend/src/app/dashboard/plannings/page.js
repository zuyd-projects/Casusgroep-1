"use client";

import { useState, useEffect } from "react";
import { api } from "@CASUSGROEP1/utils/api";
import { useSimulation } from "@CASUSGROEP1/contexts/SimulationContext";
import Card from "@CASUSGROEP1/components/Card";
import StatusBadge from "@CASUSGROEP1/components/StatusBadge";
import { PlayCircle, AlertCircle, Settings } from "lucide-react";
import PlannerWarnings from "@CASUSGROEP1/components/PlannerWarnings";
import { getMotorTypeColors } from "@CASUSGROEP1/utils/motorColors";

export default function PlanningPage() {
  const [orders, setOrders] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showCurrentRoundOnly, setShowCurrentRoundOnly] = useState(false);
  const [updating, setUpdating] = useState(null); // Track which order is being updated

  const { currentRound, currentSimulation, isRunning } = useSimulation();

  // Motor type to block requirements mapping (same as backend)
  const MotorBlockRequirements = {
    A: { Blauw: 3, Rood: 4, Grijs: 2 },
    B: { Blauw: 2, Rood: 2, Grijs: 4 },
    C: { Blauw: 3, Rood: 3, Grijs: 2 },
  };

  // Fetch real orders from API
  const fetchOrders = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Fetch both orders and rounds data
      const [apiOrders, apiRounds] = await Promise.all([
        api.get("/api/Order"),
        api.get("/api/Rounds")
      ]);

      // Store rounds data for lookup
      setRounds(apiRounds);

      // Transform API orders to match the planning table format
      const fetchedOrders = apiOrders.map((order) => {
        const blockRequirements = MotorBlockRequirements[order.motorType] || {};
        const totalBlocks = {
          blauw: (blockRequirements.Blauw || 0) * order.quantity,
          rood: (blockRequirements.Rood || 0) * order.quantity,
          grijs: (blockRequirements.Grijs || 0) * order.quantity,
        };

        // Find the round data for this order
        const roundData = apiRounds.find(round => round.id === order.roundId);

        return {
          id: order.id,
          ordernummer: `ORD-${order.id.toString().padStart(3, "0")}`,
          motortype: order.motorType,
          aantal: order.quantity,
          blauw: totalBlocks.blauw,
          rood: totalBlocks.rood,
          grijs: totalBlocks.grijs,
          productielijn: order.productionLine
            ? order.productionLine.toString()
            : null,
          status: order.status || "Pending",
          roundId: order.roundId,
          roundNumber: roundData?.roundNumber || null,
          simulationId: roundData?.simulationId || null,
          customer: order.appUserId ? `Customer ${order.appUserId}` : "Unknown",
          originalOrder: order,
        };
      });

      setOrders(fetchedOrders);
      setMessage("✅ Orders loaded from API");
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setMessage("❌ Failed to fetch orders from API");
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
      console.log(
        "🔄 Round changed, refetching orders for round:",
        currentRound.number
      );
      fetchOrders();
    }
  }, [currentRound?.number]);

  // Update production line assignment
  const updateProductionLine = async (orderId, productionLine) => {
    setUpdating(orderId);
    try {
      // Convert string to char for backend (null/empty for unassigned)
      const productionLineChar = productionLine
        ? productionLine.charAt(0)
        : null;

      // Get the current order to preserve other properties
      const currentOrder = orders.find((order) => order.id === orderId);
      if (!currentOrder) {
        setMessage(`❌ Order ${orderId} not found`);
        return;
      }

      // Update via API with all required fields
      const updateData = {
        roundId: currentOrder.originalOrder.roundId || 1,
        deliveryId: currentOrder.originalOrder.deliveryId,
        appUserId: currentOrder.originalOrder.appUserId,
        motorType: currentOrder.originalOrder.motorType,
        quantity: currentOrder.originalOrder.quantity,
        signature: currentOrder.originalOrder.signature,
        productionLine: productionLineChar,
        status: currentOrder.originalOrder.status,
      };

      await api.put(`/api/Order/${orderId}`, updateData);

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, productielijn: productionLine }
            : order
        )
      );

      setMessage(`✅ Production line updated for order ${orderId}`);
    } catch (error) {
      console.error("Failed to update production line:", error);
      setMessage(`❌ Failed to update production line for order ${orderId}`);
    } finally {
      setUpdating(null);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      // Get the current order to preserve other properties
      const currentOrder = orders.find((order) => order.id === orderId);
      if (!currentOrder) {
        setMessage(`❌ Order ${orderId} not found`);
        return;
      }

      // Update via API with all required fields
      const updateData = {
        roundId: currentOrder.originalOrder.roundId || 1,
        deliveryId: currentOrder.originalOrder.deliveryId,
        appUserId: currentOrder.originalOrder.appUserId,
        motorType: currentOrder.originalOrder.motorType,
        quantity: currentOrder.originalOrder.quantity,
        signature: currentOrder.originalOrder.signature,
        productionLine: currentOrder.productielijn
          ? currentOrder.productielijn.charAt(0)
          : null,
        status: newStatus,
      };

      await api.put(`/api/Order/${orderId}`, updateData);

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      setMessage(`✅ Status updated for order ${orderId}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      setMessage(`❌ Failed to update status for order ${orderId}`);
    } finally {
      setUpdating(null);
    }
  };

  // Filter orders based on round selection
  const filteredOrders =
    showCurrentRoundOnly && currentRound
      ? orders.filter((order) => order.roundId === currentRound.id)
      : orders;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Production Planning
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Assign orders to production lines and manage their status
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentRound && (
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={showCurrentRoundOnly}
                onChange={(e) => setShowCurrentRoundOnly(e.target.checked)}
                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <span className="ml-2 text-sm text-zinc-700 dark:text-zinc-300">
                Show only Round {currentRound.number} orders
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Simulation Status */}
      {isRunning && currentRound ? (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center space-x-4">
            <PlayCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-medium text-green-900 dark:text-green-100">
                Simulation {currentSimulation} - Round {currentRound.number}{" "}
                Active
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Planning assignments for active round. Round ID:{" "}
                {currentRound.id}
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
                Start a simulation to plan orders for specific rounds. Currently
                showing all orders.
              </p>
            </div>
          </div>
        </Card>
      )}

         {/* Planner Warnings Section */}
        <Card
          title="⚠️ Delivery Warnings for Planners"
          className="border-orange-200 dark:border-orange-800"
        >
          <PlannerWarnings />
        </Card>

      {/* Planning Statistics */}
      {filteredOrders.length > 0 && (
        <Card title="📊 Planning Overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {filteredOrders.length}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {showCurrentRoundOnly ? "Current Round Orders" : "Total Orders"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredOrders.filter((o) => o.productielijn === "1").length}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Production Line 1
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredOrders.filter((o) => o.productielijn === "2").length}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Production Line 2
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredOrders.filter((o) => !o.productielijn).length}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Unassigned
              </div>
            </div>
          </div>
        </Card>
      )}

      {message && (
        <Card
          className={
            message.includes("❌")
              ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
              : message.includes("✅")
              ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
              : "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20"
          }
        >
          <p
            className={
              message.includes("❌")
                ? "text-red-700 dark:text-red-300"
                : message.includes("✅")
                ? "text-green-700 dark:text-green-300"
                : "text-yellow-700 dark:text-yellow-300"
            }
          >
            {message}
          </p>
        </Card>
      )}

      {/* Orders table */}
      <Card>
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-zinc-500 dark:text-zinc-400">
              Loading orders...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left">
                    Motor Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left">
                    Simulation
                  </th>
                  <th scope="col" className="px-6 py-3 text-left">
                    Round
                  </th>
                  <th scope="col" className="px-6 py-3 text-left">
                    Blue Blocks
                  </th>
                  <th scope="col" className="px-6 py-3 text-left">
                    Red Blocks
                  </th>
                  <th scope="col" className="px-6 py-3 text-left">
                    Gray Blocks
                  </th>
                  <th scope="col" className="px-6 py-3 text-left">
                    Production Line
                  </th>
                  <th scope="col" className="px-6 py-3 text-left">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${getMotorTypeColors(order.motortype).full} rounded-md`}>
                        Motor {order.motortype}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.aantal}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.simulationId ? (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.blauw}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.rood}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.grijs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateProductionLine(order.id, "1")}
                          disabled={updating === order.id}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-50 ${
                            order.productielijn === "1"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-700"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          }`}
                        >
                          Line 1
                        </button>
                        <button
                          onClick={() => updateProductionLine(order.id, "2")}
                          disabled={updating === order.id}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-50 ${
                            order.productielijn === "2"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-300 dark:border-purple-700"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          }`}
                        >
                          Line 2
                        </button>
                        {order.productielijn && (
                          <button
                            onClick={() => updateProductionLine(order.id, null)}
                            disabled={updating === order.id}
                            className="px-2 py-1 text-xs font-medium rounded-md bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                            title="Unassign from production line"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        disabled={updating === order.id}
                        className="text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="Pending">Pending</option>
                        <option value="InProduction">In Production</option>
                        <option value="Completed">Completed</option>
                        <option value="AwaitingAccountManagerApproval">
                          Awaiting Approval
                        </option>
                        <option value="ApprovedByAccountManager">
                          Approved
                        </option>
                        <option value="RejectedByAccountManager">
                          Rejected
                        </option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="py-20 text-center text-zinc-500 dark:text-zinc-400">
                {showCurrentRoundOnly && currentRound
                  ? `No orders found for Round ${currentRound.number}`
                  : "No orders found"}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
