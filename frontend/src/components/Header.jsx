import React from 'react'
import { Activity, Bell, RefreshCw, Zap } from 'lucide-react'

export default function Header({ title, subtitle, onRefresh }) {
  return (
    <header className="h-16 glass-panel border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>OR-Tools Engine Active</span>
        </div>

        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        <div className="h-4 w-px bg-slate-800"></div>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs">
            OP
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-semibold text-slate-200 leading-tight">Logistics Ops Manager</p>
            <p className="text-[10px] text-slate-400">Bengaluru Hub</p>
          </div>
        </div>
      </div>
    </header>
  )
}
