import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, Map, BarChart3, ListFilter, Settings as SettingsIcon, LogOut } from 'lucide-react';
import LiveMonitoring from './pages/LiveMonitoring';
import Analytics from './pages/Analytics';
import AuditView from './pages/AuditView';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/Settings';
import axios from 'axios';

// Add global axios interceptor for auth
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem('adminToken');
    if (!token) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function Sidebar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <div className="logo">
                <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <ShieldCheck size={28} color="#3b82f6" />
                </div>
                <span>SuthamScan</span>
            </div>

            <nav className="nav-links" style={{ marginTop: '1rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>COMMAND CENTER</p>
                <NavLink to="/live" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <Map size={20} />
                    <span>Live Monitoring</span>
                </NavLink>
                <NavLink to="/analytics" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <BarChart3 size={20} />
                    <span>Analytics Engine</span>
                </NavLink>
                <NavLink to="/audit" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <ListFilter size={20} />
                    <span>Immutable Logs</span>
                </NavLink>
            </nav>

            <nav className="nav-links" style={{ marginTop: '2rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>MANAGEMENT</p>
                <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <SettingsIcon size={20} />
                    <span>Settings</span>
                </NavLink>
            </nav>

            <div style={{ marginTop: 'auto' }}>
                <div className="glass-card" style={{ padding: '1rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>AD</div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user.name || 'Admin'}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Super Admin</p>
                        </div>
                        <LogOut size={16} color="var(--text-secondary)" style={{ cursor: 'pointer' }} onClick={handleLogout} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/live" replace />} />

                <Route path="/live" element={
                    <ProtectedRoute>
                        <MainLayout><LiveMonitoring /></MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="/analytics" element={
                    <ProtectedRoute>
                        <MainLayout><Analytics /></MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="/audit" element={
                    <ProtectedRoute>
                        <MainLayout><AuditView /></MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="/settings" element={
                    <ProtectedRoute>
                        <MainLayout><SettingsPage /></MainLayout>
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
