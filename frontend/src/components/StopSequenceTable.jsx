import React from 'react';
import { MapPin, Clock, Banknote, AlertTriangle, CheckCircle, Package, Truck, Check } from 'lucide-react';

export default function StopSequenceTable({ stops, isDriver, onMarkDelivered }) {
  if (!stops || stops.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">
        No optimized route stops loaded.
      </div>
    );
  }

  const formatMinToTime = (minutes) => {
    const startHour = 8;
    const totalMinutes = startHour * 60 + minutes;
    const hrs = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
    return `${displayHrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isDriver ? <Truck className="w-5 h-5 text-emerald-400" /> : <Package className="w-5 h-5 text-cyan-400" />}
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {isDriver ? 'Driver Delivery Manifest & Stop Checkoff' : `Optimized Stop Sequence (${stops.length} Stops)`}
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {isDriver ? 'Tap button to complete stop & log COD cash' : 'Sorted by Google OR-Tools VRP Solver'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Seq</th>
              <th className="py-3 px-4">Stop ID / Type</th>
              <th className="py-3 px-4">Address & Zone</th>
              <th className="py-3 px-4">ETA Window</th>
              <th className="py-3 px-4">COD Cash (₹)</th>
              <th className="py-3 px-4">Cumulative Cash</th>
              <th className="py-3 px-4">Status / Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {stops.map((stop, idx) => {
              const isDepot = stop.stop_type === 'depot';
              const isWarning = stop.status && stop.status.includes('warning');
              const isCompleted = stop.status === 'completed';
              const [twStart, twEnd] = stop.time_window;

              return (
                <tr
                  key={`${stop.stop_id}-${idx}`}
                  className={`hover:bg-slate-800/40 transition ${isCompleted ? 'bg-emerald-950/20 opacity-75' : isDepot ? 'bg-cyan-500/5' : ''}`}
                >
                  {/* Sequence # */}
                  <td className="py-3 px-4 font-bold text-slate-200">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      isCompleted ? 'bg-emerald-500 text-slate-950' : isDepot ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}>
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : stop.sequence}
                    </span>
                  </td>

                  {/* Stop ID & Type */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{stop.stop_id}</div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                      isDepot ? 'bg-cyan-500/20 text-cyan-400' : stop.stop_type === 'pickup' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {stop.stop_type}
                    </span>
                  </td>

                  {/* Address & Zone */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="text-slate-200 font-medium truncate" title={stop.address}>
                      {stop.address}
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{stop.zone_id}</span>
                    </div>
                  </td>

                  {/* ETA & Customer Window */}
                  <td className="py-3 px-4">
                    <div className="text-white font-bold">
                      {formatMinToTime(stop.estimated_arrival_min)}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Window: {formatMinToTime(twStart)} - {formatMinToTime(twEnd)}</span>
                    </div>
                  </td>

                  {/* COD Cash Amount */}
                  <td className="py-3 px-4">
                    {stop.cod_amount > 0 ? (
                      <span className="font-semibold text-emerald-400">
                        ₹{stop.cod_amount.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>

                  {/* Cumulative Cash Carry */}
                  <td className="py-3 px-4 font-medium">
                    <div className={stop.cumulative_cod > 50000 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                      ₹{stop.cumulative_cod.toLocaleString('en-IN')}
                    </div>
                    {stop.cumulative_cod > 50000 && (
                      <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wide">
                        Above ₹50k Limit
                      </span>
                    )}
                  </td>

                  {/* Compliance / Driver Action */}
                  <td className="py-3 px-4">
                    {isDriver && !isDepot && !isCompleted ? (
                      <button
                        onClick={() => onMarkDelivered(stop.stop_id)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded shadow flex items-center space-x-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Delivered</span>
                      </button>
                    ) : isCompleted ? (
                      <div className="flex items-center space-x-1 text-emerald-400 font-bold text-xs">
                        <CheckCircle className="w-4 h-4" />
                        <span>Delivered</span>
                      </div>
                    ) : isWarning ? (
                      <div className="flex items-center space-x-1.5 text-amber-400 bg-amber-500/10 px-2 py-1 rounded text-[11px] font-semibold border border-amber-500/20">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="capitalize">{stop.status.replace('warning (', '').replace(')', '')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-[11px] font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Scheduled</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
