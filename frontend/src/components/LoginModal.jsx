import React, { useState } from 'react';
import { Lock, User, ShieldCheck, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { loginUser } from '../services/api';

export default function LoginModal({ isOpen, onLoginSuccess, onClose }) {
  const [email, setEmail] = useState('admin@routemind.in');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(email, password);
      onLoginSuccess(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleType) => {
    if (roleType === 'admin') {
      setEmail('admin@routemind.in');
      setPassword('admin123');
    } else {
      setEmail('driver@routemind.in');
      setPassword('driver123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20 mb-3">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black text-white">RouteMind Authentication</h2>
          <p className="text-xs text-slate-400 mt-1">Select account type or sign in to continue</p>
        </div>

        {/* Quick Account Switcher Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => handleQuickFill('admin')}
            className={`p-3 rounded-xl border text-left transition flex flex-col ${
              email.includes('admin')
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 ring-1 ring-cyan-500/30'
                : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-1.5 font-bold text-xs text-white">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Admin Supervisor</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Full control & approvals</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('driver')}
            className={`p-3 rounded-xl border text-left transition flex flex-col ${
              email.includes('driver')
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30'
                : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-1.5 font-bold text-xs text-white">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Delivery Driver</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Route & stop checkoffs</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs mb-4">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 pl-9"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 pl-9"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-cyan-500/20 text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to RouteMind'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300 font-medium"
          >
            Continue as Guest View
          </button>
        </div>
      </div>
    </div>
  );
}
