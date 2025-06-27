"use client";

import React, { useState, useRef, useEffect } from 'react';
import Script from 'next/script';
import { CheckCircle, AlertCircle, Play, Clock, Package, Users, Settings } from 'lucide-react';
import { api } from '@CASUSGROEP1/utils/api';
import StatusBadge from '@CASUSGROEP1/components/StatusBadge';
import { useSimulation } from '@CASUSGROEP1/contexts/SimulationContext';
import { getMotorTypeColors } from '@CASUSGROEP1/utils/motorColors';

// Motor type to block requirements mapping (same as backend)
const MotorBlockRequirements = {
  'A': { Blauw: 3, Rood: 4, Grijs: 2 },
  'B': { Blauw: 2, Rood: 2, Grijs: 4 },
  'C': { Blauw: 3, Rood: 3, Grijs: 2 }
};

const ProductionLine1Dashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [orders, setOrders] = useState([]);
  const [approvedOrders, setApprovedOrders] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRemovedOrder, setLastRemovedOrder] = useState(null);
  const [restoredOrderId, setRestoredOrderId] = useState(null);
  const [updating, setUpdating] = useState(null); // Track which order is being updated
  const [showMissingBlocksForm, setShowMissingBlocksForm] = useState(false);
  const [missingBlocks, setMissingBlocks] = useState({
    blue: 0,
    red: 0,
    gray: 0
  });

  // Maintenance state
  const [maintenanceStatus, setMaintenanceStatus] = useState({
    isUnderMaintenance: false,
    maintenanceOrder: null
  });

  const modelViewerRef = useRef(null);

  const { currentRound, currentSimulation, isRunning } = useSimulation();

  // Check for maintenance in current round
  const checkMaintenanceStatus = async () => {
    if (!currentRound) return;

    try {
      const maintenanceOrders = await api.get(`/api/Maintenance/round/${currentRound.number}`);
      const line1Maintenance = maintenanceOrders.find(
        mo => mo.productionLine === 1 && mo.status !== 'Completed'
      );

      setMaintenanceStatus({
        isUnderMaintenance: !!line1Maintenance,
        maintenanceOrder: line1Maintenance || null
      });
    } catch (error) {
      console.error('Failed to check maintenance status:', error);
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    await fetchOrders();
    await checkMaintenanceStatus();
  };

  // Fetch orders assigned to Production Line 1
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch both orders and rounds data
      const [allOrders, apiRounds] = await Promise.all([
        api.get('/api/Order'),
        api.get('/api/Rounds')
      ]);

      // Store rounds data for lookup
      setRounds(apiRounds);        // Filter orders assigned to Production Line 1 and only show relevant statuses
      const productionLine1Orders = allOrders
        .filter(order => {
          const prodLine = order.productionLine ? order.productionLine.toString() : null;
          const isAssignedToLine1 = prodLine === '1';

          // Only show orders that are assigned to production line and ready for production
          const relevantStatuses = [
            'ApprovedByVoorraadbeheer', // Orders approved by voorraadBeheer and ready for production
            'ToProduction', // Orders assigned to production line and ready to start
            'Pending',  // Include pending orders (returned from missing blocks)
            'InProduction',
            'In Progress',
            'RejectedByAccountManager',
            'ApprovedByAccountManager'  // Include approved orders
          ];
          const hasRelevantStatus = relevantStatuses.includes(order.status) ||
            relevantStatuses.includes(order.productionStatus);

          return isAssignedToLine1 && hasRelevantStatus;
        })
        .sort((a, b) => {
          // Prioritize orders returned from missing blocks
          if (a.wasReturnedFromMissingBlocks && !b.wasReturnedFromMissingBlocks) return -1;
          if (!a.wasReturnedFromMissingBlocks && b.wasReturnedFromMissingBlocks) return 1;
          // Then FIFO by order ID
          return a.id - b.id;
        })
        .map(order => {
          // Find the round data for this order
          const roundData = apiRounds.find(round => round.id === order.roundId);

          return {
            id: order.id.toString(),
            productName: `Motor ${order.motorType} - Assembly Unit`,
            customer: order.appUserId ? `Customer ${order.appUserId}` : 'Unknown Customer',
            quantity: order.quantity,
            motorType: order.motorType,
            status: order.productionStatus || order.status || 'In Queue',
            orderDate: order.roundId || 1,
            roundNumber: roundData?.roundNumber || null,
            simulationId: roundData?.simulationId || null,
            currentStep: 0,
            originalOrder: order,
            wasReturnedFromMissingBlocks: order.wasReturnedFromMissingBlocks || false  // New field
          };
        });

      // Separate orders into regular orders and approved by account manager orders
      const regularOrders = productionLine1Orders.filter(order =>
        order.status !== 'ApprovedByAccountManager'
      );
      const approvedByAccountManagerOrders = productionLine1Orders.filter(order =>
        order.status === 'ApprovedByAccountManager'
      );

      setOrders(regularOrders);
      setApprovedOrders(approvedByAccountManagerOrders);

      // Preserve selected order by finding the updated version in either list
      if (selectedOrder) {
        const updatedSelectedOrder = productionLine1Orders.find(order => order.id === selectedOrder.id);
        if (updatedSelectedOrder) {
          setSelectedOrder(updatedSelectedOrder);
        } else {
          // Order might no longer be in the list (e.g., completed/removed), clear selection
          setSelectedOrder(null);
        }
      }

      console.log(`🏭 Production Line 1: Loaded ${regularOrders.length} regular orders and ${approvedByAccountManagerOrders.length} approved orders (${productionLine1Orders.length} total)`);
    } catch (error) {
      console.error('Failed to fetch Production Line 1 orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    checkMaintenanceStatus();
  }, []);

  // Refetch orders when round changes
  useEffect(() => {
    if (currentRound) {
      console.log(
        "🔄 Round changed, refetching orders for Production Line 1. Round:",
        currentRound.number
      );
      fetchOrders();
      checkMaintenanceStatus();
    }
  }, [currentRound?.number]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'ToProduction': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'InProduction':
      case 'In Progress': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'In Queue': return 'text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-900/20';
      case 'Completed': return 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/20';
      default: return 'text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-800';
    }
  };

  const handleStartAssembly = async () => {
    if (!selectedOrder) return;

    try {
      console.log(`🏭 Starting assembly for order ${selectedOrder.id}, current status: ${selectedOrder.status}`);

      // Update status in the API
      await api.patch(`/api/Order/${selectedOrder.id}/status`, {
        status: 'InProduction'
      }).catch(err => {
        console.warn('API status update not supported, updating locally:', err.message);
      });

      // Update local state - use consistent status name
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: 'InProduction' }
            : order
        )
      );
      setSelectedOrder((prev) =>
        prev ? { ...prev, status: 'InProduction' } : prev
      );

      console.log(`✅ Assembly started for order ${selectedOrder.id}, new status: InProduction`);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleSendForReview = async () => {
    if (!selectedOrder) return;

    try {
      // Update status to awaiting account manager approval using the new updateOrderStatus function
      await updateOrderStatus(selectedOrder.id, 'AwaitingAccountManagerApproval');
    } catch (error) {
      console.error('Error sending order for review:', error);
    }
  };

  const handleRestoreLastOrder = async () => {
    if (!lastRemovedOrder) return;

    try {
      // Get the current order to preserve other properties
      const currentOrder = lastRemovedOrder;

      // Update via API with all required fields, restoring to production line 1
      const updateData = {
        roundId: currentOrder.originalOrder.roundId || 1,
        deliveryId: currentOrder.originalOrder.deliveryId,
        appUserId: currentOrder.originalOrder.appUserId,
        motorType: currentOrder.originalOrder.motorType,
        quantity: currentOrder.originalOrder.quantity,
        signature: currentOrder.originalOrder.signature,
        productionLine: '1',
        status: currentOrder.originalOrder.status
      };

      await api.put(`/api/Order/${lastRemovedOrder.id}`, updateData);

      // Add to appropriate list based on status
      if (lastRemovedOrder.status === 'ApprovedByAccountManager') {
        setApprovedOrders((prevOrders) => [...prevOrders, { ...lastRemovedOrder, status: 'ApprovedByAccountManager' }]);
      } else {
        setOrders((prevOrders) => [...prevOrders, { ...lastRemovedOrder, status: 'In Queue' }]);
      }

      setRestoredOrderId(lastRemovedOrder.id);
      setLastRemovedOrder(null);
      console.log(`✅ Order ${lastRemovedOrder.id} restored to production line 1`);
    } catch (error) {
      console.error('❌ Error restoring order:', error);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      // Get the current order to preserve other properties - search in both lists
      const currentOrder = orders.find(order => order.id === orderId) ||
        approvedOrders.find(order => order.id === orderId);
      if (!currentOrder) {
        console.error(`❌ Order ${orderId} not found`);
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
        productionLine: currentOrder.originalOrder.productionLine
          ? currentOrder.originalOrder.productionLine.toString().charAt(0)
          : null,
        status: newStatus,
        wasReturnedFromMissingBlocks: newStatus === 'InProduction' ? false : currentOrder.originalOrder.wasReturnedFromMissingBlocks
      };

      await api.put(`/api/Order/${orderId}`, updateData);

      // Update local state
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      setApprovedOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Update selected order if it's the one being changed
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }

      console.log(`✅ Status updated for order ${orderId} to ${newStatus}`);
    } catch (error) {
      console.error('❌ Failed to update status:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleReportMissingBlocks = () => {
    if (!selectedOrder) return;
    
    // Use functional state updates to ensure proper batching
    setMissingBlocks(() => ({ blue: 0, red: 0, gray: 0 }));
    setShowMissingBlocksForm(prev => !prev); // Toggle instead of just setting to true
  };

  const handleSubmitMissingBlocks = async () => {
    if (!selectedOrder) return;

    // Check if at least one block is missing
    const totalMissing = missingBlocks.blue + missingBlocks.red + missingBlocks.gray;
    if (totalMissing === 0) {
      alert('Please specify at least one missing block.');
      return;
    }

    try {
      // Create missing blocks request via API
      const missingBlocksData = {
        orderId: selectedOrder.id,
        productionLine: '1',
        motorType: selectedOrder.motorType,
        quantity: selectedOrder.quantity,
        blueBlocks: missingBlocks.blue,
        redBlocks: missingBlocks.red,
        grayBlocks: missingBlocks.gray
      };

      // Send to API (this will also update the order status to ProductionError automatically)
      await api.post('/api/MissingBlocks', missingBlocksData);

      // Refresh orders to get updated status
      fetchOrders();

    } catch (error) {
      console.error('Error reporting missing blocks:', error);
    }
  };

  // Helper functions for missing blocks form
  const incrementMissingBlocks = (color) => {
    setMissingBlocks(prev => ({
      ...prev,
      [color]: prev[color] + 1
    }));
  };

  const decrementMissingBlocks = (color) => {
    setMissingBlocks(prev => ({
      ...prev,
      [color]: Math.max(0, prev[color] - 1)
    }));
  };

  const cancelMissingBlocksReport = () => {
    setMissingBlocks({ blue: 0, red: 0, gray: 0 });
    setShowMissingBlocksForm(false);
  };

  const render3DModel = (motorType) => {
    const modelSrc = motorType === 'A' ? '/models/Ontwerp-A.glb' :
      motorType === 'B' ? '/models/Ontwerp-B.glb' :
        '/models/Ontwerp-C.glb';

    return (
      <div className="w-full h-80 rounded-lg border-2 border-zinc-300 dark:border-zinc-600 overflow-hidden relative flex items-center justify-center bg-white dark:bg-zinc-800">
        <model-viewer
          ref={modelViewerRef}
          className="model-viewer"
          style={{ width: "100%", height: "100%", background: "transparent" }}
          alt={`Motor ${motorType} Assembly`}
          src={modelSrc}
          camera-controls
          interaction-prompt="none"
          auto-rotate
          auto-rotate-delay="200"
          rotation-per-second="30deg"
          shadow-intensity="1"
          exposure="0.7"
          camera-orbit="0rad 1.57rad 2.5m"
          onLoad={() => setIsModelLoaded(true)}
        ></model-viewer>
      </div>
    );
  };

  const renderOrderDetails = (order) => {
    // Calculate block requirements based on motor type and quantity
    const blockRequirements = MotorBlockRequirements[order.motorType]
      ? {
        Blauw: MotorBlockRequirements[order.motorType].Blauw * order.quantity,
        Rood: MotorBlockRequirements[order.motorType].Rood * order.quantity,
        Grijs: MotorBlockRequirements[order.motorType].Grijs * order.quantity
      }
      : { Blauw: 0, Rood: 0, Grijs: 0 };

    return (
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-50 dark:bg-zinc-900/20 p-3 rounded-lg">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-400">Customer</label>
          <p className="text-zinc-900 dark:text-white font-medium">{order.customer}</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900/20 p-3 rounded-lg">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-400">Quantity</label>
          <p className="text-zinc-900 dark:text-white font-medium">{order.quantity}</p>
        </div>
        <div className={`p-3 rounded-lg ${getMotorTypeColors(order.motorType).bg}`}>
          <label className={`text-sm font-medium ${getMotorTypeColors(order.motorType).text}`}>Motor Type</label>
          <p className={`font-medium ${getMotorTypeColors(order.motorType).text}`}>{order.motorType}</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900/20 p-3 rounded-lg">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-400">Simulation</label>
          {order.simulationId ? (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md">
              Sim {order.simulationId}
            </span>
          ) : (
            <span className="text-zinc-400">No Simulation</span>
          )}
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900/20 p-3 rounded-lg col-span-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-400">Round</label>
          <div className="mt-1">
            {order.roundNumber ? (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-md">
                Round {order.roundNumber}
              </span>
            ) : (
              <span className="text-zinc-400">No Round</span>
            )}
          </div>
        </div>

        {/* Block Requirements Section */}
        <div className="col-span-2 bg-gradient-to-r from-blue-50 to-red-50 dark:from-blue-900/20 dark:to-red-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-400 mb-3 block">Required Building Blocks</label>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
              <div className="text-blue-700 dark:text-blue-300 font-bold text-2xl">{blockRequirements.Blauw}</div>
              <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">Blue Blocks</div>
            </div>
            <div className="text-center bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">
              <div className="text-red-700 dark:text-red-300 font-bold text-2xl">{blockRequirements.Rood}</div>
              <div className="text-red-600 dark:text-red-400 text-sm font-medium">Red Blocks</div>
            </div>
            <div className="text-center bg-zinc-200 dark:bg-zinc-700 p-3 rounded-lg">
              <div className="text-zinc-700 dark:text-zinc-300 font-bold text-2xl">{blockRequirements.Grijs}</div>
              <div className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Gray Blocks</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 text-center">
            Total blocks needed: {blockRequirements.Blauw + blockRequirements.Rood + blockRequirements.Grijs}
          </div>
        </div>
      </div>
    );
  };

  // Missing Blocks Form Component
  const renderMissingBlocksForm = () => {
    if (!showMissingBlocksForm) return null;

    return (
      <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
        <h4 className="text-sm font-bold text-orange-900 dark:text-orange-100 mb-3">
          Report Missing Building Blocks for Order #{selectedOrder?.id}
        </h4>

        <div className="space-y-3">
          {/* Blue Blocks */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Blue Blocks Missing</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => decrementMissingBlocks('blue')}
                className="w-8 h-8 flex items-center justify-center bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-300 dark:hover:bg-blue-700 transition-colors"
                disabled={missingBlocks.blue === 0}
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-blue-900 dark:text-blue-100">{missingBlocks.blue}</span>
              <button
                onClick={() => incrementMissingBlocks('blue')}
                className="w-8 h-8 flex items-center justify-center bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-300 dark:hover:bg-blue-700 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Red Blocks */}
          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm font-medium text-red-900 dark:text-red-100">Red Blocks Missing</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => decrementMissingBlocks('red')}
                className="w-8 h-8 flex items-center justify-center bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full hover:bg-red-300 dark:hover:bg-red-700 transition-colors"
                disabled={missingBlocks.red === 0}
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-red-900 dark:text-red-100">{missingBlocks.red}</span>
              <button
                onClick={() => incrementMissingBlocks('red')}
                className="w-8 h-8 flex items-center justify-center bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full hover:bg-red-300 dark:hover:bg-red-700 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Gray Blocks */}
          <div className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-zinc-500 rounded"></div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Gray Blocks Missing</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => decrementMissingBlocks('gray')}
                className="w-8 h-8 flex items-center justify-center bg-zinc-200 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors"
                disabled={missingBlocks.gray === 0}
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-zinc-900 dark:text-zinc-100">{missingBlocks.gray}</span>
              <button
                onClick={() => incrementMissingBlocks('gray')}
                className="w-8 h-8 flex items-center justify-center bg-zinc-200 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-4">
          <button
            onClick={cancelMissingBlocksReport}
            className="flex-1 px-4 py-2 border border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitMissingBlocks}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            Report Missing Blocks
          </button>
        </div>
      </div>
    );
  };

  // Handle starting production for orders approved by VoorraadBeheer
  const handleStartProduction = async (orderId) => {
    try {
      setUpdating(orderId);

      // Call the new API endpoint to start production
      await api.post(`/api/Order/${orderId}/start-production`);

      // Update local state to reflect the status change
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: 'InProduction' } : order
        )
      );

      setApprovedOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: 'InProduction' } : order
        )
      );

      // Update selected order if it's the one being changed
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: 'InProduction' }));
      }

      console.log(`✅ Production started for order ${orderId}`);
    } catch (error) {
      console.error('❌ Failed to start production:', error);
      alert('Failed to start production. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      <Script
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
        type="module"
        strategy="afterInteractive"
      />
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-6">
          {/* Maintenance Warning Banner */}
          {maintenanceStatus.isUnderMaintenance && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <Settings className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900 dark:text-red-100">
                    Production Line 1 Under Maintenance
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {maintenanceStatus.maintenanceOrder?.description || 'Scheduled maintenance in progress'}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Status: {maintenanceStatus.maintenanceOrder?.status} |
                    Round {maintenanceStatus.maintenanceOrder?.roundNumber}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Production Line 1</h2>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">Orders assigned to Production Line 1</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-4 py-2 rounded-lg bg-zinc-600 text-white text-base font-semibold dark:bg-zinc-700">
                  <Users className="w-4 h-4 mr-2" />
                  Total: {orders.length + approvedOrders.length}
                </span>
              </div>
              {approvedOrders.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-green-600 text-white text-sm font-medium dark:bg-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approved: {approvedOrders.length}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Live Updates</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6" style={{ height: 'calc(100vh - 200px)' }}>
            {/* Orders Overview */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-400">Assigned Orders</h3>
                {/* Refresh button */}
                <button
                  onClick={handleManualRefresh}
                  disabled={loading}
                  className="px-3 py-2 bg-zinc-600 hover:bg-zinc-700 disabled:bg-zinc-400 text-white rounded-lg font-medium transition-colors border border-zinc-600 hover:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title="Refresh production line data"
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

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p>No orders assigned to Production Line 1</p>
                  <p className="text-sm text-zinc-400">Orders will appear here when assigned by the planner</p>
                </div>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {orders
                    .map((order) => (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedOrder?.id === order.id
                            ? 'border-zinc-500 bg-zinc-50 dark:bg-zinc-900/20 dark:border-zinc-400'
                            : order.wasReturnedFromMissingBlocks
                              ? 'bg-orange-50 border-orange-300 dark:bg-orange-900/20 dark:border-orange-400 border-2 shadow-md'
                              : restoredOrderId === order.id
                                ? 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-400'
                                : 'border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-400'
                          }`}
                        onMouseEnter={() => {
                          if (restoredOrderId === order.id) setRestoredOrderId(null);
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-zinc-900 dark:text-white">Order #{order.id}</h4>
                              {order.wasReturnedFromMissingBlocks && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 border border-orange-300 dark:border-orange-700">
                                  🚨 PRIORITY - Returned
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{order.productName}</p>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <div className="flex space-x-2">
                              {order.simulationId && (
                                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  Sim {order.simulationId}
                                </span>
                              )}
                              {order.roundNumber && (
                                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                  Round {order.roundNumber}
                                </span>
                              )}
                            </div>
                            <StatusBadge status={order.status} />
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
                          <span>Qty: {order.quantity}</span>
                          <span>Motor: {order.motorType}</span>
                        </div>
                        <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                          <span>{order.customer}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* 3D Model and Order Details */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 flex flex-col">
              {selectedOrder ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{selectedOrder.productName}</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">Order #{selectedOrder.id}</p>
                  </div>

                  {/* 3D Product Viewer */}
                  <div className="mb-6 relative">
                    {render3DModel(selectedOrder.motorType)}
                  </div>

                  {/* Conditional rendering based on status */}
                  {(selectedOrder.status === 'ApprovedByVoorraadbeheer' || selectedOrder.status === 'ToProduction') && (
                    <>
                      {renderOrderDetails(selectedOrder)}

                      {maintenanceStatus.isUnderMaintenance ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                          <Settings className="h-8 w-8 mx-auto text-red-600 dark:text-red-400 mb-2" />
                          <p className="text-red-900 dark:text-red-100 font-medium">Production line under maintenance</p>
                          <p className="text-sm text-red-700 dark:text-red-300">Cannot start production during maintenance</p>
                        </div>
                      ) : (
                        <div className="flex space-x-3">
                          <button
                            className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                            onClick={() => handleStartProduction(selectedOrder.id)}
                            disabled={updating === selectedOrder.id}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {updating === selectedOrder.id ? 'Starting...' : 'Start Production'}
                          </button>
                        </div>
                      )}
                      <div className="mt-3">
                        <button
                          className="w-full flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                          onClick={handleReportMissingBlocks}
                          disabled={maintenanceStatus.isUnderMaintenance}
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Report Missing Building Blocks
                        </button>
                      </div>
                      {renderMissingBlocksForm()}
                    </>
                  )}

                  {selectedOrder.status === 'ApprovedByAccountManager' && (
                    <>
                      {renderOrderDetails(selectedOrder)}

                      {maintenanceStatus.isUnderMaintenance ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                          <Settings className="h-8 w-8 mx-auto text-red-600 dark:text-red-400 mb-2" />
                          <p className="text-red-900 dark:text-red-100 font-medium">Production line under maintenance</p>
                          <p className="text-sm text-red-700 dark:text-red-300">Cannot start production during maintenance</p>
                        </div>
                      ) : (
                        <div className="flex space-x-3">
                          <button
                            className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors"
                            onClick={() => handleStartProduction(selectedOrder.id)}
                            disabled={updating === selectedOrder.id}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {updating === selectedOrder.id ? 'Starting...' : 'Start Production'}
                          </button>
                        </div>
                      )}
                      <div className="mt-3">
                        <button
                          className="w-full flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                          onClick={handleReportMissingBlocks}
                          disabled={maintenanceStatus.isUnderMaintenance}
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Report Missing Building Blocks
                        </button>
                      </div>
                      {renderMissingBlocksForm()}
                    </>
                  )}

                  {(selectedOrder.status === 'In Queue' || selectedOrder.status === 'Pending') && (
                    <>
                      {renderOrderDetails(selectedOrder)}

                      {maintenanceStatus.isUnderMaintenance ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                          <Settings className="h-8 w-8 mx-auto text-red-600 dark:text-red-400 mb-2" />
                          <p className="text-red-900 dark:text-red-100 font-medium">Production line under maintenance</p>
                          <p className="text-sm text-red-700 dark:text-red-300">Cannot start assembly during maintenance</p>
                        </div>
                      ) : (
                        <div className="flex space-x-3">
                          <button
                            className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors"
                            onClick={handleStartAssembly}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Assembly
                          </button>
                        </div>
                      )}
                      <div className="mt-3">
                        <button
                          className="w-full flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                          onClick={handleReportMissingBlocks}
                          disabled={maintenanceStatus.isUnderMaintenance}
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Report Missing Building Blocks
                        </button>
                      </div>
                      {renderMissingBlocksForm()}
                    </>
                  )}

                  {(selectedOrder.status === 'In Production' || selectedOrder.status === 'InProduction') && (
                    <>
                      {renderOrderDetails(selectedOrder)}

                      {maintenanceStatus.isUnderMaintenance ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                          <Settings className="h-8 w-8 mx-auto text-red-600 dark:text-red-400 mb-2" />
                          <p className="text-red-900 dark:text-red-100 font-medium">Production line under maintenance</p>
                          <p className="text-sm text-red-700 dark:text-red-300">Production halted due to maintenance</p>
                        </div>
                      ) : (
                        <div className="flex space-x-3">
                          <button
                            className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                            onClick={handleSendForReview}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Send for Review
                          </button>
                        </div>
                      )}
                      <div className="mt-3">
                        <button
                          className="w-full flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                          onClick={handleReportMissingBlocks}
                          disabled={maintenanceStatus.isUnderMaintenance}
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Report Missing Building Blocks
                        </button>
                      </div>
                      {renderMissingBlocksForm()}
                    </>
                  )}

                  {selectedOrder.status === 'Completed' && (
                    <>
                      <div className="mb-6 text-center">
                        <CheckCircle className="w-10 h-10 mx-auto text-green-600 dark:text-green-400 mb-2" />
                        <p className="text-green-700 dark:text-green-400 font-semibold">Order Completed!</p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center flex-1 text-zinc-500 dark:text-zinc-400">
                  <div className="text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-zinc-400 dark:text-zinc-500" />
                    <p className="text-lg font-medium text-zinc-900 dark:text-white">Select an Order</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Choose an order from the list to view 3D model and details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Approved by Account Manager Orders Table */}
        {approvedOrders.length > 0 && (
          <div className={`bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 mb-6 ${showMissingBlocksForm ? 'mt-96' : 'mt-20'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-green-700 dark:text-green-400">Orders Approved by Account Manager</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                {approvedOrders.length} Order{approvedOrders.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {approvedOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 border rounded-lg border-green-200 dark:border-green-600 bg-green-50/50 dark:bg-green-900/10 opacity-75"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-zinc-900 dark:text-white">Order #{order.id}</h4>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border border-green-300 dark:border-green-700">
                          ✅ Approved by Account Manager
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{order.productName}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 font-medium">
                        Sim {order.simulationId}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 font-medium">
                        Round {order.roundNumber}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
                    <span>Qty: {order.quantity}</span>
                    <span>Motor: {order.motorType}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                    <span>{order.customer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Restore button for last removed order */}
        {lastRemovedOrder && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              className="px-4 py-2 bg-zinc-600 dark:bg-zinc-700 text-white rounded-lg shadow-lg hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors"
              onClick={handleRestoreLastOrder}
            >
              Restore Last Removed Order
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductionLine1Dashboard;
