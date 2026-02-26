import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    Building2,
    Users,
    CheckSquare,
    BarChart3,
    MessageSquare,
    Settings,
    LogOut
} from 'lucide-react';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Strict Admin Check
    if (session?.user?.role !== 'ADMIN') {
        redirect('/');
    }

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
                    <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#FAF6F0' }}>
                        Shyft<span style={{ color: '#D4A373' }}>Admin</span>
                    </span>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <AdminLink href="/admin" icon={<BarChart3 size={18} />} label="Overview" />
                    <AdminLink href="/admin/verifications" icon={<CheckSquare size={18} />} label="Verifications" />
                    <AdminLink href="/admin/users" icon={<Users size={18} />} label="Users" />
                    <AdminLink href="/admin/establishments" icon={<Building2 size={18} />} label="Hotels" />
                    <AdminLink href="/admin/financials" icon={<BarChart3 size={18} />} label="Financials" />
                    <AdminLink href="/admin/messages" icon={<MessageSquare size={18} />} label="Messages" />
                </nav>

                {/* Footer actions */}
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
                            A
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FAF6F0' }}>Admin</div>
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

            {/* Main Content Area */}
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
        </div>
    );
}

function AdminLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    // Simple check for active state would require usePathname (client hook)
    // For now, simple links. To make active state work, extract to client component.
    // Or just keep it simple.
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
            className="admin-nav-link"
        >
            {icon}
            <span>{label}</span>
            {/* CSS for hover/active would be handled by .admin-nav-link in global or inline hover logic */}
        </Link>
    );
}
