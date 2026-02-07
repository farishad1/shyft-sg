import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
    ArrowLeft,
    Mail,
    Clock,
    Eye,
    MessageCircle,
    CheckCircle
} from 'lucide-react';

export default async function AdminMessagesPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    if (!prisma) return <div>Database not connected</div>;

    // Verify admin role
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { adminProfile: true }
    });

    if (user?.role !== 'ADMIN') {
        redirect('/');
    }

    // Fetch all contact requests, newest first
    const contactRequests = await prisma.contactRequest.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const unreadCount = contactRequests.filter(r => !r.isRead).length;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#888', textDecoration: 'none', marginBottom: '1.5rem' }}>
                <ArrowLeft size={18} /> Back to Admin
            </Link>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Contact Requests</h1>
                    <p style={{ color: '#888' }}>Messages from the landing page contact form</p>
                </div>

                {unreadCount > 0 && (
                    <div style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(239,191,4,0.1)',
                        border: '1px solid var(--accent)',
                        borderRadius: 'var(--radius-full)',
                        color: 'var(--accent)',
                        fontWeight: 600
                    }}>
                        {unreadCount} Unread
                    </div>
                )}
            </div>

            {contactRequests.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                    <MessageCircle size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No Contact Requests</h3>
                    <p>Messages from the contact form will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {contactRequests.map((request) => (
                        <div
                            key={request.id}
                            className="card"
                            style={{
                                padding: '1.25rem',
                                borderLeft: request.isRead ? '3px solid #333' : '3px solid var(--accent)',
                                background: request.isRead ? '#111' : '#1a1a1a'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <div>
                                    <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                        {request.isRead ? (
                                            <CheckCircle size={14} style={{ display: 'inline', color: '#666', marginRight: '0.5rem' }} />
                                        ) : (
                                            <Eye size={14} style={{ display: 'inline', color: 'var(--accent)', marginRight: '0.5rem' }} />
                                        )}
                                        {request.subject}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#888' }}>
                                        <span>{request.name}</span>
                                        <span>•</span>
                                        <a
                                            href={`mailto:${request.email}`}
                                            style={{ color: 'var(--accent)', textDecoration: 'none' }}
                                        >
                                            <Mail size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                            {request.email}
                                        </a>
                                        {request.phone && (
                                            <>
                                                <span>•</span>
                                                <span>{request.phone}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#666' }}>
                                    <Clock size={12} />
                                    {new Date(request.createdAt).toLocaleDateString('en-SG', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>

                            <div style={{
                                padding: '1rem',
                                background: '#0a0a0a',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.875rem',
                                lineHeight: 1.6,
                                color: '#ccc',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {request.message}
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                                <a
                                    href={`mailto:${request.email}?subject=Re: ${encodeURIComponent(request.subject)}`}
                                    className="btn btn-primary btn-sm"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Mail size={14} /> Reply via Email
                                </a>

                                {!request.isRead && (
                                    <form action={`/api/admin/contact/${request.id}/read`} method="POST">
                                        <button type="submit" className="btn btn-ghost btn-sm">
                                            Mark as Read
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
