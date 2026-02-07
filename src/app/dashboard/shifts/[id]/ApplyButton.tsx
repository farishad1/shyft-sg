'use client';

import { useState, useTransition } from 'react';
import { applyForJob } from '../../actions';
import { CheckCircle2, Send } from 'lucide-react';

interface ApplyButtonProps {
    jobPostingId: string;
}

export function ApplyButton({ jobPostingId }: ApplyButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [applied, setApplied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleApply = () => {
        setError(null);
        startTransition(async () => {
            try {
                const result = await applyForJob(jobPostingId);
                if (result.success) {
                    setApplied(true);
                } else {
                    setError(result.error || 'Failed to apply');
                }
            } catch (e) {
                setError('An unexpected error occurred');
            }
        });
    };

    if (applied) {
        return (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#22c55e', marginBottom: '0.5rem' }}>
                    <CheckCircle2 size={24} />
                    <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>Application Submitted!</span>
                </div>
                <p style={{ color: '#888' }}>The hotel will review your application.</p>
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center' }}>
            {error && (
                <div className="badge-declined" style={{ padding: '0.75rem', marginBottom: '1rem', width: '100%', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <button
                onClick={handleApply}
                disabled={isPending}
                className="btn btn-primary btn-lg"
                style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.125rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}
            >
                {isPending ? (
                    'Submitting Application...'
                ) : (
                    <>
                        <Send size={20} />
                        Apply For This Shift
                    </>
                )}
            </button>

            <p style={{ color: '#888', fontSize: '0.875rem', marginTop: '1rem' }}>
                By applying, you confirm your availability for this shift.
            </p>
        </div>
    );
}
