import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { ShieldCheck, Map, BarChart3, ListFilter, Activity } from 'lucide-react';
import LiveMonitoring from './pages/LiveMonitoring';
import Analytics from './pages/Analytics';
import AuditView from './pages/AuditView';

function Sidebar() {
    return (
        <div className="sidebar">
            <div className="logo">
                <ShieldCheck size={28} color="#3b82f6" />
                <span>SuthamScan Admin</span>
            </div>

            <nav className="nav-links mt-8">
                <NavLink to="/live" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <Map size={20} />
                    <span>Live Monitoring</span>
                </NavLink>
                <NavLink to="/analytics" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <BarChart3 size={20} />
                    <span>Analytics</span>
                </NavLink>
                <NavLink to="/audit" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <ListFilter size={20} />
                    <span>Audit Logs</span>
                </NavLink>
            </nav>

            <div style={{ marginTop: 'auto' }} className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity className="text-emerald-400" size={18} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>System Online</span>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <div className="app-container">
                <Sidebar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Navigate to="/live" replace />} />
                        <Route path="/live" element={<LiveMonitoring />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/audit" element={<AuditView />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
