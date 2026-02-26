import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ShyftHelper } from '@/components/ShyftHelper';
import Link from 'next/link';
import {
    Home,
    Calendar,
    MessageSquare,
    User,
    DollarSign,
    LogOut,
    ClipboardList
} from 'lucide-react';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Role-based redirects
    if (!session?.user) {
        redirect('/auth/login');
    }

    if (session.user.role === 'ADMIN') {
        redirect('/admin');
    }

    if (session.user.role === 'HOTEL') {
        redirect('/hotel'); // Placeholder
    }

    // Only WORKER reaches here

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#FAF6F0' }}>
            {/* Sidebar */}
            <aside style={{
                width: '250px',
                background: '#5A3E2B',
                borderRight: '1px solid #4A3020',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 50
            }}>
                {/* Brand */}
                <div style={{
                    height: '4rem',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 1.5rem',
                    borderBottom: '1px solid #4A3020'
                }}>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#FAF6F0' }}>
                            Shyft<span style={{ color: '#D4A373' }}>Sg</span>
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <DashboardLink href="/dashboard" icon={<Home size={18} />} label="Home" />
                    <DashboardLink href="/dashboard/shifts" icon={<Calendar size={18} />} label="Find Shifts" />
                    <DashboardLink href="/dashboard/schedule" icon={<ClipboardList size={18} />} label="My Schedule" />
                    <DashboardLink href="/messages" icon={<MessageSquare size={18} />} label="Messages" />
                    <DashboardLink href="/dashboard/history" icon={<DollarSign size={18} />} label="Earnings" />
                    <DashboardLink href="/dashboard/profile" icon={<User size={18} />} label="Profile" />
                </nav>

                {/* Footer */}
                <div style={{ padding: '1rem', borderTop: '1px solid #4A3020' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: '#4A3020' }}>
                        <div style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '50%',
                            background: '#D4A373',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: '#FFFFFF'
                        }}>
                            W
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FAF6F0' }}>Worker</div>
                            <div style={{ fontSize: '0.75rem', color: '#E6C7A1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {session.user.email}
                            </div>
                        </div>
                    </div>
                    <Link href="/api/auth/signout" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginTop: '1rem',
                        padding: '0.5rem',
                        color: '#9C8F84',
                        textDecoration: 'none',
                        fontSize: '0.875rem'
                    }}>
                        <LogOut size={16} /> Sign Out
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: '250px',
                padding: '2rem',
                background: '#FAF6F0',
                color: '#2F2A26',
                minHeight: '100vh'
            }}>
                {children}
            </main>

            {/* ShyftHelper Chatbot */}
            <ShyftHelper />
        </div>
    );
}

function DashboardLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: '#E6C7A1',
                textDecoration: 'none',
                transition: 'all 0.2s',
            }}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
