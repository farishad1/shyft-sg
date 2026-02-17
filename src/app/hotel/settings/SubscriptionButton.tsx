'use client';

import { useState, useTransition } from 'react';
import { cancelSubscription, reactivateSubscription } from './actions';

export function SubscriptionButton({ isActive }: { isActive: boolean }) {
    const [isPending, startTransition] = useTransition();
    const [confirmed, setConfirmed] = useState(false);

    const handleClick = () => {
        if (isActive && !confirmed) {
            setConfirmed(true);
            return;
        }

        startTransition(async () => {
            if (isActive) {
                await cancelSubscription();
            } else {
                await reactivateSubscription();
            }
            setConfirmed(false);
        });
    };

    if (isActive && confirmed) {
        return (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={handleClick}
                    disabled={isPending}
                    style={{
                        padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none',
                        background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer',
                        fontSize: '0.8125rem', opacity: isPending ? 0.5 : 1,
                    }}
                >
                    {isPending ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
                <button
                    onClick={() => setConfirmed(false)}
                    disabled={isPending}
                    style={{
                        padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #333',
                        background: 'transparent', color: '#888', fontWeight: 600, cursor: 'pointer',
                        fontSize: '0.8125rem',
                    }}
                >
                    Keep Active
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            style={{
                padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none',
                background: isActive ? '#333' : 'var(--accent)',
                color: isActive ? '#ccc' : '#000',
                fontWeight: 600, cursor: 'pointer', fontSize: '0.8125rem',
                opacity: isPending ? 0.5 : 1,
            }}
        >
            {isPending
                ? (isActive ? 'Cancelling...' : 'Activating...')
                : (isActive ? 'Cancel Subscription' : 'Reactivate')}
        </button>
    );
}
