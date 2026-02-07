'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const profileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'), // Email is in User, usually read-only or handled separately
    phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional().nullable(),
});

export async function updateProfile(formData: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    bio?: string | null;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated' };
    }

    // Validate input
    const validation = profileSchema.safeParse({ ...formData, email: 'ignore@me.com' }); // Mock email for partial validation
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    if (!prisma) {
        return { success: false, error: 'Database connection failed' };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { workerProfile: true },
        });

        if (!user || !user.workerProfile) {
            return { success: false, error: 'Profile not found' };
        }

        // Check if phone number is being changed and if it's already verified
        if (user.workerProfile.isPhoneVerified && formData.phoneNumber !== user.workerProfile.phoneNumber) {
            return { success: false, error: 'Cannot change verified phone number. Contact support.' };
        }

        // Update profile
        await prisma.workerProfile.update({
            where: { userId: session.user.id },
            data: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber,
                bio: formData.bio || null,
            },
        });

        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (error) {
        console.error('Profile update error:', error);
        return { success: false, error: 'Failed to update profile' };
    }
}
