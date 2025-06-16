"use client";

import { useState, useEffect, useRef } from "react";
import Card from "@CASUSGROEP1/components/Card";

const PERIOD_DURATION_MS = 20000;
const MAX_PERIODS = 36;
const MAX_CUSTOMERS = 6;
const CUSTOMER_NAMES = ["Anna", "Bram", "Chloe", "Daan", "Emma", "Finn"];

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [klantCounter, setKlantCounter] = useState(0);
  const [period, setPeriod] = useState(1);
  const [periodOrders, setPeriodOrders] = useState([]);
  const [timeLeft, setTimeLeft] = useState(PERIOD_DURATION_MS / 1000);
  const [showReport, setShowReport] = useState(null);
  const [reportText, setReportText] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (!timerStarted) return;

    timerRef.current = setInterval(() => {
      setPeriod((prev) => (prev < MAX_PERIODS ? prev + 1 : prev));
      setTimeLeft(PERIOD_DURATION_MS / 1000);
    }, PERIOD_DURATION_MS);

    return () => clearInterval(timerRef.current);
  }, [timerStarted]);

  useEffect(() => {
    if (!timerStarted) return;

    const countdown = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [timerStarted]);

  const shuffleProducts = () => {
    const baseProducts = [
      { name: "Lego Block 1", quantity: 5 },
      { name: "Lego Block 2", quantity: 5 },
      { name: "Lego Block 3", quantity: 5 },
    ];
    return baseProducts.sort(() => 0.5 - Math.random());
  };

  const rollDiceAndAddCustomerWithOrder = () => {
    if (customers.length >= MAX_CUSTOMERS) {
      alert("Maximaal 6 klanten toegestaan.");
      return;
    }

    if (!timerStarted) {
      setTimerStarted(true);
    }

    const dice = Math.ceil(Math.random() * 6);
    alert(`Dobbelsteen gegooid: ${dice}`);

    const name = CUSTOMER_NAMES[klantCounter] || `Klant ${klantCounter + 1}`;

    const newCustomer = {
      id: Date.now().toString(),
      name,
      orders: [
        {
          id: Date.now(),
          period,
          products: shuffleProducts(),
        },
      ],
    };

    setCustomers((prev) => [...prev, newCustomer]);
    setPeriodOrders((prev) => [...prev, { customer: newCustomer.name, period }]);
    setKlantCounter((prev) => prev + 1);
  };

  const handleReportSubmit = () => {
    setReportSent(true);
    setTimeout(() => {
      setShowReport(null);
      setReportSent(false);
      setReportText("");
    }, 2000);
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your customer database</p>
          <p className="text-sm text-zinc-400 mt-1">
            Current Period: {period} / {MAX_PERIODS} — Next in {timeLeft}s
          </p>
        </div>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={rollDiceAndAddCustomerWithOrder}
        >
          + Add Order
        </button>
      </div>

      <Card>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </Card>

      <Card>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left">Name</th>
              <th className="text-center">Orders</th>
              <th className="text-center" colSpan={3}>Products</th>
              <th className="text-center">Period</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => {
              const lastOrder = customer.orders[customer.orders.length - 1];
              const [p1, p2, p3] = lastOrder.products;
              return (
                <tr key={customer.id}>
                  <td className="text-left">{customer.name}</td>
                  <td className="text-center">{customer.orders.length}</td>
                  <td className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">Lego Block 1</span>
                      <span>{p1.quantity}x</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">Lego Block 2</span>
                      <span>{p2.quantity}x</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">Lego Block 3</span>
                      <span>{p3.quantity}x</span>
                    </div>
                  </td>
                  <td className="text-center">{lastOrder.period}</td>
                  <td className="text-center">
                    <button
                      onClick={() => setShowReport(customer.id)}
                      className="text-red-500 text-xs underline"
                    >
                      Report Error
                    </button>
                    {showReport === customer.id && (
                      <div className="mt-2">
                        <textarea
                          className="w-full p-2 border rounded-md mb-2"
                          placeholder={`Probleem met ${customer.name}...`}
                          value={reportText}
                          onChange={(e) => setReportText(e.target.value)}
                        />
                        <button
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          onClick={handleReportSubmit}
                        >
                          Verstuur
                        </button>
                        {reportSent && (
                          <p className="mt-2 text-green-500 text-sm">Je melding is verstuurd.</p>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-zinc-500">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-2">Period Overview</h2>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left">Period</th>
              <th className="text-left">Customers</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(
              periodOrders.reduce((acc, { period, customer }) => {
                acc[period] = acc[period] ? [...acc[period], customer] : [customer];
                return acc;
              }, {})
            ).map(([period, customers]) => (
              <>
                <tr key={period}>
                  <td className="align-top pt-2 font-medium">{period}</td>
                  <td className="align-top pt-2 whitespace-pre-line">{customers.join("\n")}</td>
                </tr>
                <tr>
                  <td colSpan={2}><hr className="my-2 border-zinc-700" /></td>
                </tr>
              </>
            ))}
            {periodOrders.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center py-4 text-zinc-500">
                  No orders added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
