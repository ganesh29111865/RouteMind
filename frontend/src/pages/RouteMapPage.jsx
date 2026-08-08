import React, { useState, useEffect } from 'react'
import RouteMap from '../components/RouteMap'
import { MapPin, Navigation, Clock, ShieldCheck, ListFilter } from 'lucide-react'
import { fetchRoutes } from '../api'

export default function RouteMapPage() {
  const [routes, setRoutes] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [selectedStop, setSelectedStop] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadRoutes = async () => {
    setLoading(true)
    try {
      const data = await fetchRoutes()
      setRoutes(data)
      if (data.length > 0) {
        // Default to the most recently created route
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
    setSelectedStop(null)
  }

  const activeStops = selectedRoute?.stops || []

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-brand-400" />
            <span>Interactive Supply Chain Route Viewer</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial trace powered by OpenStreetMap & Google OR-Tools exact sequence generator
          </p>
        </div>

        {/* Route Selector Dropdown */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <ListFilter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedRoute?.id || ''}
              onChange={handleRouteChange}
              className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer"
            >
              {loading ? (
                <option>Loading routes...</option>
              ) : routes.length === 0 ? (
                <option>No optimized routes found</option>
              ) : (
                routes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.route_name} ({r.stops.length} stops)
                  </option>
                ))
              )}
            </select>
          </div>

          {selectedRoute && (
            <div className="flex space-x-2 text-xs font-mono">
              <span className="px-3 py-2 rounded-xl bg-dark-800 border border-slate-700 text-slate-300">
                Distance: <strong className="text-brand-400">{selectedRoute.total_distance_km} km</strong>
              </span>
              <span className="px-3 py-2 rounded-xl bg-dark-800 border border-slate-700 text-slate-300">
                Time: <strong className="text-emerald-400">{selectedRoute.total_travel_time_min} min</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="glass-panel h-[600px] rounded-2xl flex items-center justify-center text-slate-400">
          Loading route map...
        </div>
      ) : routes.length === 0 ? (
        <div className="glass-panel h-[600px] rounded-2xl flex flex-col items-center justify-center text-slate-400 space-y-4">
          <p>No active optimized routes available.</p>
          <a href="/upload" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl">
            Upload & Optimize Route
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <RouteMap stops={activeStops} activeStopId={selectedStop?.id} height="600px" />
          </div>

          {/* Side Stops Sidebar */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 max-h-[600px] overflow-y-auto">
            <h4 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Route Sequence ({activeStops.length})</span>
              <span className="text-xs font-normal text-slate-400">Version v{selectedRoute.version}</span>
            </h4>

            <div className="space-y-3">
              {activeStops.map((stop) => (
                <div 
                  key={stop.id}
                  onClick={() => setSelectedStop(stop)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedStop?.id === stop.id 
                      ? 'bg-brand-600/20 border-brand-500/50 text-white' 
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-brand-400">Stop #{stop.stop_sequence}</span>
                    <span className="font-mono text-slate-400">{stop.eta}</span>
                  </div>
                  <h5 className="font-semibold text-sm leading-snug">{stop.location_name}</h5>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>Pkg: {stop.package_id || 'N/A'}</span>
                    {stop.cod_amount_inr > 0 && <span className="text-emerald-400 font-semibold">COD: ₹{stop.cod_amount_inr}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
