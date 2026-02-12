'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * Apply for a job posting
 */
export async function applyForJob(jobPostingId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    if (!prisma) {
        throw new Error('Database not connected');
    }

    // Get worker profile
    const workerProfile = await prisma.workerProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!workerProfile) {
        return { success: false, error: 'Worker profile not found' };
    }

    if (workerProfile.verificationStatus !== 'VERIFIED') {
        return { success: false, error: 'You must be verified to apply for jobs' };
    }

    if (workerProfile.trainingProgress < 100) {
        return { success: false, error: 'You must complete training before applying' };
    }

    // Check job exists and is open
    const jobPosting = await prisma.jobPosting.findUnique({
        where: { id: jobPostingId },
    });

    if (!jobPosting) {
        return { success: false, error: 'Job posting not found' };
    }

    if (!jobPosting.isActive || jobPosting.isFilled || jobPosting.slotsOpen <= 0) {
        return { success: false, error: 'This position is no longer available' };
    }

    // Check for existing application
    const existingApplication = await prisma.application.findUnique({
        where: {
            jobPostingId_workerId: {
                jobPostingId,
                workerId: workerProfile.id,
            },
        },
    });

    if (existingApplication) {
        return { success: false, error: 'You have already applied for this position' };
    }

    // Create application
    await prisma.application.create({
        data: {
            jobPostingId,
            workerId: workerProfile.id,
            status: 'PENDING',
        },
    });

    revalidatePath('/dashboard/shifts');
    revalidatePath(`/dashboard/shifts/${jobPostingId}`);

    return { success: true };
}

/**
 * Cancel application
 */
export async function cancelApplication(applicationId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    if (!prisma) {
        throw new Error('Database not connected');
    }

    const workerProfile = await prisma.workerProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!workerProfile) {
        return { success: false, error: 'Worker profile not found' };
    }

    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { jobPosting: true },
    });

    if (!application || application.workerId !== workerProfile.id) {
        return { success: false, error: 'Application not found' };
    }

    if (application.status !== 'PENDING') {
        return { success: false, error: 'Only pending applications can be cancelled' };
    }

    await prisma.application.update({
        where: { id: applicationId },
        data: { status: 'CANCELLED' },
    });

    revalidatePath('/dashboard/shifts');
    revalidatePath(`/dashboard/shifts/${application.jobPostingId}`);

    return { success: true };
}
