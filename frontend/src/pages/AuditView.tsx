import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';

interface ScanEvent {
    id: string;
    worker_name: string;
    timestamp: string;
    validation_status: string;
    fraud_score: number;
    distance_from_target: number;
    rejection_reason: string | null;
}

export default function AuditView() {
    const [scans, setScans] = useState<ScanEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch logs
        axios.get('http://localhost:5000/api/admin/scans')
            .then(res => {
                if (res.data.success) {
                    setScans(res.data.data);
                }
            })
            .catch(err => {
                // Mock data if backend not available
                setScans([
                    { id: '1', worker_name: 'John Doe', timestamp: new Date().toISOString(), validation_status: 'VALID', fraud_score: 0, distance_from_target: 2.1, rejection_reason: null },
                    { id: '2', worker_name: 'Jane Smith', timestamp: new Date(Date.now() - 3600000).toISOString(), validation_status: 'FRAUD_FLAGGED', fraud_score: 80, distance_from_target: 3.5, rejection_reason: 'Unrealistic speed detected' },
                    { id: '3', worker_name: 'John Doe', timestamp: new Date(Date.now() - 7200000).toISOString(), validation_status: 'INVALID_DISTANCE', fraud_score: 100, distance_from_target: 15.2, rejection_reason: 'Scan too far from target' },
                ]);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Audit Logs</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Immutable record of all QR scan events and fraud validations.</p>
                </div>
            </div>

            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem' }}>Recent Activity</h3>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Search size={16} color="var(--text-secondary)" style={{ marginRight: '0.5rem' }} />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.875rem' }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading logs...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Worker</th>
                                    <th>Status</th>
                                    <th>Distance</th>
                                    <th>Fraud Score</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scans.map(scan => {
                                    let badgeClass = 'badge valid';
                                    if (scan.validation_status === 'VALID') badgeClass = 'badge valid';
                                    else if (scan.validation_status === 'FRAUD_FLAGGED' || scan.fraud_score > 50) badgeClass = 'badge warning';
                                    else badgeClass = 'badge fraud';

                                    return (
                                        <tr key={scan.id}>
                                            <td>{new Date(scan.timestamp).toLocaleString()}</td>
                                            <td style={{ fontWeight: 500 }}>{scan.worker_name}</td>
                                            <td><span className={badgeClass}>{scan.validation_status}</span></td>
                                            <td>{scan.distance_from_target?.toFixed(2) || '0.00'}m</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{
                                                            height: '100%',
                                                            width: `${scan.fraud_score}%`,
                                                            background: scan.fraud_score > 50 ? 'var(--danger)' : 'var(--success)'
                                                        }}></div>
                                                    </div>
                                                    <span style={{ fontSize: '0.875rem' }}>{scan.fraud_score}</span>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{scan.rejection_reason || '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
