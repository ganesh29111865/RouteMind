import React from 'react'

export default function MetricsCard({ title, value, unit, icon: Icon, trend, color = 'brand' }) {
  const colorMap = {
    brand: 'from-brand-600/20 to-sky-500/10 text-brand-400 border-brand-500/20',
    emerald: 'from-emerald-600/20 to-teal-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-600/20 to-yellow-500/10 text-amber-400 border-amber-500/20',
    purple: 'from-purple-600/20 to-indigo-500/10 text-purple-400 border-purple-500/20',
  }

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.brand} border`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline space-x-1.5">
        <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>

      {trend && (
        <div className="mt-2 text-xs text-emerald-400 flex items-center font-medium">
          <span>{trend}</span>
        </div>
      )}
    </div>
  )
}
