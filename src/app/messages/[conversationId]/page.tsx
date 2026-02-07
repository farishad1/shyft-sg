import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Crown, Send } from 'lucide-react';
import { getMessages, getConversations } from '../actions';
import { ChatInput } from './ChatInput';

export default async function ConversationPage({
    params,
}: {
    params: { conversationId: string };
}) {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    if (!prisma) return <div>Database not connected</div>;

    const { messages, otherUserId, success, error } = await getMessages(params.conversationId);

    if (!success) {
        redirect('/messages');
    }

    // Get other user's info
    const otherUser = await prisma.user.findUnique({
        where: { id: otherUserId },
        include: { workerProfile: true, hotelProfile: true },
    });

    const otherProfile = otherUser?.workerProfile || otherUser?.hotelProfile;
    const otherName = otherProfile
        ? ('firstName' in otherProfile
            ? `${otherProfile.firstName} ${otherProfile.lastName}`
            : otherProfile.hotelName)
        : otherUser?.email || 'Unknown';
    const otherTier = otherProfile?.tier || 'SILVER';

    // Get all conversations for sidebar
    const { conversations } = await getConversations();

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', height: 'calc(100vh - 80px)', gap: 0 }}>
            {/* Left Sidebar: Conversation List */}
            <div style={{
                borderRight: '1px solid var(--border)',
                overflow: 'auto',
                background: '#0a0a0a'
            }}>
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border)',
                }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Messages</h1>
                </div>

                <div>
                    {conversations.map((conv) => (
                        <Link
                            key={conv.id}
                            href={`/messages/${conv.id}`}
                            style={{
                                display: 'block',
                                padding: '1rem 1.5rem',
                                borderBottom: '1px solid #222',
                                textDecoration: 'none',
                                position: 'relative',
                                background: conv.id === params.conversationId ? 'rgba(239,191,4,0.1)' : conv.hasUnread ? 'rgba(239,191,4,0.05)' : 'transparent'
                            }}
                        >
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
                                <div style={{
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    borderRadius: '50%',
                                    background: conv.tier === 'PLATINUM' ? '#333' : conv.tier === 'GOLD' ? 'var(--accent)' : '#222',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: conv.tier === 'GOLD' ? '#000' : '#fff',
                                    border: conv.tier === 'PLATINUM' ? '2px solid #E5E4E2' : 'none'
                                }}>
                                    {conv.role === 'HOTEL' ? '🏨' : conv.role === 'ADMIN' ? '👤' : conv.name[0]}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: 600, color: '#fff' }}>{conv.name}</span>
                                        {conv.tier === 'PLATINUM' && <Crown size={14} color="#E5E4E2" />}
                                        {conv.tier === 'GOLD' && <Crown size={14} color="var(--accent)" />}
                                    </div>
                                    {conv.lastMessage && (
                                        <p style={{ fontSize: '0.875rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                                            {conv.lastMessage}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Right Panel: Chat Window */}
            <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
                {/* Chat Header */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <Link href="/messages" className="btn btn-ghost btn-sm" style={{ display: 'none' }}>
                        <ArrowLeft size={18} />
                    </Link>
                    <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '50%',
                        background: otherTier === 'PLATINUM' ? '#333' : otherTier === 'GOLD' ? 'var(--accent)' : '#222',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        color: otherTier === 'GOLD' ? '#000' : '#fff',
                        border: otherTier === 'PLATINUM' ? '2px solid #E5E4E2' : 'none'
                    }}>
                        {otherUser?.role === 'HOTEL' ? '🏨' : otherName[0]}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                                fontWeight: 600
                            }}>{otherName}</span>
                            <span className={`badge badge-${otherTier.toLowerCase()}`}>{otherTier}</span>
                        </div>
                        <span style={{ fontSize: '0.875rem', color: '#888' }}>{otherUser?.email}</span>
                    </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
                    {messages.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#888', marginTop: '3rem' }}>
                            <p>No messages yet</p>
                            <p style={{ fontSize: '0.875rem' }}>Send a message to start the conversation</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: msg.isMine ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        maxWidth: '70%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: msg.isMine ? 'var(--radius-lg) var(--radius-lg) 0 var(--radius-lg)' : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 0',
                                        background: msg.isMine ? 'var(--accent)' : '#222',
                                        color: msg.isMine ? '#000' : '#fff'
                                    }}>
                                        <p style={{ margin: 0, lineHeight: 1.5 }}>{msg.content}</p>
                                        <span style={{
                                            display: 'block',
                                            fontSize: '0.625rem',
                                            marginTop: '0.25rem',
                                            opacity: 0.7,
                                            textAlign: msg.isMine ? 'right' : 'left'
                                        }}>
                                            {new Date(msg.createdAt).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Message Input */}
                <ChatInput conversationId={params.conversationId} />
            </div>
        </div>
    );
}
