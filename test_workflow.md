# Order Status Workflow Test

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
