import React, { useState } from 'react';
import { Zap, AlertTriangle, XCircle, PlusCircle, Play } from 'lucide-react';

export default function SimulationControls({ stops, onSimulateEvent, loading }) {
  const [selectedEventType, setSelectedEventType] = useState('traffic_delay');
  const [selectedStopId, setSelectedStopId] = useState(stops?.[1]?.stop_id || '');
  const [delayMinutes, setDelayMinutes] = useState(45);

  const handleRunSimulation = () => {
    let eventPayload = {
      event_id: `EVT_${Date.now()}`,
      event_type: selectedEventType,
      stop_id: selectedStopId,
      delay_minutes: delayMinutes,
      reason: selectedEventType === 'traffic_delay' ? 'Heavy Peak-Hour Traffic Jam' : selectedEventType === 'failed_delivery' ? 'Customer Gate Lock / Absent' : 'Urgent VIP Express Pickup Request'
    };

    onSimulateEvent(eventPayload);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Real-Time Logistics Exception Simulator
          </h2>
        </div>
        <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-semibold">
          Dynamic Re-planning Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Scenario Selection Cards */}
        <button
          type="button"
          onClick={() => setSelectedEventType('traffic_delay')}
          className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 ${
            selectedEventType === 'traffic_delay'
              ? 'bg-amber-500/10 border-amber-500 text-amber-200 ring-1 ring-amber-500/40'
              : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <AlertTriangle className={`w-5 h-5 mt-0.5 ${selectedEventType === 'traffic_delay' ? 'text-amber-400' : 'text-slate-500'}`} />
          <div>
            <p className="text-xs font-bold text-white">Traffic Congestion</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Inject travel delay on active segment</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedEventType('failed_delivery')}
          className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 ${
            selectedEventType === 'failed_delivery'
              ? 'bg-red-500/10 border-red-500 text-red-200 ring-1 ring-red-500/40'
              : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <XCircle className={`w-5 h-5 mt-0.5 ${selectedEventType === 'failed_delivery' ? 'text-red-400' : 'text-slate-500'}`} />
          <div>
            <p className="text-xs font-bold text-white">Failed Delivery</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Customer unavailable exception</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedEventType('new_pickup')}
          className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 ${
            selectedEventType === 'new_pickup'
              ? 'bg-indigo-500/10 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/40'
              : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <PlusCircle className={`w-5 h-5 mt-0.5 ${selectedEventType === 'new_pickup' ? 'text-indigo-400' : 'text-slate-500'}`} />
          <div>
            <p className="text-xs font-bold text-white">New Express Pickup</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Insert urgent pick stop mid-route</p>
          </div>
        </button>
      </div>

      {/* Target Parameters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
        <div className="flex flex-wrap items-center space-x-4">
          {selectedEventType !== 'new_pickup' && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-medium">Target Stop:</span>
              <select
                value={selectedStopId}
                onChange={(e) => setSelectedStopId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded focus:outline-none"
              >
                {stops?.filter(s => s.stop_type !== 'depot').map((s) => (
                  <option key={s.stop_id} value={s.stop_id}>
                    Stop #{s.sequence} ({s.stop_id} - {s.zone_id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedEventType === 'traffic_delay' && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-medium">Delay:</span>
              <select
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded focus:outline-none"
              >
                <option value={15}>+15 mins</option>
                <option value={30}>+30 mins</option>
                <option value={45}>+45 mins (Heavy Traffic)</option>
                <option value={60}>+60 mins (Roadblock)</option>
              </select>
            </div>
          )}
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={loading}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg shadow-md transition disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{loading ? 'Simulating...' : 'Simulate & Re-Plan Route'}</span>
        </button>
      </div>
    </div>
  );
}
