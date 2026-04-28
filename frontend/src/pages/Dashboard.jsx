import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, CheckCircle2, BarChart3 } from 'lucide-react';

export default function Dashboard() {
    const [domains, setDomains] = useState([]);
    const [testCounts, setTestCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [domainsRes, attemptsRes] = await Promise.all([
                    api.get('/domains/'),
                    api.get('/attempts/'),
                ]);
                const domainsData = domainsRes.data;
                const attempts = attemptsRes.data;
                setDomains(domainsData);

                const counts = {};
                await Promise.all(
                    domainsData.map(async (domain) => {
                        const testsRes = await api.get(`/tests/?domain=${domain.id}`);
                        const tests = testsRes.data;
                        const total = tests.length;
                        const passedTestIds = new Set(
                            attempts
                                .filter(a => a.passed && tests.some(t => t.name === a.test_name))
                                .map(a => a.test_name)
                        );
                        counts[domain.id] = { total, passed: passedTestIds.size };
                    })
                );
                setTestCounts(counts);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
            <Navbar title="EWP Dashboard" />

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="mb-10">
                    <h1 style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold mb-1">Available Domains</h1>
                    <p style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
                        Select a domain to access its test modules and track your progress.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border-subtle)' }} className="h-48 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {domains.length === 0 ? (
                            <div style={{
                                background: 'var(--bg-surface)',
                                border: '1px dashed var(--border-default)',
                                borderRadius: '1rem',
                            }} className="col-span-full text-center py-16">
                                <BookOpen style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" size={40} />
                                <p style={{ color: 'var(--text-secondary)' }} className="font-medium">No domains available yet.</p>
                                <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">Contact admin to set up your course.</p>
                            </div>
                        ) : (
                            domains.map(domain => {
                                const { total = 0, passed = 0 } = testCounts[domain.id] || {};
                                const progressPct = total > 0 ? Math.round((passed / total) * 100) : 0;

                                return (
                                    <div
                                        key={domain.id}
                                        onClick={() => navigate(`/domain/${domain.id}`)}
                                        style={{
                                            background: 'var(--bg-surface)',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '1rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.22s',
                                        }}
                                        className="p-6 flex flex-col group"
                                        onMouseEnter={e => {
                                            e.currentTarget.style.border = '1px solid rgba(91,127,255,0.4)';
                                            e.currentTarget.style.transform = 'translateY(-3px)';
                                            e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(91,127,255,0.12)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.border = '1px solid var(--border-subtle)';
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {/* Icon */}
                                        <div style={{
                                            width: 48, height: 48,
                                            background: 'rgba(91,127,255,0.12)',
                                            color: 'var(--accent-blue)',
                                            borderRadius: '0.75rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            marginBottom: '1rem',
                                            transition: 'transform 0.2s',
                                        }} className="group-hover:scale-110">
                                            <BookOpen size={22} />
                                        </div>

                                        {/* Name & Description */}
                                        <h3 style={{ color: 'var(--text-primary)' }} className="text-xl font-bold mb-1">{domain.name}</h3>
                                        <p style={{ color: 'var(--text-muted)' }} className="text-sm mb-5 line-clamp-2 flex-1">
                                            {domain.description || 'Master your skills through our comprehensive test modules.'}
                                        </p>

                                        {/* Progress */}
                                        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                                                    <CheckCircle2 size={14} style={{ color: passed > 0 ? 'var(--accent-green)' : 'var(--border-default)' }} />
                                                    <span>
                                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{passed}</span>/{total} passed
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--accent-blue)' }}>
                                                    <BarChart3 size={14} />
                                                    <span>{progressPct}%</span>
                                                </div>
                                            </div>
                                            {/* Progress bar */}
                                            <div style={{ width: '100%', background: 'var(--bg-elevated)', borderRadius: 99, height: 5, overflow: 'hidden' }}>
                                                <div
                                                    style={{
                                                        height: '100%', borderRadius: 99,
                                                        width: `${progressPct}%`,
                                                        background: progressPct >= 80
                                                            ? 'linear-gradient(90deg, #34c47c, #29a86a)'
                                                            : 'linear-gradient(90deg, #5b7fff, #7c6fff)',
                                                        transition: 'width 0.7s ease',
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <div className="flex items-center justify-end mt-4 gap-1 text-sm font-semibold" style={{ color: 'var(--accent-blue)' }}>
                                            <span>View Tests</span>
                                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
