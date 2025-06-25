"use client";

import { useState } from 'react';
import { api } from '@CASUSGROEP1/utils/api';
import StatusBadge from '@CASUSGROEP1/components/StatusBadge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function OrderStatusManager({ order, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false);

  const handleApprove = async () => {
    try {
      setUpdating(true);
      await api.patch(`/api/Order/${order.id}/approve`);
      onStatusUpdate && onStatusUpdate(order.id, 'ApprovedByAccountManager');
    } catch (error) {
      console.error('Failed to approve order:', error);
      alert('Failed to approve order. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    try {
      setUpdating(true);
      await api.patch(`/api/Order/${order.id}/reject`);
      onStatusUpdate && onStatusUpdate(order.id, 'RejectedByAccountManager');
    } catch (error) {
      console.error('Failed to reject order:', error);
      alert('Failed to reject order. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await api.patch(`/api/Order/${order.id}/status`, { status: newStatus });
      onStatusUpdate && onStatusUpdate(order.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const canApproveReject = order.status === 'AwaitingAccountManagerApproval';

  return (
    <div className="flex items-center gap-2">
      <StatusBadge status={order.status || 'Pending'} />
      
      {canApproveReject && (
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={updating}
            className="inline-flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </button>
          <button
            onClick={handleReject}
            disabled={updating}
            className="inline-flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </button>
        </div>
      )}

      {!canApproveReject && (
        <select
          value={order.status || 'Pending'}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating}
          className="text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="Pending">Pending</option>
          <option value="ToProduction">To Production</option>
          <option value="InProduction">In Production</option>
          <option value="AwaitingAccountManagerApproval">Awaiting Approval</option>
          <option value="ApprovedByAccountManager">Approved</option>
          <option value="RejectedByAccountManager">Rejected</option>
          <option value="Delivered">Delivered</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      )}

      {updating && (
        <Clock className="h-4 w-4 animate-spin text-blue-500" />
      )}
    </div>
  );
}
