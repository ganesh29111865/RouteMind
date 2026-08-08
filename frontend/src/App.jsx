import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SidebarNav from './components/SidebarNav'
import Header from './components/Header'

import Dashboard from './pages/Dashboard'
import RouteMapPage from './pages/RouteMapPage'
import UploadDatasetPage from './pages/UploadDatasetPage'
import RouteDetailsPage from './pages/RouteDetailsPage'
import SupervisorApprovalPage from './pages/SupervisorApprovalPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-dark-900 text-slate-100 font-sans antialiased">
        <SidebarNav />
        <div className="flex-1 flex flex-col min-w-0">
          <Header 
            title="RouteMind Optimization Platform" 
            subtitle="AI-Powered Supply Chain Routing under Indian Logistics Constraints" 
          />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/map" element={<RouteMapPage />} />
              <Route path="/upload" element={<UploadDatasetPage />} />
              <Route path="/routes" element={<RouteDetailsPage />} />
              <Route path="/approvals" element={<SupervisorApprovalPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}
