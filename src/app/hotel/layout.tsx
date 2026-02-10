import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ShyftHelper } from '@/components/ShyftHelper';
import Link from 'next/link';
import {
    Home,
    PlusCircle,
    Calendar,
    MessageSquare,
    Settings,
    BarChart3,
    LogOut,
    Building2
} from 'lucide-react';

export default async function HotelLayout({
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

    if (session.user.role === 'WORKER') {
        redirect('/dashboard');
    }

    // Only HOTEL reaches here

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#000' }}>
            {/* Sidebar */}
            <aside style={{
                width: '250px',
                background: '#111',
                borderRight: '1px solid #333',
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
                    borderBottom: '1px solid #333'
                }}>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#fff' }}>
                            Shyft<span style={{ color: 'var(--accent)' }}>Sg</span>
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <HotelLink href="/hotel" icon={<Home size={18} />} label="Dashboard" />
                    <HotelLink href="/hotel/jobs/new" icon={<PlusCircle size={18} />} label="Post New Shift" />
                    <HotelLink href="/hotel/jobs" icon={<Calendar size={18} />} label="My Job Postings" />
                    <HotelLink href="/hotel/roster" icon={<BarChart3 size={18} />} label="Roster" />
                    <HotelLink href="/hotel/messages" icon={<MessageSquare size={18} />} label="Messages" />
                    <HotelLink href="/hotel/settings" icon={<Settings size={18} />} label="Settings" />
                </nav>

                {/* Footer */}
                <div style={{ padding: '1rem', borderTop: '1px solid #333' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: '#222' }}>
                        <div style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '50%',
                            background: 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: '#000'
                        }}>
                            <Building2 size={14} />
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>Hotel</div>
                            <div style={{ fontSize: '0.75rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                        color: '#888',
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
                background: '#09090b',
                color: '#fff',
                minHeight: '100vh'
            }}>
                {children}
            </main>

            {/* ShyftHelper Chatbot */}
            <ShyftHelper />
        </div>
    );
}

function HotelLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: '#aaa',
                textDecoration: 'none',
                transition: 'all 0.2s',
            }}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
