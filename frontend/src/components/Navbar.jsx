import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, X, LogOut, User } from 'lucide-react';

/**
 * variant: 'default' | 'test'
 * In test mode: shows timer + cancel button (no logout)
 */
export default function Navbar({ variant = 'default', title, timer, onCancelTest }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav style={{
            background: 'rgba(26,29,39,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #2d3148',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }} className="px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
            {/* Brand */}
            <div className="flex items-center gap-3 min-w-0">
                <img 
                    src="/EWP_logo.png" 
                    alt="EWP Logo" 
                    className="h-9 w-auto object-contain flex-shrink-0"
                    />
                {title && title !== 'EWP' && (
                    <div className="flex flex-col min-w-0 border-l border-slate-700/50 pl-3 ml-1">
                        <span style={{ color: '#9fa3b8' }} className="text-xs font-semibold tracking-wide truncate">
                            {title}
                        </span>
                    </div>
                )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 flex-shrink-0 relative">
                {variant === 'test' ? (
                    <>
                        {/* Timer pill */}
                        <div style={{
                            background: 'rgba(245,136,75,0.12)',
                            border: '1px solid rgba(245,136,75,0.3)',
                            color: '#f5884b',
                        }} className="flex items-center gap-2 px-4 py-2 rounded-full font-mono font-semibold text-sm shadow-sm">
                            <Clock size={15} />
                            <span>{timer}</span>
                        </div>
                        <button
                            onClick={onCancelTest}
                            style={{ color: '#9fa3b8' }}
                            className="flex items-center gap-2 px-4 py-2 hover:text-red-400 hover:bg-red-500/10 rounded-xl font-medium transition-colors text-sm border border-transparent hover:border-red-500/20"
                        >
                            <X size={16} />
                            <span className="hidden sm:inline">Cancel Test</span>
                        </button>
                    </>
                ) : (
                    <div className="relative group">
                        {/* User badge toggles dropdown on hover */}
                        <div style={{
                            background: 'rgba(91,127,255,0.08)',
                            border: '1px solid #2d3148',
                            cursor: 'pointer'
                        }} className="flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-blue-900/20 transition-colors">
                            <div style={{ background: 'rgba(91,127,255,0.2)', color: '#5b7fff' }} className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                                <User size={13} />
                            </div>
                            <span style={{ color: '#9fa3b8' }} className="text-sm font-medium max-w-[140px] truncate">
                                {user?.username || user?.email?.split('@')[0]}
                            </span>
                        </div>
                        
                        {/* Dropdown Menu */}
                        <div style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        }} className="absolute right-0 mt-2 w-48 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                            <div className="p-3 border-b border-slate-700/50">
                                <p className="text-xs text-slate-400 font-medium mb-0.5">Signed in as</p>
                                <p className="text-sm text-slate-200 font-bold truncate" title={user?.email}>{user?.email}</p>
                            </div>
                            <div className="p-1">
                                <button
                                    onClick={handleLogout}
                                    style={{ color: '#f06b6b' }}
                                    className="flex items-center gap-2 text-sm font-medium px-3 py-2 w-full rounded-lg transition-all hover:bg-red-500/15"
                                >
                                    <LogOut size={15} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
