import React from 'react';
import { Sliders, ShieldCheck, Clock, Banknote, MapPin, AlertCircle } from 'lucide-react';

export default function ConstraintPanel({ constraints, onChange, onApply }) {
  const toggleConstraint = (key) => {
    onChange({
      ...constraints,
      [key]: !constraints[key]
    });
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Indian Logistics Constraints Engine
          </h2>
        </div>
        <button
          onClick={onApply}
          className="text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg font-semibold transition"
        >
          Re-Solve Constraints
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Time Windows Constraint Toggle */}
        <div
          onClick={() => toggleConstraint('enforce_time_windows')}
          className={`p-3.5 rounded-lg border cursor-pointer transition flex items-start justify-between ${
            constraints.enforce_time_windows
              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
              : 'bg-slate-800/40 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-start space-x-3">
            <Clock className={`w-5 h-5 mt-0.5 ${constraints.enforce_time_windows ? 'text-cyan-400' : 'text-slate-500'}`} />
            <div>
              <p className="text-xs font-bold text-white">Delivery Time Windows</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Strict customer arrival time slots</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={constraints.enforce_time_windows}
            onChange={() => {}}
            className="rounded accent-cyan-500 mt-1 cursor-pointer"
          />
        </div>

        {/* COD Cash Limit Constraint Toggle */}
        <div
          onClick={() => toggleConstraint('enforce_cod_limit')}
          className={`p-3.5 rounded-lg border cursor-pointer transition flex items-start justify-between ${
            constraints.enforce_cod_limit
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
              : 'bg-slate-800/40 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-start space-x-3">
            <Banknote className={`w-5 h-5 mt-0.5 ${constraints.enforce_cod_limit ? 'text-emerald-400' : 'text-slate-500'}`} />
            <div>
              <p className="text-xs font-bold text-white">COD Cash Limit (₹50k)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Max ₹50,000 cash carry limit</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={constraints.enforce_cod_limit}
            onChange={() => {}}
            className="rounded accent-emerald-500 mt-1 cursor-pointer"
          />
        </div>

        {/* Vehicle Zone Restrictions Toggle */}
        <div
          onClick={() => toggleConstraint('enforce_zone_restrictions')}
          className={`p-3.5 rounded-lg border cursor-pointer transition flex items-start justify-between ${
            constraints.enforce_zone_restrictions
              ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-200'
              : 'bg-slate-800/40 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-start space-x-3">
            <MapPin className={`w-5 h-5 mt-0.5 ${constraints.enforce_zone_restrictions ? 'text-indigo-400' : 'text-slate-500'}`} />
            <div>
              <p className="text-xs font-bold text-white">Zone Peak Bans</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Commercial entry ban hours</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={constraints.enforce_zone_restrictions}
            onChange={() => {}}
            className="rounded accent-indigo-500 mt-1 cursor-pointer"
          />
        </div>

        {/* Legal Hours & Breaks Toggle */}
        <div
          onClick={() => toggleConstraint('enforce_legal_hours')}
          className={`p-3.5 rounded-lg border cursor-pointer transition flex items-start justify-between ${
            constraints.enforce_legal_hours
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
              : 'bg-slate-800/40 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-start space-x-3">
            <ShieldCheck className={`w-5 h-5 mt-0.5 ${constraints.enforce_legal_hours ? 'text-amber-400' : 'text-slate-500'}`} />
            <div>
              <p className="text-xs font-bold text-white">Legal Shift & Breaks</p>
              <p className="text-[11px] text-slate-400 mt-0.5">8h max shift & 30m break after 4h</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={constraints.enforce_legal_hours}
            onChange={() => {}}
            className="rounded accent-amber-500 mt-1 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
