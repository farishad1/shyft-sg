'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertTriangle, Clock } from 'lucide-react';

interface CancelShiftButtonProps {
    shiftId: string;
    shiftStartTime: Date;
    shiftTitle: string;
}

export function CancelShiftButton({ shiftId, shiftStartTime, shiftTitle }: CancelShiftButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reason, setReason] = useState('');
    const router = useRouter();

    // Calculate if within 24 hours
    const msUntilShift = new Date(shiftStartTime).getTime() - Date.now();
    const hoursUntilShift = msUntilShift / (1000 * 60 * 60);
    const isWithin24Hours = hoursUntilShift < 24;

    const handleCancel = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/shifts/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shiftId,
                    reason,
                    isLateCancellation: isWithin24Hours
                })
            });

            if (response.ok) {
                router.refresh();
                setShowModal(false);
            } else {
                alert('Failed to cancel shift. Please try again.');
            }
        } catch (error) {
            console.error('Cancellation error:', error);
            alert('Error cancelling shift');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="btn btn-ghost btn-sm"
                style={{
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    fontSize: '0.75rem'
                }}
            >
                <X size={14} /> Cancel Shift
            </button>

            {showModal && (
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
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="card"
                        style={{
                            width: '100%',
                            maxWidth: '450px',
                            padding: 0
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid #333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <AlertTriangle size={24} color="#ef4444" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Cancel Shift</h2>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '1.5rem' }}>
                            <p style={{ marginBottom: '1rem', color: '#ccc' }}>
                                Are you sure you want to cancel <strong>{shiftTitle}</strong>?
                            </p>

                            {/* 24-Hour Warning */}
                            {isWithin24Hours && (
                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(239,68,68,0.1)',
                                    border: '1px solid #ef4444',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <Clock size={16} color="#ef4444" />
                                        <strong style={{ color: '#ef4444' }}>STRICT POLICY</strong>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: '#f87171', margin: 0 }}>
                                        Cancellations within 24 hours of the shift start time will result in an
                                        <strong> immediate violation record</strong> and potential <strong>account suspension</strong>.
                                    </p>
                                </div>
                            )}

                            {/* Time Indicator */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem',
                                background: '#111',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '1rem',
                                fontSize: '0.875rem'
                            }}>
                                <Clock size={16} color={isWithin24Hours ? '#ef4444' : '#888'} />
                                <span style={{ color: isWithin24Hours ? '#ef4444' : '#888' }}>
                                    {hoursUntilShift > 0
                                        ? `${Math.floor(hoursUntilShift)} hours until shift starts`
                                        : 'Shift has already started'}
                                </span>
                            </div>

                            {/* Reason Input */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#888' }}>
                                    Reason for cancellation {isWithin24Hours && <span style={{ color: '#ef4444' }}>*</span>}
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please explain why you need to cancel..."
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
                                    required={isWithin24Hours}
                                />
                            </div>

                            {isWithin24Hours && (
                                <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '1rem' }}>
                                    ⚠️ Your cancellation will be flagged as <strong style={{ color: '#ef4444' }}>LATE_CANCELLATION</strong> and reviewed by admin.
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderTop: '1px solid #333',
                            display: 'flex',
                            gap: '0.75rem',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn btn-ghost"
                            >
                                Keep Shift
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isSubmitting || (isWithin24Hours && !reason.trim())}
                                className="btn"
                                style={{
                                    background: '#ef4444',
                                    color: '#fff',
                                    opacity: isSubmitting || (isWithin24Hours && !reason.trim()) ? 0.5 : 1
                                }}
                            >
                                {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
