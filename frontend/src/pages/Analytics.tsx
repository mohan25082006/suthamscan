import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { UserCheck, ShieldAlert, TrendingUp, Zap, BarChart3, Users } from 'lucide-react';

export default function Analytics() {
    const [stats, setStats] = useState({ totalScans: 0, flaggedScans: 0, activeWorkers: 0 });
    const [loading, setLoading] = useState(true);

    // Stable random values — computed once, not on every re-render
    const sectorCoverage = useMemo(() => [1, 2, 3, 4].map(() => Math.floor(Math.random() * 20 + 80)), []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/stats');
                if (res.data.success) {
                    setStats(res.data.data);
                }
            } catch (err) {
                setStats({ totalScans: 140, flaggedScans: 3, activeWorkers: 45 });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const routeCompletion = ((stats.totalScans - stats.flaggedScans) / Math.max(stats.totalScans, 1) * 100).toFixed(1);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="pulse-active" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Loading Analytics...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Analytics Engine</h1>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Advanced Performance Metrics & Strategic Coverage Analysis</p>
                </div>
                <div className="glass-card" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <BarChart3 size={20} color="var(--accent-primary)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>REAL-TIME ANALYSIS</span>
                </div>
            </div>

            <div className="stats-grid">
                <div className="glass-card stat-card">
                    <div className="stat-icon-wrapper blue">
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="stat-label">System Health</p>
                        <p className="stat-value">99.9%</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700, marginTop: '0.5rem' }}>
                            <TrendingUp size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> +0.2% vs avg
                        </p>
                    </div>
                </div>
                <div className="glass-card stat-card">
                    <div className="stat-icon-wrapper emerald">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="stat-label">Route Completion</p>
                        <p className="stat-value text-emerald-400">{routeCompletion}%</p>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '1rem', overflow: 'hidden' }}>
                            <div style={{ width: `${routeCompletion}%`, height: '100%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserCheck size={16} /> Workforce Distribution
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                            <div key={i} style={{ flex: 1, position: 'relative' }}>
                                <div style={{
                                    height: `${h}%`,
                                    background: i === 3 ? 'var(--accent-primary)' : 'rgba(59, 130, 246, 0.2)',
                                    borderRadius: '0.5rem 0.5rem 0 0',
                                    transition: 'all 0.5s ease',
                                    boxShadow: i === 3 ? '0 0 20px var(--accent-glow)' : 'none'
                                }}></div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                        <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldAlert size={16} /> Security Anomaly Trends
                    </h3>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div className="stat-icon-wrapper rose" style={{ width: '50px', height: '50px' }}>
                                <ShieldAlert size={20} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.flaggedScans} anomalies</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Isolated in the last 24 hours</p>
                            </div>
                        </div>
                        <div style={{ padding: '1rem', borderRadius: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                            <p style={{ fontSize: '0.8rem', color: '#fb7185', fontWeight: 600 }}>Critical: High risk cluster detected in Anna Nagar sector.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <h3 className="stat-label">Predictive Resource Optimization</h3>
                <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {sectorCoverage.map((coverage, i) => (
                        <div key={i} style={{ padding: '1rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Sector 0{i + 1}</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{coverage}%</p>
                            <p style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: 600 }}>OPTIMAL</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
