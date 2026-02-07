'use client';

import { useState, useTransition } from 'react';
import { banUser, unbanUser, unverifyUser, deleteUser, removeUser } from '../actions';
import { MoreHorizontal, Eye, Ban, ShieldX, RotateCcw, X, Trash2, UserX } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WorkerDetails {
    name: string;
    email: string;
    phone: string;
    dob: string;
    school: string;
    workPass: string;
}

interface UserActionsProps {
    userId: string;
    isActive: boolean;
    isVerified: boolean;
    worker: WorkerDetails;
}

export function UserActions({ userId, isActive, isVerified, worker }: UserActionsProps) {
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
                            minWidth: '160px',
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
                                <Eye size={16} /> View Profile
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
                                    <Ban size={16} /> Ban User
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
                                    <RotateCcw size={16} /> Unban User
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
                                <UserX size={16} /> Remove User
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
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Worker Profile</h2>
                            <button onClick={() => setShowProfile(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>Name</label>
                                <span style={{ fontWeight: 500 }}>{worker.name}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>Email</label>
                                <span>{worker.email}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>Phone</label>
                                <span>{worker.phone}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>Date of Birth</label>
                                <span>{worker.dob}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>School</label>
                                <span>{worker.school}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>Work Pass Type</label>
                                <span className="badge">{worker.workPass}</span>
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
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444' }}>Ban User</h2>
                            <button onClick={() => setShowBanModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ marginBottom: '1rem', color: '#888' }}>
                            This will prevent <strong style={{ color: '#fff' }}>{worker.name}</strong> from accessing the platform.
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
                                {isPending ? 'Banning...' : 'Ban User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
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
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#dc2626' }}>Delete User</h2>
                            <button onClick={() => setShowDeleteModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ marginBottom: '1rem', color: '#888' }}>
                            Are you sure you want to <strong style={{ color: '#dc2626' }}>permanently delete</strong>{' '}
                            <strong style={{ color: '#fff' }}>{worker.name}</strong>?
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
                </div>
            )}

            {/* Remove Modal */}
            {showRemoveModal && (
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
                    <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f97316' }}>Remove User</h2>
                            <button onClick={() => { setShowRemoveModal(false); setRemoveReason(''); }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ marginBottom: '1rem', color: '#888' }}>
                            Are you sure you want to remove <strong style={{ color: '#fff' }}>{worker.name}</strong>?
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
                                {isPending ? 'Removing...' : 'Remove User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
