"use client";

import { useState, useCallback, useEffect } from "react";
import Card from "@CASUSGROEP1/components/Card";
import { useRoundTimer } from "@CASUSGROEP1/utils/useRoundSim";

const legoColors = ["Blauw", "Rood", "Grijs"];

function generateOrdersPerRound(rounds, startRound = 1) {
  // Helper om random uit [4,5] te kiezen
  const getNextOrderInterval = () => Math.floor(Math.random() * 2) + 4;
  // Helper om random uit [0, 10, 20, 30] te kiezen
  const getOrderAmount = () => [0, 10, 20, 30][Math.floor(Math.random() * 4)];

  let nextOrderIn = getNextOrderInterval();
  let orderRounds = [];

  for (let i = 0; i < rounds; i++) {
    const roundNr = startRound + i;
    let bestellingen = {};
    let isOrderRound = false;

    if (nextOrderIn === 0) {
      // Bestelling in deze ronde
      legoColors.forEach(color => (bestellingen[color] = getOrderAmount() || 10));
      isOrderRound = true;
      nextOrderIn = getNextOrderInterval();
    } else {
      // Geen bestelling deze ronde
      legoColors.forEach(color => (bestellingen[color] = 0));
      nextOrderIn--;
    }

    orderRounds.push({
      round: roundNr,
      bestelling: bestellingen,
      geleverdVinkje: false,
      geleverdInPeriode: null,
      isOrderRound,
    });
  }
  return orderRounds;
}

export default function SupplierPage() {
  const [round, setRound] = useState(1);
  const [orderRounds, setOrderRounds] = useState([]);

  useEffect(() => {
    setOrderRounds(generateOrdersPerRound(1));
  }, []);

  const handleNextRound = useCallback(() => {
    setRound(prev => prev + 1);
    setOrderRounds(prev =>
      [
        ...prev,
        ...generateOrdersPerRound(1).map(o => ({
          ...o,
          round: prev.length + 1,
        })),
      ]
    );
  }, []);

  const { isRunning, timer, start, stop, restart } = useRoundTimer(handleNextRound, 20000);

  // Checkbox handler
  const handleVinkjeChange = (roundIdx, checked) => {
    setOrderRounds(orderRounds =>
      orderRounds.map((r, idx) =>
        idx === roundIdx
          ? {
              ...r,
              geleverdVinkje: checked,
              geleverdInPeriode: checked ? round : null,
            }
          : r
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-2 items-center">
        <button
          className="px-2 py-1 rounded text-white bg-blue-600 text-sm"
          onClick={start}
          disabled={isRunning}
        >
          Start simulatie
        </button>
        <button
          className="px-2 py-1 rounded text-white bg-red-600 text-sm"
          onClick={stop}
          disabled={!isRunning}
        >
          Stop simulatie
        </button>
        <button
          className="px-2 py-1 rounded text-white bg-gray-600 text-sm"
          onClick={restart}
        >
          Herstart simulatie
        </button>
        <span className="ml-4 text-sm">
          Timer: <span className="font-mono">{timer}s</span>
        </span>
      </div>
      <Card>
        <h1 className="text-2xl font-bold mb-2">Overzicht per ronde</h1>
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-center">
          <thead>
            <tr>
              <th rowSpan={2} className="px-2 py-1">Periode</th>
              <th colSpan={3} className="px-2 py-1">Bestelling</th>
              <th className="bg-zinc-300" />
              <th rowSpan={2} className="px-2 py-1">Geleverd?</th>
              <th rowSpan={2} className="px-2 py-1">Periode geleverd</th>
            </tr>
            <tr>
              {legoColors.map(color => (
                <th key={color} className="px-2 py-1">{color}</th>
              ))}
              <th className="bg-zinc-300" />
            </tr>
          </thead>
          <tbody>
            {orderRounds.map((r, idx) => (
              <tr key={r.round}>
                <td className="px-2 py-1">{r.round}</td>
                {legoColors.map(color => (
                  <td key={color} className="px-2 py-1">{r.bestelling[color]}</td>
                ))}
                <td className="bg-zinc-300" />
                <td className="px-2 py-1">
                  <input
                    type="checkbox"
                    checked={r.geleverdVinkje}
                    onChange={e => handleVinkjeChange(idx, e.target.checked)}
                  />
                </td>
                <td className="px-2 py-1">
                  {r.geleverdInPeriode ? r.geleverdInPeriode : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}