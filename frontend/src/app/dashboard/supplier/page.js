"use client";

import { useState } from "react";
import '../../../styles/globals.css';


const legoColors = ["Blauw", "Rood", "Grijs"];

export default function SupplierPage() {
  const [orderRounds] = useState([]);

  return (
<div className="flex justify-center mt-8">
  <div className="w-full max-w-6xl">
<div className="panel-gradient-border max-w-6xl mx-auto mt-8">
  <h1 className="text-2xl font-bold mb-4">Overzicht per ronde</h1>
      <div className="bg-brandPurple text-white p-4">Hello World</div>

        <table className="min-w-full divide-y divide-black/20 text-center bg-transparent">
          <thead>
            <tr>
              <th rowSpan={2} className="px-2 py-1">Periode</th>
              <th colSpan={3} className="px-2 py-1">Bestelling</th>
              <th rowSpan={2} className="px-2 py-1">Geleverd?</th>
              <th rowSpan={2} className="px-2 py-1">Periode geleverd</th>
            </tr>
            <tr>
              {legoColors.map(color => (
                <th key={color} className="px-2 py-1">{color}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orderRounds.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-gray-500">Nog geen bestellingen</td>
              </tr>
            ) : (
              orderRounds.map((r, idx) => (
                <tr key={r.round}>
                  <td className="px-2 py-1">{r.round}</td>
                  {legoColors.map(color => (
                    <td key={color} className="px-2 py-1">{r.bestelling[color]}</td>
                  ))}
                  <td className="px-2 py-1">
                    <input
                      type="checkbox"
                      checked={r.geleverdVinkje}
                      readOnly
                    />
                  </td>
                  <td className="px-2 py-1">
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
    );
}