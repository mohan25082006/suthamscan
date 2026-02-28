import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Users, Bell, Globe, Save, RefreshCw, Sliders, MapPin, ChevronDown, ChevronRight, UserPlus } from 'lucide-react';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('system');
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Workforce State
    const [workforce, setWorkforce] = useState([
        {
            area: 'Anna Nagar', officer: { name: 'Meena S.', status: 'ONLINE' }, workers: [
                { name: 'Rajesh K.', status: 'ONLINE' },
                { name: 'Suresh V.', status: 'ONLINE' }
            ]
        },
        {
            area: 'Madurai East', officer: { name: 'Arul Vel', status: 'IDLE' }, workers: [
                { name: 'Karthik P.', status: 'ONLINE' },
                { name: 'Mani G.', status: 'IDLE' }
            ]
        },
        {
            area: 'Sellur', officer: { name: 'Priya M.', status: 'ONLINE' }, workers: [
                { name: 'Selvi T.', status: 'ONLINE' },
                { name: 'Deepa R.', status: 'ONLINE' }
            ]
        },
        {
            area: 'Central Zone', officer: { name: 'Kavitha J.', status: 'OFFLINE' }, workers: [
                { name: 'Kumar R.', status: 'OFFLINE' },
                { name: 'Lakshmi N.', status: 'IDLE' }
            ]
        }
    ]);

    const [expandedAreas, setExpandedAreas] = useState<string[]>(['Anna Nagar']);

    const toggleArea = (area: string) => {
        setExpandedAreas(prev =>
            prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
        );
    };

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => setSaving(false), 1500);
    };

    const [newPersonnel, setNewPersonnel] = useState({ name: '', role: 'Worker', area: 'Anna Nagar' });

    const addPerson = () => {
        if (!newPersonnel.name) return;

        const updatedWorkforce = workforce.map(group => {
            if (group.area === newPersonnel.area) {
                if (newPersonnel.role === 'Officer') {
                    return { ...group, officer: { name: newPersonnel.name, status: 'IDLE' } };
                } else {
                    return { ...group, workers: [...group.workers, { name: newPersonnel.name, status: 'IDLE' }] };
                }
            }
            return group;
        });

        setWorkforce(updatedWorkforce);
        setNewPersonnel({ name: '', role: 'Worker', area: 'Anna Nagar' });
        setShowAddModal(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
            {/* Add Personnel Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="glass-card" style={{ width: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Deploy New Personnel</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>FULL NAME</label>
                                <input
                                    type="text"
                                    value={newPersonnel.name}
                                    onChange={e => setNewPersonnel({ ...newPersonnel, name: e.target.value })}
                                    placeholder="Enter personnel name"
                                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ASSIGNMENT AREA</label>
                                <select
                                    value={newPersonnel.area}
                                    onChange={e => setNewPersonnel({ ...newPersonnel, area: e.target.value })}
                                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white' }}
                                >
                                    {workforce.map(w => <option key={w.area} value={w.area}>{w.area}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>RANK</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {['Worker', 'Officer'].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setNewPersonnel({ ...newPersonnel, role: r })}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                borderRadius: '0.5rem',
                                                background: newPersonnel.role === r ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                                                border: 'none',
                                                color: 'white',
                                                fontWeight: 700
                                            }}
                                        >
                                            {r.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '0.75rem', fontWeight: 700 }}>CANCEL</button>
                            <button onClick={addPerson} style={{ flex: 1, padding: '1rem', background: 'var(--accent-primary)', border: 'none', color: 'white', borderRadius: '0.75rem', fontWeight: 700 }}>CONFIRM DEPLOY</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-header">
                <div>
                    <h1 className="page-title">System Settings</h1>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Advanced Configuration & Strategic Control Center</p>
                </div>
                <button
                    onClick={handleSave}
                    className="glass-card"
                    style={{
                        padding: '0.75rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        background: saving ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{saving ? 'SYNCING...' : 'SAVE CHANGES'}</span>
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
                {/* Navigation Sidebar */}
                <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', height: 'fit-content' }}>
                    {[
                        { id: 'system', icon: <Sliders size={18} />, label: 'System Thresholds' },
                        { id: 'workforce', icon: <Users size={18} />, label: 'Workforce Hub' },
                        { id: 'org', icon: <Globe size={18} />, label: 'Organization' },
                        { id: 'security', icon: <Shield size={18} />, label: 'Security Engine' },
                        { id: 'notify', icon: <Bell size={18} />, label: 'Alert Protocols' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                border: 'none',
                                color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontWeight: activeTab === tab.id ? 700 : 500,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    {activeTab === 'system' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Validation Parameters</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Define precision requirements for municipal scan integrity.</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <label style={{ fontWeight: 600 }}>Proximity Tolerance (Meters)</label>
                                        <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>5.0m</span>
                                    </div>
                                    <input type="range" style={{ width: '100%', height: '4px', background: 'var(--accent-glow)', borderRadius: '2px' }} />
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <label style={{ fontWeight: 600 }}>Anomaly Sensitivity</label>
                                        <span style={{ color: 'var(--danger)', fontWeight: 800 }}>HIGH</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {['Low', 'Medium', 'High', 'Strict'].map(level => (
                                            <button
                                                key={level}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.75rem',
                                                    borderRadius: '0.5rem',
                                                    background: level === 'High' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                                                    border: 'none',
                                                    color: level === 'High' ? 'white' : 'var(--text-secondary)',
                                                    fontWeight: 700,
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                {level.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'workforce' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Area Command Hub</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Hierarchical oversight across Madurai Municipal zones.</p>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="glass-card"
                                    style={{
                                        padding: '0.75rem 1.25rem',
                                        fontSize: '0.8rem',
                                        fontWeight: 800,
                                        color: 'var(--accent-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        border: '1px solid rgba(59, 130, 246, 0.2)'
                                    }}
                                >
                                    <UserPlus size={16} />
                                    ADD PERSONNEL
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {workforce.map(zone => (
                                    <div key={zone.area} style={{ borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                                        {/* Area Header */}
                                        <div
                                            onClick={() => toggleArea(zone.area)}
                                            style={{
                                                padding: '1.25rem 1.5rem',
                                                background: 'rgba(255,255,255,0.02)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ color: 'var(--accent-primary)' }}>
                                                    {expandedAreas.includes(zone.area) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <MapPin size={18} color="var(--accent-primary)" strokeWidth={3} />
                                                    <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{zone.area.toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                {zone.workers.length + 1} PERSONNEL ACTIVE
                                            </div>
                                        </div>

                                        {expandedAreas.includes(zone.area) && (
                                            <div style={{ padding: '1rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {/* Field Officer */}
                                                <div style={{ padding: '1.25rem', borderRadius: '1rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
                                                            {zone.officer.name[0]}
                                                        </div>
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <span style={{ fontWeight: 800, fontSize: '1rem' }}>{zone.officer.name}</span>
                                                                <span style={{ fontSize: '0.6rem', fontWeight: 900, background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '4px' }}>FIELD OFFICER</span>
                                                            </div>
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tactical Area Commander</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: zone.officer.status === 'ONLINE' ? 'var(--success)' : '#fbbf24' }}></div>
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{zone.officer.status}</span>
                                                        <SettingsIcon size={16} color="rgba(255,255,255,0.2)" />
                                                    </div>
                                                </div>

                                                {/* Workers Group */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                    {zone.workers.map(worker => (
                                                        <div key={worker.name} style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                                                                    {worker.name[0]}
                                                                </div>
                                                                <div>
                                                                    <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{worker.name}</p>
                                                                    <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Field Agent</p>
                                                                </div>
                                                            </div>
                                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: worker.status === 'ONLINE' ? 'var(--success)' : '#fbbf24' }}></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'notify' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Alert Protocols</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Strategic multi-channel emergency sync and escalation.</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                {[
                                    { label: 'Push Notifications', desc: 'Real-time dashboard alerts', icon: <Bell size={18} /> },
                                    { label: 'SMS Gateway', desc: 'Phone alerts for field leads', icon: <Globe size={18} /> },
                                    { label: 'Email Reports', desc: 'Daily efficiency summaries', icon: <Save size={18} /> },
                                    { label: 'Auto-Escalation', desc: 'Notify Command if idle > 15m', icon: <Shield size={18} /> }
                                ].map(proto => (
                                    <div key={proto.label} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}>
                                                {proto.icon}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{proto.label}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{proto.desc}</p>
                                            </div>
                                        </div>
                                        <div style={{
                                            width: '40px',
                                            height: '24px',
                                            borderRadius: '12px',
                                            background: 'var(--accent-primary)',
                                            position: 'relative',
                                            cursor: 'pointer'
                                        }}>
                                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', right: '3px' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Security Engine</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Configure authentication policies, session controls, and audit retention.</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Token Expiry */}
                                <div style={{ padding: '1.5rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '0.6rem', borderRadius: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}>
                                                <Shield size={18} />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 700 }}>JWT Token Expiry</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Admin session validity window</p>
                                            </div>
                                        </div>
                                        <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>24h</span>
                                    </div>
                                    <input type="range" min={1} max={72} defaultValue={24} style={{ width: '100%', height: '4px', background: 'var(--accent-glow)', borderRadius: '2px' }} />
                                </div>

                                {/* Audit Log Retention */}
                                <div style={{ padding: '1.5rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '0.6rem', borderRadius: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-secondary)' }}>
                                                <Shield size={18} />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 700 }}>Audit Log Retention</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Days scan events are preserved</p>
                                            </div>
                                        </div>
                                        <span style={{ color: 'var(--accent-secondary)', fontWeight: 800 }}>90 days</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {['30d', '60d', '90d', '180d', '365d'].map(d => (
                                            <button key={d} style={{
                                                flex: 1,
                                                padding: '0.6rem',
                                                borderRadius: '0.5rem',
                                                background: d === '90d' ? 'var(--accent-secondary)' : 'rgba(255,255,255,0.05)',
                                                border: 'none',
                                                color: d === '90d' ? 'white' : 'var(--text-secondary)',
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                                cursor: 'pointer'
                                            }}>{d.toUpperCase()}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* Access Controls */}
                                <div style={{ padding: '1.5rem', borderRadius: '1rem', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                    <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#fb7185' }}>Danger Zone</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Irreversible actions affecting all active sessions.</p>
                                    <button style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fb7185', fontWeight: 700, cursor: 'pointer' }}>
                                        Revoke All Active Tokens
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'org' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Institutional Identity</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Customize municipal branding for official reporting.</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>Organization Name</label>
                                    <input
                                        type="text"
                                        defaultValue="Civic Coverage Administration"
                                        style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>Deployment Zone</label>
                                    <input
                                        type="text"
                                        defaultValue="Madurai, Tamil Nadu"
                                        style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
