'use client';

import { useState } from 'react';
import { createJobPosting } from '../../actions';

interface JobPostingFormProps {
    defaultLocation: string;
}

export function JobPostingForm({ defaultLocation }: JobPostingFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await createJobPosting(formData);
            if (result && !result.success && result.error) {
                setError(result.error);
                setIsSubmitting(false);
            }
            // If successful, the server action redirects
        } catch (err) {
            setError('An unexpected error occurred');
            setIsSubmitting(false);
        }
    };

    // Get tomorrow's date as minimum for date picker
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
            {error && (
                <div className="badge-declined" style={{ padding: '0.75rem', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <div>
                <label className="label">Role Title</label>
                <input
                    name="title"
                    required
                    className="input"
                    placeholder="e.g. Front Desk Agent, Housekeeping"
                />
            </div>

            <div>
                <label className="label">Shift Date</label>
                <input
                    name="shiftDate"
                    type="date"
                    required
                    className="input"
                    min={minDate}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label className="label">Start Time</label>
                    <input
                        name="startTime"
                        type="time"
                        required
                        className="input"
                    />
                </div>
                <div>
                    <label className="label">End Time</label>
                    <input
                        name="endTime"
                        type="time"
                        required
                        className="input"
                    />
                </div>
            </div>

            <div>
                <label className="label">Hourly Pay ($)</label>
                <input
                    name="hourlyPay"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    className="input"
                    placeholder="e.g. 15.00"
                />
            </div>

            <div>
                <label className="label">Location</label>
                <input
                    name="location"
                    required
                    className="input"
                    defaultValue={defaultLocation}
                    placeholder="e.g. 123 Orchard Road, Singapore"
                />
            </div>

            <div>
                <label className="label">Notes (Optional)</label>
                <textarea
                    name="note"
                    className="input"
                    rows={3}
                    placeholder="Any additional requirements or information..."
                />
            </div>

            <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Creating Job Posting...' : 'Post Shift'}
            </button>
        </form>
    );
}
