'use client';

import Link from 'next/link';
import DetailedTimingAnalyzer from '@CASUSGROEP1/components/DetailedTimingAnalyzer';
import { BarChart3, MapPin, Timer } from 'lucide-react';

export default function DetailedTimingPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Detailed Process Timing Analysis
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Comprehensive timing analysis with stage-by-stage breakdowns, bottleneck identification, and performance metrics
        </p>
      </div>
      
      {/* Process Mining Navigation */}
      <div className="flex space-x-4 mb-6">
        <Link href="/dashboard/process-mining" className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
          <BarChart3 className="h-4 w-4" />
          <span>Main Dashboard</span>
        </Link>
        <Link href="/dashboard/process-mining/detailed-timing" className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/40">
          <Timer className="h-4 w-4" />
          <span>Detailed Timing</span>
        </Link>
      </div>
      
      <DetailedTimingAnalyzer />
    </div>
  );
}
