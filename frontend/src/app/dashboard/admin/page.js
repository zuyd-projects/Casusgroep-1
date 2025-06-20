'use client';

import { useState } from 'react';
import Card from '@CASUSGROEP1/components/Card';
import { api } from '@CASUSGROEP1/utils/api';
import { Database, Play, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const seedSampleData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await api.post('/api/ProcessMining/seed-sample-data');
      setMessage(`Success: ${response.message}`);
      setMessageType('success');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Administrative tools and data management
        </p>
      </div>

      {/* Data Management */}
      <Card title="Process Mining Data Management">
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Development Tool</h3>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              This tool creates sample process mining data for demonstration purposes. 
              It will generate 20 sample orders with various activities, some delays, and anomalies.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={seedSampleData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Seeding Data...</span>
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  <span>Seed Sample Process Data</span>
                </>
              )}
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-lg border ${
              messageType === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {messageType === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <span>{message}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Links */}
      <Card title="Quick Navigation">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/dashboard/process-mining"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Play className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Process Mining Dashboard</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  View anomalies and process analytics
                </div>
              </div>
            </div>
          </a>

          <a
            href="/dashboard/orders"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-medium">Planner Warnings</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Check delivery time warnings
                </div>
              </div>
            </div>
          </a>

          <a
            href="/dashboard"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Database className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Main Dashboard</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Overview with process mining summary
                </div>
              </div>
            </div>
          </a>
        </div>
      </Card>

      {/* Instructions */}
      <Card title="How to Use Process Mining Features">
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">1. Generate Sample Data</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Click "Seed Sample Process Data" to create sample orders with various activities and anomalies.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">2. View Process Mining Dashboard</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Navigate to Process Mining to see:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 space-y-1">
              <li>Process anomalies and performance issues</li>
              <li>Duration anomalies (activities taking too long)</li>
              <li>Process bottlenecks (high frequency activities)</li>
              <li>Failed processes and error patterns</li>
              <li>Visual charts and statistics</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">3. Planner Alerts</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Planners can see delivery warnings in:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 space-y-1">
              <li>Main Dashboard (quick overview)</li>
              <li>Orders page (detailed warnings)</li>
              <li>Process Mining page (comprehensive analysis)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">4. Dutch Planner Messages</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Delivery warnings include the Dutch message "Levertijd wordt later" to inform planning teams about delivery delays.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
