import prisma from './prisma';
import { Tier } from '@prisma/client';

/**
 * Tier thresholds based on total hours worked
 */
export const TIER_THRESHOLDS = {
    SILVER: { min: 0, max: 50 },     // 0-50 hours
    GOLD: { min: 51, max: 200 },     // 51-200 hours
    PLATINUM: { min: 201, max: Infinity }, // 200+ hours
} as const;

/**
 * Determines the tier based on total hours worked
 */
export function calculateTier(totalHours: number): Tier {
    if (totalHours >= TIER_THRESHOLDS.PLATINUM.min) {
        return 'PLATINUM';
    } else if (totalHours >= TIER_THRESHOLDS.GOLD.min) {
        return 'GOLD';
    }
    return 'SILVER';
}

/**
 * Updates a worker's tier based on their completed shift hours
 * Call this after marking a shift as complete
 */
export async function updateWorkerTier(workerId: string): Promise<{
    previousTier: Tier;
    newTier: Tier;
    totalHours: number;
    promoted: boolean;
}> {
    if (!prisma) throw new Error('Database not connected');

    // Get current worker profile
    const worker = await prisma.workerProfile.findUnique({
        where: { id: workerId },
        select: { tier: true, totalHoursWorked: true },
    });

    if (!worker) throw new Error('Worker not found');

    // Sum all completed shift hours
    const completedShifts = await prisma.shift.aggregate({
        where: {
            workerId,
            isCompleted: true,
        },
        _sum: { totalHours: true },
    });

    const totalHours = completedShifts._sum.totalHours || 0;
    const previousTier = worker.tier;
    const newTier = calculateTier(totalHours);

    // Update profile if tier changed or hours differ
    await prisma.workerProfile.update({
        where: { id: workerId },
        data: {
            totalHoursWorked: totalHours,
            tier: newTier,
        },
    });

    return {
        previousTier,
        newTier,
        totalHours,
        promoted: newTier !== previousTier && TIER_THRESHOLDS[newTier].min > TIER_THRESHOLDS[previousTier].min,
    };
}

/**
 * Updates a hotel's tier based on their total hired hours
 */
export async function updateHotelTier(hotelId: string): Promise<void> {
    if (!prisma) throw new Error('Database not connected');

    // Sum all completed shift hours for this hotel
    const completedShifts = await prisma.shift.aggregate({
        where: {
            hotelId,
            isCompleted: true,
        },
        _sum: { totalHours: true },
    });

    const totalHours = completedShifts._sum.totalHours || 0;
    const newTier = calculateTier(totalHours);

    await prisma.hotelProfile.update({
        where: { id: hotelId },
        data: {
            totalHoursHired: totalHours,
            tier: newTier,
        },
    });
}

/**
 * Recalculates a worker's average rating from all shift ratings
 */
export async function recalculateWorkerRating(workerId: string): Promise<number | null> {
    if (!prisma) throw new Error('Database not connected');

    const ratings = await prisma.shift.aggregate({
        where: {
            workerId,
            workerRating: { not: null },
        },
        _avg: { workerRating: true },
        _count: { workerRating: true },
    });

    const avgRating = ratings._avg.workerRating;
    const totalReviews = ratings._count.workerRating;

    await prisma.workerProfile.update({
        where: { id: workerId },
        data: {
            averageRating: avgRating,
            totalReviews,
        },
    });

    return avgRating;
}

/**
 * Recalculates a hotel's average rating from all shift ratings
 */
export async function recalculateHotelRating(hotelId: string): Promise<number | null> {
    if (!prisma) throw new Error('Database not connected');

    const ratings = await prisma.shift.aggregate({
        where: {
            hotelId,
            hotelRating: { not: null },
        },
        _avg: { hotelRating: true },
        _count: { hotelRating: true },
    });

    const avgRating = ratings._avg.hotelRating;
    const totalReviews = ratings._count.hotelRating;

    await prisma.hotelProfile.update({
        where: { id: hotelId },
        data: {
            averageRating: avgRating,
            totalReviews,
        },
    });

    return avgRating;
}
