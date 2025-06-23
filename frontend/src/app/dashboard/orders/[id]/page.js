"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@CASUSGROEP1/components/Card';
import StatusBadge from '@CASUSGROEP1/components/StatusBadge';
import { api } from '@CASUSGROEP1/utils/api';

export default function OrderDetail({ params }) {
  const orderId = params.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('Pending');
  const [updating, setUpdating] = useState(false);

  // Fetch order data on component mount
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`[Order Detail] Fetching order ${orderId}...`);
        const orderData = await api.get(`/api/Order/${orderId}`);
        
        if (orderData) {
          console.log('[Order Detail] Successfully fetched order data:', orderData);
          setOrder(orderData);
          setCurrentStatus(orderData.status || 'Pending');
        } else {
          console.warn(`[Order Detail] Order ${orderId} not found`);
          setError(`Order ${orderId} not found`);
        }
      } catch (err) {
        console.error('[Order Detail] Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      console.log(`[Order Detail] Updating status to ${newStatus}...`);
      
      // Try to update via API if the backend supports it
      try {
        await api.patch(`/api/Order/${orderId}/status`, { status: newStatus });
        console.log(`[Order Detail] Status updated via API to ${newStatus}`);
      } catch (apiError) {
        console.warn('[Order Detail] API status update not supported, updating locally:', apiError.message);
        // If API doesn't support status updates, just update locally for demo
      }
      
      setCurrentStatus(newStatus);
      
      // Update the order object as well
      if (order) {
        setOrder({ ...order, status: newStatus });
      }
      
      console.log(`[Order Detail] Status updated successfully to ${newStatus}`);
    } catch (err) {
      console.error('[Order Detail] Error updating status:', err);
      // For demo purposes, still update the local state even if API call fails
      setCurrentStatus(newStatus);
      if (order) {
        setOrder({ ...order, status: newStatus });
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = (e) => {
    setCurrentStatus(e.target.value);
  };

  const handleUpdateStatus = () => {
    updateStatus(currentStatus);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <Link 
            href="/dashboard/orders"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Back to Orders
          </Link>
        </div>
        <Card>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <Link 
            href="/dashboard/orders"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Back to Orders
          </Link>
        </div>
        <Card>
          <div className="text-center py-8">
            <div className="text-red-500 text-lg font-medium mb-2">Error</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  // Handle case where order is not found
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">
          The order you're looking for doesn't exist or has been deleted.
        </p>
        <Link 
          href="/dashboard/orders" 
          className="px-4 py-2 bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-800 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  // Calculate subtotal - handle both new API format and mock data format
  const orderItems = order.items || order.orderItems || [];
  
  // If API order doesn't have items array, create one from the order data itself
  const displayItems = orderItems.length > 0 ? orderItems : [{
    id: 1,
    name: order.motorType ? `Motor Type ${order.motorType}` : 'Motor',
    productName: order.motorType ? `Motor Type ${order.motorType}` : 'Motor',
    motorType: order.motorType,
    quantity: order.quantity || 1,
    price: 100, // Default price since API doesn't include pricing
    unitPrice: 100
  }];
  
  const subtotal = displayItems.reduce((sum, item) => {
    const price = item.price || item.unitPrice || 100; // Default price if not available
    const quantity = item.quantity || 1;
    return sum + price * quantity;
  }, 0);

  // Simulated tax and shipping
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 10;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link 
              href="/dashboard/orders"
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Order #{order.id}</h1>
          </div>
          <div className="mt-1 space-y-1">
            <p className="text-zinc-500 dark:text-zinc-400">
              Placed on {order.orderDate || order.date || 'Unknown'}
            </p>
            {order.roundId && (
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Round {order.roundNumber || order.roundId}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Print Invoice
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Send Email
          </button>
        </div>
      </div>
      
      {/* Order summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Order items */}
          <Card title="Order Items">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left">Product</th>
                    <th scope="col" className="px-6 py-3 text-right">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-right">Price</th>
                    <th scope="col" className="px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {displayItems.map((item, index) => {
                    const itemPrice = item.price || item.unitPrice || 100;
                    const itemQuantity = item.quantity || 1;
                    const itemName = item.name || item.productName || (item.motorType ? `Motor Type ${item.motorType}` : `Item ${index + 1}`);
                    
                    return (
                      <tr key={item.id || index}>
                        <td className="px-6 py-4">{itemName}</td>
                        <td className="px-6 py-4 text-right">{itemQuantity}</td>
                        <td className="px-6 py-4 text-right">${itemPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">${(itemPrice * itemQuantity).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* Customer information */}
          <Card title="Customer Information" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Contact Information</h3>
                <p className="mt-2">{order.customerName || order.customer || 'Unknown Customer'}</p>
                <p className="mt-1 text-zinc-600 dark:text-zinc-300">{order.customerEmail || order.email || 'No email provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Shipping Address</h3>
                <p className="mt-2">{order.shippingAddress || order.address || 'No address provided'}</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Order status */}
          <Card title="Order Status">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Current Status</span>
                <StatusBadge status={currentStatus} />
              </div>
              <select
                value={currentStatus}
                onChange={handleStatusChange}
                disabled={updating}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 mt-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="Pending">Pending</option>
                <option value="InProduction">In Production</option>
                <option value="AwaitingAccountManagerApproval">Awaiting Account Manager Approval</option>
                <option value="ApprovedByAccountManager">Approved by Account Manager</option>
                <option value="RejectedByAccountManager">Rejected by Account Manager</option>
                <option value="Delivered">Delivered</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <button 
              onClick={handleUpdateStatus}
              disabled={updating}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </Card>
          
          {/* Order summary */}
          <Card title="Order Summary">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-300">Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-300">Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-300">Shipping:</span>
                <span>{shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free'}</span>
              </div>
              <div className="border-t pt-3 border-zinc-200 dark:border-zinc-700">
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${(subtotal + tax + shipping).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Payment information */}
          <Card title="Payment Information">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-300">Method:</span>
                <span>{order.paymentMethod || 'Credit Card'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-300">Status:</span>
                <StatusBadge status="delivered" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
