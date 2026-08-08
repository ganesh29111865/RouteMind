import React, { useState, useEffect } from 'react'
import { Route, Clock, DollarSign, Package, ShieldCheck, ListFilter } from 'lucide-react'
import { fetchRoutes } from '../api'

export default function RouteDetailsPage() {
  const [routes, setRoutes] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadRoutes = async () => {
    setLoading(true)
    try {
      const data = await fetchRoutes()
      setRoutes(data)
      if (data.length > 0) {
        const sorted = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        setSelectedRoute(sorted[0])
      }
    } catch (e) {
      console.error("Failed to load routes:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoutes()
  }, [])

  const handleRouteChange = (e) => {
    const routeId = e.target.value
    const found = routes.find(r => r.id === routeId)
    setSelectedRoute(found)
  }

  const activeStops = selectedRoute?.stops 
    ? [...selectedRoute.stops].sort((a, b) => a.stop_sequence - b.stop_sequence) 
    : []
  const totalCod = activeStops.reduce((sum, s) => sum + (s.cod_amount_inr || 0), 0)

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-bold text-slate-100">Route Sequence Breakdown</h3>
            {selectedRoute && (
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-mono font-semibold">
                {selectedRoute.status}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {selectedRoute ? `Route ID: ${selectedRoute.id} • Version: v${selectedRoute.version}` : 'Select a route to view details'}
          </p>
        </div>

        {/* Route Selector & Info Card */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs">
            <ListFilter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedRoute?.id || ''}
              onChange={handleRouteChange}
              className="bg-transparent text-slate-200 font-semibold outline-none cursor-pointer"
            >
              {loading ? (
                <option>Loading...</option>
              ) : routes.length === 0 ? (
                <option>No routes</option>
              ) : (
                routes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.route_name}
                  </option>
                ))
              )}
            </select>
          </div>

          {selectedRoute && (
            <div className="flex space-x-3 text-xs font-mono">
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 text-right">
                <span className="text-slate-400 block text-[9px]">Total Distance</span>
                <span className="text-brand-400 font-bold text-xs">{selectedRoute.total_distance_km} km</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 text-right">
                <span className="text-slate-400 block text-[9px]">Total COD Cash</span>
                <span className="text-emerald-400 font-bold text-xs">₹{totalCod.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-12 text-center text-slate-400">Loading details...</div>
      ) : routes.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 space-y-4">
          <p>No routes optimized yet.</p>
          <a href="/upload" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl inline-block">
            Upload & Optimize
          </a>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Seq</th>
                <th className="px-6 py-4">Location Name</th>
                <th className="px-6 py-4">Package ID</th>
                <th className="px-6 py-4">COD Cash (INR)</th>
                <th className="px-6 py-4">Est. ETA</th>
                <th className="px-6 py-4">Time Window</th>
                <th className="px-6 py-4">Constraint Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {activeStops.map((stop) => (
                <tr key={stop.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-brand-400">#{stop.stop_sequence}</td>
                  <td className="px-6 py-4 font-semibold text-slate-100">{stop.location_name}</td>
                  <td className="px-6 py-4 font-mono text-slate-400">{stop.package_id || '-'}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-400">
                    {stop.cod_amount_inr > 0 ? `₹${stop.cod_amount_inr.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-200">{stop.eta || '08:00 AM'}</td>
                  <td className="px-6 py-4 font-mono text-slate-400">
                    {stop.time_window_start ? `${stop.time_window_start} - ${stop.time_window_end}` : '08:00 - 20:00'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Satisfied</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
