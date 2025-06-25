# Order Status Workflow Test

## COMPLETED: ToProduction Status Implementation

### TASK DESCRIPTION: 
Fix the order workflow so that when orders are assigned to production lines, they get status "ToProduction" instead of "Pending" (which triggers voorraadBeheer approval again), and when production starts, the status becomes "InProduction". The goal is to prevent orders from returning to voorraadBeheer after being assigned to production lines.

### COMPLETED TASKS:
1. **Added new OrderStatus enum value**: Added "ToProduction" status to the backend enum in OrderStatus.cs
2. **Updated MissingBlocksController**: Modified the missing blocks resolution logic to set status to "ToProduction" instead of "ApprovedByVoorraadbeheer" when blocks are delivered
3. **Updated Planning Page**: Modified updateProductionLine function to set status to "ToProduction" when assigning orders to production lines
4. **Updated Production Lines**: 
   - Added "ToProduction" to relevant statuses filter in both production line 1 and 2 pages
   - Added "ToProduction" status color mapping (blue) in both production line pages
   - Updated status color functions to distinguish between "ToProduction" (blue) and "InProduction" (green)
   - Updated conditional rendering to allow both "ApprovedByVoorraadbeheer" and "ToProduction" orders to start production
5. **Updated backend start-production endpoint**: Modified OrderController to accept both "ApprovedByVoorraadbeheer" and "ToProduction" status orders for starting production
6. **Updated StatusBadge component**: Added "ToProduction" status with blue styling to distinguish from "InProduction" (green)
7. **Updated OrderStatusManager component**: Added "ToProduction" option to the status dropdown
8. **Verified voorraadBeheer filtering**: Confirmed that voorraadBeheer only shows "Pending" orders, so "ToProduction" orders won't appear there

### FINAL WORKFLOW:
✅ New Order → Status: "Pending" → Appears in voorraadBeheer
✅ VoorraadBeheer Approval → Status: "ApprovedByVoorraadbeheer" → Goes to supplier & planning
✅ Planning Assignment → Status: "ToProduction" → Assigned to production line
✅ Production Start → Status: "InProduction" → Production begins
✅ Missing Blocks Resolution → Status: "ToProduction" → Returns prioritized to production line (not voorraadBeheer)
✅ Production Complete → Status: "AwaitingAccountManagerApproval" → Normal flow continues

### FILES CHANGED:
- `/Users/maikelh/Developer/Casusgroep-1/backend/ERPNumber1/ERPNumber1/Models/OrderStatus.cs` - Added "ToProduction" enum value
- `/Users/maikelh/Developer/Casusgroep-1/backend/ERPNumber1/ERPNumber1/Controllers/MissingBlocksController.cs` - Modified to set "ToProduction" status
- `/Users/maikelh/Developer/Casusgroep-1/frontend/src/app/dashboard/plannings/page.js` - Updated assignment logic to use "ToProduction"
- `/Users/maikelh/Developer/Casusgroep-1/frontend/src/app/dashboard/production-lines/1/page.js` - Added support for "ToProduction" status
- `/Users/maikelh/Developer/Casusgroep-1/frontend/src/app/dashboard/production-lines/2/page.js` - Added support for "ToProduction" status  
- `/Users/maikelh/Developer/Casusgroep-1/backend/ERPNumber1/ERPNumber1/Controllers/OrderController.cs` - Updated start-production endpoint
- `/Users/maikelh/Developer/Casusgroep-1/frontend/src/components/StatusBadge.js` - Added "ToProduction" styling
- `/Users/maikelh/Developer/Casusgroep-1/frontend/src/components/OrderStatusManager.js` - Added "ToProduction" option

---

## Fixed Issue: Orders returning to voorraadBeheer after supplier delivery

### Problem:
When a user accepts an order on the voorraadBeheer page and then goes to the supplier page to click the "delivered" button, the order was coming back into voorraadBeheer instead of properly progressing through the workflow.

### Root Cause:
In `/frontend/src/app/dashboard/supplier/page.js` line 142, when marking an order as delivered, the status was being set to `'Pending'` instead of keeping it as `'ApprovedByVoorraadbeheer'` (ready for production).

```javascript
// BEFORE (INCORRECT):
status: 'Pending',  // Set to Pending when delivered

// AFTER (FIXED):
status: 'ApprovedByVoorraadbeheer',  // Set to ApprovedByVoorraadbeheer when delivered by supplier (ready for production)
```

### Correct Workflow:
1. **New Order** → Status: `Pending` → **Appears in voorraadBeheer**
2. **VoorraadBeheer Approval** → Status: `ApprovedByVoorraadbeheer` → **Goes to supplier**
3. **Supplier Delivery** → Status: `ApprovedByVoorraadbeheer` (remains) → **Ready for production lines** ✅
4. **Production Starts** → Status: `InProduction` → **Production lines working on it**
5. **Production Complete** → Status: `Completed` → **Final state**

### Files Changed:
- `/Users/maikelh/Developer/Casusgroep-1/frontend/src/app/dashboard/supplier/page.js`
  - Line 142: Changed `status: 'Pending'` to `status: 'ApprovedByVoorraadbeheer'`
  - Line 147: Updated console log message

### Testing Steps:
1. Create a new order (status should be `Pending`)
2. Go to voorraadBeheer and approve the order (status should become `ApprovedByVoorraadbeheer`)
3. Go to supplier page and mark as delivered (status should remain `ApprovedByVoorraadbeheer`)
4. Verify order does NOT reappear in voorraadBeheer
5. Verify order appears in production lines as "ready for production"
6. When production lines start working on it, status becomes `InProduction`

### Status Filter Logic:
- **voorraadBeheer**: Shows orders with status `Pending` (line 54 in voorraadBeheer/page.js)
- **Production Lines**: Show orders with status `ApprovedByVoorraadbeheer` (ready for production), `Pending`, `InProduction` (actively being worked on) etc.

---

## Fixed Issue: Production Line Counts Not Updating When Orders Complete

### Problem:
When orders were assigned to production lines (Line 1 or Line 2) in the planning dashboard, the count would increase correctly. However, when production lines finished the products and marked them as completed, the count in the planning dashboard never went down. This meant planners couldn't see how many items were actually still actively on production lines.

### Root Cause:
In `/frontend/src/app/dashboard/plannings/page.js` lines 299 and 307, the counting logic was including ALL orders assigned to production lines, regardless of their status. This included orders that had left the production lines for account manager review, delivery, or completion.

```javascript
// BEFORE (INCORRECT):
{filteredOrders.filter((o) => o.productielijn === "1").length}
{filteredOrders.filter((o) => o.productielijn === "2").length}

// AFTER (FIXED):
{filteredOrders.filter((o) => o.productielijn === "1" && !["AwaitingAccountManagerApproval", "ApprovedByAccountManager", "RejectedByAccountManager", "Delivered", "Completed"].includes(o.status)).length}
{filteredOrders.filter((o) => o.productielijn === "2" && !["AwaitingAccountManagerApproval", "ApprovedByAccountManager", "RejectedByAccountManager", "Delivered", "Completed"].includes(o.status)).length}
```

### Correct Behavior:
- **Planning Dashboard** now only counts orders that are actively being worked on by production lines
- **Orders that have moved to account manager review, delivery, or completion** are excluded from production line counts
- **This accurately reflects what's actually happening on the production lines**

### Files Changed:
- `/Users/maikelh/Developer/Casusgroep-1/frontend/src/app/dashboard/plannings/page.js`
  - Line 299: Added `&& !["AwaitingAccountManagerApproval", "ApprovedByAccountManager", "RejectedByAccountManager", "Delivered", "Completed"].includes(o.status)` to Production Line 1 count
  - Line 307: Added `&& !["AwaitingAccountManagerApproval", "ApprovedByAccountManager", "RejectedByAccountManager", "Delivered", "Completed"].includes(o.status)` to Production Line 2 count
  - Status column: Replaced editable dropdown with read-only StatusBadge component
  - Assignment buttons: Added disabled state for orders with "InProduction", "AwaitingAccountManagerApproval", "ApprovedByAccountManager", "Delivered", or "Completed" status
  - Removed updateOrderStatus function (no longer needed since status is read-only)

### Testing Steps:
1. Create and assign orders to production lines (counts should increase)
2. Start production on those orders (counts should remain the same)
3. Complete the orders by sending for review → account manager approval → delivery → completion
4. Verify counts go down as orders progress to `Delivered` and `Completed` statuses
5. Verify completed orders no longer appear in production line counts but assignment buttons still work for re-planning

---

## Latest Update: Planning Table Status and Assignment Controls

### Changes Made:
1. **Status Column**: Changed from editable dropdown to read-only display using StatusBadge component
2. **Assignment Restrictions**: Disabled production line assignment buttons when order status is:
   - "InProduction" 
   - "ApprovedByAccountManager"
   - "AwaitingAccountManagerApproval"
   - "Delivered"
   - "Completed"

### Reasoning:
- **Read-only Status**: Prevents accidental status changes from the planning dashboard - status should be managed by the production lines and workflow processes
- **Assignment Restrictions**: Orders that are actively in production, awaiting account manager approval, approved by account manager, delivered, or completed should not be reassigned to different production lines to maintain workflow integrity

### Testing Steps:
1. Create orders and assign them to production lines
2. Change status to "InProduction", "AwaitingAccountManagerApproval", "ApprovedByAccountManager", "Delivered", or "Completed" 
3. Verify assignment buttons (Line 1, Line 2, Unassign) are disabled with helpful tooltips
4. Verify status is displayed as a badge (not editable dropdown)
5. Verify other statuses still allow assignment changes

---

## Final Update: Table Improvements and Sorting

### Changes Made:
1. **Added Status Columns**: Added status column to both Unassigned Orders and Assigned Orders tables
2. **Column Reordering**: Moved production line assignment actions before status columns for better workflow
3. **Assigned Orders Sorting**: Implemented high-to-low order ID sorting for the Assigned Orders table

### Technical Implementation:
- Added status column headers to both table structures
- Reordered table cells to match new column layout
- Added `.sort((a, b) => b.id - a.id)` to assigned orders filtering chain for descending order ID sort

### Testing Steps:
1. Verify both tables now show status information in dedicated columns
2. Verify production line actions appear before status columns
3. Verify Assigned Orders table displays orders with highest order IDs first
4. Verify all previous functionality (read-only status, disabled buttons) still works correctly

---

## Fixed Issue: Orders returning to voorraadBeheer after missing blocks delivery

### Problem:
When an order goes through the missing blocks workflow:
1. **Production Lines** → Report missing blocks → Order status: `ProductionError`
2. **Runner** → Can't deliver → Escalates to supplier → Order status: still `ProductionError` 
3. **Supplier** → Clicks delivered → Resolves missing blocks → Order status: wrongly set to `Pending`

The order would return to voorraadBeheer for approval again instead of going back to the production line to continue production.

### Root Cause:
In `/backend/ERPNumber1/ERPNumber1/Controllers/MissingBlocksController.cs` line 172, when a missing blocks request was resolved, the order status was being set back to `Pending` instead of the correct status for the workflow.

```csharp
// BEFORE (INCORRECT):
order.Status = OrderStatus.Pending;  // This sends it back to voorraadBeheer

// AFTER (FIXED):
order.Status = OrderStatus.ApprovedByVoorraadbeheer;  // This sends it back to production lines
```

### Correct Missing Blocks Workflow:
1. **Production Line** → Reports missing blocks → Order status: `ProductionError`
2. **Runner** → Can't deliver → Escalates to supplier → Order status: still `ProductionError`
3. **Supplier** → Clicks delivered → Resolves missing blocks → Order status: `ApprovedByVoorraadbeheer` ✅
4. **Production Line** → Receives order back (prioritized) → Can continue production
5. **Production Complete** → Status: `AwaitingAccountManagerApproval` → Normal flow continues

### Files Changed:
- `/Users/maikelh/Developer/Casusgroep-1/backend/ERPNumber1/ERPNumber1/Controllers/MissingBlocksController.cs`
  - Line 169: Updated comment to clarify the correct behavior
  - Line 172: Changed `OrderStatus.Pending` to `OrderStatus.ApprovedByVoorraadbeheer`
  - Line 172: Updated comment to explain why this status is chosen

### Testing Steps:
1. Assign an order to a production line
2. Start production on that order (status becomes `InProduction`)
3. Report missing blocks from the production line (status becomes `ProductionError`)
4. Go to runner dashboard - order should appear as missing blocks request
5. Runner escalates to supplier (marks as "Can't Deliver")
6. Go to supplier dashboard - missing blocks request should appear
7. Supplier clicks "Delivered" to resolve missing blocks
8. **VERIFY**: Order should NOT reappear in voorraadBeheer
9. **VERIFY**: Order should appear back in production lines with status `ApprovedByVoorraadbeheer` and prioritized
10. Production line can continue working on the order

### Status Filter Logic for Missing Blocks:
- **VoorraadBeheer**: Shows orders with status `Pending` (should NOT include missing blocks resolved orders)
- **Production Lines**: Show orders with status `ApprovedByVoorraadbeheer`, `Pending`, `InProduction` (includes missing blocks resolved orders)
- **Runner**: Shows missing blocks requests where `RunnerAttempted = false`
- **Supplier**: Shows missing blocks requests where `RunnerAttempted = true`
