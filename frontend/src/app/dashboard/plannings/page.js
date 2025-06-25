"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@CASUSGROEP1/utils/api";
import { useSimulation } from "@CASUSGROEP1/contexts/SimulationContext";
import Card from "@CASUSGROEP1/components/Card";
import StatusBadge from "@CASUSGROEP1/components/StatusBadge";
import { PlayCircle, AlertCircle, Settings } from "lucide-react";
import PlannerWarnings from "@CASUSGROEP1/components/PlannerWarnings";
import { getMotorTypeColors } from "@CASUSGROEP1/utils/motorColors";

// Motor type to block requirements mapping (same as backend)
const MotorBlockRequirements = {
  A: { Blauw: 3, Rood: 4, Grijs: 2 },
  B: { Blauw: 2, Rood: 2, Grijs: 4 },
  C: { Blauw: 3, Rood: 3, Grijs: 2 },
};

export default function PlanningPage() {
  const [orders, setOrders] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showCurrentRoundOnly, setShowCurrentRoundOnly] = useState(false);
  const [updating, setUpdating] = useState(null); // Track which order is being updated
  
  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    motorType: "all",
    productionLine: "all"
  });

  const { currentRound, currentSimulation, isRunning } = useSimulation();

  // Fetch real orders from API
  const fetchOrders = useCallback(async () => {
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
  }, []);

  // Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Refetch orders when round changes
  useEffect(() => {
    if (currentRound) {
      console.log(
        "🔄 Round changed, refetching orders for round:",
        currentRound.number
      );
      fetchOrders();
    }
  }, [currentRound, fetchOrders]);

  // Update production line assignment
  const updateProductionLine = async (orderId, productionLine) => {
    setUpdating(orderId);
    try {
      // Get the current order to preserve other properties
      const currentOrder = orders.find((order) => order.id === orderId);
      if (!currentOrder) {
        setMessage(`❌ Order ${orderId} not found`);
        return;
      }

      // Check if order is rejected by voorraad beheer
      if (currentOrder.status === "RejectedByVoorraadbeheer" && productionLine) {
        setMessage(`❌ Cannot assign rejected order ${orderId} to production line. Order has been rejected by voorraad beheer.`);
        setUpdating(null);
        return;
      }

      // Convert string to char for backend (null/empty for unassigned)
      const productionLineChar = productionLine
        ? productionLine.charAt(0)
        : null;

      // Update via API with all required fields
      const updateData = {
        roundId: currentOrder.originalOrder.roundId || 1,
        deliveryId: currentOrder.originalOrder.deliveryId,
        appUserId: currentOrder.originalOrder.appUserId,
        motorType: currentOrder.originalOrder.motorType,
        quantity: currentOrder.originalOrder.quantity,
        signature: currentOrder.originalOrder.signature,
        productionLine: productionLineChar,
        status: productionLine ? 'ToProduction' : currentOrder.originalOrder.status, // Set to ToProduction when assigning to production line
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

  // Apply table filters to orders
  const applyTableFilters = (ordersList) => {
    return ordersList.filter((order) => {
      // Search filter (order ID or customer)
      if (filters.search && !(`#${order.id}`.toLowerCase().includes(filters.search.toLowerCase()) || 
          order.customer.toLowerCase().includes(filters.search.toLowerCase()))) {
        return false;
      }
      
      // Status filter
      if (filters.status !== "all" && order.status !== filters.status) {
        return false;
      }
      
      // Motor type filter
      if (filters.motorType !== "all" && order.motortype !== filters.motorType) {
        return false;
      }
      
      // Production line filter
      if (filters.productionLine !== "all") {
        if (filters.productionLine === "unassigned" && order.productielijn) {
          return false;
        }
        if (filters.productionLine !== "unassigned" && order.productielijn !== filters.productionLine) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Filter orders based on round selection and split into regular and rejected orders
  const allFilteredOrders =
    showCurrentRoundOnly && currentRound
      ? orders.filter((order) => order.roundId === currentRound.id)
      : orders;

  // Apply additional filters
  const baseFilteredOrders = applyTableFilters(allFilteredOrders);

  // Separate regular orders from rejected orders
  const filteredOrders = baseFilteredOrders.filter(
    (order) => order.status !== "RejectedByVoorraadbeheer"
  );
  
  const rejectedOrders = baseFilteredOrders.filter(
    (order) => order.status === "RejectedByVoorraadbeheer"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Production Planning
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Assign orders to production lines
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
      {baseFilteredOrders.length > 0 && (
        <Card title="📊 Planning Overview">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {baseFilteredOrders.length}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {showCurrentRoundOnly ? "Current Round Orders" : "Total Orders"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredOrders.filter((o) => o.productielijn === "1" && !["AwaitingAccountManagerApproval", "ApprovedByAccountManager", "RejectedByAccountManager", "Delivered", "Completed"].includes(o.status)).length}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Production Line 1
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredOrders.filter((o) => o.productielijn === "2" && !["AwaitingAccountManagerApproval", "ApprovedByAccountManager", "RejectedByAccountManager", "Delivered", "Completed"].includes(o.status)).length}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Production Line 2
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredOrders.filter((o) => !o.productielijn && o.status !== "RejectedByVoorraadbeheer").length}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Unassigned
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {rejectedOrders.length}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Rejected Orders
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

      {/* Orders tables */}
      <div className="space-y-6">
        {/* Unassigned Orders Table */}
        <Card title="📋 Unassigned Orders">
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
                      Assign to Production Line
                    </th>
                    <th scope="col" className="px-6 py-3 text-left">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredOrders.filter(order => !order.productielijn).map((order) => (
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateProductionLine(order.id, "1")}
                            disabled={updating === order.id}
                            className="px-3 py-1 text-xs font-medium rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                          >
                            Line 1
                          </button>
                          <button
                            onClick={() => updateProductionLine(order.id, "2")}
                            disabled={updating === order.id}
                            className="px-3 py-1 text-xs font-medium rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                          >
                            Line 2
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredOrders.filter(order => !order.productielijn).length === 0 && (
                <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                  All orders have been assigned to production lines
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Assigned Orders Table */}
        {filteredOrders.filter(order => order.productielijn).length > 0 && (
          <Card title="🏭 Assigned Orders">
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
                      Production Line
                    </th>
                    <th scope="col" className="px-6 py-3 text-left">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredOrders.filter(order => order.productielijn).sort((a, b) => b.id - a.id).map((order) => (
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
                        <div className="flex gap-2">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-md ${
                              order.productielijn === "1"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-700"
                                : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-300 dark:border-purple-700"
                            }`}
                          >
                            Line {order.productielijn}
                          </span>
                          <button
                            onClick={() => updateProductionLine(order.id, null)}
                            disabled={updating === order.id || order.status === "InProduction" || order.status === "ApprovedByAccountManager" || order.status === "AwaitingAccountManagerApproval" || order.status === "Delivered" || order.status === "Completed"}
                            className="px-2 py-1 text-xs font-medium rounded-md bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={order.status === "InProduction" || order.status === "ApprovedByAccountManager" || order.status === "AwaitingAccountManagerApproval" || order.status === "Delivered" || order.status === "Completed" ? "Cannot unassign when order is in production, awaiting/approved by account manager, delivered, or completed" : "Unassign from production line"}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Rejected Orders table */}
      {rejectedOrders.length > 0 && (
        <Card 
          title="🚫 Rejected Orders" 
          className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
        >
          <div className="mb-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              These orders have been rejected by Voorraad Beheer and cannot be assigned to production lines. 
              They are excluded from planning but kept for record-keeping purposes.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-red-200 dark:divide-red-800">
              <thead className="text-xs uppercase tracking-wider text-red-600 dark:text-red-400">
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
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-200 dark:divide-red-800">
                {rejectedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="bg-red-100 dark:bg-red-900/30 hover:bg-red-150 dark:hover:bg-red-900/40"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-red-800 dark:text-red-200">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-800 dark:text-red-200">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${getMotorTypeColors(order.motortype).full} rounded-md opacity-75`}>
                        Motor {order.motortype}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-800 dark:text-red-200">
                      {order.aantal}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.simulationId ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md opacity-75">
                          Sim {order.simulationId}
                        </span>
                      ) : (
                        <span className="text-red-400 dark:text-red-500">No Simulation</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.roundNumber ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-md opacity-75">
                          Round {order.roundNumber}
                        </span>
                      ) : (
                        <span className="text-red-400 dark:text-red-500">No Round</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-red-200 text-red-800 dark:bg-red-800/50 dark:text-red-200 border border-red-300 dark:border-red-700 rounded-md">
                        🚫 Rejected by Voorraad Beheer
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
