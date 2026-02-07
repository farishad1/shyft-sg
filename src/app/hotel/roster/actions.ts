'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import {
    updateWorkerTier,
    updateHotelTier,
    recalculateWorkerRating,
    recalculateHotelRating
} from '@/lib/tiers';

/**
 * Mark a shift as complete (Hotel action)
 * This is THE GATEKEEPER - only completed shifts count for tiers/ratings
 */
export async function markShiftComplete(shiftId: string) {
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

    const shift = await prisma.shift.findUnique({
        where: { id: shiftId },
    });

    if (!shift || shift.hotelId !== hotelProfile.id) {
        return { success: false, error: 'Shift not found or unauthorized' };
    }

    if (shift.isCompleted) {
        return { success: false, error: 'Shift already marked as complete' };
    }

    // Verify shift has ended
    if (new Date(shift.endTime) > new Date()) {
        return { success: false, error: 'Cannot complete a shift before it ends' };
    }

    // Mark shift as complete
    await prisma.shift.update({
        where: { id: shiftId },
        data: {
            isCompleted: true,
            completedAt: new Date(),
        },
    });

    // CRITICAL: Update worker's tier and hours
    const tierResult = await updateWorkerTier(shift.workerId);

    // Also update hotel's hours
    await updateHotelTier(hotelProfile.id);

    revalidatePath('/hotel/roster');
    revalidatePath('/hotel/roster/history');

    return {
        success: true,
        tierPromotion: tierResult.promoted ? tierResult.newTier : null,
    };
}

/**
 * Rate a worker (Hotel action) - only after shift is complete
 */
export async function rateWorker(shiftId: string, rating: number, review?: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    if (!prisma) {
        throw new Error('Database not connected');
    }

    if (rating < 1 || rating > 5) {
        return { success: false, error: 'Rating must be between 1 and 5' };
    }

    const hotelProfile = await prisma.hotelProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!hotelProfile) {
        return { success: false, error: 'Hotel profile not found' };
    }

    const shift = await prisma.shift.findUnique({
        where: { id: shiftId },
    });

    if (!shift || shift.hotelId !== hotelProfile.id) {
        return { success: false, error: 'Shift not found or unauthorized' };
    }

    if (!shift.isCompleted) {
        return { success: false, error: 'Cannot rate before shift is completed' };
    }

    // Update the shift with the rating
    await prisma.shift.update({
        where: { id: shiftId },
        data: {
            workerRating: rating,
            workerReview: review || null,
        },
    });

    // Recalculate worker's average rating
    await recalculateWorkerRating(shift.workerId);

    revalidatePath('/hotel/roster/history');

    return { success: true };
}

/**
 * Rate a hotel (Worker action) - only after shift is complete
 */
export async function rateHotel(shiftId: string, rating: number, review?: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    if (!prisma) {
        throw new Error('Database not connected');
    }

    if (rating < 1 || rating > 5) {
        return { success: false, error: 'Rating must be between 1 and 5' };
    }

    const workerProfile = await prisma.workerProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!workerProfile) {
        return { success: false, error: 'Worker profile not found' };
    }

    const shift = await prisma.shift.findUnique({
        where: { id: shiftId },
    });

    if (!shift || shift.workerId !== workerProfile.id) {
        return { success: false, error: 'Shift not found or unauthorized' };
    }

    if (!shift.isCompleted) {
        return { success: false, error: 'Cannot rate before shift is completed' };
    }

    // Update the shift with the rating
    await prisma.shift.update({
        where: { id: shiftId },
        data: {
            hotelRating: rating,
            hotelReview: review || null,
        },
    });

    // Recalculate hotel's average rating
    await recalculateHotelRating(shift.hotelId);

    revalidatePath('/dashboard/history');

    return { success: true };
}
