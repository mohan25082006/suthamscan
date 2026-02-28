import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

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
}

export default function LiveMonitoring() {
    const [scans, setScans] = useState<ScanEvent[]>([]);
    const [loading, setLoading] = useState(true);

    // Default center (New York roughly based on our seed data)
    const defaultCenter: [number, number] = [40.7128, -74.0060];

    useEffect(() => {
        const fetchScans = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/scans');
                if (res.data.success) {
                    setScans(res.data.data);
                }
            } catch (err) {
                console.error('Error fetching scans', err);
                // Fallback demo data if backend is not running during initial UI test
                setScans([
                    { id: '1', worker_name: 'John Doe', timestamp: new Date().toISOString(), lat: 40.7128, long: -74.0060, target_lat: 40.7128, target_long: -74.0060, validation_status: 'VALID', fraud_score: 0 },
                    { id: '2', worker_name: 'Jane Smith', timestamp: new Date(Date.now() - 3600000).toISOString(), lat: 40.7135, long: -74.0070, target_lat: 40.7135, target_long: -74.0070, validation_status: 'FRAUD_FLAGGED', fraud_score: 80 }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchScans();
        const interval = setInterval(fetchScans, 10000); // 10s poll
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Live Monitoring</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Real-time visualization of sanitation QR scans.</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="glass-card stat-card">
                    <div className="stat-icon blue">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Recent Valid Scans</h3>
                        <p>{scans.filter(s => s.validation_status === 'VALID').length}</p>
                    </div>
                </div>
                <div className="glass-card stat-card">
                    <div className="stat-icon red">
                        <ShieldAlert size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Fraud Flags</h3>
                        <p>{scans.filter(s => s.fraud_score > 50).length}</p>
                    </div>
                </div>
            </div>

            <div className="map-container">
                {loading ? (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>
                ) : (
                    <MapContainer center={scans.length > 0 ? [scans[0].lat, scans[0].long] : defaultCenter} zoom={15} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                        {scans.map(scan => {
                            const isValid = scan.validation_status === 'VALID';
                            const color = isValid ? '#10b981' : '#ef4444';
                            return (
                                <React.Fragment key={scan.id}>
                                    {/* Worker scan location */}
                                    <Circle
                                        center={[scan.lat, scan.long]}
                                        pathOptions={{ color, fillColor: color, fillOpacity: 0.6 }}
                                        radius={30}
                                    >
                                        <Popup>
                                            <div style={{ color: '#000' }}>
                                                <strong>{scan.worker_name}</strong><br />
                                                Status: {scan.validation_status}<br />
                                                Fraud Score: {scan.fraud_score} <br />
                                                Time: {new Date(scan.timestamp).toLocaleTimeString()}
                                            </div>
                                        </Popup>
                                    </Circle>

                                    {/* Actual target location context (gray circle outline) */}
                                    <Circle
                                        center={[scan.target_lat, scan.target_long]}
                                        pathOptions={{ color: '#94a3b8', fill: false, dashArray: '4' }}
                                        radius={5}
                                    />
                                </React.Fragment>
                            );
                        })}
                    </MapContainer>
                )}
            </div>
        </div>
    );
}
