'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { WorkPassType } from '@prisma/client';
import { WORK_PASS_LABELS } from '@/lib/constants';

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultType = searchParams.get('type') === 'hotel' ? 'HOTEL' : 'WORKER';

    const [role, setRole] = useState<'WORKER' | 'HOTEL'>(defaultType);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        phoneNumber: '',
        workPassType: 'CITIZEN' as WorkPassType,
        workPassNumber: '',
        schoolName: '',
        hasBasicEnglish: false,
        hasComputerSkills: false,
        hotelName: '',
        uen: '',
        location: '',
        description: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const payload: any = {
            email: formData.email,
            password: formData.password,
            role,
        };

        if (role === 'WORKER') {
            payload.firstName = formData.firstName;
            payload.lastName = formData.lastName;
            payload.dateOfBirth = formData.dateOfBirth;
            payload.phoneNumber = formData.phoneNumber;
            payload.workPassType = formData.workPassType;
            payload.workPassNumber = formData.workPassNumber;
            if (formData.workPassType === 'STUDENT_PASS') {
                payload.schoolName = formData.schoolName;
            }
            payload.hasBasicEnglish = formData.hasBasicEnglish;
            payload.hasComputerSkills = formData.hasComputerSkills;
        } else {
            payload.hotelName = formData.hotelName;
            payload.uen = formData.uen;
            payload.location = formData.location;
            payload.description = formData.description;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.details && data.details.fieldErrors) {
                    const firstField = Object.keys(data.details.fieldErrors)[0];
                    setError(`${firstField}: ${data.details.fieldErrors[firstField][0]}`);
                } else {
                    setError(data.error || 'Registration failed');
                }
                setIsSubmitting(false);
                return;
            }

            router.push('/auth/login?registered=true');
        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create Account</h1>
                <p className="text-muted">Join Shyft Sg today</p>
            </div>

            {/* Role Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    type="button"
                    className={`btn ${role === 'WORKER' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ border: role === 'WORKER' ? 'none' : '1px solid var(--border)' }}
                    onClick={() => setRole('WORKER')}
                >
                    I&apos;m a Worker
                </button>
                <button
                    type="button"
                    className={`btn ${role === 'HOTEL' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ border: role === 'HOTEL' ? 'none' : '1px solid var(--border)' }}
                    onClick={() => setRole('HOTEL')}
                >
                    I&apos;m a Hotel
                </button>
            </div>

            {error && (
                <div className="badge-declined" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                {/* Common Fields */}
                <div>
                    <label className="label">Email</label>
                    <input name="email" type="email" required className="input" value={formData.email} onChange={handleChange} />
                </div>
                <div>
                    <label className="label">Password (Min 8 chars)</label>
                    <input name="password" type="password" required className="input" minLength={8} value={formData.password} onChange={handleChange} />
                </div>

                {/* Worker Fields */}
                {role === 'WORKER' && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="label">First Name</label>
                                <input name="firstName" required className="input" value={formData.firstName} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="label">Last Name</label>
                                <input name="lastName" required className="input" value={formData.lastName} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="label">Date of Birth</label>
                            <input name="dateOfBirth" type="date" required className="input" value={formData.dateOfBirth} onChange={handleChange} />
                            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Must be at least 13 years old</p>
                        </div>

                        <div>
                            <label className="label">Phone Number</label>
                            <input name="phoneNumber" type="tel" required className="input" value={formData.phoneNumber} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="label">Work Pass Type</label>
                            <select name="workPassType" className="input" value={formData.workPassType} onChange={handleChange}>
                                {Object.entries(WORK_PASS_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {formData.workPassType === 'STUDENT_PASS' && (
                            <div>
                                <label className="label">School Name (Required for Student Pass)</label>
                                <input name="schoolName" required className="input" placeholder="e.g. NUS, NTU, Poly..." value={formData.schoolName} onChange={handleChange} />
                            </div>
                        )}

                        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                            <label className="label" style={{ marginBottom: '0.75rem' }}>Skills Verification (Mandatory)</label>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        name="hasBasicEnglish"
                                        className="checkbox"
                                        checked={formData.hasBasicEnglish}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span style={{ fontSize: '0.875rem' }}>I possess Basic English skills</span>
                                </label>
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        name="hasComputerSkills"
                                        className="checkbox"
                                        checked={formData.hasComputerSkills}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span style={{ fontSize: '0.875rem' }}>I possess Basic Computer skills</span>
                                </label>
                            </div>
                        </div>
                    </>
                )}

                {/* Hotel Fields */}
                {role === 'HOTEL' && (
                    <>
                        <div>
                            <label className="label">Hotel Name</label>
                            <input name="hotelName" required className="input" value={formData.hotelName} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="label">UEN (Unique Entity Number)</label>
                            <input name="uen" required className="input" placeholder="e.g. 200812345M" value={formData.uen} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="label">Location / Address</label>
                            <input name="location" required className="input" value={formData.location} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="label">Description (Optional)</label>
                            <textarea name="description" className="input" rows={3} value={formData.description} onChange={handleChange} />
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginTop: '1rem' }}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Creating Account...' : `Register as ${role === 'WORKER' ? 'Worker' : 'Hotel'}`}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <span className="text-muted">Already have an account? </span>
                    <Link href="/auth/login" className="text-gold" style={{ textDecoration: 'none' }}>Sign In</Link>
                </div>
            </form>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem 0', background: 'var(--background-secondary)' }}>
            <Suspense fallback={
                <div className="card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', padding: '2rem' }}>
                    <p>Loading...</p>
                </div>
            }>
                <RegisterForm />
            </Suspense>
        </div>
    );
}
