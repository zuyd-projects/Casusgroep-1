"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@CASUSGROEP1/components/Card";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [klantCounter, setKlantCounter] = useState(1);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rollDiceAndAddCustomerWithOrder = () => {
    const dice = Math.ceil(Math.random() * 6);
    alert(`Dobbelsteen gegooid: ${dice}`);

    const newCustomer = {
      id: Date.now().toString(),
      name: `Klant ${klantCounter}`,
      orders: [
        {
          id: Date.now(),
          products: [
            { name: "Lego Block 1", quantity: 5 },
            { name: "Lego Block 2", quantity: 5 },
            { name: "Lego Block 3", quantity: 5 },
          ],
        },
      ],
    };

    setCustomers((prev) => [...prev, newCustomer]);
    setKlantCounter((prev) => prev + 1);
  };

  const showErrorPopup = () => {
    alert("Ur error is in handeling.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your customer database</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={rollDiceAndAddCustomerWithOrder}
          >
            + Add Order
          </button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Search Customers
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Orders</th>
                <th className="px-6 py-3 text-left">Lego Block 1</th>
                <th className="px-6 py-3 text-left">Lego Block 2</th>
                <th className="px-6 py-3 text-left">Lego Block 3</th>
                <th className="px-6 py-3 text-left">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredCustomers.map((customer) => {
                const lastOrder = customer.orders[customer.orders.length - 1] || {
                  products: [
                    { quantity: 0 },
                    { quantity: 0 },
                    { quantity: 0 },
                  ],
                };

                return (
                  <tr key={customer.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 align-top">
                    <td className="px-6 py-4 font-medium whitespace-nowrap">{customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">1</td>
                    <td className="px-6 py-4 whitespace-nowrap">{lastOrder.products[0].quantity}x</td>
                    <td className="px-6 py-4 whitespace-nowrap">{lastOrder.products[1].quantity}x</td>
                    <td className="px-6 py-4 whitespace-nowrap">{lastOrder.products[2].quantity}x</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={showErrorPopup}
                        className="text-xs text-red-500 underline hover:text-red-700"
                      >
                        Report Error
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredCustomers.length === 0 && (
            <div className="py-20 text-center text-zinc-500 dark:text-zinc-400">
              No customers found.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
