"use client";

import { useState } from "react";

const initialOrders = [
  {
    id: "ORD-001",
    timestamp: "2024-06-20 10:15",
    klantnaam: "",
    motortype: "A",
    aantal: 1,
    volledig: true,
    geaccepteerd: false,
  },
  {
    id: "ORD-002",
    timestamp: "2024-06-21 09:30",
    klantnaam: "",
    motortype: "B",
    aantal: 1,
    volledig: false,
    geaccepteerd: true,
  },
  {
    id: "ORD-003",
    timestamp: "2024-06-22 14:05",
    klantnaam: "",
    motortype: "C",
    aantal: 1,
    volledig: false,
    geaccepteerd: false,
  },
  {
    id: "ORD-004",
    timestamp: "2024-06-23 11:45",
    klantnaam: "",
    motortype: "A",
    aantal: 1,
    volledig: false,
    geaccepteerd: false,
  },
  {
    id: "ORD-005",
    timestamp: "2024-06-24 08:20",
    klantnaam: "",
    motortype: "B",
    aantal: 1,
    volledig: true,
    geaccepteerd: false,
  },
];

const motortypes = ["A", "B", "C"];

export default function AccountManagerDashboard() {
  const [orders, setOrders] = useState(initialOrders);

  const handleChange = (id, field, value) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, [field]: value } : order
      )
    );
  };

  // Toggle geaccepteerd (waiting <-> accepted)
  const handleToggleField = (id, field) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, [field]: !order[field] } : order
      )
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-[2000px] mx-auto">
        <div className="bg-zinc-100 dark:bg-zinc-900 shadow-md overflow-hidden border-0 rounded-lg">
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-500 py-10 px-8 relative">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
            <h1 className="text-4xl font-bold text-white relative z-10">
              Overzicht Accountmanager
            </h1>
            <p className="text-pink-100 mt-3 text-lg relative z-10">
              Beheer en verwerk klantorders
            </p>
          </div>
          <div className="overflow-x-auto p-2">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="border-b-2 border-zinc-200 dark:border-zinc-800">
                  <th className="px-6 py-5 text-left text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    Ordernummer
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    Tijdstip
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    Klantnaam
                  </th>
                  <th className="px-6 py-5 text-center text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    Motortype
                  </th>
                  <th className="px-6 py-5 text-center text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    Aantal
                  </th>
                  <th className="px-6 py-5 text-center text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    Geaccepteerd?
                  </th>
                  <th className="px-6 py-5 text-center text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    Product Compleet?
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-zinc-500 dark:text-zinc-400"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 text-zinc-300 dark:text-zinc-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p className="mt-3 text-lg">Nog geen orders</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order, idx) => (
                    <tr
                      key={order.id}
                      className={idx % 2 === 0 ? "bg-zinc-800" : "bg-zinc-900"}
                    >
                      <td className="px-6 py-5 whitespace-nowrap text-base font-bold text-white">
                        {order.id}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-base text-zinc-300">
                        {order.timestamp || "-"}
                      </td>
                      <td className="px-6 py-5">
                        <input
                          type="text"
                          value={order.klantnaam}
                          onChange={(e) =>
                            handleChange(order.id, "klantnaam", e.target.value)
                          }
                          className="border border-zinc-700 rounded px-2 py-1 text-sm w-32 bg-zinc-900 text-zinc-200"
                          placeholder="Klantnaam"
                        />
                      </td>
                      <td className="px-6 py-5 text-center">
                        <select
                          value={order.motortype}
                          onChange={(e) =>
                            handleChange(order.id, "motortype", e.target.value)
                          }
                          className="border border-zinc-700 rounded px-2 py-1 text-sm bg-zinc-900 text-zinc-200"
                        >
                          {motortypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <input
                          type="number"
                          min={0}
                          value={order.aantal}
                          onChange={(e) =>
                            handleChange(order.id, "aantal", e.target.value)
                          }
                          className="border border-zinc-700 rounded px-2 py-1 text-sm w-16 bg-zinc-900 text-zinc-200"
                        />
                      </td>
                      {/* Geaccepteerd: waiting/ready icon, toggle on click */}
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() =>
                            handleToggleField(order.id, "geaccepteerd")
                          }
                          className="focus:outline-none transition-transform hover:scale-110 duration-150"
                          title={
                            order.geaccepteerd
                              ? "Order geaccepteerd"
                              : "Wacht op acceptatie"
                          }
                        >
                          {order.geaccepteerd ? (
                            <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 shadow-md">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-7 w-7"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-amber-600 shadow-md">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-7 w-7"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </span>
                          )}
                        </button>
                      </td>
                      {/* Product Compleet: waiting/ready icon, toggle on click */}
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() =>
                            handleToggleField(order.id, "volledig")
                          }
                          className="focus:outline-none transition-transform hover:scale-110 duration-150"
                          title={
                            order.volledig
                              ? "Product compleet"
                              : "Wacht op afronding"
                          }
                        >
                          {order.volledig ? (
                            <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 shadow-md">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-7 w-7"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-amber-600 shadow-md">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-7 w-7"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
