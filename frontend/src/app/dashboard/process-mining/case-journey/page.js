'use client';

import CaseJourneyAnalyzer from '@CASUSGROEP1/components/CaseJourneyAnalyzer';

export default function CaseJourneyPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Case Journey Analysis
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Analyze individual case journeys through your business process
        </p>
      </div>
      
      <CaseJourneyAnalyzer />
    </div>
  );
}
