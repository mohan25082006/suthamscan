import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, User, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/admin/login`, { username, password });
            if (res.data.success) {
                localStorage.setItem('adminToken', res.data.token);
                localStorage.setItem('adminUser', JSON.stringify(res.data.user));
                navigate('/live');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-dark)',
            color: 'var(--text-primary)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Ambient Background Elements */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '10%',
                width: '400px',
                height: '400px',
                background: 'var(--accent-primary)',
                filter: 'blur(150px)',
                opacity: 0.2,
                borderRadius: '50%',
                zIndex: 0
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '10%',
                width: '500px',
                height: '500px',
                background: 'var(--accent-secondary)',
                filter: 'blur(180px)',
                opacity: 0.15,
                borderRadius: '50%',
                zIndex: 0
            }}></div>

            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '450px',
                padding: '3.5rem 3rem',
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '2.5rem',
                animation: 'slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex',
                        padding: '1rem',
                        borderRadius: '1.5rem',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        marginBottom: '1.5rem',
                        boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)'
                    }}>
                        <ShieldCheck size={40} color="var(--accent-primary)" />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '0.5rem' }}>
                        Portal Access
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Unauthorized access is strictly monitored.</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <User style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} size={20} />
                        <input
                            type="text"
                            placeholder="Authorized Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1.15rem 1.15rem 1.15rem 3.5rem',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '1rem',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 500,
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--accent-primary)';
                                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} size={20} />
                        <input
                            type="password"
                            placeholder="Security Key (Password)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1.15rem 1.15rem 1.15rem 3.5rem',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '1rem',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 500,
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--accent-primary)';
                                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#fb7185',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            animation: 'shake 0.4s ease-in-out'
                        }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1.15rem',
                            borderRadius: '1rem',
                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                            border: 'none',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            marginTop: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
                            }
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Initiate Sync
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                        Default login: <span style={{ color: 'white', fontWeight: 600 }}>admin</span> / <span style={{ color: 'white', fontWeight: 600 }}>admin123</span>
                    </p>
                </form>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
