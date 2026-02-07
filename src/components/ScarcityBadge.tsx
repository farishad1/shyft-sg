'use client';

import { Flame, CheckCircle } from 'lucide-react';

interface ScarcityBadgeProps {
    slotsOpen: number;
    totalSlots?: number;
}

export function ScarcityBadge({ slotsOpen }: ScarcityBadgeProps) {
    // High availability (>3 spots): Green/Neutral
    if (slotsOpen > 3) {
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.75rem',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: 'var(--radius-full)',
                color: '#22c55e',
                fontSize: '0.75rem',
                fontWeight: 600
            }}>
                <CheckCircle size={12} />
                {slotsOpen} spots available
            </span>
        );
    }

    // Low availability (1-3 spots): Red/Bold urgency
    if (slotsOpen >= 1 && slotsOpen <= 3) {
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.75rem',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: 'var(--radius-full)',
                color: '#ef4444',
                fontSize: '0.75rem',
                fontWeight: 700,
                animation: 'pulse 2s ease-in-out infinite'
            }}>
                <Flame size={12} />
                🔥 Only {slotsOpen} {slotsOpen === 1 ? 'spot' : 'spots'} left!
            </span>
        );
    }

    // Full (0 spots): Greyed out
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            background: 'rgba(156, 163, 175, 0.1)',
            border: '1px solid rgba(156, 163, 175, 0.3)',
            borderRadius: 'var(--radius-full)',
            color: '#9CA3AF',
            fontSize: '0.75rem',
            fontWeight: 500
        }}>
            Fully Booked
        </span>
    );
}

// Inline style for pulse animation
const pulseKeyframes = `
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
`;

// Inject the keyframes once
if (typeof document !== 'undefined') {
    const styleId = 'scarcity-badge-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = pulseKeyframes;
        document.head.appendChild(style);
    }
}
