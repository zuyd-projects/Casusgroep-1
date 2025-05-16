"use client";

import { useState } from 'react';
import Link from 'next/link';
import Card from '@CASUSGROEP1/components/Card';

// Mock customer data
const customers = [
  { 
    id: '1', 
    name: 'John Doe', 
    email: 'john@example.com', 
    phone: '+1 (555) 123-4567',
    totalOrders: 3,
    totalSpent: 354.25,
    lastOrderDate: '2025-05-10'
  },
  { 
    id: '2', 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    phone: '+1 (555) 987-6543',
    totalOrders: 2,
    totalSpent: 76.00,
    lastOrderDate: '2025-05-14'
  },
  { 
    id: '3', 
    name: 'Bob Johnson', 
    email: 'bob@example.com', 
    phone: '+1 (555) 234-5678',
    totalOrders: 1,
    totalSpent: 199.95,
    lastOrderDate: '2025-05-13'
  },
  { 
    id: '4', 
    name: 'Alice Williams', 
    email: 'alice@example.com', 
    phone: '+1 (555) 876-5432',
    totalOrders: 5,
    totalSpent: 687.50,
    lastOrderDate: '2025-05-12'
  },
  { 
    id: '5', 
    name: 'Charlie Brown', 
    email: 'charlie@example.com', 
    phone: '+1 (555) 345-6789',
    totalOrders: 2,
    totalSpent: 425.75,
    lastOrderDate: '2025-05-10'
  },
  { 
    id: '6', 
    name: 'Diana Prince', 
    email: 'diana@example.com', 
    phone: '+1 (555) 456-7890',
    totalOrders: 6,
    totalSpent: 889.99,
    lastOrderDate: '2025-05-15'
  },
  { 
    id: '7', 
    name: 'Ethan Hunt', 
    email: 'ethan@example.com', 
    phone: '+1 (555) 567-8901',
    totalOrders: 1,
    totalSpent: 45.50,
    lastOrderDate: '2025-05-09'
  },
];

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) => {
    return (
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your customer database</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            + Add Customer
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
                placeholder="Search by name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <label htmlFor="sort" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Sort By
            </label>
            <select
              id="sort"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="totalSpent">Total Spent</option>
              <option value="totalOrders">Orders</option>
              <option value="lastOrderDate">Last Order</option>
            </select>
          </div>
        </div>
      </Card>
      
      {/* Customers table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">Name</th>
                <th scope="col" className="px-6 py-3 text-left">Email</th>
                <th scope="col" className="px-6 py-3 text-left">Phone</th>
                <th scope="col" className="px-6 py-3 text-left">Orders</th>
                <th scope="col" className="px-6 py-3 text-left">Total Spent</th>
                <th scope="col" className="px-6 py-3 text-left">Last Order</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{customer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.totalOrders}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${customer.totalSpent.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.lastOrderDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link 
                      href={`/dashboard/customers/${customer.id}`}
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
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
