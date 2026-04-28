import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { AlertCircle } from 'lucide-react';

// Shuffle utility
const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

export default function TestTaking() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: [optionId, ...] }
    const [timeLeft, setTimeLeft] = useState(30 * 60);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        api.get(`/tests/${id}/questions/`)
            .then(res => {
                const shuffled = shuffleArray(res.data).map(q => ({
                    ...q,
                    options: shuffleArray(q.options),
                }));
                setQuestions(shuffled.slice(0, 30));
            })
            .catch(() => setSubmitError('Failed to load test. Please refresh.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = useCallback(async () => {
        if (submitting) return;
        setSubmitting(true);
        setSubmitError('');
        try {
            const res = await api.post(`/tests/${id}/submit/`, { answers });
            navigate('/result', { state: { resultData: res.data, questions } });
        } catch (err) {
            setSubmitError('Submission failed. Please try again.');
            setSubmitting(false);
        }
    }, [submitting, id, answers, questions, navigate]);

    // Timer countdown — auto-submit at 0
    useEffect(() => {
        if (loading || submitting) return;
        if (timeLeft <= 0) { handleSubmit(); return; }
        const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [timeLeft, loading, submitting, handleSubmit]);

    const handleOptionToggle = (questionId, optionId, isMulti) => {
        setAnswers(prev => {
            const cur = prev[questionId] || [];
            if (isMulti) {
                return {
                    ...prev,
                    [questionId]: cur.includes(optionId)
                        ? cur.filter(x => x !== optionId)
                        : [...cur, optionId],
                };
            }
            return { ...prev, [questionId]: [optionId] };
        });
    };

    const handleCancel = () => {
        if (window.confirm('Cancel the test? Your progress will NOT be saved.')) {
            navigate(-1);
        }
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const isUrgent = timeLeft <= 5 * 60; // last 5 mins

    if (loading) {
        return (
            <div style={{ background: 'var(--bg-base)' }} className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div style={{ borderColor: 'rgba(91,127,255,0.2)', borderTopColor: 'var(--accent-blue)' }} className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-4" />
                    <p style={{ color: 'var(--text-muted)' }} className="font-medium">Loading test...</p>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div style={{ background: 'var(--bg-base)' }} className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto mb-3" style={{ color: 'var(--accent-red)' }} size={40} />
                    <p style={{ color: 'var(--text-primary)' }} className="font-medium">{submitError || 'This test has no questions.'}</p>
                    <button onClick={() => navigate(-1)} className="btn-primary mt-4 w-auto px-6">Go Back</button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    const currentSelected = answers[currentQ.id] || [];
    const isLastQ = currentIndex === questions.length - 1;
    const answeredCount = Object.keys(answers).length;

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }} className="flex flex-col">
            <Navbar
                variant="test"
                timer={formatTime(timeLeft)}
                onCancelTest={handleCancel}
            />

            <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col">
                {/* Progress header */}
                <div className="mb-4 flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }} className="font-medium">
                        Question <span style={{ color: 'var(--text-primary)' }} className="font-bold">{currentIndex + 1}</span> of {questions.length}
                    </span>
                    <span style={{ color: isUrgent ? 'var(--accent-orange)' : 'var(--text-secondary)' }} className={`font-medium`}>
                        {answeredCount}/{questions.length} answered
                    </span>
                </div>

                {/* Progress bar */}
                <div style={{ background: 'var(--bg-elevated)', borderRadius: 99 }} className="w-full h-1.5 mb-6 overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                            width: `${((currentIndex + 1) / questions.length) * 100}%`,
                            background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-indigo))'
                        }}
                    />
                </div>

                {/* Question card */}
                <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '1.5rem',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }} className="p-6 md:p-10 flex-1 flex flex-col">
                    {/* Question type badge */}
                    <div className="mb-4">
                        <span style={{
                            background: currentQ.is_multiple_choice ? 'rgba(176,124,255,0.15)' : 'rgba(91,127,255,0.15)',
                            color: currentQ.is_multiple_choice ? 'var(--accent-purple)' : 'var(--accent-blue)',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }} className="inline-block px-3 py-1 rounded-full">
                            {currentQ.is_multiple_choice ? 'Multiple Answers — Select all that apply' : 'Single Answer — Select one'}
                        </span>
                    </div>

                    {/* Question text */}
                    <h2 style={{ color: 'var(--text-primary)' }} className="text-xl md:text-2xl font-semibold mb-8 leading-relaxed flex-shrink-0">
                        {currentQ.text}
                    </h2>

                    {/* Options */}
                    <div className="space-y-3 flex-1">
                        {currentQ.options.map((opt) => {
                            const isChecked = currentSelected.includes(opt.id);
                            return (
                                <label
                                    key={opt.id}
                                    style={{
                                        border: isChecked ? '2px solid var(--accent-blue)' : '2px solid var(--border-subtle)',
                                        background: isChecked ? 'rgba(91,127,255,0.08)' : 'var(--bg-elevated)',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    className="flex items-start gap-4 p-4 rounded-xl select-none hover:border-blue-500/50"
                                >
                                    <div className="mt-0.5 flex-shrink-0">
                                        {currentQ.is_multiple_choice ? (
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleOptionToggle(currentQ.id, opt.id, true)}
                                                style={{ accentColor: 'var(--accent-blue)' }}
                                                className="w-4.5 h-4.5 rounded"
                                            />
                                        ) : (
                                            <input
                                                type="radio"
                                                name={`q-${currentQ.id}`}
                                                checked={isChecked}
                                                onChange={() => handleOptionToggle(currentQ.id, opt.id, false)}
                                                style={{ accentColor: 'var(--accent-blue)' }}
                                                className="w-4.5 h-4.5"
                                            />
                                        )}
                                    </div>
                                    <span style={{ color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)' }} className={`text-base leading-snug flex-1 ${isChecked ? 'font-medium' : ''}`}>
                                        {opt.text}
                                    </span>
                                </label>
                            );
                        })}
                    </div>

                    {/* Error */}
                    {submitError && (
                        <div style={{
                            background: 'rgba(240,107,107,0.1)',
                            border: '1px solid rgba(240,107,107,0.3)',
                            color: 'var(--accent-red)'
                        }} className="mt-4 flex items-center gap-2 text-sm rounded-lg p-3">
                            <AlertCircle size={16} /> {submitError}
                        </div>
                    )}

                    {/* Navigation */}
                    <div style={{ borderTop: '1px solid var(--border-subtle)' }} className="flex justify-between items-center mt-10 pt-6">
                        <button
                            onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
                            disabled={currentIndex === 0}
                            style={{
                                background: currentIndex === 0 ? 'var(--bg-base)' : 'var(--bg-elevated)',
                                color: currentIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                                opacity: currentIndex === 0 ? 0.5 : 1,
                                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer'
                            }}
                            className="px-6 py-2.5 rounded-xl font-semibold transition-colors text-sm hover:brightness-110"
                        >
                            ← Previous
                        </button>

                        {/* Question dots (up to 10) */}
                        <div className="hidden md:flex items-center gap-1.5">
                            {questions.slice(0, 10).map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentIndex(idx)}
                                    style={{
                                        width: idx === currentIndex ? 12 : 10,
                                        height: idx === currentIndex ? 12 : 10,
                                        borderRadius: '50%',
                                        background: idx === currentIndex
                                            ? 'var(--accent-blue)'
                                            : answers[q.id]?.length > 0
                                                ? 'rgba(91,127,255,0.4)'
                                                : 'var(--border-default)',
                                        transition: 'all 0.2s'
                                    }}
                                    title={`Question ${idx + 1}`}
                                />
                            ))}
                            {questions.length > 10 && (
                                <span style={{ color: 'var(--text-muted)' }} className="text-xs ml-1">+{questions.length - 10}</span>
                            )}
                        </div>

                        {isLastQ ? (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                style={{
                                    background: 'linear-gradient(135deg, var(--accent-green), #29a86a)',
                                    color: '#fff',
                                    boxShadow: '0 4px 12px rgba(52,196,124,0.3)'
                                }}
                                className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all text-sm hover:brightness-110 active:scale-95"
                            >
                                {submitting ? (
                                    <><div className="spinner" /> Submitting...</>
                                ) : (
                                    'Submit Test ✓'
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentIndex(p => Math.min(questions.length - 1, p + 1))}
                                style={{
                                    background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))',
                                    color: '#fff',
                                    boxShadow: '0 4px 12px rgba(91,127,255,0.3)'
                                }}
                                className="px-8 py-2.5 rounded-xl font-semibold transition-all text-sm hover:brightness-110 active:scale-95"
                            >
                                Next →
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
