'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * Verify admin role before any action
 */
async function verifyAdmin() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    if (!prisma) {
        throw new Error('Database not connected');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (user?.role !== 'ADMIN') {
        throw new Error('Unauthorized - Admin only');
    }

    return session.user.id;
}

/**
 * Verify a worker's profile
 */
export async function verifyWorker(profileId: string) {
    await verifyAdmin();

    await prisma!.workerProfile.update({
        where: { id: profileId },
        data: {
            verificationStatus: 'VERIFIED',
            verifiedAt: new Date()
        },
    });

    revalidatePath('/admin/verifications');
    return { success: true };
}

/**
 * Decline a worker's verification
 */
export async function declineWorker(profileId: string, reason?: string) {
    await verifyAdmin();

    await prisma!.workerProfile.update({
        where: { id: profileId },
        data: {
            verificationStatus: 'DECLINED',
            verificationNote: reason || 'Verification declined'
        },
    });

    revalidatePath('/admin/verifications');
    return { success: true };
}

/**
 * Verify a hotel's profile
 */
export async function verifyHotel(profileId: string) {
    await verifyAdmin();

    await prisma!.hotelProfile.update({
        where: { id: profileId },
        data: {
            verificationStatus: 'VERIFIED',
            verifiedAt: new Date()
        },
    });

    revalidatePath('/admin/verifications');
    return { success: true };
}

/**
 * Decline a hotel's verification
 */
export async function declineHotel(profileId: string, reason?: string) {
    await verifyAdmin();

    await prisma!.hotelProfile.update({
        where: { id: profileId },
        data: {
            verificationStatus: 'DECLINED',
            verificationNote: reason || 'Verification declined'
        },
    });

    revalidatePath('/admin/verifications');
    return { success: true };
}

/**
 * Ban a user (Worker or Hotel)
 */
export async function banUser(userId: string, reason: string) {
    await verifyAdmin();

    // Check if user is a worker or hotel
    const user = await prisma!.user.findUnique({
        where: { id: userId },
        include: { workerProfile: true, hotelProfile: true },
    });

    if (!user) {
        return { success: false, error: 'User not found' };
    }

    // Update the appropriate profile
    if (user.workerProfile) {
        await prisma!.workerProfile.update({
            where: { id: user.workerProfile.id },
            data: { isActive: false, isBanned: true, bannedReason: reason },
        });
    } else if (user.hotelProfile) {
        await prisma!.hotelProfile.update({
            where: { id: user.hotelProfile.id },
            data: { isActive: false, isBanned: true, bannedReason: reason },
        });
    }

    revalidatePath('/admin/users');
    revalidatePath('/admin/hotels');

    return { success: true };
}

/**
 * Unban a user
 */
export async function unbanUser(userId: string) {
    await verifyAdmin();

    const user = await prisma!.user.findUnique({
        where: { id: userId },
        include: { workerProfile: true, hotelProfile: true },
    });

    if (!user) {
        return { success: false, error: 'User not found' };
    }

    if (user.workerProfile) {
        await prisma!.workerProfile.update({
            where: { id: user.workerProfile.id },
            data: { isActive: true, isBanned: false, bannedReason: null },
        });
    } else if (user.hotelProfile) {
        await prisma!.hotelProfile.update({
            where: { id: user.hotelProfile.id },
            data: { isActive: true, isBanned: false, bannedReason: null },
        });
    }

    revalidatePath('/admin/users');
    revalidatePath('/admin/hotels');

    return { success: true };
}

/**
 * Un-verify a user (revert to PENDING status)
 */
export async function unverifyUser(userId: string) {
    await verifyAdmin();

    const user = await prisma!.user.findUnique({
        where: { id: userId },
        include: { workerProfile: true, hotelProfile: true },
    });

    if (!user) {
        return { success: false, error: 'User not found' };
    }

    if (user.workerProfile) {
        await prisma!.workerProfile.update({
            where: { id: user.workerProfile.id },
            data: { verificationStatus: 'PENDING' },
        });
    } else if (user.hotelProfile) {
        await prisma!.hotelProfile.update({
            where: { id: user.hotelProfile.id },
            data: { verificationStatus: 'PENDING' },
        });
    }

    revalidatePath('/admin/users');
    revalidatePath('/admin/hotels');
    revalidatePath('/admin/verifications');

    return { success: true };
}

/**
 * Permanently delete a user and their profile
 */
export async function deleteUser(userId: string) {
    await verifyAdmin();

    const user = await prisma!.user.findUnique({
        where: { id: userId },
        include: { workerProfile: true, hotelProfile: true },
    });

    if (!user) {
        return { success: false, error: 'User not found' };
    }

    // Prisma cascade will handle profile deletion due to onDelete: Cascade
    await prisma!.user.delete({
        where: { id: userId },
    });

    revalidatePath('/admin/users');
    revalidatePath('/admin/hotels');
    revalidatePath('/admin/verifications');
    revalidatePath('/admin/establishments');

    return { success: true };
}

/**
 * Remove a user (soft delete) with a reason - user cannot log in
 */
export async function removeUser(userId: string, reason: string) {
    await verifyAdmin();

    if (!reason || reason.trim().length === 0) {
        return { success: false, error: 'Removal reason is required' };
    }

    const user = await prisma!.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        return { success: false, error: 'User not found' };
    }

    if (user.isRemoved) {
        return { success: false, error: 'User is already removed' };
    }

    await prisma!.user.update({
        where: { id: userId },
        data: {
            isRemoved: true,
            removalReason: reason.trim(),
        },
    });

    revalidatePath('/admin/users');
    revalidatePath('/admin/hotels');
    revalidatePath('/admin/verifications');
    revalidatePath('/admin/establishments');

    return { success: true };
}

/**
 * Toggle hotel subscription status
 */
export async function toggleSubscription(hotelProfileId: string) {
    await verifyAdmin();

    const hotel = await prisma!.hotelProfile.findUnique({
        where: { id: hotelProfileId },
    });

    if (!hotel) {
        return { success: false, error: 'Hotel not found' };
    }

    await prisma!.hotelProfile.update({
        where: { id: hotelProfileId },
        data: { subscriptionActive: !hotel.subscriptionActive },
    });

    revalidatePath('/admin/hotels');

    return { success: true, newStatus: !hotel.subscriptionActive };
}

/**
 * Get platform statistics for financial dashboard
 */
/**
 * Get platform statistics for financial dashboard
 */
export async function getPlatformStats() {
    await verifyAdmin();

    // 1. Platform Revenue (Gross)
    // Sum of estimatedPay for all completed shifts
    const gmvResult = await prisma!.shift.aggregate({
        where: { isCompleted: true },
        _sum: { estimatedPay: true },
        _count: { id: true },
    });

    const platformRevenue = gmvResult._sum.estimatedPay || 0;
    const completedShifts = gmvResult._count.id;

    // 2. Admin Revenue (Net)
    // Logic: 15% of Platform Revenue + (Active Premium Hotels * $99)
    const activePremiumHotelsCount = await prisma!.hotelProfile.count({
        where: { subscriptionActive: true, isActive: true },
    });

    const subscriptionRevenue = activePremiumHotelsCount * 99;
    const serviceFeeRevenue = platformRevenue * 0.15;
    const adminRevenue = serviceFeeRevenue + subscriptionRevenue;

    // 3. Monthly Revenue Graph (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // Go back 5 months to include current month = 6 total
    sixMonthsAgo.setDate(1); // Start of that month

    const monthlyShifts = await prisma!.shift.findMany({
        where: {
            isCompleted: true,
            shiftDate: { gte: sixMonthsAgo },
        },
        select: {
            shiftDate: true,
            estimatedPay: true,
        },
        orderBy: { shiftDate: 'asc' },
    });

    // Group by Month (e.g., "Jan", "Feb")
    const monthlyRevenueMap = new Map<string, number>();

    // Initialize last 6 months with 0
    for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = d.toLocaleString('default', { month: 'short' });
        monthlyRevenueMap.set(monthName, 0);
    }

    monthlyShifts.forEach(shift => {
        const monthName = shift.shiftDate.toLocaleString('default', { month: 'short' });
        const current = monthlyRevenueMap.get(monthName) || 0;
        monthlyRevenueMap.set(monthName, current + shift.estimatedPay);
    });

    // Convert map to array and reverse to show oldest to newest if needed, 
    // but map iteration order might vary. Better to reconstruct based on time.
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = d.toLocaleString('default', { month: 'short' });
        monthlyRevenue.push({
            name: monthName,
            value: monthlyRevenueMap.get(monthName) || 0,
        });
    }

    // Other Stats
    const totalJobPostings = await prisma!.jobPosting.count();

    // Fill rate
    const fillRate = totalJobPostings > 0
        ? (completedShifts / totalJobPostings) * 100
        : 0;

    // Active entities
    const activeHotels = await prisma!.hotelProfile.count({
        where: { isActive: true },
    }); // Total active hotels, not just premium

    const totalWorkers = await prisma!.workerProfile.count();
    const activeWorkers = await prisma!.workerProfile.count({
        where: { isActive: true, verificationStatus: 'VERIFIED' },
    });

    // Valid shifts today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayShifts = await prisma!.shift.count({
        where: {
            shiftDate: { gte: today, lt: tomorrow },
        },
    });

    // Top earners
    const topEarners = await prisma!.shift.groupBy({
        by: ['workerId'],
        where: { isCompleted: true },
        _sum: { estimatedPay: true },
        orderBy: { _sum: { estimatedPay: 'desc' } },
        take: 5,
    });

    const topEarnerDetails = await Promise.all(
        topEarners.map(async (e) => {
            const worker = await prisma!.workerProfile.findUnique({
                where: { id: e.workerId },
                include: { user: true },
            });
            return {
                name: worker ? `${worker.firstName} ${worker.lastName}` : 'Unknown',
                email: worker?.user.email || '',
                tier: worker?.tier || 'SILVER',
                totalEarnings: e._sum.estimatedPay || 0,
            };
        })
    );

    // Top spenders
    const topSpenders = await prisma!.shift.groupBy({
        by: ['hotelId'],
        where: { isCompleted: true },
        _sum: { estimatedPay: true },
        orderBy: { _sum: { estimatedPay: 'desc' } },
        take: 5,
    });

    const topSpenderDetails = await Promise.all(
        topSpenders.map(async (s) => {
            const hotel = await prisma!.hotelProfile.findUnique({
                where: { id: s.hotelId },
            });
            return {
                name: hotel?.hotelName || 'Unknown',
                tier: hotel?.tier || 'SILVER',
                totalSpent: s._sum.estimatedPay || 0,
            };
        })
    );

    return {
        platformRevenue,
        adminRevenue,
        monthlyRevenue,
        completedShifts,
        fillRate,
        activeHotels,
        totalWorkers,
        activeWorkers,
        todayShifts,
        topEarners: topEarnerDetails,
        topSpenders: topSpenderDetails,
    };
}
