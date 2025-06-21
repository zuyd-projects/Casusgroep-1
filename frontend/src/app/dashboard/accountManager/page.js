import React from "react";

const orders = [
  { id: 1001, customer: "Jane Doe", status: "Pending", amount: 120 },
  { id: 1002, customer: "John Smith", status: "Completed", amount: 350 },
  { id: 1003, customer: "Alice Brown", status: "Pending", amount: 200 },
  { id: 1004, customer: "Michael Johnson", status: "Completed", amount: 460 },
];

const statusColors = {
  Pending: "bg-pink-200 text-pink-700 dark:bg-pink-900 dark:text-pink-200",
  Completed: "bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
};

export default function AccountManagerDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-8 transition-colors">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-pink-100 dark:bg-pink-900 rounded-xl p-6 text-center shadow">
          <div className="text-lg text-pink-700 dark:text-pink-200 font-semibold">
            Total Sales
          </div>
          <div className="text-3xl font-bold text-pink-800 dark:text-pink-100 mt-2">
            $13,560
          </div>
        </div>
        <div className="bg-purple-100 dark:bg-purple-900 rounded-xl p-6 text-center shadow">
          <div className="text-lg text-purple-700 dark:text-purple-200 font-semibold">
            Orders
          </div>
          <div className="text-3xl font-bold text-purple-800 dark:text-purple-100 mt-2">
            245
          </div>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900 rounded-xl p-6 text-center shadow">
          <div className="text-lg text-blue-700 dark:text-blue-200 font-semibold">
            Customers
          </div>
          <div className="text-3xl font-bold text-blue-800 dark:text-blue-100 mt-2">
            128
          </div>
        </div>
        <div className="bg-cyan-100 dark:bg-cyan-900 rounded-xl p-6 text-center shadow">
          <div className="text-lg text-cyan-700 dark:text-cyan-200 font-semibold">
            Sales
          </div>
          <div className="text-3xl font-bold text-cyan-800 dark:text-cyan-100 mt-2">
            3,200
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-8">
        <h3 className="text-2xl font-bold mb-6 text-indigo-900 dark:text-indigo-100">
          Recent Orders
        </h3>
        <table className="w-full text-left">
          <thead>
            <tr className="text-indigo-700 dark:text-indigo-200">
              <th className="pb-2">Order</th>
              <th className="pb-2">Customer</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t dark:border-gray-700">
                <td className="py-2">{order.id}</td>
                <td>{order.customer}</td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td>${order.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
