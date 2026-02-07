'use client';

import { useState } from 'react';
import { acceptApplication, declineApplication } from '../../actions';
import { Lock } from 'lucide-react';

interface ApplicantActionsProps {
    applicationId: string;
    isLocked: boolean;
}

export function ApplicantActions({ applicationId, isLocked }: ApplicantActionsProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAccept = async () => {
        if (!confirm('Accept this applicant? This will fill the position and decline all other applicants.')) return;
        setLoading(true);
        setError(null);

        try {
            const result = await acceptApplication(applicationId);
            if (!result.success && result.error) {
                setError(result.error);
            }
        } catch (e) {
            setError('Failed to accept application');
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async () => {
        if (isLocked) return;
        if (!confirm('Decline this applicant?')) return;
        setLoading(true);
        setError(null);

        try {
            const result = await declineApplication(applicationId);
            if (!result.success && result.error) {
                setError(result.error);
            }
        } catch (e) {
            setError('Failed to decline application');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{error}</span>;
    }

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
                onClick={handleAccept}
                disabled={loading}
                className="btn btn-sm btn-primary"
                style={{ background: '#22c55e', border: 'none' }}
            >
                Accept
            </button>

            {isLocked ? (
                <button
                    disabled
                    className="btn btn-sm btn-ghost"
                    style={{ opacity: 0.5, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    title="Cannot decline within 12 hours of shift start"
                >
                    <Lock size={12} /> Locked
                </button>
            ) : (
                <button
                    onClick={handleDecline}
                    disabled={loading}
                    className="btn btn-sm btn-ghost"
                    style={{ color: '#ef4444', borderColor: '#ef4444' }}
                >
                    Decline
                </button>
            )}
        </div>
    );
}
