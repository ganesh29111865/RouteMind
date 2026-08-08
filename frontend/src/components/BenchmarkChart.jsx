import React, { useState } from 'react';
import { BarChart3, TrendingUp, Zap, Award, CheckCircle2, Clock, Navigation, Cpu } from 'lucide-react';
import { runBenchmark } from '../services/api';

export default function BenchmarkChart({ selectedRouteId }) {
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRunBenchmark = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await runBenchmark(selectedRouteId);
      setBenchmarkData(data);
    } catch (err) {
      setError('Benchmark error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const solvers = benchmarkData?.solvers;
  const metrics = benchmarkData?.metrics_comparison;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Solver Performance Benchmark Suite
          </h2>
        </div>

        <button
          onClick={handleRunBenchmark}
          disabled={loading}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md transition disabled:opacity-50"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{loading ? 'Running Benchmark...' : 'Benchmark vs Naive & OR-Tools'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs">
          {error}
        </div>
      )}

      {!benchmarkData && !loading && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
          Click 'Benchmark vs Naive & OR-Tools' to evaluate spatial efficiency, duration reduction, and violation rates.
        </div>
      )}

      {benchmarkData && (
        <>
          {/* Key Savings Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
              <div className="flex items-center justify-between text-emerald-400 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Distance Optimization</span>
                <Award className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-emerald-400">-{metrics?.distance_saved_pct}%</p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Saved {metrics?.distance_saved_km} km vs Naive route
              </p>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-xl">
              <div className="flex items-center justify-between text-cyan-400 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Time Reduction</span>
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-cyan-400">-{metrics?.time_saved_pct}%</p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Saved {metrics?.time_saved_min} mins transit time
              </p>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl">
              <div className="flex items-center justify-between text-indigo-400 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Computational Speed</span>
                <Cpu className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-indigo-300">
                {solvers?.routemind_constrained?.runtime_ms} ms
              </p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Sub-second OR-Tools execution
              </p>
            </div>
          </div>

          {/* Comparative Results Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Routing Strategy</th>
                  <th className="py-3 px-4">Distance (km)</th>
                  <th className="py-3 px-4">Duration (min)</th>
                  <th className="py-3 px-4">Violations</th>
                  <th className="py-3 px-4">Runtime (ms)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {/* Naive Routing Row */}
                <tr className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-slate-300">
                    Naive Sequential (1..N)
                  </td>
                  <td className="py-3 px-4 text-slate-200">{solvers?.naive?.summary?.total_distance_km} km</td>
                  <td className="py-3 px-4 text-slate-200">{solvers?.naive?.summary?.total_duration_min} min</td>
                  <td className="py-3 px-4 text-amber-400 font-bold">
                    {solvers?.naive?.summary?.time_window_violations + solvers?.naive?.summary?.cod_limit_violations + solvers?.naive?.summary?.zone_violations} Violations
                  </td>
                  <td className="py-3 px-4 text-slate-400">{solvers?.naive?.runtime_ms} ms</td>
                  <td className="py-3 px-4 text-slate-500">Unoptimized Baseline</td>
                </tr>

                {/* Unconstrained OR-Tools Row */}
                <tr className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-blue-400">
                    OR-Tools Unconstrained VRP
                  </td>
                  <td className="py-3 px-4 text-white font-bold">{solvers?.unconstrained_ortools?.summary?.total_distance_km} km</td>
                  <td className="py-3 px-4 text-white font-bold">{solvers?.unconstrained_ortools?.summary?.total_duration_min} min</td>
                  <td className="py-3 px-4 text-slate-400">0 (Ignored)</td>
                  <td className="py-3 px-4 text-indigo-300 font-bold">{solvers?.unconstrained_ortools?.runtime_ms} ms</td>
                  <td className="py-3 px-4 text-blue-400 font-semibold">Pure Spatial VRP</td>
                </tr>

                {/* RouteMind Constrained Engine Row */}
                <tr className="bg-cyan-500/10 hover:bg-cyan-500/20 transition border-l-4 border-l-cyan-500">
                  <td className="py-3 px-4 font-black text-cyan-300 flex items-center space-x-1.5">
                    <Zap className="w-4 h-4 fill-cyan-400" />
                    <span>RouteMind Indian Constrained Engine</span>
                  </td>
                  <td className="py-3 px-4 text-cyan-200 font-black">{solvers?.routemind_constrained?.summary?.total_distance_km} km</td>
                  <td className="py-3 px-4 text-cyan-200 font-black">{solvers?.routemind_constrained?.summary?.total_duration_min} min</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">
                    {solvers?.routemind_constrained?.summary?.time_window_violations + solvers?.routemind_constrained?.summary?.cod_limit_violations + solvers?.routemind_constrained?.summary?.zone_violations} Tracked
                  </td>
                  <td className="py-3 px-4 text-cyan-300 font-bold">{solvers?.routemind_constrained?.runtime_ms} ms</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">Production Ready</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
