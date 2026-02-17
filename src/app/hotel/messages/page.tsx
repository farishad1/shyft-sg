import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { MessageSquare, ArrowRight, Clock, User } from 'lucide-react';

export default async function HotelMessagesPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');
    if (!prisma) return <div>Database not connected</div>;

    const conversations = await prisma.conversation.findMany({
        where: {
            OR: [
                { participantOneId: session.user.id },
                { participantTwoId: session.user.id },
            ],
        },
        include: {
            participantOne: true,
            participantTwo: true,
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
            },
        },
        orderBy: { lastMessageAt: 'desc' },
    });

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    <MessageSquare size={24} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--accent)' }} />
                    Messages
                </h1>
                <p style={{ color: '#888' }}>Communicate with workers and support</p>
            </div>

            {conversations.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '4rem 2rem',
                    background: '#111', borderRadius: 'var(--radius-md)', border: '1px solid #333'
                }}>
                    <MessageSquare size={48} style={{ color: '#444', marginBottom: '1rem' }} />
                    <h3 style={{ color: '#888', fontWeight: 600, marginBottom: '0.5rem' }}>No Messages Yet</h3>
                    <p style={{ color: '#666', fontSize: '0.875rem' }}>
                        Conversations will appear here when workers apply to your shifts or you receive support messages.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {conversations.map((conv) => {
                        const otherUser = conv.participantOneId === session.user?.id
                            ? conv.participantTwo
                            : conv.participantOne;
                        const lastMessage = conv.messages[0];
                        const unreadCount = conv.messages.filter(
                            (m) => !m.isRead && m.receiverId === session.user?.id
                        ).length;

                        return (
                            <Link
                                key={conv.id}
                                href={`/messages/${conv.id}`}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                    padding: '1rem 1.25rem', background: '#111', borderRadius: 'var(--radius-md)',
                                    border: '1px solid #333', textDecoration: 'none', color: 'inherit',
                                    transition: 'border-color 0.2s',
                                }}
                            >
                                <div style={{
                                    width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                                    background: conv.isSupport ? '#2563eb' : 'var(--accent)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, color: '#000', fontSize: '0.875rem', flexShrink: 0,
                                }}>
                                    {conv.isSupport ? '?' : <User size={16} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                                            {conv.isSupport ? 'Shyft Support' : otherUser.email}
                                        </span>
                                        {unreadCount > 0 && (
                                            <span style={{
                                                background: 'var(--accent)', color: '#000', fontWeight: 700,
                                                fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '999px'
                                            }}>
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <p style={{
                                        color: '#888', fontSize: '0.8125rem', margin: '0.25rem 0 0',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                    }}>
                                        {lastMessage?.content || 'No messages yet'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                                    <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                        <Clock size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                        {new Date(conv.lastMessageAt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
                                    </span>
                                    <ArrowRight size={14} style={{ color: '#555' }} />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
