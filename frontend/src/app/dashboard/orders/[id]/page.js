"use client";

import { useState } from 'react';
import Link from 'next/link';
import Card from '@CASUSGROEP1/components/Card';
import StatusBadge from '@CASUSGROEP1/components/StatusBadge';
import { orders } from '@CASUSGROEP1/utils/mockData';

export default function OrderDetail({ params }) {
  const orderId = params.id;
  const order = orders.find((o) => o.id === orderId);
  
  const [currentStatus, setCurrentStatus] = useState(order?.status || 'pending');
  
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

  // Calculate subtotal
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Simulated tax and shipping
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 10;
  
  const handleStatusChange = (e) => {
    setCurrentStatus(e.target.value);
    // In a real app, you would update the status in the database here
  };

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
          <p className="text-zinc-500 dark:text-zinc-400">Placed on {order.date}</p>
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
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">{item.name}</td>
                      <td className="px-6 py-4 text-right">{item.quantity}</td>
                      <td className="px-6 py-4 text-right">${item.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* Customer information */}
          <Card title="Customer Information" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Contact Information</h3>
                <p className="mt-2">{order.customer}</p>
                <p className="mt-1 text-zinc-600 dark:text-zinc-300">{order.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Shipping Address</h3>
                <p className="mt-2">{order.address}</p>
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
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 mt-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Update Status
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
                <span>{order.paymentMethod}</span>
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
