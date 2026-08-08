import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, ArrowRight, FileText } from 'lucide-react';

export default function ApprovalModal({
  isOpen,
  diffSummary,
  oldRoute,
  newRoute,
  onApprove,
  onReject,
  onClose,
  loading
}) {
  const [supervisorNotes, setSupervisorNotes] = useState('');

  if (!isOpen || !diffSummary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Supervisor Approval Workflow</h2>
              <p className="text-xs text-slate-400">Review AI Explanation & Proposed Route Re-Sequence</p>
            </div>
          </div>
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono px-2.5 py-1 rounded">
            ID: {diffSummary.old_route_id || 'REQ_PENDING'}
          </span>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Top Event Overview Banner */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trigger Exception</span>
              <p className="text-sm font-bold text-amber-400 capitalize mt-0.5">
                {diffSummary.event_triggered.event_type.replace('_', ' ')}
              </p>
              <p className="text-slate-300 text-xs mt-0.5">{diffSummary.event_triggered.reason}</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">API Telemetry Cost</span>
              <p className="text-sm font-mono font-bold text-indigo-300 mt-0.5">${diffSummary.api_cost_usd} USD</p>
              <p className="text-[10px] text-slate-500">Token usage logged</p>
            </div>
          </div>

          {/* Side-by-Side Operational Metric Comparison */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Side-by-Side Impact Comparison
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Old Route Column */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Active Manifest (Before)</span>
                <p className="text-base font-bold text-white mt-1">{oldRoute?.summary?.total_distance_km} km</p>
                <p className="text-slate-400 text-[11px]">{oldRoute?.summary?.total_duration_min} mins total duration</p>
                <p className="text-slate-400 text-[11px]">{oldRoute?.stops?.length - 1} Delivery Stops</p>
              </div>

              {/* Proposed Route Column */}
              <div className="bg-cyan-950/40 p-3.5 rounded-xl border border-cyan-500/30">
                <span className="text-[10px] font-bold text-cyan-400 uppercase">Proposed Manifest (After)</span>
                <p className="text-base font-bold text-cyan-300 mt-1">{newRoute?.summary?.total_distance_km} km</p>
                <p className="text-cyan-400/80 text-[11px]">{newRoute?.summary?.total_duration_min} mins total duration</p>
                <p className="text-cyan-400/80 text-[11px]">{newRoute?.stops?.length - 1} Delivery Stops</p>
              </div>
            </div>
          </div>

          {/* Natural Language AI Explanation */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              AI Supervisor Justification Summary
            </h4>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-slate-200 text-[11px] whitespace-pre-line leading-relaxed">
              {diffSummary.ai_explanation || 'No AI explanation generated.'}
            </div>
          </div>

          {/* Supervisor Notes Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Supervisor Log Notes (Optional)
            </label>
            <input
              type="text"
              value={supervisorNotes}
              onChange={(e) => setSupervisorNotes(e.target.value)}
              placeholder="e.g. Approved after confirming traffic report with dispatch center..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 transition"
          >
            Hold Review
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onReject(diffSummary.old_route_id, supervisorNotes)}
              disabled={loading}
              className="flex items-center space-x-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-4 py-2 rounded-lg transition"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject & Revert</span>
            </button>

            <button
              onClick={() => onApprove(diffSummary.old_route_id, supervisorNotes)}
              disabled={loading}
              className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-5 py-2 rounded-lg shadow-lg shadow-emerald-500/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Dispatch Route</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
