'use client';

import { useState, useEffect } from 'react';
import { 
  Radio, 
  CheckCircle, 
  Activity,
  Database,
  Wifi,
  RefreshCw
} from 'lucide-react';

interface SyncStatus {
  name: string;
  status: 'connected' | 'syncing' | 'error';
  lastSync: string;
  dataCount: number;
  icon: string;
}

export default function CPAllSyncDisplay() {
  const [mounted, setMounted] = useState(false);
  const [syncData, setSyncData] = useState<SyncStatus[]>([
    { 
      name: '7-Eleven', 
      status: 'connected', 
      lastSync: 'Just now',
      dataCount: 13542,
      icon: '🏪'
    },
    { 
      name: "Lotus's", 
      status: 'syncing', 
      lastSync: '2 min ago',
      dataCount: 2187,
      icon: '🛒'
    },
    { 
      name: 'Makro', 
      status: 'connected', 
      lastSync: '5 min ago',
      dataCount: 1456,
      icon: '🏢'
    },
  ]);

  const [totalSynced, setTotalSynced] = useState(17185);
  const [syncSpeed, setSyncSpeed] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Initialize random values on client only
    setSyncSpeed(Math.floor(Math.random() * 50) + 20);
  }, []);

  // Simulate live syncing
  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      setSyncData(prev => prev.map(item => {
        // Randomly update sync status
        const shouldSync = Math.random() > 0.7;
        if (shouldSync && item.status === 'connected') {
          return { 
            ...item, 
            status: 'syncing' as const,
            dataCount: item.dataCount + Math.floor(Math.random() * 5)
          };
        } else if (item.status === 'syncing') {
          return { 
            ...item, 
            status: 'connected' as const,
            lastSync: 'Just now'
          };
        }
        return item;
      }));

      // Update total count
      setTotalSynced(prev => prev + Math.floor(Math.random() * 3));
      setSyncSpeed(Math.floor(Math.random() * 50) + 20);
    }, 3000);

    return () => clearInterval(interval);
  }, [mounted]);

  const allConnected = syncData.every(s => s.status !== 'error');

  // Show loading state on server
  if (!mounted) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <div className="bg-white shadow-2xl rounded-xl sm:rounded-2xl border-2 border-green-200 p-3 sm:p-4 w-72 sm:w-80">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Compact Display */}
      <div className="bg-white shadow-2xl rounded-xl sm:rounded-2xl border-2 border-green-200 p-3 sm:p-4 w-72 sm:w-80">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Radio className={`w-5 h-5 ${allConnected ? 'text-green-600' : 'text-red-600'}`} />
              {allConnected && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
              )}
            </div>
            <span className="font-bold text-gray-900 text-sm">CP ALL Ecosystem</span>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            allConnected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {allConnected ? '✓ Live' : '⚠ Alert'}
          </span>
        </div>

        {/* Sync Sources */}
        <div className="space-y-2 mb-4">
          {syncData.map((item, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.lastSync}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.status === 'connected' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : item.status === 'syncing' ? (
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                ) : (
                  <span className="text-red-600">!</span>
                )}
                <span className="text-xs font-mono text-gray-700">
                  {item.dataCount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              <Database className="w-3 h-3 text-green-600" />
              <p className="text-xs text-green-700 font-medium">Total Data</p>
            </div>
            <p className="text-lg font-bold text-green-900">
              {totalSynced.toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              <Activity className="w-3 h-3 text-blue-600" />
              <p className="text-xs text-blue-700 font-medium">Sync Speed</p>
            </div>
            <p className="text-lg font-bold text-blue-900">
              {syncSpeed}/s
            </p>
          </div>
        </div>

        {/* Connection Quality */}
        <div className="mt-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-600">
            <Wifi className="w-3 h-3" />
            <span>Connection: Strong</span>
          </div>
          <span className="text-gray-400">API v2.1</span>
        </div>

        {/* Pulse Animation */}
        <div className="absolute -top-1 -right-1 w-3 h-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
        </div>
      </div>

      {/* Minimized version for mobile */}
      <style jsx>{`
        @media (max-width: 640px) {
          .fixed {
            bottom: 1rem;
            right: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

// Export a simplified version for embedding in dashboard
export function CPAllSyncBanner() {
  return (
    <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-ping" />
          </div>
          <div>
            <p className="font-bold text-green-900">
              🔗 API Live Connection: CP ALL Ecosystem
            </p>
            <p className="text-xs text-green-700">
              Syncing data from 7-Eleven (13,542), Lotus's (2,187), Makro (1,456) branches
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-green-700">
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-semibold">Real-time</span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Last sync: Just now
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 relative h-2 bg-green-200 rounded-full overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse" style={{ width: '85%' }} />
      </div>

      {/* Mini stats */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-xs text-green-600">7-Eleven</p>
          <p className="text-sm font-bold text-green-900">✓</p>
        </div>
        <div>
          <p className="text-xs text-green-600">Lotus's</p>
          <p className="text-sm font-bold text-green-900">✓</p>
        </div>
        <div>
          <p className="text-xs text-green-600">Makro</p>
          <p className="text-sm font-bold text-green-900">✓</p>
        </div>
        <div>
          <p className="text-xs text-green-600">Total</p>
          <p className="text-sm font-bold text-green-900">17,185</p>
        </div>
      </div>
    </div>
  );
}
