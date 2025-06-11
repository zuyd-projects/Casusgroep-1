'use client';

import { useState } from 'react';

export default function PlanningPage() {
  const [orders] = useState([
    { ordernummer: 'ORD-001', motortype: 'A', aantal: 3, blauw: 9, rood: 12, grijs: 6, productielijn: 'A' },
    { ordernummer: 'ORD-002', motortype: 'B', aantal: 2, blauw: 4, rood: 4, grijs: 8, productielijn: 'C' },
    { ordernummer: 'ORD-003', motortype: 'C', aantal: 1, blauw: 3, rood: 3, grijs: 2, productielijn: 'B' },
    { ordernummer: 'ORD-004', motortype: 'A', aantal: 2, blauw: 6, rood: 6, grijs: 4, productielijn: 'A' },
    { ordernummer: 'ORD-005', motortype: 'C', aantal: 3, blauw: 9, rood: 9, grijs: 6, productielijn: 'C' },
    { ordernummer: 'ORD-006', motortype: 'B', aantal: 1, blauw: 3, rood: 3, grijs: 2, productielijn: 'C' },
    { ordernummer: 'ORD-007', motortype: 'A', aantal: 2, blauw: 4, rood: 4, grijs: 8, productielijn: 'A' },
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Productie Planning</h1>
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-black text-white">
            <th className="border px-4 py-2">Ordernummer</th>
            <th className="border px-4 py-2">Motortype</th>
            <th className="border px-4 py-2">Aantal</th>
            <th className="border px-4 py-2">Blauw</th>
            <th className="border px-4 py-2">Rood</th>
            <th className="border px-4 py-2">Grijs</th>
            <th className="border px-4 py-2">Productielijn</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={index} className="text-center">
              <td className="border px-4 py-2">{order.ordernummer}</td>
              <td className="border px-4 py-2">{order.motortype}</td>
              <td className="border px-4 py-2">{order.aantal}</td>
              <td className="border px-4 py-2">{order.blauw}</td>
              <td className="border px-4 py-2">{order.rood}</td>
              <td className="border px-4 py-2">{order.grijs}</td>
              <td className="border px-4 py-2">{order.productielijn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
