import Link from 'next/link';
import { auth } from '@/auth';
import { UserNav } from './UserNav';

export async function Navbar() {
    const session = await auth();
    const user = session?.user;

    return (
        <nav className="navbar">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        background: '#5A3E2B',
                        border: '2px solid #D4A373',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.25rem',
                        color: '#D4A373',
                    }}>
                        S
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--foreground)' }}>
                        Shyft<span style={{ color: 'var(--accent)' }}>Sg</span>
                    </span>
                </Link>

                {/* Navigation Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <Link href="/#how-it-works" className="nav-link">How It Works</Link>
                    <Link href="/#faq" className="nav-link">FAQ</Link>
                    <Link href="/#contact" className="nav-link">Contact</Link>

                    {user ? (
                        <UserNav user={user} />
                    ) : (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Link href="/auth/login" className="btn btn-ghost btn-sm">
                                Sign In
                            </Link>
                            <Link href="/auth/register" className="btn btn-primary btn-sm">
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
