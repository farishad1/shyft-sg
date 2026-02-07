'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { Tier } from '@prisma/client';

// Tier priority mapping for sorting
const TIER_PRIORITY: Record<Tier, number> = {
    PLATINUM: 3,
    GOLD: 2,
    SILVER: 1,
};

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(otherUserId: string, isSupport = false) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    if (!prisma) {
        throw new Error('Database not connected');
    }

    const currentUserId = session.user.id;

    // Check if conversation exists (check both orderings)
    let conversation = await prisma.conversation.findFirst({
        where: {
            OR: [
                { participantOneId: currentUserId, participantTwoId: otherUserId },
                { participantOneId: otherUserId, participantTwoId: currentUserId },
            ],
        },
    });

    if (!conversation) {
        // Calculate priority tier (highest tier of either participant)
        const [user1, user2] = await Promise.all([
            prisma.user.findUnique({
                where: { id: currentUserId },
                include: { workerProfile: true, hotelProfile: true },
            }),
            prisma.user.findUnique({
                where: { id: otherUserId },
                include: { workerProfile: true, hotelProfile: true },
            }),
        ]);

        const tier1 = user1?.workerProfile?.tier || user1?.hotelProfile?.tier || 'SILVER';
        const tier2 = user2?.workerProfile?.tier || user2?.hotelProfile?.tier || 'SILVER';
        const priorityTier = TIER_PRIORITY[tier1] >= TIER_PRIORITY[tier2] ? tier1 : tier2;

        conversation = await prisma.conversation.create({
            data: {
                participantOneId: currentUserId,
                participantTwoId: otherUserId,
                isSupport,
                priorityTier,
            },
        });
    }

    return { success: true, conversationId: conversation.id };
}

/**
 * Get all conversations for current user, sorted by priority then date
 */
export async function getConversations() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    if (!prisma) {
        throw new Error('Database not connected');
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true },
    });

    if (!currentUser) {
        return { success: false, error: 'User not found', conversations: [] };
    }

    // Fetch conversations where user is a participant
    const conversations = await prisma.conversation.findMany({
        where: {
            OR: [
                { participantOneId: currentUser.id },
                { participantTwoId: currentUser.id },
            ],
        },
        include: {
            participantOne: {
                include: { workerProfile: true, hotelProfile: true },
            },
            participantTwo: {
                include: { workerProfile: true, hotelProfile: true },
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
            },
        },
        orderBy: [
            { priorityTier: 'desc' }, // PLATINUM first
            { lastMessageAt: 'desc' },
        ],
    });

    // Format conversations with other user info
    const formattedConversations = conversations.map((conv) => {
        const otherUser = conv.participantOneId === currentUser.id
            ? conv.participantTwo
            : conv.participantOne;

        const otherProfile = otherUser.workerProfile || otherUser.hotelProfile;
        const name = otherProfile
            ? ('firstName' in otherProfile
                ? `${otherProfile.firstName} ${otherProfile.lastName}`
                : otherProfile.hotelName)
            : otherUser.email;

        const tier = otherProfile?.tier || 'SILVER';
        const lastMessage = conv.messages[0];
        const hasUnread = lastMessage && !lastMessage.isRead && lastMessage.receiverId === currentUser.id;

        return {
            id: conv.id,
            otherUserId: otherUser.id,
            name,
            email: otherUser.email,
            role: otherUser.role,
            tier,
            isPriority: tier === 'PLATINUM' || tier === 'GOLD',
            lastMessage: lastMessage?.content || null,
            lastMessageAt: conv.lastMessageAt,
            hasUnread,
            isSupport: conv.isSupport,
        };
    });

    return { success: true, conversations: formattedConversations };
}

/**
 * Get messages for a conversation
 */
export async function getMessages(conversationId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    if (!prisma) {
        throw new Error('Database not connected');
    }

    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
    });

    if (!conversation) {
        return { success: false, error: 'Conversation not found', messages: [] };
    }

    // Verify user is a participant
    if (conversation.participantOneId !== session.user.id &&
        conversation.participantTwoId !== session.user.id) {
        return { success: false, error: 'Unauthorized', messages: [] };
    }

    const messages = await prisma.message.findMany({
        where: { conversationId },
        include: {
            sender: {
                include: { workerProfile: true, hotelProfile: true },
            },
        },
        orderBy: { createdAt: 'asc' },
    });

    // Mark all unread messages as read
    await prisma.message.updateMany({
        where: {
            conversationId,
            receiverId: session.user.id,
            isRead: false,
        },
        data: {
            isRead: true,
            readAt: new Date(),
        },
    });

    return {
        success: true,
        messages: messages.map(m => ({
            id: m.id,
            content: m.content,
            senderId: m.senderId,
            isMine: m.senderId === session.user.id,
            createdAt: m.createdAt,
            isRead: m.isRead,
        })),
        otherUserId: conversation.participantOneId === session.user.id
            ? conversation.participantTwoId
            : conversation.participantOneId,
    };
}

/**
 * Send a message
 */
export async function sendMessage(conversationId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    if (!prisma) {
        throw new Error('Database not connected');
    }

    if (!content.trim()) {
        return { success: false, error: 'Message cannot be empty' };
    }

    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
    });

    if (!conversation) {
        return { success: false, error: 'Conversation not found' };
    }

    // Verify user is a participant
    if (conversation.participantOneId !== session.user.id &&
        conversation.participantTwoId !== session.user.id) {
        return { success: false, error: 'Unauthorized' };
    }

    const receiverId = conversation.participantOneId === session.user.id
        ? conversation.participantTwoId
        : conversation.participantOneId;

    // Determine message type
    const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    let messageType: 'HOTEL_TO_WORKER' | 'WORKER_TO_HOTEL' | 'ADMIN_TO_USER' = 'HOTEL_TO_WORKER';
    if (currentUser?.role === 'WORKER') {
        messageType = 'WORKER_TO_HOTEL';
    } else if (currentUser?.role === 'ADMIN') {
        messageType = 'ADMIN_TO_USER';
    }

    // Create message
    await prisma.message.create({
        data: {
            conversationId,
            senderId: session.user.id,
            receiverId,
            content: content.trim(),
            messageType,
        },
    });

    // Update conversation lastMessageAt
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
    });

    revalidatePath(`/messages/${conversationId}`);
    revalidatePath('/messages');

    return { success: true };
}

/**
 * Start a support conversation (with Admin)
 */
export async function startSupportConversation() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    if (!prisma) {
        throw new Error('Database not connected');
    }

    // Find an admin user
    const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
    });

    if (!admin) {
        return { success: false, error: 'No admin available' };
    }

    const result = await getOrCreateConversation(admin.id, true);
    return result;
}
