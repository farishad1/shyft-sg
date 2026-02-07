'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';

interface UserNavProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: 'ADMIN' | 'WORKER' | 'HOTEL';
    };
}

export function UserNav({ user }: UserNavProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                {user.email} ({user.role})
            </span>

            {user.role === 'WORKER' && (
                <Link href="/dashboard/worker" className="btn btn-primary btn-sm">
                    Dashboard
                </Link>
            )}

            {user.role === 'HOTEL' && (
                <Link href="/dashboard/hotel" className="btn btn-primary btn-sm">
                    My Hotel
                </Link>
            )}

            {user.role === 'ADMIN' && (
                <Link href="/admin" className="btn btn-primary btn-sm">
                    Admin
                </Link>
            )}

            <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="btn btn-ghost btn-sm"
            >
                Sign Out
            </button>
        </div>
    );
}
