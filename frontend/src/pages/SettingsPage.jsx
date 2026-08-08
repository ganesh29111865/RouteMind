import React, { useState } from 'react'
import { Sliders, ShieldCheck, Clock, DollarSign, Truck, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const [config, setConfig] = useState({
    timeWindows: true,
    codLimit: true,
    maxCod: 50000,
    vehicleCapacity: true,
    maxCapacity: 150,
    noEntryZones: true,
    noEntryHours: "08:00 - 11:00 & 16:00 - 20:00",
    legalDrivingHours: true,
    maxDriving: 8.0,
  })

  const toggle = (key) => setConfig(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h3 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <Sliders className="w-6 h-6 text-brand-400" />
          <span>Indian Logistics Constraints Engine Configuration</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Configure active rules enforced by Google OR-Tools during route optimization and replanning
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h4 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-3">Active Policy Rules</h4>

        {/* Rule 1: Delivery Time Windows */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-brand-400 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-white">Delivery Time Windows (VRPTW)</h5>
              <p className="text-xs text-slate-400">Strictly enforce customer slot availability (e.g., 09:00 - 12:00 PM)</p>
            </div>
          </div>
          <button 
            onClick={() => toggle('timeWindows')}
            className={`w-12 h-6 rounded-full transition-colors relative ${config.timeWindows ? 'bg-brand-600' : 'bg-slate-700'}`}
          >
            <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${config.timeWindows ? 'right-1' : 'left-1'}`} />
          </button>
        </div>

        {/* Rule 2: COD Cash Limit */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-start space-x-3">
            <DollarSign className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-white">COD Cash Limit Cap</h5>
              <p className="text-xs text-slate-400">Max cumulative cash-on-delivery limit per driver/vehicle shift</p>
              <span className="text-xs font-mono text-emerald-400 font-semibold mt-1 block">Limit: ₹{config.maxCod.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <button 
            onClick={() => toggle('codLimit')}
            className={`w-12 h-6 rounded-full transition-colors relative ${config.codLimit ? 'bg-emerald-600' : 'bg-slate-700'}`}
          >
            <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${config.codLimit ? 'right-1' : 'left-1'}`} />
          </button>
        </div>

        {/* Rule 3: Vehicle Capacity */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-start space-x-3">
            <Truck className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-white">Vehicle Package & Volume Capacity</h5>
              <p className="text-xs text-slate-400">Enforce max weight and volume cubic limits per vehicle</p>
              <span className="text-xs font-mono text-purple-400 font-semibold mt-1 block">Cap: {config.maxCapacity} packages</span>
            </div>
          </div>
          <button 
            onClick={() => toggle('vehicleCapacity')}
            className={`w-12 h-6 rounded-full transition-colors relative ${config.vehicleCapacity ? 'bg-purple-600' : 'bg-slate-700'}`}
          >
            <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${config.vehicleCapacity ? 'right-1' : 'left-1'}`} />
          </button>
        </div>

        {/* Rule 4: No Entry Zone Timing */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-white">Metro No-Entry Zone Timing Bans</h5>
              <p className="text-xs text-slate-400">Restrict heavy vehicles in restricted commercial corridors (Bengaluru, Delhi, Mumbai)</p>
              <span className="text-xs font-mono text-amber-400 font-semibold mt-1 block">Ban Hours: {config.noEntryHours}</span>
            </div>
          </div>
          <button 
            onClick={() => toggle('noEntryZones')}
            className={`w-12 h-6 rounded-full transition-colors relative ${config.noEntryZones ? 'bg-amber-600' : 'bg-slate-700'}`}
          >
            <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${config.noEntryZones ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>
    </div>
  )
}
