import React, { useRef } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { CheckCircle2, XCircle, ChevronLeft, Trophy, Target, RotateCcw } from 'lucide-react';

export default function Result() {
    const location = useLocation();
    const navigate = useNavigate();
    const reviewRef = useRef(null);

    if (!location.state?.resultData) {
        return <Navigate to="/" replace />;
    }

    const { resultData, questions } = location.state;
    const { attempt, details } = resultData;
    const total = questions.length;
    const pct = Math.round((attempt.score / total) * 100);
    const passed = attempt.passed;

    const scrollToReview = () => reviewRef.current?.scrollIntoView({ behavior: 'smooth' });

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }} className="pb-16">
            <Navbar title="Test Results" />

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Back */}
                <button
                    onClick={() => navigate('/')}
                    style={{ color: 'var(--text-muted)' }}
                    className="flex items-center gap-1.5 hover:text-white text-sm font-medium mb-6 transition-colors"
                >
                    <ChevronLeft size={16} /> Back to Dashboard
                </button>

                {/* ── Score card ─────────────────────────────────────── */}
                <div style={{
                    background: passed ? 'rgba(52,196,124,0.05)' : 'var(--bg-surface)',
                    border: passed ? '1px solid rgba(52,196,124,0.2)' : '1px solid var(--border-subtle)',
                    borderRadius: '1.5rem',
                    position: 'relative', overflow: 'hidden'
                }} className="p-8 mb-8 shadow-sm text-center">
                    {/* Decorative blobs */}
                    {passed && (
                        <>
                            <div style={{
                                position: 'absolute', top: '-2.5rem', right: '-2.5rem',
                                width: '10rem', height: '10rem', borderRadius: '50%',
                                background: 'var(--accent-green)', opacity: 0.15, filter: 'blur(2rem)'
                            }} />
                            <div style={{
                                position: 'absolute', bottom: '-2.5rem', left: '-2.5rem',
                                width: '10rem', height: '10rem', borderRadius: '50%',
                                background: 'var(--accent-blue)', opacity: 0.15, filter: 'blur(2rem)'
                            }} />
                        </>
                    )}

                    <div className="relative">
                        <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-1">{attempt.test_name}</h1>
                        <p style={{ color: 'var(--text-muted)' }} className="text-sm mb-8">
                            Completed on {new Date(attempt.timestamp).toLocaleString()}
                        </p>

                        {/* Circular score */}
                        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
                            <div className="relative w-44 h-44 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        stroke="var(--bg-elevated)"
                                        strokeWidth="3"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        stroke={passed ? 'var(--accent-green)' : 'var(--accent-red)'}
                                        strokeDasharray={`${pct}, 100`}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span style={{ color: 'var(--text-primary)' }} className="text-4xl font-extrabold">{pct}%</span>
                                    <span style={{ color: 'var(--text-muted)' }} className="text-xs font-bold tracking-widest uppercase mt-0.5">Score</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div style={{
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '1rem',
                                    backdropFilter: 'blur(4px)'
                                }} className="p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Trophy size={16} style={{ color: passed ? 'var(--accent-green)' : 'var(--accent-red)' }} />
                                        <span style={{ color: 'var(--text-muted)' }} className="text-xs font-semibold uppercase tracking-wide">Result</span>
                                    </div>
                                    <p style={{ color: passed ? 'var(--accent-green)' : 'var(--accent-red)' }} className="text-xl font-bold">
                                        {passed ? 'PASSED' : 'FAILED'}
                                    </p>
                                    <p style={{ color: 'var(--text-muted)' }} className="text-xs">{passed ? '≥ 80% required' : '< 80% scored'}</p>
                                </div>

                                <div style={{
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '1rem',
                                    backdropFilter: 'blur(4px)'
                                }} className="p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Target size={16} style={{ color: 'var(--accent-blue)' }} />
                                        <span style={{ color: 'var(--text-muted)' }} className="text-xs font-semibold uppercase tracking-wide">Correct</span>
                                    </div>
                                    <p style={{ color: 'var(--text-primary)' }} className="text-xl font-bold">{attempt.score}/{total}</p>
                                    <p style={{ color: 'var(--text-muted)' }} className="text-xs">questions</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
                            <button
                                onClick={scrollToReview}
                                style={{
                                    background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))',
                                    color: '#fff',
                                    boxShadow: '0 4px 12px rgba(91,127,255,0.3)',
                                    border: 'none',
                                }}
                                className="font-semibold px-8 py-3 rounded-xl transition-all text-sm hover:brightness-110 active:scale-95"
                            >
                                View Detailed Review
                            </button>
                            <button
                                onClick={() => navigate(-1)}
                                style={{
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                }}
                                className="flex items-center justify-center gap-2 font-semibold px-8 py-3 rounded-xl transition-colors text-sm hover:bg-slate-800"
                            >
                                <RotateCcw size={15} /> Retake Test
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Detailed Review ────────────────────────────────── */}
                <div ref={reviewRef}>
                    <h2 style={{ color: 'var(--text-primary)' }} className="text-xl font-bold mb-5 flex items-center gap-2">
                        Detailed Review
                        <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }} className="text-sm">— {questions.length} questions</span>
                    </h2>

                    <div className="space-y-5">
                        {questions.map((q, idx) => {
                            const detail = details.find(d => d.question_id === q.id);
                            if (!detail) return null;
                            const isCorrect = detail.is_correct;

                            return (
                                <div
                                    key={q.id}
                                    style={{
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border-subtle)',
                                        borderLeft: `4px solid ${isCorrect ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                                        borderRadius: '1rem',
                                    }}
                                    className="p-6 shadow-sm"
                                >
                                    {/* Question header */}
                                    <div className="flex gap-3 mb-4">
                                        <span style={{
                                            background: isCorrect ? 'var(--accent-green)' : 'var(--accent-red)',
                                            color: '#fff',
                                            width: 32, height: 32, borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.875rem', fontWeight: 'bold'
                                        }} className="flex-shrink-0">
                                            {idx + 1}
                                        </span>
                                        <div className="flex-1">
                                            <h3 style={{ color: 'var(--text-primary)' }} className="text-base font-semibold leading-snug">{q.text}</h3>
                                            <span style={{ color: isCorrect ? 'var(--accent-green)' : 'var(--accent-red)' }} className="text-xs font-bold mt-1 inline-block">
                                                {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Options */}
                                    <div className="ml-11 space-y-2">
                                        {q.options.map(opt => {
                                            // Backend returns string ids in details
                                            const sid = String(opt.id);
                                            const isUserSelected = detail.user_options.includes(sid) || detail.user_options.includes(opt.id);
                                            const isActuallyCorrect = detail.correct_options.includes(sid) || detail.correct_options.includes(opt.id);

                                            let background = 'var(--bg-elevated)';
                                            let border = '1px solid var(--border-subtle)';
                                            let color = 'var(--text-secondary)';
                                            let icon = null;

                                            if (isActuallyCorrect && isUserSelected) {
                                                background = 'rgba(52,196,124,0.1)';
                                                border = '1px solid rgba(52,196,124,0.3)';
                                                color = 'var(--accent-green)';
                                                icon = <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} className="flex-shrink-0" />;
                                            } else if (isActuallyCorrect) {
                                                background = 'rgba(52,196,124,0.1)';
                                                border = '1px solid rgba(52,196,124,0.3)';
                                                color = 'var(--accent-green)';
                                                icon = <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} className="flex-shrink-0" />;
                                            } else if (isUserSelected && !isActuallyCorrect) {
                                                background = 'rgba(240,107,107,0.1)';
                                                border = '1px solid rgba(240,107,107,0.3)';
                                                color = 'var(--accent-red)';
                                                icon = <XCircle size={16} style={{ color: 'var(--accent-red)' }} className="flex-shrink-0" />;
                                            }

                                            return (
                                                <div key={opt.id} style={{ background, border, color, borderRadius: '0.75rem' }} className="p-3 flex items-center gap-3 text-sm">
                                                    <span className="flex-1 font-medium">{opt.text}</span>
                                                    {icon}
                                                    {isUserSelected && !isActuallyCorrect && (
                                                        <span style={{ color: 'var(--accent-red)' }} className="text-xs font-bold flex-shrink-0">(your answer)</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
