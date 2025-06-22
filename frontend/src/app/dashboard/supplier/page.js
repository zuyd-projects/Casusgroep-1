"use client";

import { useState } from "react";

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

  // Toggle geleverdVinkje
  const handleToggleGeleverd = (id) => {
    setOrderRounds((prev) =>
      prev.map((order) =>
        order.id === id
          ? { ...order, geleverdVinkje: !order.geleverdVinkje }
          : order
      )
    );
  };

  // Update note
  const handleNoteChange = (id, value) => {
    setOrderRounds((prev) =>
      prev.map((order) => (order.id === id ? { ...order, note: value } : order))
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-[2000px] mx-auto">
        <div className="bg-zinc-100 dark:bg-zinc-900 shadow-md overflow-hidden border-0 rounded-lg">
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-500 py-10 px-8 relative">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
            <h1 className="text-4xl font-bold text-white relative z-10">
              Overzicht Leverancier
            </h1>
            <p className="text-pink-100 mt-3 text-lg relative z-10">
              Beheer en monitor alle leveringen van lego blokjes
            </p>
          </div>

          <div className="overflow-x-auto p-2">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="border-b-2 border-zinc-200 dark:border-zinc-800">
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-left text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-left text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    Tijdstip
                  </th>
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    Periode
                  </th>
                  <th
                    colSpan={3}
                    className="px-6 py-5 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-900/50"
                  >
                    Bestelling
                  </th>
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    Geleverd?
                  </th>
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    Periode geleverd
                  </th>
                  <th
                    rowSpan={2}
                    className="px-6 py-5 text-left text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    Notitie
                  </th>
                </tr>
                <tr>
                  {legoColors.map((color) => (
                    <th
                      key={color}
                      className={`px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider ${
                        color === "Blauw"
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : color === "Rood"
                          ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          : color === "Grijs"
                          ? "bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                          : ""
                      }`}
                    >
                      {color}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {orderRounds.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
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
                        <p className="mt-3 text-lg">Nog geen bestellingen</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  [...orderRounds].reverse().map((r, idx) => (
                    <tr
                      key={r.id}
                      className="hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-5 whitespace-nowrap text-base font-bold text-white">
                        {r.id}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-base text-zinc-600 dark:text-zinc-400">
                        {r.timestamp || "-"}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full font-bold text-lg text-white">
                          {r.round}
                        </span>
                      </td>
                      {legoColors.map((color) => (
                        <td key={color} className="px-6 py-5 text-center">
                          <span
                            className={`inline-flex items-center justify-center h-10 w-10 rounded-full font-semibold text-base ${
                              color === "Blauw"
                                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                                : color === "Rood"
                                ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                                : color === "Grijs"
                                ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                : ""
                            }`}
                          >
                            {r.bestelling[color]}
                          </span>
                        </td>
                      ))}
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => handleToggleGeleverd(r.id)}
                          className="focus:outline-none transition-transform hover:scale-110 duration-150"
                          title={
                            r.geleverdVinkje
                              ? "Levering ontvangen"
                              : "Nog niet geleverd"
                          }
                        >
                          {r.geleverdVinkje ? (
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
                      <td className="px-6 py-5 text-center text-base">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-medium bg-gradient-to-r from-purple-500/70 to-pink-500/70 dark:from-purple-600/60 dark:to-pink-600/60 text-white shadow-sm backdrop-blur-sm">
                          Periode{" "}
                          {r.geleverdInPeriode ? r.geleverdInPeriode : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-base">
                        <button
                          className="inline-flex items-center px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 shadow-sm text-base leading-5 font-medium rounded-md text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-150"
                          onClick={() => {
                            const newNote = window.prompt(
                              "Voeg notitie toe",
                              r.note || ""
                            );
                            if (newNote !== null) {
                              handleNoteChange(r.id, newNote);
                            }
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                          {r.note ? "Bewerken" : "Notitie"}
                        </button>
                        {r.note && (
                          <div
                            className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-xs truncate"
                            title={r.note}
                          >
                            {r.note}
                          </div>
                        )}
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
