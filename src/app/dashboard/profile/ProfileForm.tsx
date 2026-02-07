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
                    <label className="text-sm font-medium text-gray-400">First Name</label>
                    <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[var(--accent)] transition-colors"
                        placeholder="Enter first name"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Last Name</label>
                    <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[var(--accent)] transition-colors"
                        placeholder="Enter last name"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Email Address</label>
                <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-gray-500 cursor-not-allowed opacity-70"
                />
                <p className="text-xs text-gray-600">Email cannot be changed. Contact support for assistance.</p>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center justify-between">
                    Phone Number
                    {isPhoneVerified && (
                        <span className="text-xs text-green-500 flex items-center gap-1">
                            <Check size={12} /> Verified
                        </span>
                    )}
                </label>
                <div className="flex gap-3">
                    <div className="bg-[#111] border border-[#333] rounded-lg p-3 text-gray-400 w-[80px] text-center">
                        +65
                    </div>
                    <input
                        type="tel"
                        value={formData.phoneNumber.replace(/^\+65/, '')}
                        onChange={(e) => {
                            // Only allow numbers
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setFormData({ ...formData, phoneNumber: `+65${val}` });
                        }}
                        disabled={isPhoneVerified}
                        required
                        className={`flex-1 bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[var(--accent)] transition-colors ${isPhoneVerified ? 'cursor-not-allowed opacity-70 text-gray-500' : ''}`}
                        placeholder="8123 4567"
                    />
                </div>
                {isPhoneVerified && (
                    <p className="text-xs text-gray-600">Verified phone numbers cannot be changed for security.</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Bio / About Me</label>
                <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white min-h-[120px] focus:outline-none focus:border-[var(--accent)] transition-colors resize-y"
                    placeholder="Tell hotels about your experience and skills..."
                    maxLength={500}
                />
                <div className="flex justify-end">
                    <span className="text-xs text-gray-600">{formData.bio.length}/500</span>
                </div>
            </div>

            {status === 'error' && (
                <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle size={16} />
                    {errorMessage}
                </div>
            )}

            {status === 'success' && (
                <div className="p-3 bg-green-900/20 border border-green-900/50 rounded-lg flex items-center gap-2 text-green-500 text-sm">
                    <Check size={16} />
                    Profile updated successfully!
                </div>
            )}

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full md:w-auto px-8 btn btn-primary flex items-center justify-center gap-2"
                >
                    {status === 'loading' ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Saving...
                        </>
                    ) : status === 'success' ? (
                        <>
                            <Check size={16} />
                            Saved
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </button>
            </div>
        </form>
    );
}
