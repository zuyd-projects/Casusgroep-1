"use client";

import { useState } from "react";
import "../../../styles/globals.css";

const initialOrders = [
  {
    id: "ORD-001",
    klantnaam: "",
    motortype: "A",
    aantal: 1,
    volledig: "Ja",
    geaccepteerd: "Ja",
  },
  {
    id: "ORD-002",
    klantnaam: "",
    motortype: "B",
    aantal: 1,
    volledig: "Ja",
    geaccepteerd: "Ja",
  },
  {
    id: "ORD-003",
    klantnaam: "",
    motortype: "C",
    aantal: 1,
    volledig: "Ja",
    geaccepteerd: "Ja",
  },
  {
    id: "ORD-004",
    klantnaam: "",
    motortype: "A",
    aantal: 1,
    volledig: "Ja",
    geaccepteerd: "Ja",
  },
  {
    id: "ORD-005",
    klantnaam: "",
    motortype: "B",
    aantal: 1,
    volledig: "Ja",
    geaccepteerd: "Ja",
  },
];

const motortypes = ["A", "B", "C"];
const jaNee = ["Ja", "Nee"];

export default function AccountManagerDashboard() {
  const [orders, setOrders] = useState(initialOrders);

  const handleChange = (id, field, value) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, [field]: value } : order
      )
    );
  };

  return (
    <div className="flex justify-center mt-8">
      <div className="w-full max-w-7xl">
        <div className="panel-gradient-border max-w-7xl mx-auto mt-8 py-16 px-10 rounded-xl shadow-lg">
          <h1 className="text-4xl font-extrabold mb-10 tracking-tight text-center">
            Overzicht Accountmanager
          </h1>
          <div className="overflow-x-auto rounded-xl shadow-lg table-panel">
            <table className="min-w-full divide-y divide-black/20 text-center bg-transparent">
              <thead>
                <tr>
                  <th className="px-2 py-2">Ordernummer</th>
                  <th className="px-2 py-2">Klantnaam</th>
                  <th className="px-2 py-2">Motortype</th>
                  <th className="px-2 py-2">Aantal</th>
                  <th className="px-2 py-2">Product Compleet?</th>
                  <th className="px-2 py-2">Geaccepteerd?</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className={
                      idx % 2 === 0
                        ? "bg-white/10 hover:bg-white/20"
                        : "bg-gray-100/10 hover:bg-gray-200/20"
                    }
                  >
                    <td className="px-2 py-2">{order.id}</td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={order.klantnaam}
                        onChange={(e) =>
                          handleChange(order.id, "klantnaam", e.target.value)
                        }
                        className="border rounded px-2 py-1 text-sm w-32"
                        placeholder="Klantnaam"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={order.motortype}
                        onChange={(e) =>
                          handleChange(order.id, "motortype", e.target.value)
                        }
                        className="border rounded px-2 py-1 text-sm"
                      >
                        {motortypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={0}
                        value={order.aantal}
                        onChange={(e) =>
                          handleChange(order.id, "aantal", e.target.value)
                        }
                        className="border rounded px-2 py-1 text-sm w-16"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={order.volledig}
                        onChange={(e) =>
                          handleChange(order.id, "volledig", e.target.value)
                        }
                        className="border rounded px-2 py-1 text-sm"
                      >
                        {jaNee.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={order.geaccepteerd}
                        onChange={(e) =>
                          handleChange(order.id, "geaccepteerd", e.target.value)
                        }
                        className="border rounded px-2 py-1 text-sm"
                      >
                        {jaNee.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
