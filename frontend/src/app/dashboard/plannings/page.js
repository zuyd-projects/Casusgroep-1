'use client';

import { useState } from 'react';

export default function PlanningPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Lege connection string (placeholder)
  const connectionString = '';

  const fetchOrders = async () => {
    setLoading(true);
    setMessage('');

    // Simulatie van het ophalen van data
    setTimeout(() => {
      const fetchedOrders = [
        { ordernummer: 'ORD-001', motortype: 'A', aantal: 3, blauw: 9, rood: 12, grijs: 6, productielijn: 'A' },
        { ordernummer: 'ORD-002', motortype: 'B', aantal: 2, blauw: 4, rood: 4, grijs: 8, productielijn: 'C' },
        { ordernummer: 'ORD-003', motortype: 'C', aantal: 1, blauw: 3, rood: 3, grijs: 2, productielijn: 'B' },
        { ordernummer: 'ORD-004', motortype: 'A', aantal: 2, blauw: 6, rood: 6, grijs: 4, productielijn: 'A' },
        { ordernummer: 'ORD-005', motortype: 'C', aantal: 3, blauw: 9, rood: 9, grijs: 6, productielijn: 'C' },
        { ordernummer: 'ORD-006', motortype: 'B', aantal: 1, blauw: 3, rood: 3, grijs: 2, productielijn: 'C' },
        { ordernummer: 'ORD-007', motortype: 'A', aantal: 2, blauw: 4, rood: 4, grijs: 8, productielijn: 'A' },
      ];

      const currentData = JSON.stringify(orders);
      const newData = JSON.stringify(fetchedOrders);

      if (currentData === newData) {
        setMessage('No new data found');
      } else {
        setOrders(fetchedOrders);
        setMessage('');
      }

      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Productie Planning</h1>
      <button
        onClick={fetchOrders}
        className="mb-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Scannen...' : 'Data ophalen'}
      </button>

      {message && <p className="mb-4 text-yellow-600 font-medium">{message}</p>}

      {orders.length > 0 && (
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
      )}
    </div>
  );
}
