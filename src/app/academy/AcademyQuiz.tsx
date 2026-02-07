'use client';

import { useState } from 'react';
import { completeTraining } from './actions';

export function AcademyQuiz() {
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedAnswer) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.set('answer', selectedAnswer);

        try {
            const result = await completeTraining(formData);
            if (result && !result.success && result.error) {
                setError(result.error);
                setLoading(false);
            }
            // If successful, the server action redirects
        } catch (err) {
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    const options = [
        { value: 'A', label: 'Be late to shifts' },
        { value: 'B', label: 'Guest Experience' },
        { value: 'C', label: 'Ignore guest requests' },
    ];

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 500, marginBottom: '1rem' }}>
                    What is the most important rule at Shyft Sg?
                </p>

                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {options.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '1rem',
                                background: selectedAnswer === option.value ? 'rgba(212,175,55,0.1)' : '#222',
                                border: selectedAnswer === option.value ? '1px solid var(--accent)' : '1px solid #333',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <input
                                type="radio"
                                name="answer"
                                value={option.value}
                                checked={selectedAnswer === option.value}
                                onChange={(e) => setSelectedAnswer(e.target.value)}
                                style={{ accentColor: 'var(--accent)' }}
                            />
                            <span><strong>{option.value}.</strong> {option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {error && (
                <div className="badge-declined" style={{ padding: '0.75rem', marginBottom: '1rem', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={!selectedAnswer || loading}
            >
                {loading ? 'Submitting...' : 'Complete Training'}
            </button>
        </form>
    );
}
