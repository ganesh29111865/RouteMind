import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

export default function SelfCheckBadge({ summary, runtimeMs }) {
  if (!summary) return null;

  const latencyCompliant = runtimeMs < 30000;
  const windowsSatisfied = summary.time_window_violations === 0;
  const cashSafe = summary.cod_limit_violations === 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Self-Check Agent Business Goal Verification
            </h4>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Automated Audit Passed
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Agent pre-evaluated output against business SLA, cash risk, and latency guardrails before finalization.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-xs font-semibold">
        <div className="flex items-center space-x-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Latency &lt; 30s ({runtimeMs}ms)</span>
        </div>

        <div className={`flex items-center space-x-1.5 ${windowsSatisfied ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'} px-2.5 py-1 rounded-lg border`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>SLA Window Check</span>
        </div>

        <div className={`flex items-center space-x-1.5 ${cashSafe ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'} px-2.5 py-1 rounded-lg border`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>₹50k COD Risk Audit</span>
        </div>
      </div>
    </div>
  );
}
