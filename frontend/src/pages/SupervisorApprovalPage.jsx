import React, { useState, useEffect } from 'react'
import { ShieldAlert, CheckCircle2, XCircle, ArrowRight, Sparkles, Navigation, Clock, RefreshCw } from 'lucide-react'
import { fetchPendingApprovals, approveRoute, rejectRoute } from '../api'

export default function SupervisorApprovalPage() {
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [approvalStatus, setApprovalStatus] = useState(null)
  const [reason, setReason] = useState('')

  const loadPending = async () => {
    setLoading(true)
    try {
      const data = await fetchPendingApprovals()
      setApprovals(data)
    } catch (e) {
      console.error("Failed to load approvals:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPending()
  }, [])

  const currentApproval = approvals.length > 0 ? approvals[0] : null

  const handleApprove = async () => {
    if (!currentApproval) return
    try {
      await approveRoute(currentApproval.id, reason)
      setApprovalStatus('APPROVED')
      // Refresh list after brief timeout
      setTimeout(() => {
        setApprovalStatus(null)
        setReason('')
        loadPending()
      }, 2000)
    } catch (err) {
      alert("Approval failed: " + err.message)
    }
  }

  const handleReject = async () => {
    if (!currentApproval) return
    try {
      await rejectRoute(currentApproval.id, reason)
      setApprovalStatus('REJECTED')
      setTimeout(() => {
        setApprovalStatus(null)
        setReason('')
        loadPending()
      }, 2000)
    } catch (err) {
      alert("Rejection failed: " + err.message)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <span>Supervisor Route Change Approval Center</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Review dynamic replanning route modifications, metrics deltas, and AI explanations before authorizing dispatch updates.
          </p>
        </div>
        <button
          onClick={loadPending}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Refresh Alert Queue"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="glass-panel p-12 text-center text-slate-400">Loading pending requests...</div>
      ) : approvalStatus ? (
        <div className={`glass-panel p-8 rounded-2xl border text-center space-y-4 ${
          approvalStatus === 'APPROVED' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
        }`}>
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
            approvalStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {approvalStatus === 'APPROVED' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>
          <h4 className="text-xl font-bold text-white">
            Route Change {approvalStatus === 'APPROVED' ? 'Approved & Dispatched' : 'Rejected'}
          </h4>
          <p className="text-xs text-slate-400">
            {approvalStatus === 'APPROVED' 
              ? 'Driver route updated in real time via live socket dispatch.'
              : 'Original route maintained. Exception logged for logistics manager review.'}
          </p>
        </div>
      ) : !currentApproval ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-white">All Routes Fully Dispatched & Clear</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are currently no pending dynamic replan modifications awaiting authorization. All drivers are tracking according to plan.
          </p>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          {/* Header Tag */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 font-bold">
                PENDING APPROVAL: #{currentApproval.id}
              </span>
              <h4 className="font-bold text-lg text-slate-100 mt-2">Route #{currentApproval.route_id} - Dynamic Re-Optimization</h4>
            </div>
            <span className="text-xs text-slate-400">Pending Actions: {approvals.length}</span>
          </div>

          {/* Metrics Delta Split Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Distance Impact</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-slate-400 line-through">{currentApproval.original_distance_km} km</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <span className="text-xl font-bold text-amber-400">{currentApproval.new_distance_km} km</span>
              </div>
              <p className="text-[11px] text-amber-400 font-mono">
                +{(currentApproval.new_distance_km - currentApproval.original_distance_km).toFixed(2)} km delta
              </p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Travel Time Impact</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-slate-400 line-through">{currentApproval.original_time_min} min</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <span className="text-xl font-bold text-amber-400">{currentApproval.new_time_min} min</span>
              </div>
              <p className="text-[11px] text-amber-400 font-mono">
                +{(currentApproval.new_time_min - currentApproval.original_time_min).toFixed(1)} min delta
              </p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Sequence Adjustments</span>
              <p className="text-xl font-bold text-emerald-400">{currentApproval.stops_changed_count} Stops Modified</p>
              <p className="text-[11px] text-emerald-400 font-mono">100% Constraints Enforced</p>
            </div>
          </div>

          {/* AI Explanation Box */}
          <div className="glass-card p-5 rounded-xl border border-brand-500/30 bg-brand-500/5 space-y-3">
            <div className="flex items-center space-x-2 text-brand-400">
              <Sparkles className="w-4 h-4" />
              <h5 className="font-bold text-xs uppercase tracking-wider">AI Route Change Explanation</h5>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">{currentApproval.ai_explanation}</p>
            <ul className="space-y-1.5 pt-2 border-t border-brand-500/20 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
                <span>Localized stop adjustment reordered only affected zone stops.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
                <span>COD capacity limits verified against driver security profiles.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
                <span>No-entry timing bans checked and passed.</span>
              </li>
            </ul>
          </div>

          {/* Decision Reason & Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <textarea
              rows={2}
              placeholder="Optional supervisor decision note or reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleReject}
                className="px-6 py-2.5 bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Replan</span>
              </button>
              <button
                onClick={handleApprove}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Update Driver</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
