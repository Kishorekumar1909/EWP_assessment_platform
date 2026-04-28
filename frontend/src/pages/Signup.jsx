import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Feather } from 'lucide-react';

export default function Signup() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const requestOTP = async (e) => {
        e.preventDefault();
        try {
            setError('');
            await api.post('/auth/request-otp/', { email, purpose: 'signup' });
            setStep(2);
            setMsg('OTP sent to your email.');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP.');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            setError('');
            await api.post('/auth/verify-otp/', { email, otp, purpose: 'signup' });
            await api.post('/auth/signup/', { email, username, password });
            setMsg('Account created successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            if (err.response?.data?.password) {
                setError(err.response.data.password[0]);
            } else {
                setError(err.response?.data?.error || 'Signup failed.');
            }
        }
    };

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }} className="flex items-center justify-center p-4">
            {/* Background glow orbs */}
            <div style={{
                position: 'fixed', top: '-20%', right: '-10%',
                width: '500px', height: '500px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(91,127,255,0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'fixed', bottom: '-15%', left: '-10%',
                width: '400px', height: '400px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(52,196,124,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(91,127,255,0.2), rgba(124,111,255,0.2))',
                        border: '1px solid rgba(91,127,255,0.3)',
                        color: '#5b7fff',
                        boxShadow: '0 4px 20px rgba(91,127,255,0.25)',
                    }} className="p-3.5 rounded-2xl glow-pulse">
                        <Feather size={30} />
                    </div>
                </div>

                <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold text-center mb-1">Create an Account</h2>
                <p style={{ color: 'var(--text-muted)' }} className="text-sm text-center mb-6">Start your preparation journey with EWP.</p>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center gap-3">
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 700,
                                background: s < step ? 'var(--accent-green)' : s === step
                                    ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))'
                                    : 'var(--bg-elevated)',
                                color: s <= step ? '#fff' : 'var(--text-muted)',
                                border: s === step ? '1px solid rgba(91,127,255,0.5)' : '1px solid var(--border-subtle)',
                                boxShadow: s === step ? '0 0 12px rgba(91,127,255,0.3)' : 'none',
                                transition: 'all 0.3s',
                            }}>
                                {s < step ? '✓' : s}
                            </div>
                            {s === 1 && (
                                <div style={{
                                    width: 32, height: 2, borderRadius: 99,
                                    background: step > 1 ? 'var(--accent-green)' : 'var(--border-subtle)',
                                    transition: 'background 0.3s',
                                }} />
                            )}
                        </div>
                    ))}
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(240,107,107,0.1)',
                        border: '1px solid rgba(240,107,107,0.3)',
                        color: '#f06b6b',
                    }} className="p-3 rounded-xl mb-4 text-sm">
                        {error}
                    </div>
                )}
                {msg && (
                    <div style={{
                        background: 'rgba(52,196,124,0.1)',
                        border: '1px solid rgba(52,196,124,0.3)',
                        color: '#34c47c',
                    }} className="p-3 rounded-xl mb-4 text-sm">
                        {msg}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={requestOTP}>
                        <div>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">Email</label>
                            <input type="email" required className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                        </div>
                        <div>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">Username <span style={{ color: 'var(--text-muted)' }}>(Optional)</span></label>
                            <input type="text" className="input-field" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. john_doe" />
                        </div>
                        <div>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">Password</label>
                            <input type="password" required className="input-field" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 chars, 1 upper, 1 special…" />
                            <p style={{ color: 'var(--text-muted)', marginTop: '-0.5rem', marginBottom: '1rem' }} className="text-xs px-1">
                                Min 8 chars, 1 uppercase, 1 lowercase, 1 special character.
                            </p>
                        </div>
                        <button type="submit" className="btn-primary mt-1">Continue →</button>
                    </form>
                ) : (
                    <form onSubmit={handleSignup}>
                        <div>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">Enter OTP Code</label>
                            <input
                                type="text" required maxLength="6"
                                className="input-field tracking-widest text-center text-xl font-bold"
                                style={{ letterSpacing: '0.35em' }}
                                placeholder="• • • • • •"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                            />
                            <p style={{ color: 'var(--text-muted)', marginTop: '-0.5rem', marginBottom: '1rem' }} className="text-xs text-center">
                                OTP sent to <span style={{ color: 'var(--accent-blue)' }}>{email}</span>
                            </p>
                        </div>
                        <button type="submit" className="btn-primary mt-1">Verify &amp; Create Account</button>
                        <button type="button" onClick={() => setStep(1)} style={{ color: 'var(--text-muted)' }} className="w-full hover:text-white mt-4 text-sm transition-colors text-center">
                            ← Back to details
                        </button>
                    </form>
                )}

                <div style={{ color: 'var(--text-muted)' }} className="mt-6 text-center text-sm">
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--accent-blue)', fontWeight: 600 }} className="hover:underline">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
