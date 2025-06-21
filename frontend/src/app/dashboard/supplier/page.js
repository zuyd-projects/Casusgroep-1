"use client";

import { useState } from "react";
import "../../../styles/globals.css";

const legoColors = ["Blauw", "Rood", "Grijs"];

export default function SupplierPage() {
  const [orderRounds, setOrderRounds] = useState([
    {
      id: "ORD-001",
      timestamp: "2024-06-20 10:15",
      round: 1,
      bestelling: { Blauw: 2, Rood: 2, Grijs: 4 },
      geleverdVinkje: true,
      geleverdInPeriode: "3",
      note: "",
    },
    {
      id: "ORD-002",
      timestamp: "2024-06-21 09:30",
      round: 2,
      bestelling: { Blauw: 3, Rood: 3, Grijs: 2 },
      geleverdVinkje: true,
      geleverdInPeriode: 4,
      note: "",
    },
    {
      id: "ORD-003",
      timestamp: "2024-06-22 14:05",
      round: 3,
      bestelling: { Blauw: 6, Rood: 6, Grijs: 4 },
      geleverdVinkje: true,
      geleverdInPeriode: "5",
      note: "",
    },
    {
      id: "ORD-004",
      timestamp: "2024-06-23 11:45",
      round: 4,
      bestelling: { Blauw: 4, Rood: 4, Grijs: 8 },
      geleverdVinkje: false,
      geleverdInPeriode: 6,
      note: "",
    },
    {
      id: "ORD-005",
      timestamp: "2024-06-24 08:20",
      round: 5,
      bestelling: { Blauw: 2, Rood: 2, Grijs: 4 },
      geleverdVinkje: true,
      geleverdInPeriode: "7",
      note: "",
    },
  ]);

  const handleToggleGeleverd = (id) => {
    setOrderRounds((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, geleverdVinkje: !order.geleverdVinkje } : order
      )
    );
  };

  const handleNoteChange = (id, value) => {
    setOrderRounds((prev) =>
      prev.map((order) => (order.id === id ? { ...order, note: value } : order))
    );
  };

  return (
    <div className="flex justify-center mt-8">
      <div className="w-full max-w-7xl">
        <div className="border-4 border-transparent rounded-xl bg-gradient-to-r from-brandPurple to-brandPink p-[4px] max-w-7xl mx-auto mt-8 shadow-xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg py-16 px-10">
            <h1 className="text-4xl font-extrabold mb-10 tracking-tight text-center text-gray-900 dark:text-white">
              Overzicht per ronde
            </h1>
            <div className="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-center bg-transparent">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th rowSpan={2} className="px-2 py-2">ID</th>
                    <th rowSpan={2} className="px-2 py-2">Tijdstip</th>
                    <th rowSpan={2} className="px-2 py-2">Periode</th>
                    <th colSpan={3} className="px-2 py-2">Bestelling</th>
                    <th rowSpan={2} className="px-2 py-2">Geleverd?</th>
                    <th rowSpan={2} className="px-2 py-2">Periode geleverd</th>
                    <th rowSpan={2} className="px-2 py-2">Notitie</th>
                  </tr>
                  <tr>
                    {legoColors.map((color) => (
                      <th
                        key={color}
                        className={`px-2 py-2 ${
                          color === "Blauw"
                            ? "bg-blue-100 text-blue-800"
                            : color === "Rood"
                            ? "bg-red-100 text-red-800"
                            : color === "Grijs"
                            ? "bg-gray-200 text-gray-800"
                            : ""
                        }`}
                      >
                        {color}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orderRounds.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-4 text-gray-500">
                        Nog geen bestellingen
                      </td>
                    </tr>
                  ) : (
                    [...orderRounds].reverse().map((r, idx) => (
                      <tr
                        key={r.id}
                        className={
                          idx % 2 === 0
                            ? "bg-white/5 hover:bg-white/10"
                            : "hover:bg-white/10"
                        }
                      >
                        <td className="px-2 py-2">{r.id}</td>
                        <td className="px-2 py-2">{r.timestamp || "-"}</td>
                        <td className="px-2 py-2">{r.round}</td>
                        {legoColors.map((color) => (
                          <td key={color} className="px-2 py-2 font-semibold">
                            <span
                              className={
                                color === "Blauw"
                                  ? "text-blue-700"
                                  : color === "Rood"
                                  ? "text-red-700"
                                  : color === "Grijs"
                                  ? "text-gray-700"
                                  : ""
                              }
                            >
                              {r.bestelling[color]}
                            </span>
                          </td>
                        ))}
                        <td className="px-2 py-2">
                          <button
                            onClick={() => handleToggleGeleverd(r.id)}
                            className="focus:outline-none"
                            title="Toggle geleverd"
                          >
                            {r.geleverdVinkje ? (
                              <span className="inline-block text-green-400 font-bold text-lg">✔</span>
                            ) : (
                              <span className="inline-block text-red-400 font-bold text-lg">✘</span>
                            )}
                          </button>
                        </td>
                        <td className="px-2 py-2">
                          {r.geleverdInPeriode ? r.geleverdInPeriode : "-"}
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={r.note || ""}
                            onChange={(e) => handleNoteChange(r.id, e.target.value)}
                            placeholder="Notitie toevoegen"
                            className="border rounded px-2 py-1 text-sm w-32"
                          />
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
    </div>
  );
}