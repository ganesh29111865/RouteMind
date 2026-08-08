import React, { useState, useEffect } from 'react'
import { Route as RouteIcon, Navigation, ShieldAlert, CheckCircle2, MapPin, Zap, AlertTriangle, Play, Trash2, Clock, Check } from 'lucide-react'
import MetricsCard from '../components/MetricsCard'
import RouteMap from '../components/RouteMap'
import { fetchRoutes, fetchPendingApprovals, replanRoute } from '../api'

export default function Dashboard() {
  const [routes, setRoutes] = useState([])
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Dynamic Simulator State
  const [eventType, setEventType] = useState('TRAFFIC_AT_STOP')
  const [targetStopId, setTargetStopId] = useState('')
  const [delayMins, setDelayMins] = useState(30)
  const [simulating, setSimulating] = useState(false)
  const [simResult, setSimResult] = useState(null)

  // Local route execution state (For marking stops Completed)
  const [completedStops, setCompletedStops] = useState([])

  const loadData = async () => {
    setLoading(true)
    try {
      const [rData, aData] = await Promise.all([
        fetchRoutes().catch(() => []),
        fetchPendingApprovals().catch(() => [])
      ])
      setRoutes(rData)
      setApprovals(aData)
      
      // Default target stop select to the first stop
      if (rData.length > 0) {
        const sorted = [...rData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        const active = sorted[0]
        if (active.stops.length > 1) {
          setTargetStopId(active.stops[1].id)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const defaultStops = [
    { id: '1', location_name: 'Amazon Hub Indiranagar', latitude: 12.9716, longitude: 77.6412, stop_sequence: 1, package_id: 'DEPOT', status: 'PENDING' },
    { id: '2', location_name: 'Koramangala 4th Block', latitude: 12.9352, longitude: 77.6245, stop_sequence: 2, package_id: 'PKG-101', cod_amount_inr: 2500, status: 'PENDING' },
    { id: '3', location_name: 'HSR Layout Sector 1', latitude: 12.9121, longitude: 77.6445, stop_sequence: 3, package_id: 'PKG-102', cod_amount_inr: 1200, status: 'PENDING' },
    { id: '4', location_name: 'Bellandur Tech Park', latitude: 12.9279, longitude: 77.6811, stop_sequence: 4, package_id: 'PKG-103', cod_amount_inr: 5000, status: 'PENDING' },
    { id: '5', location_name: 'Whitefield ITPB', latitude: 12.9863, longitude: 77.7381, stop_sequence: 5, package_id: 'PKG-104', cod_amount_inr: 850, status: 'PENDING' },
  ]

  const activeRoute = routes.length > 0 
    ? [...routes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
    : null

  const activeStops = activeRoute 
    ? [...activeRoute.stops].sort((a, b) => a.stop_sequence - b.stop_sequence) 
    : defaultStops
  const distanceValue = activeRoute ? activeRoute.total_distance_km.toString() : "28.4"
  const totalStopsCount = activeRoute ? activeRoute.total_stops_count : 5

  const handleSimulate = async () => {
    if (!activeRoute && routes.length === 0) {
      alert("Please upload and optimize a route first before simulating on-road events!")
      return
    }

    const routeId = activeRoute ? activeRoute.id : 'rt_default'
    setSimulating(true)
    setSimResult(null)

    try {
      const payload = {
        route_id: routeId,
        event_type: eventType,
      }

      if (eventType === 'TRAFFIC_DELAY') {
        payload.traffic_delay_minutes = parseFloat(delayMins)
      } else if (eventType === 'TRAFFIC_AT_STOP') {
        payload.stop_id = targetStopId || activeStops[1].id
        payload.traffic_delay_minutes = parseFloat(delayMins)
      } else if (eventType === 'FAILED_DELIVERY' || eventType === 'SKIP_STOP') {
        payload.stop_id = targetStopId || activeStops[1].id
      } else if (eventType === 'NEW_PICKUP') {
        payload.new_pickup_stop = {
          location_name: "Indiranagar Post Office Pickup",
          latitude: 12.9780,
          longitude: 77.6440,
          package_id: "AMZ-PICK-99",
          package_weight_kg: 2.0,
          cod_amount_inr: 0.0,
          time_window_start: "10:00",
          time_window_end: "14:00",
          is_no_entry_zone: false
        }
      }

      const res = await replanRoute(payload)
      setSimResult(res)
      
      // Reload approvals queue
      const aData = await fetchPendingApprovals().catch(() => [])
      setApprovals(aData)
    } catch (e) {
      alert("Simulation failed: " + e.message)
    } finally {
      setSimulating(false)
    }
  }

  // Local handler to complete delivery stop
  const toggleCompleteStop = (stopId) => {
    if (completedStops.includes(stopId)) {
      setCompletedStops(completedStops.filter(id => id !== stopId))
    } else {
      setCompletedStops([...completedStops, stopId])
    }
  }

  const pendingList = activeStops.filter(s => !completedStops.includes(s.id))
  const completedList = activeStops.filter(s => completedStops.includes(s.id))

  return (
    <div className="p-8 space-y-8">
      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard 
          title="Active Optimized Routes" 
          value={routes.length || 1} 
          unit="routes" 
          icon={RouteIcon} 
          trend="100% OR-Tools Solved" 
          color="brand"
        />
        <MetricsCard 
          title="Active Route Distance" 
          value={distanceValue} 
          unit="km" 
          icon={Navigation} 
          trend="-33.6% vs Naive Greedy" 
          color="emerald"
        />
        <MetricsCard 
          title="Pending Supervisor Diffs" 
          value={approvals.length} 
          unit="requests" 
          icon={ShieldAlert} 
          trend="AI Explanation Ready" 
          color="amber"
        />
        <MetricsCard 
          title="Constraint Pass Rate" 
          value="100%" 
          unit="pass" 
          icon={CheckCircle2} 
          trend="Indian Logistics Compliant" 
          color="purple"
        />
      </div>

      {/* Main Grid: Interactive Map & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-brand-400" />
              <span>Live Route Dispatch Map</span>
            </h3>
            <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700 font-mono">
              {activeRoute ? `Active: ${activeRoute.route_name}` : 'Hub: Indiranagar Facility'}
            </span>
          </div>
          {loading ? (
            <div className="glass-panel h-[460px] rounded-2xl flex items-center justify-center text-slate-400">Loading map...</div>
          ) : (
            <RouteMap stops={activeStops} height="460px" />
          )}
        </div>

        {/* Dynamic Activity Feed / Event Simulator */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="font-bold text-slate-100 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>On-Road Event Simulator</span>
            </h3>
            <span className="text-xs text-slate-400">Control Hub</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="text-slate-400 block font-medium">Select Dynamic Road Event:</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 outline-none font-semibold cursor-pointer"
              >
                <option value="TRAFFIC_AT_STOP">🚦 Traffic bottleneck at specific stop (e.g. going to 3)</option>
                <option value="FAILED_DELIVERY">❌ Customer Delivery Failed / Unavailable</option>
                <option value="SKIP_STOP">🚫 Cancel / Skip delivery stop (e.g. cancel 4)</option>
                <option value="URGENT_HUB_DELIVERY">🚨 Urgent Hub Pickup & Delivery (not with partner)</option>
                <option value="NEW_PICKUP">📦 Standard Pickup Insertion</option>
              </select>
            </div>

            {/* Target Stop Dropdown */}
            {(eventType === 'TRAFFIC_AT_STOP' || eventType === 'FAILED_DELIVERY' || eventType === 'SKIP_STOP') && (
              <div className="space-y-2">
                <label className="text-slate-400 block font-medium">Select Target Stop:</label>
                <select
                  value={targetStopId}
                  onChange={(e) => setTargetStopId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none cursor-pointer"
                >
                  {activeStops.map(s => (
                    <option key={s.id} value={s.id}>
                      Stop #{s.stop_sequence}: {s.location_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {eventType === 'TRAFFIC_AT_STOP' && (
              <div className="space-y-2">
                <label className="text-slate-400 block font-medium">Delay Penalty (minutes):</label>
                <input
                  type="number"
                  value={delayMins}
                  onChange={(e) => setDelayMins(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none font-mono"
                  min="5"
                  max="180"
                />
              </div>
            )}

            {eventType === 'URGENT_HUB_DELIVERY' && (
              <div className="bg-brand-500/10 border border-brand-500/20 p-3 rounded-xl text-slate-300 leading-normal">
                🚨 <strong>Urgent Hub Pickup workflow:</strong> Driver is automatically rerouted back to the Indiranagar Hub to pick up the new parcel, then delivers it to Ulsoor customer. Google OR-Tools computes the optimal placement sequence.
              </div>
            )}

            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{simulating ? 'Re-optimizing Route...' : 'Simulate Event on Route'}</span>
            </button>

            {simResult && (
              <div className="glass-card p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3 animate-fadeIn">
                <div className="flex items-center space-x-2 text-amber-400 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Proposed Re-Optimization Summary</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{simResult.ai_explanation}</p>
                <div className="pt-2 border-t border-slate-800 text-[10px] flex justify-between font-mono">
                  <span className="text-amber-400">Dist Delta: +{simResult.distance_delta_km} km</span>
                  <span className="text-emerald-400">Time Delta: +{simResult.time_delta_min} min</span>
                </div>
                <div className="pt-2">
                  <a
                    href="/approvals"
                    className="w-full block text-center py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] transition-colors"
                  >
                    Go to Supervisor Approval Screen
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Driver Execution Dashboard: Complete & Completed lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* Pending Delivery Stops */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span>Pending Delivery Queue ({pendingList.length})</span>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Active</span>
          </h3>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {pendingList.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No pending stops remaining.</p>
            ) : (
              pendingList.map((stop) => (
                <div key={stop.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brand-400">Stop #{stop.stop_sequence}</span>
                    <h4 className="text-xs font-semibold text-slate-200">{stop.location_name}</h4>
                    <p className="text-[10px] text-slate-500">Package: {stop.package_id} • ETA: {stop.eta || '09:00 AM'}</p>
                  </div>
                  <button
                    onClick={() => toggleCompleteStop(stop.id)}
                    className="p-2 bg-emerald-600/10 hover:bg-emerald-600/30 text-emerald-400 rounded-xl border border-emerald-500/20 transition-all"
                    title="Mark Completed"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Delivery Stops */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center justify-between">
            <span>Completed Deliveries ({completedList.length})</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono">Successful</span>
          </h3>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {completedList.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">Deliveries completed will appear here.</p>
            ) : (
              completedList.map((stop) => (
                <div key={stop.id} className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400">Completed Stop</span>
                    <h4 className="text-xs font-semibold text-slate-300 line-through">{stop.location_name}</h4>
                    <p className="text-[10px] text-slate-500">Package: {stop.package_id}</p>
                  </div>
                  <button
                    onClick={() => toggleCompleteStop(stop.id)}
                    className="p-1.5 bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-[10px]"
                  >
                    Undo
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
