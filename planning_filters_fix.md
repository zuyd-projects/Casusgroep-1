# Planning Page Filter Fix

## Issue Description
The Planning page was showing ALL orders, including those that have not been approved by VoorraadBeheer yet. This meant that orders with "Pending" status would appear in Planning before VoorraadBeheer had a chance to approve them.

## Root Cause
In `/frontend/src/app/dashboard/plannings/page.js`, the `fetchOrders` function was processing all orders from the API without filtering by approval status.

## Solution
Added a filter to only show orders that have been approved by VoorraadBeheer or are in later stages of the workflow.

### Code Changes
**File**: `/frontend/src/app/dashboard/plannings/page.js`
**Lines**: 62-74

```javascript
// Filter orders to only show those approved by VoorraadBeheer
const approvedOrders = apiOrders.filter(order => 
  order.status === "ApprovedByVoorraadbeheer" || 
  order.status === "ToProduction" ||
  order.status === "InProduction" ||
  order.status === "AwaitingAccountManagerApproval" ||
  order.status === "ApprovedByAccountManager" ||
  order.status === "RejectedByAccountManager" ||
  order.status === "Delivered" ||
  order.status === "Completed" ||
  order.status === "ProductionError" ||
  order.status === "RejectedByVoorraadbeheer" // Keep rejected orders for reference
);
```

## Expected Workflow
1. **New Order** → Status: `"Pending"` → **Only appears in VoorraadBeheer**
2. **VoorraadBeheer Approval** → Status: `"ApprovedByVoorraadbeheer"` → **Now appears in Planning**
3. **Planning Assignment** → Status: `"ToProduction"` → **Assigned to production line**
4. **Production Start** → Status: `"InProduction"` → **Production begins**

## Verification
- Orders with `"Pending"` status should NOT appear in Planning
- Orders with `"ApprovedByVoorraadbeheer"` status should appear in Planning for assignment
- All other workflow statuses continue to work as expected

## Testing
✅ Frontend builds successfully
✅ Planning page now only shows approved orders
✅ VoorraadBeheer continues to show only pending orders for approval

## Date
December 26, 2025
