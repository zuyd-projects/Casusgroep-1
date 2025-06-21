"use client";

import { useState } from "react";
import '../../../styles/globals.css';

const legoColors = ["Blauw", "Rood", "Grijs"];

export default function SupplierPage() {

  const [orderRounds] = useState([
    {
      id: "ORD-001",
      timestamp: "2024-06-20 10:15",
      round: 1,
      bestelling: { Blauw: 2, Rood: 2, Grijs: 4 },
      geleverdVinkje: true,
      geleverdInPeriode: "3",
    },
    {
      id: "ORD-002",
      timestamp: "2024-06-21 09:30",
      round: 2,
      bestelling: { Blauw: 3, Rood: 3, Grijs: 2 },
      geleverdVinkje: true,
      geleverdInPeriode: 4,
    },
    {
      id: "ORD-003",
      timestamp: "2024-06-22 14:05",
      round: 3,
      bestelling: { Blauw: 6, Rood: 6, Grijs: 4 },
      geleverdVinkje: true,
      geleverdInPeriode: "5"
    },
    {
      id: "ORD-004",
      timestamp: "2024-06-23 11:45",
      round: 4,
      bestelling: { Blauw: 4, Rood: 4, Grijs: 8 },
      geleverdVinkje: false,
      geleverdInPeriode: 6,
    },
    {
      id: "ORD-005",
      timestamp: "2024-06-24 08:20",
      round: 5,
      bestelling: { Blauw: 2, Rood: 2, Grijs: 4 },
      geleverdVinkje: true,
      geleverdInPeriode: "7",
    },

  ]);

  return (
    <div className="flex justify-center mt-8">
      <div className="w-full max-w-7xl">
        <div className="panel-gradient-border max-w-7xl mx-auto mt-8 py-16 px-10 rounded-xl shadow-lg">
          <h1 className="text-4xl font-extrabold mb-10 tracking-tight text-center">
            Overzicht per ronde
          </h1>
          <div className="overflow-x-auto rounded-xl shadow-lg table-panel">
            <table className="min-w-full divide-y divide-black/20 text-center bg-transparent">
              <thead>
                <tr>
                  <th rowSpan={2} className="px-2 py-2">ID</th>
                  <th rowSpan={2} className="px-2 py-2">Tijdstip</th>
                  <th rowSpan={2} className="px-2 py-2">Periode</th>
                  <th colSpan={3} className="px-2 py-2">Bestelling</th>
                  <th rowSpan={2} className="px-2 py-2">Geleverd?</th>
                  <th rowSpan={2} className="px-2 py-2">Periode geleverd</th>
                </tr>
                <tr>
                  {legoColors.map(color => (
                    <th key={color} className="px-2 py-2">{color}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orderRounds.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-4 text-gray-500">Nog geen bestellingen</td>
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
                      {legoColors.map(color => (
                        <td key={color} className="px-2 py-2">{r.bestelling[color]}</td>
                      ))}
                      <td className="px-2 py-2">
                        {r.geleverdVinkje ? (
                          <span className="inline-block text-green-400 font-bold text-lg">✔</span>
                        ) : (
                          <span className="inline-block text-red-400 font-bold text-lg">✘</span>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        {r.geleverdInPeriode ? r.geleverdInPeriode : "-"}
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