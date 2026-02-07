'use client';

import { useState } from 'react';
import { Star, Lock, Crown } from 'lucide-react';

interface AllStarFilterProps {
    isPremium: boolean;
    onFilterChange: (showOnlyAllStar: boolean) => void;
}

export function AllStarFilter({ isPremium, onFilterChange }: AllStarFilterProps) {
    const [isEnabled, setIsEnabled] = useState(false);

    const handleToggle = () => {
        if (!isPremium) return;
        const newState = !isEnabled;
        setIsEnabled(newState);
        onFilterChange(newState);
    };

    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: isPremium ? 'rgba(239,191,4,0.1)' : '#111',
                border: `1px solid ${isPremium ? 'var(--accent)' : '#333'}`,
                borderRadius: 'var(--radius-md)',
                cursor: isPremium ? 'pointer' : 'not-allowed',
                opacity: isPremium ? 1 : 0.7,
                position: 'relative'
            }}
            onClick={handleToggle}
            title={isPremium ? 'Toggle All-Star filter' : 'Unlock Premium to filter by rating'}
        >
            {/* Toggle Switch */}
            <div style={{
                width: '40px',
                height: '22px',
                background: isEnabled ? 'var(--accent)' : '#333',
                borderRadius: '11px',
                padding: '2px',
                transition: 'background 0.2s',
                position: 'relative'
            }}>
                <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'transform 0.2s',
                    transform: isEnabled ? 'translateX(18px)' : 'translateX(0)'
                }} />
            </div>

            {/* Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={16} fill={isEnabled ? 'var(--accent)' : 'none'} color="var(--accent)" />
                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    Show Only All-Star Staff (4.5+ ★)
                </span>
            </div>

            {/* Lock icon for non-premium */}
            {!isPremium && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    marginLeft: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    background: '#222',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    color: '#888'
                }}>
                    <Lock size={12} />
                    <span>Premium</span>
                </div>
            )}

            {/* Premium badge */}
            {isPremium && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    marginLeft: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    background: 'var(--accent)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    color: '#000',
                    fontWeight: 600
                }}>
                    <Crown size={12} />
                    <span>Premium</span>
                </div>
            )}
        </div>
    );
}

// Tooltip component for explaining premium benefits
export function PremiumTooltip() {
    return (
        <div style={{
            padding: '1rem',
            background: '#111',
            border: '1px solid #333',
            borderRadius: 'var(--radius-md)',
            maxWidth: '300px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Crown size={18} color="var(--accent)" />
                <span style={{ fontWeight: 600 }}>Unlock Premium</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#888', margin: 0 }}>
                Fill 25+ shifts to automatically unlock Premium features including:
            </p>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#ccc' }}>
                <li>Filter by All-Star staff (4.5+ ★)</li>
                <li>Priority support</li>
                <li>Featured job placement</li>
            </ul>
        </div>
    );
}
