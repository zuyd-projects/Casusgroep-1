// Mock data for orders
export const orders = [
  {
    id: '1001',
    customer: 'John Doe',
    email: 'john@example.com',
    date: '2025-05-15',
    amount: 128.50,
    status: 'delivered',
    items: [
      { id: 'p101', name: 'Product A', quantity: 2, price: 49.99 },
      { id: 'p102', name: 'Product B', quantity: 1, price: 28.52 },
    ],
    address: '123 Main St, Anytown, CA 94521',
    paymentMethod: 'Credit Card',
  },
  {
    id: '1002',
    customer: 'Jane Smith',
    email: 'jane@example.com',
    date: '2025-05-14',
    amount: 75.00,
    status: 'processing',
    items: [
      { id: 'p103', name: 'Product C', quantity: 3, price: 25.00 },
    ],
    address: '456 Oak Ave, Springfield, IL 62701',
    paymentMethod: 'PayPal',
  },
  {
    id: '1003',
    customer: 'Bob Johnson',
    email: 'bob@example.com',
    date: '2025-05-13',
    amount: 199.95,
    status: 'pending',
    items: [
      { id: 'p104', name: 'Product D', quantity: 1, price: 199.95 },
    ],
    address: '789 Pine Rd, Lakeville, MN 55044',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: '1004',
    customer: 'Alice Williams',
    email: 'alice@example.com',
    date: '2025-05-12',
    amount: 54.75,
    status: 'delivered',
    items: [
      { id: 'p105', name: 'Product E', quantity: 1, price: 34.75 },
      { id: 'p106', name: 'Product F', quantity: 1, price: 20.00 },
    ],
    address: '101 Elm St, Riverdale, NY 10471',
    paymentMethod: 'Credit Card',
  },
  {
    id: '1005',
    customer: 'Charlie Brown',
    email: 'charlie@example.com',
    date: '2025-05-10',
    amount: 320.00,
    status: 'cancelled',
    items: [
      { id: 'p107', name: 'Product G', quantity: 4, price: 80.00 },
    ],
    address: '202 Maple Ave, Portland, OR 97205',
    paymentMethod: 'Credit Card',
  },
];

// Order status options
export const orderStatuses = [
  { value: 'all', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'InProduction', label: 'In Production' },
  { value: 'AwaitingAccountManagerApproval', label: 'Awaiting Approval' },
  { value: 'ApprovedByAccountManager', label: 'Approved' },
  { value: 'RejectedByAccountManager', label: 'Rejected' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

// Some statistics for the dashboard
export const dashboardStats = {
  totalOrders: 145,
  pendingOrders: 17,
  totalRevenue: 18945.50,
  monthlySales: [
    { month: 'Jan', sales: 1500 },
    { month: 'Feb', sales: 1800 },
    { month: 'Mar', sales: 2200 },
    { month: 'Apr', sales: 2500 },
    { month: 'May', sales: 3100 },
  ]
};
