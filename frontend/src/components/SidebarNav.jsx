import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Map, 
  UploadCloud, 
  Route as RouteIcon, 
  ShieldCheck, 
  BarChart3, 
  Sliders 
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Interactive Map', path: '/map', icon: Map },
  { name: 'Upload Dataset', path: '/upload', icon: UploadCloud },
  { name: 'Route Details', path: '/routes', icon: RouteIcon },
  { name: 'Supervisor Approval', path: '/approvals', icon: ShieldCheck, badge: 'Active' },
  { name: 'Analytics & Benchmark', path: '/analytics', icon: BarChart3 },
  { name: 'Indian Constraints', path: '/settings', icon: Sliders },
]

export default function SidebarNav() {
  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <RouteIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 tracking-wide text-lg leading-none">RouteMind</h1>
            <span className="text-[10px] text-sky-400 font-mono font-medium tracking-wider uppercase">AI Supply Chain</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Optimization Engine</span>
            <span className="text-emerald-400 font-mono font-semibold">OR-Tools</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Constraints Profile</span>
            <span className="text-amber-400 font-mono">India Metro</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
