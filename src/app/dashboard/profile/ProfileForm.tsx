'use client';

import { useState } from 'react';
import { updateProfile } from './actions';
import { Check, Loader2, AlertCircle } from 'lucide-react';

interface ProfileFormProps {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    bio: string | null;
    isPhoneVerified: boolean;
}

export function ProfileForm({
    firstName,
    lastName,
    email,
    phoneNumber,
    bio,
    isPhoneVerified
}: ProfileFormProps) {
    const [formData, setFormData] = useState({
        firstName: firstName || '',
        lastName: lastName || '',
        phoneNumber: phoneNumber || '',
        bio: bio || ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            const result = await updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber,
                bio: formData.bio
            });

            if (result.success) {
                setStatus('success');
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
                setErrorMessage(result.error || 'Failed to update profile');
            }
        } catch (error) {
            setStatus('error');
            setErrorMessage('An unexpected error occurred');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="label">First Name</label>
                    <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="input"
                        placeholder="Enter first name"
                    />
                </div>
                <div className="space-y-2">
                    <label className="label">Last Name</label>
                    <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="input"
                        placeholder="Enter last name"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="label">Email Address</label>
                <input
                    type="email"
                    disabled
                    value={email}
                    className="input"
                    style={{ opacity: 0.6, cursor: 'not-allowed', color: '#9C8F84' }}
                />
                <p style={{ fontSize: '0.75rem', color: '#9C8F84' }}>Email cannot be changed. Contact support for assistance.</p>
            </div>

            <div className="space-y-2">
                <label className="label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    Phone Number
                    {isPhoneVerified && (
                        <span style={{ fontSize: '0.75rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Check size={12} /> Verified
                        </span>
                    )}
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{
                        background: '#FAF6F0',
                        border: '1px solid #E2D3C2',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem',
                        color: '#9C8F84',
                        width: '80px',
                        textAlign: 'center'
                    }}>
                        +65
                    </div>
                    <input
                        type="tel"
                        value={formData.phoneNumber.replace(/^\+65/, '')}
                        onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setFormData({ ...formData, phoneNumber: `+65${val}` });
                        }}
                        disabled={isPhoneVerified}
                        required
                        className="input"
                        style={{ flex: 1, ...(isPhoneVerified ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
                        placeholder="8123 4567"
                    />
                </div>
                {isPhoneVerified && (
                    <p style={{ fontSize: '0.75rem', color: '#9C8F84' }}>Verified phone numbers cannot be changed for security.</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="label">Bio / About Me</label>
                <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="input"
                    style={{ minHeight: '120px', resize: 'vertical' }}
                    placeholder="Tell hotels about your experience and skills..."
                    maxLength={500}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.75rem', color: '#9C8F84' }}>{formData.bio.length}/500</span>
                </div>
            </div>

            {status === 'error' && (
                <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.875rem' }}>
                    <AlertCircle size={16} />
                    {errorMessage}
                </div>
            )}

            {status === 'success' && (
                <div style={{ padding: '0.75rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e', fontSize: '0.875rem' }}>
                    <Check size={16} />
                    Profile updated successfully!
                </div>
            )}

            <div style={{ paddingTop: '1rem' }}>
                <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {status === 'loading' ? (
                        <><Loader2 size={16} className="animate-spin" />Saving...</>
                    ) : status === 'success' ? (
                        <><Check size={16} />Saved</>
                    ) : (
                        'Save Changes'
                    )}
                </button>
            </div>
        </form>
    );
}
