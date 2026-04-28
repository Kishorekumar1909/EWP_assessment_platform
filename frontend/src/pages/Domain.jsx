import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { CheckCircle2, Play, Download, RotateCcw, Trophy, Clock, ChevronLeft } from 'lucide-react';

export default function DomainPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [domainTitle, setDomainTitle] = useState('Domain Area');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDomainData = async () => {
            try {
                const [attemptsRes, testsRes, domainRes] = await Promise.all([
                    api.get('/attempts/'),
                    api.get(`/tests/?domain=${id}`),
                    api.get('/domains/'),
                ]);
                setAttempts(attemptsRes.data);
                setTests(testsRes.data);
                const d = domainRes.data.find(d => String(d.id) === String(id));
                if (d) setDomainTitle(d.name);
            } catch (err) {
                console.error('Failed to load domain data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDomainData();
    }, [id]);

    const hasPassed = (testId) => {
        const testName = tests.find(t => t.id === testId)?.name;
        return attempts.some(a => a.test_name === testName && a.passed);
    };

    const getPrevAttempts = (testId) => {
        const testName = tests.find(t => t.id === testId)?.name;
        return attempts.filter(a => a.test_name === testName);
    };

    const passedCount = tests.filter(t => hasPassed(t.id)).length;

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }} className="pb-16">
            <Navbar title={domainTitle} />

            <main className="max-w-5xl mx-auto px-6 py-10">
                {/* Back + Header */}
                <button
                    onClick={() => navigate('/')}
                    style={{ color: 'var(--text-muted)' }}
                    className="flex items-center gap-1.5 hover:text-white font-medium mb-6 transition-colors text-sm"
                >
                    <ChevronLeft size={16} /> Back to Dashboard
                </button>

                <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
                    <div>
                        <h1 style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold">{domainTitle}</h1>
                        <p style={{ color: 'var(--text-secondary)' }} className="mt-1.5">
                            {passedCount} of {tests.length} tests passed
                        </p>
                    </div>

                    {/* Download resources */}
                    <a
                        href="/articulation.zip"
                        download
                        style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                        }}
                        className="inline-flex items-center gap-2 hover:bg-slate-700 px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm flex-shrink-0"
                    >
                        <Download size={16} /> Download Resources
                    </a>
                </div>

                {/* Overall progress bar */}
                {tests.length > 0 && !loading && (
                    <div style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '1rem',
                        padding: '1.25rem',
                    }} className="mb-8 flex items-center gap-5 shadow-sm">
                        <div style={{
                            width: 48, height: 48, borderRadius: '0.75rem',
                            background: 'rgba(91,127,255,0.12)',
                            color: 'var(--accent-blue)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }} className="flex-shrink-0">
                            <Trophy size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                                <span style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">Overall Progress</span>
                                <span style={{ color: 'var(--accent-blue)' }} className="text-sm font-bold">
                                    {tests.length > 0 ? Math.round((passedCount / tests.length) * 100) : 0}%
                                </span>
                            </div>
                            <div style={{ width: '100%', background: 'var(--bg-elevated)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                                <div
                                    style={{
                                        height: '100%', borderRadius: 99,
                                        width: `${tests.length > 0 ? (passedCount / tests.length) * 100 : 0}%`,
                                        background: 'linear-gradient(90deg, #5b7fff, #7c6fff)',
                                        transition: 'width 0.7s ease',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tests list */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border-subtle)' }} className="h-28 animate-pulse" />
                        ))}
                    </div>
                ) : tests.length === 0 ? (
                    <div style={{
                        background: 'var(--bg-surface)',
                        border: '1px dashed var(--border-default)',
                        borderRadius: '1rem',
                    }} className="text-center py-16">
                        <Play style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" size={36} />
                        <p style={{ color: 'var(--text-secondary)' }} className="font-medium">No tests found in this domain.</p>
                        <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">Use the admin panel to upload questions.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tests.map((test, idx) => {
                            const passed = hasPassed(test.id);
                            const prevAttempts = getPrevAttempts(test.id);
                            const bestScore = prevAttempts.length > 0
                                ? Math.max(...prevAttempts.map(a => a.score))
                                : null;

                            return (
                                <div
                                    key={test.id}
                                    style={{
                                        background: 'var(--bg-surface)',
                                        border: passed ? '1px solid rgba(52,196,124,0.3)' : '1px solid var(--border-subtle)',
                                        borderRadius: '1rem',
                                        transition: 'all 0.2s',
                                        position: 'relative', overflow: 'hidden'
                                    }}
                                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 hover:shadow-lg"
                                >
                                    {/* Passed ribbon */}
                                    {passed && (
                                        <div style={{
                                            position: 'absolute', top: 0, right: 0,
                                            background: 'var(--accent-green)', color: '#fff',
                                            fontSize: '0.7rem', fontWeight: 'bold',
                                            padding: '0.25rem 0.75rem',
                                            borderBottomLeftRadius: '0.75rem',
                                        }} className="flex items-center gap-1 shadow-sm">
                                            <CheckCircle2 size={11} /> PASS
                                        </div>
                                    )}

                                    {/* Test number badge + info */}
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '0.75rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.875rem', fontWeight: 'bold',
                                            background: passed ? 'rgba(52,196,124,0.15)' : 'rgba(91,127,255,0.15)',
                                            color: passed ? 'var(--accent-green)' : 'var(--accent-blue)',
                                        }} className="flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 style={{ color: passed ? 'var(--accent-green)' : 'var(--text-primary)' }} className="text-lg font-bold truncate">
                                                {test.name}
                                            </h3>

                                            {/* Attempt history */}
                                            {prevAttempts.length > 0 ? (
                                                <div className="mt-1 flex flex-wrap gap-3 items-center">
                                                    <span style={{ color: 'var(--text-muted)' }} className="text-xs font-semibold flex items-center gap-1 bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-700/50">
                                                        <Clock size={12} /> {prevAttempts.length} attempt{prevAttempts.length !== 1 ? 's' : ''}
                                                    </span>
                                                    {bestScore !== null && (
                                                        <span style={{ color: bestScore >= 24 ? 'var(--accent-green)' : 'var(--accent-blue)' }} className="text-xs font-bold flex items-center gap-1 bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-700/50">
                                                            <Trophy size={12} /> Best: {bestScore} / 30
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-0.5">No attempts yet — give it a try!</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <button
                                        onClick={() => navigate(`/test/${test.id}`)}
                                        style={{
                                            background: passed ? 'var(--bg-elevated)' : 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))',
                                            color: passed ? 'var(--text-primary)' : '#fff',
                                            border: passed ? '1px solid var(--border-default)' : 'none',
                                            boxShadow: passed ? 'none' : '0 4px 12px rgba(91,127,255,0.3)',
                                            padding: '0.625rem 1.5rem',
                                            borderRadius: '0.75rem',
                                        }}
                                        className="flex items-center gap-2 font-semibold transition-all text-sm flex-shrink-0 hover:brightness-110 active:scale-95"
                                    >
                                        {passed ? (
                                            <><RotateCcw size={15} /> Retake</>
                                        ) : (
                                            <><Play size={15} fill="currentColor" /> Start Test</>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
