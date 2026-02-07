'use client';

import { useState } from 'react';
import { verifyWorker, verifyHotel, declineWorker, declineHotel } from '../actions';
import { useRouter } from 'next/navigation';

interface VerificationActionsProps {
    id: string;
    type: 'WORKER' | 'HOTEL';
}

export function VerificationActions({ id, type }: VerificationActionsProps) {
    const [isDeclining, setIsDeclining] = useState(false);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleVerify = async () => {
        if (!confirm('Are you sure you want to verify this user?')) return;
        setLoading(true);
        try {
            if (type === 'WORKER') {
                await verifyWorker(id);
            } else {
                await verifyHotel(id);
            }
            router.refresh();
        } catch (e) {
            alert('Failed to verify');
            setLoading(false);
        }
    };

    const handleDecline = async () => {
        if (!reason) return;
        setLoading(true);
        try {
            if (type === 'WORKER') {
                await declineWorker(id, reason);
            } else {
                await declineHotel(id, reason);
            }
            setIsDeclining(false);
            setReason('');
            router.refresh();
        } catch (e) {
            alert('Failed to decline');
        } finally {
            setLoading(false);
        }
    };

    if (isDeclining) {
        return (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                    autoFocus
                    placeholder="Reason for rejection..."
                    className="input"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
                <button
                    onClick={handleDecline}
                    disabled={loading || !reason}
                    className="btn btn-sm btn-primary"
                    style={{ background: '#ef4444', border: 'none' }}
                >
                    Confirm
                </button>
                <button
                    onClick={() => setIsDeclining(false)}
                    className="btn btn-sm btn-ghost"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
                onClick={handleVerify}
                disabled={loading}
                className="btn btn-sm btn-primary"
                style={{ background: '#22c55e', border: 'none' }}
            >
                Verify
            </button>
            <button
                onClick={() => setIsDeclining(true)}
                disabled={loading}
                className="btn btn-sm btn-ghost"
                style={{ color: '#ef4444', borderColor: '#ef4444' }}
            >
                Decline
            </button>
        </div>
    );
}
