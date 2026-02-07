'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { recalculateHotelRating } from '@/lib/tiers';

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

    if (shift.hotelRating) {
        return { success: false, error: 'You have already rated this hotel' };
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
