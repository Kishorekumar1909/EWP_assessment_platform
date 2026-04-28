import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Feather, Mail, KeyRound, Lock } from 'lucide-react';

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const requestOTP = async (e) => {
        e.preventDefault();
        setError(''); setMsg('');
        setLoading(true);
        try {
            await api.post('/auth/request-otp/', { email, purpose: 'forgot_password' });
            setStep(2);
            setMsg('OTP sent to your email address.');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP. Check email and try again.');
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async (e) => {
        e.preventDefault();
        setError(''); setMsg('');
        setLoading(true);
        try {
            await api.post('/auth/verify-otp/', { email, otp, purpose: 'forgot_password' });
            setStep(3);
            setMsg('OTP verified. Please set your new password.');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        setError(''); setMsg('');
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/reset-password/', { email, password });
            setMsg('Password reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            if (err.response?.data?.password) {
                setError(err.response.data.password[0]);
            } else {
                setError(err.response?.data?.error || 'Password reset failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { icon: Mail, label: 'Email' },
        { icon: KeyRound, label: 'Verify OTP' },
        { icon: Lock, label: 'New Password' },
    ];

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }} className="flex items-center justify-center p-4">
            {/* Background glow orbs */}
            <div style={{
                position: 'fixed', top: '-20%', left: '20%',
                width: '500px', height: '500px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(124,111,255,0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div className="flex justify-center mb-4">
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(91,127,255,0.2), rgba(124,111,255,0.2))',
                        border: '1px solid rgba(91,127,255,0.3)',
                        color: '#5b7fff',
                        boxShadow: '0 4px 20px rgba(91,127,255,0.25)',
                    }} className="p-3.5 rounded-2xl glow-pulse">
                        <Feather size={30} />
                    </div>
                </div>

                <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold text-center mb-1">Reset Your Password</h2>
                <p style={{ color: 'var(--text-muted)' }} className="text-sm text-center mb-6">We'll send an OTP to verify your identity.</p>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {steps.map((s, idx) => {
                        const Icon = s.icon;
                        const isActive = step === idx + 1;
                        const isDone = step > idx + 1;
                        return (
                            <React.Fragment key={idx}>
                                <div className="flex flex-col items-center gap-1">
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.3s',
                                        background: isDone
                                            ? 'var(--accent-green)'
                                            : isActive
                                                ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))'
                                                : 'var(--bg-elevated)',
                                        color: isDone || isActive ? '#fff' : 'var(--text-muted)',
                                        border: isActive ? '1px solid rgba(91,127,255,0.4)' : '1px solid var(--border-subtle)',
                                        boxShadow: isActive ? '0 0 14px rgba(91,127,255,0.35)' : 'none',
                                    }}>
                                        <Icon size={15} />
                                    </div>
                                    <span style={{
                                        fontSize: '0.7rem', fontWeight: 600,
                                        color: isDone ? 'var(--accent-green)' : isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
                                        transition: 'color 0.3s',
                                    }}>
                                        {s.label}
                                    </span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div style={{
                                        height: 2, width: 32, borderRadius: 99,
                                        marginBottom: 20,
                                        background: isDone ? 'var(--accent-green)' : 'var(--border-subtle)',
                                        transition: 'background 0.3s',
                                    }} />
                                )}
                            </React.Fragment>
                        );
                    })}
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

                {/* Step 1: Email */}
                {step === 1 && (
                    <form onSubmit={requestOTP}>
                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">Email Address</label>
                        <input
                            type="email" required
                            className="input-field"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <button type="submit" disabled={loading} className="btn-primary mt-1">
                            {loading ? 'Sending OTP…' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                    <form onSubmit={verifyOTP}>
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
                            Check your inbox at <span style={{ color: 'var(--accent-blue)' }}>{email}</span>
                        </p>
                        <button type="submit" disabled={loading} className="btn-primary mt-1">
                            {loading ? 'Verifying…' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setStep(1); setOtp(''); setError(''); setMsg(''); }}
                            style={{ color: 'var(--text-muted)' }}
                            className="w-full hover:text-white mt-4 text-sm transition-colors text-center"
                        >
                            ← Change email
                        </button>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <form onSubmit={resetPassword}>
                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">New Password</label>
                        <input
                            type="password" required
                            className="input-field"
                            placeholder="Min 8 chars, 1 upper, 1 special…"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">Confirm New Password</label>
                        <input
                            type="password" required
                            className="input-field"
                            placeholder="Re-enter new password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                        <button type="submit" disabled={loading} className="btn-primary mt-1">
                            {loading ? 'Resetting…' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div style={{ color: 'var(--text-muted)' }} className="mt-6 text-center text-sm">
                    Remember your password?{' '}
                    <Link to="/login" style={{ color: 'var(--accent-blue)', fontWeight: 600 }} className="hover:underline">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
