"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@CASUSGROEP1/utils/api";
import { useSimulation } from "@CASUSGROEP1/contexts/SimulationContext";
import Link from "next/link";

const legoColors = ["Blauw", "Rood", "Grijs"];

// Motor type to block requirements mapping (same as backend)
const MotorBlockRequirements = {
  A: { Blauw: 3, Rood: 4, Grijs: 2 },
  B: { Blauw: 2, Rood: 2, Grijs: 4 },
  C: { Blauw: 3, Rood: 3, Grijs: 2 },
};

export default function VoorraadBeheerPage() {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStock, setCurrentStock] = useState({
    Blauw: 0,
    Rood: 0,
    Grijs: 0,
  });
  const [showReplacementOrder, setShowReplacementOrder] = useState(false);
  const [replacementOrder, setReplacementOrder] = useState({
    Blauw: 0,
    Rood: 0,
    Grijs: 0,
    reason: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  }, [fetchInventoryData]);

  // Refetch when round changes
  useEffect(() => {
    if (currentRound) {
      fetchInventoryData();
    }
  }, [currentRound, fetchInventoryData]);

  const fetchInventoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch supplier orders and regular orders to calculate inventory needs
      const [supplierOrders, orders] = await Promise.all([
        api.get("/api/SupplierOrder"),
        api.get("/api/Order"),
      ]);

      // Calculate current stock levels based on delivered supplier orders
      let stockLevels = { Blauw: 0, Rood: 0, Grijs: 0 };

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

          // Add to stock if delivered (checking both 'Delivered' and 'FromOrder' status)
          if (
            supplierOrder.status === "Delivered" ||
            supplierOrder.status === "FromOrder"
          ) {
            stockLevels.Blauw += blockRequirements.Blauw;
            stockLevels.Rood += blockRequirements.Rood;
            stockLevels.Grijs += blockRequirements.Grijs;
          }
        }

        return {
          id: `INV-${supplierOrder.id}`,
          orderNumber: relatedOrder?.id || `SO-${supplierOrder.id}`,
          timestamp: new Date(supplierOrder.orderDate).toLocaleString(),
          motorType: relatedOrder?.motorType || "Unknown",
          orderQuantity: relatedOrder?.quantity || 0,
          expectedBlocks: blockRequirements,
          productionLine: `Lijn ${
            ((relatedOrder?.id || supplierOrder.id) % 3) + 1
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
          customerName: relatedOrder?.appUserId ? `Customer ${relatedOrder.appUserId}` : "Unknown Customer",
        };
      });

      setCurrentStock(stockLevels);
      setInventoryData(inventoryItems);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      setError("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Manual refresh function
  const handleManualRefresh = async () => {
    await fetchInventoryData();
  };

  // Validate replacement order form
  const validateReplacementOrder = () => {
    const errors = {};
    const totalBlocks =
      replacementOrder.Blauw + replacementOrder.Rood + replacementOrder.Grijs;

    if (totalBlocks === 0) {
      errors.blocks = "Selecteer ten minste één blokje om te vervangen";
    }

    if (!replacementOrder.reason.trim()) {
      errors.reason = "Reden voor vervanging is verplicht";
    } else if (replacementOrder.reason.trim().length < 10) {
      errors.reason = "Reden moet minimaal 10 karakters bevatten";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle replacement order submission
  const handleReplacementOrder = async () => {
    if (!validateReplacementOrder()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const totalBlocks =
        replacementOrder.Blauw + replacementOrder.Rood + replacementOrder.Grijs;

      console.log("🔄 Creating replacement order");

      // Create a replacement supplier order
      const orderData = {
        AppUserId: "1", // Use same user ID as orders screen for compatibility
        OrderId: 0, // Will be set by backend for replacement orders
        Quantity: totalBlocks,
        Status: "Pending",
        RoundNumber: currentRound?.number || 1,
        IsRMA: true, // Mark as replacement/return order
        OrderDate: new Date().toISOString(),
      };

      await api.post("/api/SupplierOrder", orderData);

      // Reset form and close
      setReplacementOrder({ Blauw: 0, Rood: 0, Grijs: 0, reason: "" });
      setValidationErrors({});
      setShowReplacementOrder(false);

      // Refresh data to show new order
      await fetchInventoryData();

      // Show success message
      showSuccessMessage(
        `🎉 Vervangingsorder Succesvol Geplaatst!`,
        `${totalBlocks} blokjes worden vervangen:\n• Blauw: ${replacementOrder.Blauw}\n• Rood: ${replacementOrder.Rood}\n• Grijs: ${replacementOrder.Grijs}\n• Reden: ${replacementOrder.reason}`
      );
    } catch (error) {
      console.error("Error placing replacement order:", error);
      console.error("Error details:", error.response?.data || error.message);
      let errorMessage = "Er is een onbekende fout opgetreden";

      if (
        error.message.includes("401") ||
        error.message.includes("unauthorized") ||
        error.response?.status === 401
      ) {
        errorMessage =
          "🔐 Je moet ingelogd zijn om een vervangingsorder te plaatsen.\n\n💡 Ga naar de login pagina om in te loggen en probeer daarna opnieuw.";
      } else if (
        error.message.includes("constraint") ||
        error.message.includes("foreign key")
      ) {
        errorMessage =
          "👤 Je moet ingelogd zijn als geldige gebruiker om een order te plaatsen.\n\n💡 Tip: Zorg dat je bent ingelogd voordat je een vervangingsorder plaatst.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage =
          "🌐 Netwerkfout: Controleer je internetverbinding en probeer opnieuw.";
      } else if (error.message.includes("500")) {
        errorMessage =
          "🔧 Server fout: Er is iets misgegaan op de server. Neem contact op met de beheerder.";
      } else if (error.response?.status === 400) {
        errorMessage =
          "❌ Ongeldig verzoek: Controleer of alle velden correct zijn ingevuld.\n\n💡 Als je niet ingelogd bent, log dan eerst in.";
      } else if (error.message) {
        errorMessage = `❌ ${error.message}`;
      }

      showErrorMessage("Fout bij Vervangingsorder", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Loading inventory data...
          </p>
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
            onClick={fetchInventoryData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-[2000px] mx-auto">
        <div className="bg-zinc-100 dark:bg-zinc-900 shadow-md overflow-hidden border-0 rounded-lg">
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-500 py-6 px-6 relative">
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-8">
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Voorraad Beheer
                  </h1>
                  <p className="text-pink-100 mt-1 text-sm">
                    Monitor voorraad niveaus en leveringen
                  </p>
                </div>
                {/* Current Stock Levels - Inline */}
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  {legoColors.map((color) => {
                    const stockCount = currentStock[color];
                    const isLowStock = stockCount < 10;
                    return (
                      <div key={color} className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold relative ${
                            color === "Blauw"
                              ? "bg-blue-500 text-white"
                              : color === "Rood"
                              ? "bg-red-500 text-white"
                              : "bg-gray-500 text-white"
                          }`}
                        >
                          {stockCount}
                          {isLowStock && stockCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-pink-100 text-xs font-medium">
                            {color}
                          </span>
                          {isLowStock && stockCount > 0 && (
                            <span className="text-orange-200 text-xs">
                              Laag
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Refresh button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowReplacementOrder(!showReplacementOrder)}
                  className={`px-3 py-2 ${
                    showReplacementOrder
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-amber-500 hover:bg-amber-600"
                  } text-white rounded-lg font-medium transition-colors flex items-center gap-2`}
                  title="Plaats vervangingsorder voor defecte blokjes"
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
                      d={
                        showReplacementOrder
                          ? "M6 18L18 6M6 6l12 12"
                          : "M12 4v16m8-8H4"
                      }
                    />
                  </svg>
                  {showReplacementOrder ? "Sluiten" : "Vervangingsorder"}
                </button>
                <button
                  onClick={handleManualRefresh}
                  disabled={loading}
                  className="px-3 py-2 bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white rounded-lg font-medium transition-colors border border-white/30 hover:border-white/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          {/* Inline Replacement Order Form */}
          {showReplacementOrder && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700 p-6">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-4">
                  🔄 Vervangingsorder Plaatsen
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                  Selecteer het aantal defecte blokjes dat vervangen moet worden
                </p>
                {/* Validation Error for Blocks */}
                {validationErrors.blocks && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      ⚠️ {validationErrors.blocks}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Block Selection */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                      Selecteer Blokjes
                    </h4>
                    {legoColors.map((color) => (
                      <div
                        key={color}
                        className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm"
                      >
                        <label className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full ${
                              color === "Blauw"
                                ? "bg-blue-500"
                                : color === "Rood"
                                ? "bg-red-500"
                                : "bg-gray-500"
                            }`}
                          ></div>
                          <span className="font-medium text-zinc-700 dark:text-zinc-300 text-lg">
                            {color}
                          </span>
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              setReplacementOrder((prev) => ({
                                ...prev,
                                [color]: Math.max(0, prev[color] - 1),
                              }))
                            }
                            className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 flex items-center justify-center transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18 12H6"
                              />
                            </svg>
                          </button>
                          <span className="w-12 text-center font-bold text-xl text-zinc-700 dark:text-zinc-300">
                            {replacementOrder[color]}
                          </span>
                          <button
                            onClick={() =>
                              setReplacementOrder((prev) => ({
                                ...prev,
                                [color]: prev[color] + 1,
                              }))
                            }
                            className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 flex items-center justify-center transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reason and Actions */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                        Reden voor vervanging *
                      </label>
                      <textarea
                        value={replacementOrder.reason}
                        onChange={(e) => {
                          setReplacementOrder((prev) => ({
                            ...prev,
                            reason: e.target.value,
                          }));
                          // Clear validation error when user starts typing
                          if (validationErrors.reason) {
                            setValidationErrors((prev) => ({
                              ...prev,
                              reason: undefined,
                            }));
                          }
                        }}
                        placeholder="Bijv. defecte blokjes, beschadiging tijdens transport, kwaliteitsprobleem..."
                        className={`w-full p-4 border rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 resize-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                          validationErrors.reason
                            ? "border-red-300 dark:border-red-600"
                            : "border-amber-300 dark:border-amber-600"
                        }`}
                        rows="4"
                      />
                      {validationErrors.reason && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {validationErrors.reason}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        Minimaal 10 karakters ({replacementOrder.reason.length}
                        /10)
                      </p>
                    </div>
                    <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-4">
                      <h5 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                        Samenvatting
                      </h5>
                      <div className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                        <p>
                          Totaal blokjes:{" "}
                          <span className="font-semibold">
                            {replacementOrder.Blauw +
                              replacementOrder.Rood +
                              replacementOrder.Grijs}
                          </span>
                        </p>
                        <p>
                          Blauw: {replacementOrder.Blauw}, Rood:{" "}
                          {replacementOrder.Rood}, Grijs:{" "}
                          {replacementOrder.Grijs}
                        </p>
                        <p>Periode: {currentRound?.number || 1}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowReplacementOrder(false);
                          setReplacementOrder({
                            Blauw: 0,
                            Rood: 0,
                            Grijs: 0,
                            reason: "",
                          });
                          setValidationErrors({});
                        }}
                        className="flex-1 px-4 py-3 border border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors font-medium"
                      >
                        Annuleren
                      </button>
                      <button
                        onClick={handleReplacementOrder}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Plaatsen...
                          </>
                        ) : (
                          "Order Plaatsen"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="overflow-x-auto p-2">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="border-b-2 border-zinc-200 dark:border-zinc-800">
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-left text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    Order Nummer
                  </th>
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    Klant
                  </th>
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    Motor Type
                  </th>
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    Aantal Motoren
                  </th>
                  <th
                    colSpan={3}
                    className="px-6 py-5 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-900/50"
                  >
                    Blokjes Telling
                  </th>
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    Productielijn
                  </th>
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    Order Details
                  </th>
                </tr>
                <tr>
                  {legoColors.map((color) => (
                    <th
                      key={color}
                      className={`px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider ${
                        color === "Blauw"
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : color === "Rood"
                          ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          : color === "Grijs"
                          ? "bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                          : ""
                      }`}
                    >
                      {color}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {inventoryData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
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
                        <p className="mt-3 text-lg">Nog geen voorraad data</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  [...inventoryData].reverse().map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors duration-150"
                    >
                      {/* Order Number */}
                      <td className="px-6 py-5 whitespace-nowrap text-base font-bold text-zinc-900 dark:text-zinc-100">
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
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            item.status?.toLowerCase() === "pending"
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
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          Motor {item.motorType}
                        </span>
                      </td>
                      {/* Amount of Motors */}
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full font-semibold text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          {item.orderQuantity}
                        </span>
                      </td>
                      {/* Block Counts */}
                      {legoColors.map((color) => (
                        <td key={color} className="px-6 py-5 text-center">
                          <span
                            className={`inline-flex items-center justify-center h-10 w-10 rounded-full font-semibold text-base ${
                              color === "Blauw"
                                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                                : color === "Rood"
                                ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                                : color === "Grijs"
                                ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                : ""
                            }`}
                          >
                            {item.expectedBlocks[color]}
                          </span>
                        </td>
                      ))}
                      {/* Production Line */}
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          {item.productionLine}
                        </span>
                      </td>
                      {/* Order Details Link */}
                      <td className="px-6 py-5 text-center">
                        {item.originalOrder ? (
                          <Link
                            href={`/dashboard/orders/${item.originalOrder.id}?returnTo=voorraadBeheer`}
                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View
                          </Link>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600">
                            -
                          </span>
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
    </div>
  );
}
