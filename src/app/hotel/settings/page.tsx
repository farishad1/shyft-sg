import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Settings, Crown, Bell, Sliders, XCircle, CheckCircle } from 'lucide-react';
import { TIER_THRESHOLDS } from '@/lib/constants';
import { SubscriptionButton } from './SubscriptionButton';
import { SettingsForm } from './SettingsForm';

export default async function HotelSettingsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');
    if (!prisma) return <div>Database not connected</div>;

    const hotelProfile = await prisma.hotelProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!hotelProfile) redirect('/hotel');

    // Calculate tier progress
    const hoursHired = hotelProfile.totalHoursHired;
    const currentTier = hotelProfile.tier;

    let nextTier: string | null = null;
    let progressPercent = 100;
    let hoursToNext = 0;

    if (currentTier === 'SILVER') {
        nextTier = 'Gold';
        progressPercent = Math.min(100, (hoursHired / TIER_THRESHOLDS.HOTEL.GOLD) * 100);
        hoursToNext = Math.max(0, TIER_THRESHOLDS.HOTEL.GOLD - hoursHired);
    } else if (currentTier === 'GOLD') {
        nextTier = 'Platinum';
        const range = TIER_THRESHOLDS.HOTEL.PLATINUM - TIER_THRESHOLDS.HOTEL.GOLD;
        const progress = hoursHired - TIER_THRESHOLDS.HOTEL.GOLD;
        progressPercent = Math.min(100, (progress / range) * 100);
        hoursToNext = Math.max(0, TIER_THRESHOLDS.HOTEL.PLATINUM - hoursHired);
    }

    const tierColors: Record<string, string> = {
        SILVER: '#C0C0C0',
        GOLD: '#EFBF04',
        PLATINUM: '#E5E4E2',
    };

    const tierEmoji: Record<string, string> = {
        SILVER: '🥈',
        GOLD: '🥇',
        PLATINUM: '💎',
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    <Settings size={24} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--accent)' }} />
                    Settings
                </h1>
                <p style={{ color: '#888' }}>Manage your hotel profile, subscription, and preferences</p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* ---- Tier Progress ---- */}
                <div style={{
                    background: '#111', border: '1px solid #333', borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <Crown size={20} style={{ color: 'var(--accent)' }} />
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Tier Progress</h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '2rem' }}>{tierEmoji[currentTier]}</span>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: tierColors[currentTier] }}>
                                {currentTier}
                            </div>
                            <div style={{ color: '#888', fontSize: '0.8125rem' }}>
                                {hoursHired.toFixed(0)} hours hired • {hotelProfile.shiftsFilled} shifts filled
                            </div>
                        </div>
                    </div>

                    {nextTier && (
                        <>
                            <div style={{
                                background: '#222', borderRadius: '999px', height: '0.5rem',
                                overflow: 'hidden', marginBottom: '0.5rem',
                            }}>
                                <div style={{
                                    height: '100%', borderRadius: '999px',
                                    background: `linear-gradient(90deg, ${tierColors[currentTier]}, var(--accent))`,
                                    width: `${progressPercent}%`,
                                    transition: 'width 0.5s ease',
                                }} />
                            </div>
                            <p style={{ color: '#888', fontSize: '0.8125rem', margin: 0 }}>
                                {hoursToNext.toFixed(0)} more hours to reach <span style={{ color: tierColors[nextTier.toUpperCase()], fontWeight: 600 }}>{nextTier}</span>
                            </p>
                        </>
                    )}

                    {!nextTier && (
                        <p style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
                            🎉 You&apos;ve reached the highest tier! Enjoy premium benefits.
                        </p>
                    )}
                </div>

                {/* ---- Subscription Management ---- */}
                <div style={{
                    background: '#111', border: '1px solid #333', borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        {hotelProfile.subscriptionActive ? (
                            <CheckCircle size={20} style={{ color: '#22c55e' }} />
                        ) : (
                            <XCircle size={20} style={{ color: '#ef4444' }} />
                        )}
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Subscription</h2>
                    </div>

                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '1rem', background: '#0a0a0a', borderRadius: 'var(--radius-sm)', border: '1px solid #222',
                    }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>
                                Status: {' '}
                                <span style={{ color: hotelProfile.subscriptionActive ? '#22c55e' : '#ef4444' }}>
                                    {hotelProfile.subscriptionActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div style={{ color: '#888', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                                {hotelProfile.subscriptionActive
                                    ? 'You can post shifts and receive applications.'
                                    : 'Reactivate to post shifts and receive applications.'}
                            </div>
                        </div>
                        <SubscriptionButton isActive={hotelProfile.subscriptionActive} />
                    </div>
                </div>

                {/* ---- Creative Settings ---- */}
                <SettingsForm />
            </div>
        </div>
    );
}
