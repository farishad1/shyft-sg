'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * Cancel hotel subscription (sets subscriptionActive to false)
 */
export async function cancelSubscription() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    if (!prisma) {
        throw new Error('Database not connected');
    }

    const hotelProfile = await prisma.hotelProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!hotelProfile) {
        return { success: false, error: 'Hotel profile not found' };
    }

    await prisma.hotelProfile.update({
        where: { id: hotelProfile.id },
        data: { subscriptionActive: false },
    });

    revalidatePath('/hotel/settings');
    revalidatePath('/hotel');

    return { success: true };
}

/**
 * Reactivate hotel subscription
 */
export async function reactivateSubscription() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    if (!prisma) {
        throw new Error('Database not connected');
    }

    const hotelProfile = await prisma.hotelProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!hotelProfile) {
        return { success: false, error: 'Hotel profile not found' };
    }

    await prisma.hotelProfile.update({
        where: { id: hotelProfile.id },
        data: { subscriptionActive: true },
    });

    revalidatePath('/hotel/settings');
    revalidatePath('/hotel');

    return { success: true };
}
