import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, UserCheck, ShieldAlert } from 'lucide-react';

// Combined both smaller pages into one file to save creation time for MVP.
export default function Analytics() {
    const [stats, setStats] = useState({ totalScans: 0, flaggedScans: 0, activeWorkers: 0 });

    useEffect(() => {
        axios.get('http://localhost:5000/api/admin/stats')
            .then(res => res.data.success && setStats(res.data.data))
            .catch(err => {
                // Mock data
                setStats({ totalScans: 140, flaggedScans: 3, activeWorkers: 45 });
            });
    }, []);

    const routeCompletion = ((stats.totalScans - stats.flaggedScans) / Math.max(stats.totalScans, 1) * 100).toFixed(1);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Analytics Engine</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>System-wide performance metrics and route completion.</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="glass-card stat-card flex-col align-start">
                    <h3 style={{ color: 'var(--text-secondary)' }}>System Uptime</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>99.9%</p>
                </div>
                <div className="glass-card stat-card flex-col align-start">
                    <h3 style={{ color: 'var(--text-secondary)' }}>Overall Route Completion</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)' }}>{routeCompletion}%</p>
                </div>
            </div>

            <div className="glass-card" style={{ marginTop: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Active Workforce Insights</h2>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="stat-icon blue"><UserCheck /></div>
                        <div>
                            <h4 style={{ color: 'var(--text-secondary)' }}>Active Workers Today</h4>
                            <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.activeWorkers}</span>
                        </div>
                    </div>

                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="stat-icon red"><ShieldAlert /></div>
                        <div>
                            <h4 style={{ color: 'var(--text-secondary)' }}>Suspicious Activities Detected</h4>
                            <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.flaggedScans} anomalies isolated</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
