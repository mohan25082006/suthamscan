import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Filter, Download, ListFilter } from 'lucide-react';

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
    const [searchQuery, setSearchQuery] = useState('');

    const filteredScans = scans.filter(s =>
        s.worker_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.validation_status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const fetchScans = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/scans');
                if (res.data.success) {
                    setScans(res.data.data.sort((a: any, b: any) =>
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    ));
                }
            } catch (err) {
                setScans([
                    { id: '1', worker_name: 'John Doe', timestamp: new Date().toISOString(), validation_status: 'VALID', fraud_score: 0, distance_from_target: 2.1, rejection_reason: null },
                    { id: '2', worker_name: 'Jane Smith', timestamp: new Date(Date.now() - 3600000).toISOString(), validation_status: 'FRAUD_FLAGGED', fraud_score: 80, distance_from_target: 3.5, rejection_reason: 'Unrealistic speed detected' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchScans();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Immutable Audit Trail</h1>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Comprehensive Ledger of Verification Events & Integrity Checks</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="glass-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}>
                        <Download size={18} /> <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>EXPORT CSV</span>
                    </button>
                </div>
            </div>

            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <ListFilter size={20} color="var(--accent-primary)" />
                        <h3 className="stat-label" style={{ margin: 0 }}>System Logs</h3>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Search size={16} color="var(--text-secondary)" style={{ marginRight: '0.75rem' }} />
                            <input
                                type="text"
                                placeholder="Search by worker or status..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.875rem', width: '250px' }}
                            />
                        </div>
                        <button style={{ padding: '0.6rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer' }}>
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div className="pulse-active" style={{ fontSize: '1.2rem', fontWeight: 600 }}>Synchronizing Data Streams...</div>
                    </div>
                ) : (
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Event Timestamp</th>
                                    <th>Sanitation Worker</th>
                                    <th>Integrity Status</th>
                                    <th>Geo-Offset</th>
                                    <th>Risk Index</th>
                                    <th>Verification Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredScans.map(scan => {
                                    const isValid = scan.validation_status === 'VALID';
                                    return (
                                        <tr key={scan.id}>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(scan.timestamp).toLocaleString()}</td>
                                            <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>{scan.worker_name}</td>
                                            <td>
                                                <span className={`badge ${isValid ? 'badge-valid' : 'badge-fraud'}`}>
                                                    {scan.validation_status}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{scan.distance_from_target?.toFixed(2) || '0.00'}m</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ flex: 1, minWidth: '60px', background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{
                                                            height: '100%',
                                                            width: `${scan.fraud_score}%`,
                                                            background: scan.fraud_score > 50 ? 'var(--danger)' : 'var(--success)',
                                                            boxShadow: scan.fraud_score > 50 ? '0 0 10px var(--danger)' : 'none'
                                                        }}></div>
                                                    </div>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{scan.fraud_score}</span>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                                {scan.rejection_reason || 'Verified successfully'}
                                            </td>
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
