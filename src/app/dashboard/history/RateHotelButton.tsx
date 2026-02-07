'use client';

import { useState, useTransition } from 'react';
import { rateHotel } from './actions';
import { Star, X } from 'lucide-react';

interface RateHotelButtonProps {
    shiftId: string;
}

export function RateHotelButton({ shiftId }: RateHotelButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [rated, setRated] = useState(false);

    if (rated) {
        return <span style={{ color: '#22c55e', fontSize: '0.875rem' }}>✓ Rated</span>;
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="btn btn-ghost btn-sm"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
            >
                <Star size={14} style={{ marginRight: '0.25rem' }} />
                Rate Hotel
            </button>

            {showModal && (
                <RatingModal
                    shiftId={shiftId}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setRated(true); setShowModal(false); }}
                />
            )}
        </>
    );
}

interface RatingModalProps {
    shiftId: string;
    onClose: () => void;
    onSuccess: () => void;
}

function RatingModal({ shiftId, onClose, onSuccess }: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        if (rating < 1) {
            setError('Please select a rating');
            return;
        }

        startTransition(async () => {
            try {
                const result = await rateHotel(shiftId, rating, review);
                if (result.success) {
                    onSuccess();
                } else {
                    setError(result.error || 'Failed to submit rating');
                }
            } catch (e) {
                setError('An unexpected error occurred');
            }
        });
    };

    return (
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
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Rate Hotel</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="badge-declined" style={{ padding: '0.5rem', marginBottom: '1rem', textAlign: 'center', width: '100%' }}>
                        {error}
                    </div>
                )}

                {/* Star Rating */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '2rem',
                                color: star <= rating ? 'var(--accent)' : '#333',
                                transition: 'transform 0.2s'
                            }}
                        >
                            ★
                        </button>
                    ))}
                </div>

                {/* Review */}
                <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Leave a review (optional)"
                    className="input"
                    rows={3}
                    style={{ marginBottom: '1rem' }}
                />

                <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                >
                    {isPending ? 'Submitting...' : 'Submit Rating'}
                </button>
            </div>
        </div>
    );
}
