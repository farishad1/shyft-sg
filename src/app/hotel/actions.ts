'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';
import { BUSINESS_RULES } from '@/lib/constants';

// Job Posting Schema
const jobPostingSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    shiftDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date'),
    startTime: z.string().refine(val => /^\d{2}:\d{2}$/.test(val), 'Invalid time format'),
    endTime: z.string().refine(val => /^\d{2}:\d{2}$/.test(val), 'Invalid time format'),
    hourlyPay: z.number().positive('Hourly pay must be greater than 0'),
    location: z.string().min(2, 'Location is required'),
    note: z.string().optional(),
});

/**
 * Create a new job posting
 */
export async function createJobPosting(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    if (!prisma) {
        throw new Error('Database not connected');
    }

    // Get hotel profile
    const hotelProfile = await prisma.hotelProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!hotelProfile || hotelProfile.verificationStatus !== 'VERIFIED') {
        return { success: false, error: 'Hotel must be verified to post jobs' };
    }

    // Parse form data
    const rawData = {
        title: formData.get('title') as string,
        shiftDate: formData.get('shiftDate') as string,
        startTime: formData.get('startTime') as string,
        endTime: formData.get('endTime') as string,
        hourlyPay: parseFloat(formData.get('hourlyPay') as string),
        location: formData.get('location') as string || hotelProfile.location,
        note: formData.get('note') as string,
    };

    // Validate
    const parsed = jobPostingSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message };
    }

    const { title, shiftDate, startTime, endTime, hourlyPay, location, note } = parsed.data;

    // Construct full datetime objects
    const shiftDateObj = new Date(shiftDate);
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startDateTime = new Date(shiftDateObj);
    startDateTime.setHours(startHour, startMin, 0, 0);

    const endDateTime = new Date(shiftDateObj);
    endDateTime.setHours(endHour, endMin, 0, 0);

    // Handle overnight shifts (end time is next day)
    if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
    }

    // Validation: Start time must be in the future
    if (startDateTime <= new Date()) {
        return { success: false, error: 'Shift start time must be in the future' };
    }

    // Calculate total hours
    const totalHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);

    if (totalHours <= 0) {
        return { success: false, error: 'End time must be after start time' };
    }

    // Create job posting
    await prisma.jobPosting.create({
        data: {
            hotelId: hotelProfile.id,
            title,
            shiftDate: shiftDateObj,
            startTime: startDateTime,
            endTime: endDateTime,
            totalHours,
            hourlyPay,
            location,
            note: note || null,
            isActive: true,
            isFilled: false,
        },
    });

    revalidatePath('/hotel');
    revalidatePath('/hotel/jobs');
    revalidatePath('/dashboard/shifts'); // Workers see new job
    redirect('/hotel?posted=true');
}

/**
 * Accept an application (creates a Shift)
 */
export async function acceptApplication(applicationId: string) {
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

    // Fetch application with job posting
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { jobPosting: true, worker: true },
    });

    if (!application) {
        return { success: false, error: 'Application not found' };
    }

    if (application.jobPosting.hotelId !== hotelProfile.id) {
        return { success: false, error: 'Unauthorized' };
    }

    if (application.jobPosting.isFilled) {
        return { success: false, error: 'This position has already been filled' };
    }

    // Create Shift
    const shift = await prisma.shift.create({
        data: {
            jobPostingId: application.jobPostingId,
            workerId: application.workerId,
            hotelId: hotelProfile.id,
            shiftDate: application.jobPosting.shiftDate,
            startTime: application.jobPosting.startTime,
            endTime: application.jobPosting.endTime,
            totalHours: application.jobPosting.totalHours,
            hourlyPay: application.jobPosting.hourlyPay,
            estimatedPay: application.jobPosting.totalHours * application.jobPosting.hourlyPay,
        },
    });

    // Update application status
    await prisma.application.update({
        where: { id: applicationId },
        data: { status: 'ACCEPTED', respondedAt: new Date() },
    });

    // Decrement open slots
    const updatedJob = await prisma.jobPosting.update({
        where: { id: application.jobPostingId },
        data: { slotsOpen: { decrement: 1 } },
    });

    // If no slots left, mark as filled and decline pending applications
    if (updatedJob.slotsOpen <= 0) {
        await prisma.jobPosting.update({
            where: { id: application.jobPostingId },
            data: { isFilled: true, isActive: false },
        });

        await prisma.application.updateMany({
            where: {
                jobPostingId: application.jobPostingId,
                id: { not: applicationId },
                status: 'PENDING'
            },
            data: { status: 'DECLINED', declineReason: 'Position filled', respondedAt: new Date() },
        });
    }

    revalidatePath('/hotel');
    revalidatePath('/hotel/jobs');
    revalidatePath(`/hotel/jobs/${application.jobPostingId}`);

    return { success: true };
}

/**
 * Decline an application (with 12-hour rule check)
 */
export async function declineApplication(applicationId: string, reason?: string) {
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

    // Fetch application with job posting
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { jobPosting: true },
    });

    if (!application) {
        return { success: false, error: 'Application not found' };
    }

    if (application.jobPosting.hotelId !== hotelProfile.id) {
        return { success: false, error: 'Unauthorized' };
    }

    // 12-Hour Rule Check
    const hoursUntilShift = (new Date(application.jobPosting.startTime).getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilShift < BUSINESS_RULES.APPLICATION_LOCK_HOURS) {
        return {
            success: false,
            error: `Cannot decline within ${BUSINESS_RULES.APPLICATION_LOCK_HOURS} hours of shift start (12-Hour Rule)`
        };
    }

    // Update application
    await prisma.application.update({
        where: { id: applicationId },
        data: {
            status: 'DECLINED',
            declineReason: reason || 'Position filled by another candidate',
            respondedAt: new Date()
        },
    });

    revalidatePath(`/hotel/jobs/${application.jobPostingId}`);

    return { success: true };
}
