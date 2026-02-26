import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { MessageCircle, Crown, Users, Headphones } from 'lucide-react';
import { getConversations } from './actions';

export default async function MessagesPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    const { conversations } = await getConversations();

    // Get the current user's role for UI customization
    const currentUser = prisma && await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    const isAdmin = currentUser?.role === 'ADMIN';

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', height: 'calc(100vh - 80px)', gap: 0 }}>
            {/* Left Sidebar: Conversation List */}
            <div style={{
                borderRight: '1px solid var(--border)',
                overflow: 'auto',
                background: '#FFFFFF'
            }}>
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Messages</h1>
                    {!isAdmin && (
                        <Link href="/messages/support" className="btn btn-ghost btn-sm" style={{ display: 'flex', gap: '0.5rem' }}>
                            <Headphones size={16} /> Support
                        </Link>
                    )}
                </div>

                {conversations.length === 0 ? (
                    <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#9C8F84' }}>
                        <MessageCircle size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>No conversations yet</p>
                        {!isAdmin && (
                            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                Messages from hotels and support will appear here.
                            </p>
                        )}
                    </div>
                ) : (
                    <div>
                        {conversations.map((conv) => (
                            <Link
                                key={conv.id}
                                href={`/messages/${conv.id}`}
                                style={{
                                    display: 'block',
                                    padding: '1rem 1.5rem',
                                    borderBottom: '1px solid #E2D3C2',
                                    textDecoration: 'none',
                                    position: 'relative',
                                    background: conv.hasUnread ? 'rgba(239,191,4,0.05)' : 'transparent',
                                    transition: 'background 0.2s'
                                }}
                            >
                                {/* Priority indicator for Platinum/Gold */}
                                {conv.isPriority && (
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '3px',
                                        background: conv.tier === 'PLATINUM'
                                            ? 'linear-gradient(180deg, #9CA3AF 0%, #E5E4E2 50%, #9CA3AF 100%)'
                                            : 'var(--accent)'
                                    }} />
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: '2.5rem',
                                        height: '2.5rem',
                                        borderRadius: '50%',
                                        background: conv.tier === 'PLATINUM' ? 'rgba(229,228,226,0.2)' : conv.tier === 'GOLD' ? 'var(--accent)' : 'rgba(212,163,115,0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        color: '#5A3E2B',
                                        border: conv.tier === 'PLATINUM' ? '2px solid #E5E4E2' : 'none'
                                    }}>
                                        {conv.role === 'HOTEL' ? '🏨' : conv.role === 'ADMIN' ? '👤' : conv.name[0]}
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span style={{ fontWeight: 600, color: '#2F2A26' }}>{conv.name}</span>
                                            {conv.tier === 'PLATINUM' && (
                                                <Crown size={14} color="#E5E4E2" />
                                            )}
                                            {conv.tier === 'GOLD' && (
                                                <Crown size={14} color="var(--accent)" />
                                            )}
                                            {conv.isSupport && (
                                                <span className="badge" style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem', background: '#FAF6F0', color: '#9C8F84' }}>
                                                    Support
                                                </span>
                                            )}
                                        </div>
                                        {conv.lastMessage && (
                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: '#9C8F84',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                margin: 0
                                            }}>
                                                {conv.lastMessage}
                                            </p>
                                        )}
                                    </div>

                                    {/* Right: Time + Unread */}
                                    <div style={{ textAlign: 'right' }}>
                                        {conv.lastMessageAt && (
                                            <span style={{ fontSize: '0.75rem', color: '#9C8F84' }}>
                                                {formatTime(new Date(conv.lastMessageAt))}
                                            </span>
                                        )}
                                        {conv.hasUnread && (
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: 'var(--accent)',
                                                marginTop: '0.5rem',
                                                marginLeft: 'auto'
                                            }} />
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Panel: Empty State */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--background)',
                color: '#9C8F84'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <MessageCircle size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.125rem' }}>Select a conversation</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Choose from your existing conversations
                    </p>
                </div>
            </div>
        </div>
    );
}

function formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        return date.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return date.toLocaleDateString('en-SG', { weekday: 'short' });
    } else {
        return date.toLocaleDateString('en-SG', { month: 'short', day: 'numeric' });
    }
}
