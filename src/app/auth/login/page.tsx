'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get('registered');
    const errorParam = searchParams.get('error');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(errorParam ? 'Authentication failed' : null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
                setIsSubmitting(false);
            } else {
                router.refresh();
                router.push('/dashboard');
            }
        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
                <p className="text-muted">Sign in to your account</p>
            </div>

            {registered && (
                <div className="badge-verified" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                    Account created! Please sign in.
                </div>
            )}

            {error && (
                <div className="badge-declined" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                    <label className="label">Email</label>
                    <input
                        type="email"
                        required
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="label">Password</label>
                    <input
                        type="password"
                        required
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginTop: '1rem' }}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <span className="text-muted">Don't have an account? </span>
                    <Link href="/auth/register" className="text-gold" style={{ textDecoration: 'none' }}>Sign Up</Link>
                </div>
            </form>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem 0', background: 'var(--background-secondary)' }}>
            <Suspense fallback={
                <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
                    <p>Loading...</p>
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
}
