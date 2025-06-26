'use client';

import Link from 'next/link';
import CaseJourneyAnalyzer from '@CASUSGROEP1/components/CaseJourneyAnalyzer';
import { BarChart3, MapPin, Timer } from 'lucide-react';

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

            {/* Process Mining Navigation */}
            <div className="flex space-x-4 mb-6">
                <Link href="/dashboard/process-mining" className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
                    <BarChart3 className="h-4 w-4" />
                    <span>Main Dashboard</span>
                </Link>
                <Link href="/dashboard/process-mining/case-journey" className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/40">
                    <MapPin className="h-4 w-4" />
                    <span>Case Journey</span>
                </Link>
                <Link href="/dashboard/process-mining/detailed-timing" className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
                    <Timer className="h-4 w-4" />
                    <span>Detailed Timing</span>
                </Link>
            </div>

            <CaseJourneyAnalyzer />
        </div>
    );
}
