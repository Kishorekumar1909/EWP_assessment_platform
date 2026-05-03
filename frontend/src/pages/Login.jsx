import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Feather } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        }
    };

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }} className="flex items-center justify-center p-4">
            {/* Background glow orbs */}
            <div style={{
                position: 'fixed', top: '-20%', left: '-10%',
                width: '500px', height: '500px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(91,127,255,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'fixed', bottom: '-20%', right: '-10%',
                width: '500px', height: '500px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(124,111,255,0.1) 0%, transparent 70%)',
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

                <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold text-center mb-1">Welcome Back to EWP</h2>
                <p style={{ color: 'var(--text-muted)' }} className="text-sm text-center mb-6">Enter your details to access your dashboard.</p>

                {error && (
                    <div style={{
                        background: 'rgba(240,107,107,0.1)',
                        border: '1px solid rgba(240,107,107,0.3)',
                        color: '#f06b6b',
                    }} className="p-3 rounded-xl mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div>
                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">Email</label>
                        <input type="email" required className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div>
                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">Password</label>
                        <input type="password" required className="input-field" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                    </div>



                    <button type="submit" className="btn-primary mt-1">Sign In</button>
                </form>

                <div style={{ color: 'var(--text-muted)' }} className="mt-6 text-center text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ color: 'var(--accent-blue)', fontWeight: 600 }} className="hover:underline">Sign up</Link>
                </div>
            </div>
        </div>
    );
}
