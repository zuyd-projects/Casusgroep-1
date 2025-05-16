import Link from 'next/link';
import Card from '@CASUSGROEP1/components/Card';
import StatusBadge from '@CASUSGROEP1/components/StatusBadge';
import { orders, dashboardStats } from '@CASUSGROEP1/utils/mockData';

export default function Dashboard() {
  // Get just the 5 most recent orders
  const recentOrders = orders.slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Overview of your order management system</p>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Orders</div>
          <div className="text-3xl font-bold mt-1">{dashboardStats.totalOrders}</div>
          <div className="text-sm text-green-600 dark:text-green-400 mt-1">+12% from last month</div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Pending Orders</div>
          <div className="text-3xl font-bold mt-1">{dashboardStats.pendingOrders}</div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Requires attention</div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Revenue</div>
          <div className="text-3xl font-bold mt-1">${dashboardStats.totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-green-600 dark:text-green-400 mt-1">+8% from last month</div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Customers</div>
          <div className="text-3xl font-bold mt-1">78</div>
          <div className="text-sm text-green-600 dark:text-green-400 mt-1">+5 new this week</div>
        </Card>
      </div>
      
      {/* Monthly sales chart */}
      <Card title="Monthly Sales">
        <div className="h-64 flex items-end justify-between space-x-2 px-6">
          {dashboardStats.monthlySales.map((item) => {
            const height = (item.sales / 3200) * 100;
            return (
              <div key={item.month} className="flex flex-col items-center">
                <div 
                  className="w-12 bg-blue-500 rounded-t" 
                  style={{ height: `${height}%` }}
                ></div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{item.month}</div>
              </div>
            );
          })}
        </div>
      </Card>
      
      {/* Recent orders */}
      <Card title="Recent Orders">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">Order ID</th>
                <th scope="col" className="px-6 py-3 text-left">Customer</th>
                <th scope="col" className="px-6 py-3 text-left">Date</th>
                <th scope="col" className="px-6 py-3 text-left">Amount</th>
                <th scope="col" className="px-6 py-3 text-left">Status</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-6 py-4 whitespace-nowrap">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${order.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link 
                      href={`/dashboard/orders/${order.id}`}
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <Link 
            href="/dashboard/orders"
            className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View all orders &rarr;
          </Link>
        </div>
      </Card>
    </div>
  );
}