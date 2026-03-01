import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { ShieldAlert, CheckCircle2, User, Clock, MapPin, Activity } from 'lucide-react';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ScanEvent {
    id: string;
    worker_name: string;
    timestamp: string;
    lat: number;
    long: number;
    target_lat: number;
    target_long: number;
    validation_status: string;
    fraud_score: number;
    distance_from_target?: number;
}

export default function LiveMonitoring() {
    const [scans, setScans] = useState<ScanEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, fraud: 0 });
    const feedRef = useRef<HTMLDivElement>(null);

    // Default center (Madurai, India)
    const defaultCenter: [number, number] = [9.9252, 78.1198];

    useEffect(() => {
        const fetchScans = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${API_URL}/api/admin/scans`);
                if (res.data.success) {
                    const sortedScans = res.data.data.sort((a: any, b: any) =>
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    );
                    setScans(sortedScans);
                    setStats({
                        total: sortedScans.length,
                        fraud: sortedScans.filter((s: any) => s.validation_status !== 'VALID').length
                    });
                }
            } catch (err) {
                console.error('Error fetching scans', err);
                const mock = [
                    { id: '1', worker_name: 'John Doe', timestamp: new Date().toISOString(), lat: 9.9195, long: 78.1193, target_lat: 9.9195, target_long: 78.1193, validation_status: 'VALID', fraud_score: 0 },
                    { id: '2', worker_name: 'Jane Smith', timestamp: new Date(Date.now() - 5000).toISOString(), lat: 9.9231, long: 78.1406, target_lat: 9.9231, target_long: 78.1406, validation_status: 'FRAUD_FLAGGED', fraud_score: 80 }
                ];
                setScans(mock);
            } finally {
                setLoading(false);
            }
        };

        fetchScans();
        const interval = setInterval(fetchScans, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Madurai Coverage Feed</h1>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Global Surveillance & Real-time Anomaly Detection</p>
                </div>
                <div className="glass-card" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="pulse-active" style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE FEED ACTIVE</span>
                </div>
            </div>

            <div className="stats-grid">
                <div className="glass-card stat-card">
                    <div className="stat-icon-wrapper blue">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="stat-label">Total Coverage</p>
                        <p className="stat-value">{stats.total}</p>
                    </div>
                </div>
                <div className="glass-card stat-card">
                    <div className="stat-icon-wrapper emerald">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="stat-label">Verified Scans</p>
                        <p className="stat-value text-emerald-400">{stats.total - stats.fraud}</p>
                    </div>
                </div>
                <div className="glass-card stat-card">
                    <div className="stat-icon-wrapper rose">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <p className="stat-label">Risk Flagged</p>
                        <p className="stat-value" style={{ color: 'var(--danger)' }}>{stats.fraud}</p>
                    </div>
                </div>
            </div>

            <div className="monitoring-layout">
                <div className="map-section">
                    <MapContainer center={defaultCenter} zoom={14} style={{ height: '100%', width: '100%', background: '#020617' }}>
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; CARTO'
                        />
                        {scans.map(scan => {
                            const isValid = scan.validation_status === 'VALID';
                            const color = isValid ? '#10b981' : '#ef4444';
                            return (
                                <React.Fragment key={scan.id}>
                                    <Circle
                                        center={[scan.lat, scan.long]}
                                        pathOptions={{ color, fillColor: color, fillOpacity: 0.5, weight: 2 }}
                                        radius={35}
                                    >
                                        <Popup className="glass-popup">
                                            <div style={{ color: '#fff', minWidth: '180px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                    <User size={14} color={color} />
                                                    <strong style={{ fontSize: '1rem' }}>{scan.worker_name}</strong>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', opacity: 0.8 }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={12} /> {new Date(scan.timestamp).toLocaleTimeString()}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={12} /> {scan.lat.toFixed(4)}, {scan.long.toFixed(4)}</span>
                                                </div>
                                                <div style={{ marginTop: '0.75rem', padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}44` }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                                        <span>Fraud Risk</span>
                                                        <span style={{ color }}>{scan.fraud_score}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Circle>
                                </React.Fragment>
                            );
                        })}
                    </MapContainer>
                </div>

                <div className="live-feed-section">
                    <h3 className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={16} /> Real-time Feed
                    </h3>
                    <div className="feed-container" ref={feedRef}>
                        {scans.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>Awaiting data streams...</p>}
                        {scans.map((scan, i) => (
                            <div key={scan.id} className={`feed-item ${scan.validation_status === 'VALID' ? 'valid' : 'fraud'}`} style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className={`stat-icon-wrapper ${scan.validation_status === 'VALID' ? 'emerald' : 'rose'}`} style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                                    {scan.validation_status === 'VALID' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{scan.worker_name}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {scan.validation_status === 'VALID' ? 'Standard Verification' : 'Anomaly Detected'}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>{new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    {scan.distance_from_target && (
                                        <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{scan.distance_from_target.toFixed(1)}m offset</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
