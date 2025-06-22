# Order Creation with Simulation Context - Example

## 🛍️ Complete Order Creation Flow

Here's a complete example of how to create orders using the simulation context in the ERP system:

### 1. Start a Simulation

```bash
# Start simulation via API
POST /api/Simulations/1/run

# Or use the frontend dashboard to click "Run" on any simulation
```

### 2. Frontend Order Creation

```javascript
// In your React component
import { useSimulation } from '@/contexts/SimulationContext';
import { api } from '@/utils/api';

function OrderForm() {
  const { currentRound, getCurrentRoundId, isRunning } = useSimulation();
  const [orderData, setOrderData] = useState({
    motorType: 'A',
    quantity: 10,
    signature: ''
  });

  const createOrder = async () => {
    // Validate active round
    const roundId = getCurrentRoundId();
    if (!roundId) {
      alert('No active round! Start a simulation first.');
      return;
    }

    // Prepare order payload
    const orderPayload = {
      roundId: roundId,                     // From simulation context
      deliveryId: null,                     // Optional
      appUserId: getCurrentUserId(),        // From auth context
      motorType: orderData.motorType,       // Selected motor type
      quantity: parseInt(orderData.quantity), // Order quantity
      signature: orderData.signature || `order-${Date.now()}`, // Auto-generate if empty
      orderDate: new Date().toISOString()   // Current timestamp
    };

    try {
      const newOrder = await api.createOrder(orderPayload);
      console.log('Order created:', newOrder);
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };
}
```

### 3. Order Display and Management

#### Order List Page

The `/dashboard/orders` page now:

- ✅ Fetches real orders from the API (`/api/Order`)
- ✅ Shows round information for each order
- ✅ Uses simulation context for new order creation
- ✅ Displays error message if API is unavailable

#### Order Detail Page

The `/dashboard/orders/[id]` page now:

- ✅ Fetches individual order data from API (`/api/Order/{id}`)
- ✅ Displays real order information including round details
- ✅ Handles API data format properly
- ✅ Shows status management (local-only since API doesn't support status field)
- ✅ Calculates pricing and totals with default values for API data

#### API Integration Points

- `GET /api/Order` - List all orders
- `GET /api/Order/{id}` - Get specific order details
- `POST /api/Order` - Create new order (with roundId)
- `PUT /api/Order/{id}/status` - Update order status (fallback to local state)

### 4. Business Logic Integration

```javascript
// Example: Validate order timing
const isValidOrderTime = () => {
  const roundId = getCurrentRoundId();
  const timeLeft = roundTimeLeft;
  
  return roundId !== null && timeLeft > 5; // Allow orders until 5 seconds left
};

// Example: Get orders for current round
const getCurrentRoundOrders = async () => {
  const roundId = getCurrentRoundId();
  if (!roundId) return [];
  
  const allOrders = await api.get('/api/Order');
  return allOrders.filter(order => order.roundId === roundId);
};

// Example: Calculate round summary
const getRoundSummary = async () => {
  const orders = await getCurrentRoundOrders();
  
  return {
    totalOrders: orders.length,
    totalQuantity: orders.reduce((sum, order) => sum + order.quantity, 0),
    motorTypes: {
      A: orders.filter(o => o.motorType === 'A').length,
      B: orders.filter(o => o.motorType === 'B').length,
      C: orders.filter(o => o.motorType === 'C').length,
    }
  };
};
```

### 5. Real-Time Updates

Orders created during a simulation are automatically:

- ✅ **Linked to current round** via `roundId`
- ✅ **Timestamped** with creation time
- ✅ **Validated** against active simulation state
- ✅ **Tracked** for business process analytics

### 6. Team Collaboration

Since simulations are company-wide:

- 👥 **All users** see the same active round
- 🎯 **All orders** are created for the same round simultaneously  
- 📊 **Real-time coordination** of order placement across teams
- 🔄 **Synchronized business processes** during training/testing

## 🎯 Key Benefits

1. **Process Timing**: Orders tied to specific simulation phases
2. **Data Integrity**: Clear relationship between orders and rounds
3. **Team Training**: Realistic collaborative order placement
4. **Analytics**: Round-based performance metrics
5. **Validation**: Prevents orders outside active simulations

## 🚫 Error Handling

```javascript
// Robust error handling
const createOrderSafely = async (orderData) => {
  try {
    // Check simulation state
    if (!isRunning) {
      throw new Error('No simulation running');
    }
    
    const roundId = getCurrentRoundId();
    if (!roundId) {
      throw new Error('No active round');
    }
    
    // Check time remaining
    if (roundTimeLeft <= 5) {
      throw new Error('Too close to round end - wait for next round');
    }
    
    // Create order
    const order = await api.post('/api/Order', {
      ...orderData,
      roundId,
      orderDate: new Date().toISOString()
    });
    
    return { success: true, order };
    
  } catch (error) {
    console.error('Order creation failed:', error.message);
    return { success: false, error: error.message };
  }
};
```

This integration provides a seamless experience for creating orders that are automatically linked to the current simulation round! 🚀
