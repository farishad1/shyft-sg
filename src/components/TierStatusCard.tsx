'use client';

import { useState } from 'react';
import { Award, X, Gift, Star, Headphones, ChevronRight } from 'lucide-react';

type Tier = 'SILVER' | 'GOLD' | 'PLATINUM';

interface TierStatusCardProps {
    tier: Tier;
    hoursWorked: number;
}

const TIER_CONFIG = {
    SILVER: {
        label: 'Silver',
        color: '#9CA3AF',
        bgColor: 'rgba(156, 163, 175, 0.1)',
        borderColor: '#9CA3AF',
        minHours: 0,
        maxHours: 50,
    },
    GOLD: {
        label: 'Gold',
        color: '#EFBF04',
        bgColor: 'rgba(239, 191, 4, 0.1)',
        borderColor: '#EFBF04',
        minHours: 50,
        maxHours: 200,
    },
    PLATINUM: {
        label: 'Platinum',
        color: '#E5E4E2',
        bgColor: 'rgba(229, 228, 226, 0.1)',
        borderColor: '#E5E4E2',
        minHours: 200,
        maxHours: Infinity,
    },
};

const TIER_BENEFITS = {
    SILVER: {
        title: 'Silver Member',
        description: '0 - 50 hours worked',
        benefits: [
            { icon: '🥈', text: 'Silver Badge Status' },
            { icon: '📱', text: 'Access to all basic shifts' },
            { icon: '📊', text: 'Earnings dashboard' },
        ],
    },
    GOLD: {
        title: 'Gold Member',
        description: '50+ hours worked',
        benefits: [
            { icon: '🥇', text: 'Gold Badge Status' },
            { icon: '🚗', text: '$15 Grab Voucher' },
            { icon: '🍦', text: 'Free Yochi treat' },
            { icon: '⭐', text: 'Priority shift notifications' },
        ],
    },
    PLATINUM: {
        title: 'Platinum Member',
        description: 'Top 10% + High Rating',
        benefits: [
            { icon: '💎', text: 'Platinum Badge Status' },
            { icon: '🎧', text: 'Priority Admin Support' },
            { icon: '🔔', text: 'First access to premium shifts' },
            { icon: '🏆', text: 'Featured on hotel leaderboards' },
            { icon: '💰', text: 'Exclusive bonus opportunities' },
        ],
    },
};

export function TierStatusCard({ tier, hoursWorked }: TierStatusCardProps) {
    const [showBenefits, setShowBenefits] = useState(false);
    const config = TIER_CONFIG[tier];

    // Calculate progress to next tier
    let progressPercent = 0;
    let hoursToNext = 0;
    let nextTier: string | null = null;

    if (tier === 'SILVER') {
        progressPercent = Math.min((hoursWorked / 50) * 100, 100);
        hoursToNext = Math.max(50 - hoursWorked, 0);
        nextTier = 'Gold';
    } else if (tier === 'GOLD') {
        progressPercent = Math.min(((hoursWorked - 50) / 150) * 100, 100);
        hoursToNext = Math.max(200 - hoursWorked, 0);
        nextTier = 'Platinum';
    } else {
        progressPercent = 100;
        hoursToNext = 0;
        nextTier = null;
    }

    return (
        <>
            <div className="card" style={{
                padding: '1.5rem',
                background: config.bgColor,
                border: `2px solid ${config.borderColor}`,
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Tier Icon & Title */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '3rem',
                            height: '3rem',
                            borderRadius: '50%',
                            background: config.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Award size={24} color="#5A3E2B" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#9C8F84', textTransform: 'uppercase' }}>Current Tier</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: config.color }}>{config.label}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowBenefits(true)}
                        className="btn btn-ghost"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: `1px solid ${config.borderColor}`,
                            color: config.color
                        }}
                    >
                        <Gift size={16} /> View Benefits
                    </button>
                </div>

                {/* Progress Section */}
                {nextTier ? (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#9C8F84' }}>{hoursWorked.toFixed(1)} hours worked</span>
                            <span style={{ color: config.color, fontWeight: 600 }}>{hoursToNext.toFixed(0)}h to {nextTier}</span>
                        </div>
                        <div style={{
                            height: '10px',
                            background: '#E2D3C2',
                            borderRadius: '5px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${progressPercent}%`,
                                height: '100%',
                                background: `linear-gradient(90deg, ${config.color}, ${config.color}dd)`,
                                borderRadius: '5px',
                                transition: 'width 0.5s ease-out'
                            }} />
                        </div>
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        background: 'rgba(229,228,226,0.1)',
                        borderRadius: 'var(--radius-md)',
                        color: config.color
                    }}>
                        <Star size={18} fill={config.color} />
                        <span style={{ fontWeight: 600 }}>You&apos;ve reached the top tier!</span>
                    </div>
                )}
            </div>

            {/* Benefits Modal */}
            {showBenefits && (
                <TierBenefitsModal
                    tier={tier}
                    onClose={() => setShowBenefits(false)}
                />
            )}
        </>
    );
}

function TierBenefitsModal({ tier, onClose }: { tier: Tier; onClose: () => void }) {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
            }}
            onClick={onClose}
        >
            <div
                className="card"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    padding: 0
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #E2D3C2',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        <Award size={24} style={{ display: 'inline', marginRight: '0.5rem', color: TIER_CONFIG[tier].color }} />
                        Tier Benefits
                    </h2>
                    <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tier Cards */}
                <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                    {(['SILVER', 'GOLD', 'PLATINUM'] as Tier[]).map((t) => {
                        const config = TIER_CONFIG[t];
                        const benefits = TIER_BENEFITS[t];
                        const isCurrent = t === tier;

                        return (
                            <div
                                key={t}
                                style={{
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: isCurrent ? config.bgColor : '#FAF6F0',
                                    border: isCurrent ? `2px solid ${config.color}` : '1px solid #E2D3C2',
                                    opacity: isCurrent ? 1 : 0.7
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div style={{
                                        width: '2rem',
                                        height: '2rem',
                                        borderRadius: '50%',
                                        background: config.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Award size={16} color="#5A3E2B" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: config.color }}>{benefits.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9C8F84' }}>{benefits.description}</div>
                                    </div>
                                    {isCurrent && (
                                        <span style={{
                                            marginLeft: 'auto',
                                            padding: '0.25rem 0.75rem',
                                            background: config.color,
                                            color: '#5A3E2B',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}>
                                            Current
                                        </span>
                                    )}
                                </div>
                                <ul style={{ display: 'grid', gap: '0.5rem' }}>
                                    {benefits.benefits.map((benefit, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#5C524A' }}>
                                            <span>{benefit.icon}</span>
                                            <span>{benefit.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2D3C2', background: '#FAF6F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9C8F84', fontSize: '0.875rem' }}>
                        <Headphones size={16} />
                        <span>Need help? <a href="/messages/support" style={{ color: 'var(--accent)' }}>Contact Support</a></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
