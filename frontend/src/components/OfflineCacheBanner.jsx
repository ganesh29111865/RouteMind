import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, HardDrive, Check } from 'lucide-react';

export default function OfflineCacheBanner({ routeData }) {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [lastCachedTime, setLastCachedTime] = useState(null);

  // Save active route to localStorage for low-connectivity driver resilience
  useEffect(() => {
    if (routeData) {
      localStorage.setItem('routemind_driver_cached_manifest', JSON.stringify(routeData));
      setLastCachedTime(new Date().toLocaleTimeString());
    }
  }, [routeData]);

  return (
    <div className={`p-3.5 rounded-xl border transition flex flex-wrap items-center justify-between gap-3 text-xs ${
      isOfflineMode
        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
        : 'bg-slate-900/80 border-slate-800 text-slate-300'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${isOfflineMode ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
          {isOfflineMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-white">
              {isOfflineMode ? 'Low-Connectivity Offline Mode Active' : 'Offline Route Resilience Active'}
            </h4>
            <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono px-2 py-0.5 rounded">
              Cached: {lastCachedTime || 'Ready'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Driver manifest cached locally in device memory for zero-connectivity rural / subterranean zones.
          </p>
        </div>
      </div>

      <button
        onClick={() => setIsOfflineMode(!isOfflineMode)}
        className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition flex items-center space-x-1.5 ${
          isOfflineMode
            ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
        }`}
      >
        <HardDrive className="w-3.5 h-3.5" />
        <span>{isOfflineMode ? 'Restore Online Network' : 'Simulate Low-Connectivity (Offline)'}</span>
      </button>
    </div>
  );
}
