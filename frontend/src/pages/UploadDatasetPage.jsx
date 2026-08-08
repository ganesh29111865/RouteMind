import React, { useState } from 'react'
import { UploadCloud, FileText, CheckCircle, Database, Play } from 'lucide-react'
import { uploadDataset, optimizeRoute } from '../api'

export default function UploadDatasetPage() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [optimizedRoute, setOptimizedRoute] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadDataset(file)
      setResult(res)
    } catch (err) {
      alert("Upload failed: " + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleRunOptimizer = async () => {
    try {
      const opt = await optimizeRoute({ dataset_id: result?.dataset_id || 'ds_default' })
      setOptimizedRoute(opt)
    } catch (err) {
      alert("Optimization failed: " + err.message)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h3 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <UploadCloud className="w-6 h-6 text-brand-400" />
          <span>Amazon Routing Research Dataset Loader</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Upload JSON/CSV route files from the Amazon Last Mile Routing Challenge or load sample dataset
        </p>
      </div>

      {/* File Dropzone */}
      <div className="glass-panel p-10 rounded-2xl border-2 border-dashed border-slate-700 hover:border-brand-500/50 transition-all text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 mx-auto flex items-center justify-center border border-brand-500/20">
          <FileText className="w-8 h-8" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-200">Select Amazon Dataset File</h4>
          <p className="text-xs text-slate-400 mt-1">Supports JSON or CSV containing route sequences, packages, and coordinates</p>
        </div>

        <input 
          type="file" 
          id="dataset-file-input"
          accept=".json,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex justify-center space-x-3 pt-2">
          <label 
            htmlFor="dataset-file-input"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 transition-colors"
          >
            Browse Files
          </label>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`px-6 py-2.5 rounded-xl text-xs font-semibold text-white transition-all ${
              !file || uploading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/20'
            }`}
          >
            {uploading ? 'Processing...' : 'Upload & Parse'}
          </button>
        </div>

        {file && (
          <p className="text-xs font-mono text-emerald-400 pt-2">Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
        )}
      </div>

      {/* Dataset Result Preview */}
      {result && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Dataset Parsed Successfully</span>
            </h4>
            <span className="font-mono text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              ID: {result.dataset_id}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center py-2">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Routes Found</span>
              <p className="text-lg font-bold text-white mt-1">{result.route_count}</p>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Total Delivery Stops</span>
              <p className="text-lg font-bold text-brand-400 mt-1">{result.stop_count}</p>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Status</span>
              <p className="text-lg font-bold text-emerald-400 mt-1">Ready for OR-Tools</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleRunOptimizer}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run Google OR-Tools Optimizer</span>
            </button>
          </div>
        </div>
      )}

      {/* Optimization Output Summary */}
      {optimizedRoute && (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
          <h4 className="font-bold text-emerald-400 text-sm flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>OR-Tools Optimization Complete</span>
          </h4>
          <div className="grid grid-cols-4 gap-4 text-xs text-slate-300">
            <div>Route ID: <strong className="font-mono text-white">{optimizedRoute.route_id}</strong></div>
            <div>Distance: <strong className="text-brand-400">{optimizedRoute.total_distance_km} km</strong></div>
            <div>Travel Time: <strong className="text-emerald-400">{optimizedRoute.total_travel_time_min} min</strong></div>
            <div>Solver: <strong className="text-amber-400">{optimizedRoute.solver_used}</strong></div>
          </div>
        </div>
      )}
    </div>
  )
}
