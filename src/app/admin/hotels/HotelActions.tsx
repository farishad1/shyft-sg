'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { banUser, unbanUser, unverifyUser, toggleSubscription, deleteUser, removeUser } from '../actions';
import { MoreHorizontal, Eye, Ban, ShieldX, RotateCcw, X, ToggleLeft, ToggleRight, Trash2, UserX } from 'lucide-react';
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [banReason, setBanReason] = useState('');
    const [removeReason, setRemoveReason] = useState('');
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

    const handleDelete = () => {
        startTransition(async () => {
            await deleteUser(userId);
            setShowDeleteModal(false);
            router.refresh();
        });
    };

    const handleRemove = () => {
        if (!removeReason.trim()) return;
        startTransition(async () => {
            const result = await removeUser(userId, removeReason.trim());
            if (result.success) {
                setShowRemoveModal(false);
                setRemoveReason('');
                router.refresh();
            }
        });
    };

    // Track if component is mounted (for SSR-safe portal)
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    // Close handlers
    const closeProfile = useCallback(() => setShowProfile(false), []);
    const closeBanModal = useCallback(() => { setShowBanModal(false); setBanReason(''); }, []);
    const closeDeleteModal = useCallback(() => setShowDeleteModal(false), []);
    const closeRemoveModal = useCallback(() => { setShowRemoveModal(false); setRemoveReason(''); }, []);

    // Check if any modal is open
    const anyModalOpen = showProfile || showBanModal || showDeleteModal || showRemoveModal;

    // Escape key and scroll lock for all modals
    useEffect(() => {
        if (!anyModalOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeProfile();
                closeBanModal();
                closeDeleteModal();
                closeRemoveModal();
            }
        };

        // Lock body scroll
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [anyModalOpen, closeProfile, closeBanModal, closeDeleteModal, closeRemoveModal]);

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

                            <div style={{ height: '1px', background: '#333', margin: '0.25rem 0' }} />

                            <button
                                onClick={() => { setShowRemoveModal(true); setShowDropdown(false); }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'none',
                                    border: 'none',
                                    color: '#f97316',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <UserX size={16} /> Remove Hotel
                            </button>

                            <button
                                onClick={() => { setShowDeleteModal(true); setShowDropdown(false); }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'none',
                                    border: 'none',
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <Trash2 size={16} /> Delete Permanently
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Modals rendered via Portal to escape table constraints */}
            {isMounted && showProfile && createPortal(
                <>
                    {/* Backdrop - click to close */}
                    <div
                        onClick={closeProfile}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 9998,
                        }}
                    />

                    {/* Modal Card - Centered */}
                    <div
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 9999,
                            width: '100%',
                            maxWidth: '450px',
                            padding: '0 1rem',
                        }}
                    >
                        <div
                            className="card"
                            style={{
                                padding: '2rem',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1.5rem',
                                paddingBottom: '1rem',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff' }}>Hotel Details</h2>
                                <button
                                    onClick={closeProfile}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: 'none',
                                        color: '#888',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        borderRadius: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Profile Content Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hotel Name</label>
                                    <span style={{ fontWeight: 600, fontSize: '1.125rem', color: '#fff' }}>{hotel.name}</span>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                                    <span style={{ color: '#a3a3a3' }}>{hotel.email}</span>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>UEN</label>
                                    <span style={{ color: '#a3a3a3', fontFamily: 'monospace' }}>{hotel.uen}</span>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</label>
                                    <span style={{ color: '#a3a3a3' }}>{hotel.location}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <button
                                    onClick={closeProfile}
                                    className="btn btn-ghost"
                                    style={{ width: '100%' }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </>,
                document.body
            )}

            {/* Ban Modal */}
            {isMounted && showBanModal && createPortal(
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
                    zIndex: 9999
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
                </div>,
                document.body
            )}

            {/* Delete Modal */}
            {isMounted && showDeleteModal && createPortal(
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
                    zIndex: 9999
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#dc2626' }}>Delete Hotel</h2>
                            <button onClick={() => setShowDeleteModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ marginBottom: '1rem', color: '#888' }}>
                            Are you sure you want to <strong style={{ color: '#dc2626' }}>permanently delete</strong>{' '}
                            <strong style={{ color: '#fff' }}>{hotel.name}</strong>?
                        </p>
                        <p style={{ marginBottom: '1.5rem', color: '#ef4444', fontSize: '0.875rem' }}>
                            ⚠️ This action cannot be undone. All data will be permanently removed.
                        </p>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="btn btn-ghost"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isPending}
                                className="btn"
                                style={{ flex: 1, background: '#dc2626', color: '#fff' }}
                            >
                                {isPending ? 'Deleting...' : 'Delete Forever'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Remove Modal */}
            {isMounted && showRemoveModal && createPortal(
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
                    zIndex: 9999
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f97316' }}>Remove Hotel</h2>
                            <button onClick={() => { setShowRemoveModal(false); setRemoveReason(''); }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ marginBottom: '1rem', color: '#888' }}>
                            Are you sure you want to remove <strong style={{ color: '#fff' }}>{hotel.name}</strong>?
                        </p>
                        <p style={{ marginBottom: '1rem', color: '#888', fontSize: '0.875rem' }}>
                            The user will be unable to log in and will see the reason you provide below.
                        </p>

                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
                            Reason for removal: <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                            value={removeReason}
                            onChange={(e) => setRemoveReason(e.target.value)}
                            placeholder="Enter reason for removal (required)"
                            className="input"
                            rows={3}
                            style={{ marginBottom: '1rem', width: '100%' }}
                        />

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => { setShowRemoveModal(false); setRemoveReason(''); }}
                                className="btn btn-ghost"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRemove}
                                disabled={isPending || !removeReason.trim()}
                                className="btn"
                                style={{ flex: 1, background: '#f97316', color: '#fff', opacity: !removeReason.trim() ? 0.5 : 1 }}
                            >
                                {isPending ? 'Removing...' : 'Remove Hotel'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
