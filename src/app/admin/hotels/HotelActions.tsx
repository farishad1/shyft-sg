'use client';

import { useState, useTransition } from 'react';
import { banUser, unbanUser, unverifyUser, toggleSubscription } from '../actions';
import { MoreHorizontal, Eye, Ban, ShieldX, RotateCcw, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HotelDetails {
    name: string;
    email: string;
    uen: string;
    location: string;
}

interface HotelActionsProps {
    userId: string;
    hotelProfileId: string;
    isActive: boolean;
    isVerified: boolean;
    subscriptionActive: boolean;
    hotel: HotelDetails;
}

export function HotelActions({ userId, hotelProfileId, isActive, isVerified, subscriptionActive, hotel }: HotelActionsProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showBanModal, setShowBanModal] = useState(false);
    const [banReason, setBanReason] = useState('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleBan = () => {
        if (!banReason.trim()) return;
        startTransition(async () => {
            await banUser(userId, banReason);
            setShowBanModal(false);
            setBanReason('');
            router.refresh();
        });
    };

    const handleUnban = () => {
        startTransition(async () => {
            await unbanUser(userId);
            setShowDropdown(false);
            router.refresh();
        });
    };

    const handleUnverify = () => {
        startTransition(async () => {
            await unverifyUser(userId);
            setShowDropdown(false);
            router.refresh();
        });
    };

    const handleToggleSubscription = () => {
        startTransition(async () => {
            await toggleSubscription(hotelProfileId);
            setShowDropdown(false);
            router.refresh();
        });
    };

    return (
        <>
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0.5rem' }}
                >
                    <MoreHorizontal size={18} />
                </button>

                {showDropdown && (
                    <>
                        <div
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
                            onClick={() => setShowDropdown(false)}
                        />
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            background: '#111',
                            border: '1px solid #333',
                            borderRadius: 'var(--radius-md)',
                            minWidth: '180px',
                            zIndex: 20,
                            overflow: 'hidden'
                        }}>
                            <button
                                onClick={() => { setShowProfile(true); setShowDropdown(false); }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'none',
                                    border: 'none',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <Eye size={16} /> View Details
                            </button>

                            <button
                                onClick={handleToggleSubscription}
                                disabled={isPending}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'none',
                                    border: 'none',
                                    color: subscriptionActive ? '#eab308' : '#22c55e',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                {subscriptionActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                {subscriptionActive ? 'Deactivate Sub' : 'Activate Sub'}
                            </button>

                            {isActive ? (
                                <button
                                    onClick={() => { setShowBanModal(true); setShowDropdown(false); }}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        background: 'none',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <Ban size={16} /> Ban Hotel
                                </button>
                            ) : (
                                <button
                                    onClick={handleUnban}
                                    disabled={isPending}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        background: 'none',
                                        border: 'none',
                                        color: '#22c55e',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <RotateCcw size={16} /> Unban Hotel
                                </button>
                            )}

                            {isVerified && isActive && (
                                <button
                                    onClick={handleUnverify}
                                    disabled={isPending}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        background: 'none',
                                        border: 'none',
                                        color: '#eab308',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <ShieldX size={16} /> Un-Verify
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Profile Modal */}
            {showProfile && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Hotel Details</h2>
                            <button onClick={() => setShowProfile(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>Hotel Name</label>
                                <span style={{ fontWeight: 500 }}>{hotel.name}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>Email</label>
                                <span>{hotel.email}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>UEN</label>
                                <span style={{ fontFamily: 'monospace' }}>{hotel.uen}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>Location</label>
                                <span>{hotel.location}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ban Modal */}
            {showBanModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444' }}>Ban Hotel</h2>
                            <button onClick={() => setShowBanModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ marginBottom: '1rem', color: '#888' }}>
                            This will prevent <strong style={{ color: '#fff' }}>{hotel.name}</strong> from posting jobs on the platform.
                        </p>

                        <textarea
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            placeholder="Enter reason for ban (required)"
                            className="input"
                            rows={3}
                            style={{ marginBottom: '1rem' }}
                        />

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setShowBanModal(false)}
                                className="btn btn-ghost"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBan}
                                disabled={isPending || !banReason.trim()}
                                className="btn"
                                style={{ flex: 1, background: '#ef4444', color: '#fff' }}
                            >
                                {isPending ? 'Banning...' : 'Ban Hotel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
