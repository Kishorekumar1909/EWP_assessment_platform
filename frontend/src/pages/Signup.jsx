import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Feather } from 'lucide-react';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            setError('');
            await api.post('/auth/signup/', { email, username, password });
            setMsg('Account created successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            if (err.response?.data?.password) {
                setError(err.response.data.password[0]);
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Signup failed.');
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

                <form onSubmit={handleSignup}>
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
                    <button type="submit" className="btn-primary mt-1">Create Account</button>
                </form>

                <div style={{ color: 'var(--text-muted)' }} className="mt-6 text-center text-sm">
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--accent-blue)', fontWeight: 600 }} className="hover:underline">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
