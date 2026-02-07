'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, CheckCircle, AlertTriangle } from 'lucide-react';

interface HotelBanButtonProps {
    hotelId: string;
    hotelName: string;
    isBanned: boolean;
}

export function HotelBanButton({ hotelId, hotelName, isBanned }: HotelBanButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reason, setReason] = useState('');
    const router = useRouter();

    const handleAction = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/admin/hotels/ban', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hotelId,
                    action: isBanned ? 'unban' : 'ban',
                    reason
                })
            });

            if (response.ok) {
                router.refresh();
                setShowModal(false);
                setReason('');
            } else {
                alert('Failed to update hotel status');
            }
        } catch (error) {
            console.error('Ban action error:', error);
            alert('Error updating hotel status');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isBanned) {
        return (
            <>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: '#22c55e', border: '1px solid #22c55e', fontSize: '0.75rem' }}
                >
                    <CheckCircle size={14} /> Unban
                </button>

                {showModal && (
                    <Modal
                        title="Unban Hotel"
                        onClose={() => setShowModal(false)}
                    >
                        <p style={{ marginBottom: '1rem' }}>
                            Are you sure you want to unban <strong>{hotelName}</strong>?
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#888', marginBottom: '1.5rem' }}>
                            The hotel will be able to post shifts and access all features again.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                            <button
                                onClick={handleAction}
                                disabled={isSubmitting}
                                className="btn btn-primary"
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm Unban'}
                            </button>
                        </div>
                    </Modal>
                )}
            </>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="btn btn-ghost btn-sm"
                style={{ color: '#ef4444', border: '1px solid #ef4444', fontSize: '0.75rem' }}
            >
                <Ban size={14} /> Ban
            </button>

            {showModal && (
                <Modal
                    title="Ban Hotel"
                    onClose={() => setShowModal(false)}
                >
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid #ef4444',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <AlertTriangle size={24} color="#ef4444" />
                        <div>
                            <strong style={{ color: '#ef4444' }}>Warning</strong>
                            <p style={{ fontSize: '0.875rem', color: '#f87171', margin: 0 }}>
                                Banning will prevent {hotelName} from posting shifts and accessing the platform.
                            </p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#888' }}>
                            Reason for ban <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Fake hotel, fraudulent activity, policy violations..."
                            style={{
                                width: '100%',
                                minHeight: '80px',
                                padding: '0.75rem',
                                background: '#111',
                                border: '1px solid #333',
                                borderRadius: 'var(--radius-md)',
                                color: '#fff',
                                resize: 'vertical'
                            }}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                        <button
                            onClick={handleAction}
                            disabled={isSubmitting || !reason.trim()}
                            style={{
                                background: '#ef4444',
                                color: '#fff',
                                opacity: isSubmitting || !reason.trim() ? 0.5 : 1
                            }}
                            className="btn"
                        >
                            {isSubmitting ? 'Banning...' : 'Confirm Ban'}
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
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
                style={{ width: '100%', maxWidth: '450px', padding: '1.5rem' }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>{title}</h2>
                {children}
            </div>
        </div>
    );
}
