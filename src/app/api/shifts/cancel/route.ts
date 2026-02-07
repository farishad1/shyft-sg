import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!prisma) {
            return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
        }

        const body = await request.json();
        const { shiftId, reason, isLateCancellation } = body;

        if (!shiftId) {
            return NextResponse.json({ error: 'Shift ID is required' }, { status: 400 });
        }

        // Get worker profile
        const workerProfile = await prisma.workerProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!workerProfile) {
            return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 });
        }

        // Verify the shift belongs to this worker
        const shift = await prisma.shift.findUnique({
            where: { id: shiftId },
            include: { jobPosting: true }
        });

        if (!shift || shift.workerId !== workerProfile.id) {
            return NextResponse.json({ error: 'Shift not found or not authorized' }, { status: 404 });
        }

        // Calculate if actually within 24 hours (server-side validation)
        const msUntilShift = new Date(shift.startTime).getTime() - Date.now();
        const hoursUntilShift = msUntilShift / (1000 * 60 * 60);
        const isActuallyLateCancellation = hoursUntilShift < 24;

        // Use a transaction to update everything atomically
        await prisma.$transaction(async (tx) => {
            // Delete the shift
            await tx.shift.delete({
                where: { id: shiftId }
            });

            // Mark the job posting as not filled
            await tx.jobPosting.update({
                where: { id: shift.jobPostingId },
                data: {
                    isFilled: false,
                    slotsOpen: { increment: 1 }
                }
            });

            // If late cancellation, create a violation record (if table exists)
            // and update worker's reliability score
            if (isActuallyLateCancellation) {
                // Increment late cancellation count on worker profile
                await tx.workerProfile.update({
                    where: { id: workerProfile.id },
                    data: {
                        lateCancellationCount: { increment: 1 }
                    }
                });

                // Could also create a formal violation record here
                // await tx.violation.create({ ... })
            }

            // Update the original application status if exists
            await tx.application.updateMany({
                where: {
                    jobPostingId: shift.jobPostingId,
                    workerId: workerProfile.id,
                    status: 'ACCEPTED'
                },
                data: {
                    status: 'CANCELLED',
                    cancellationReason: reason || null,
                    cancelledAt: new Date(),
                    isLateCancellation: isActuallyLateCancellation
                }
            });
        });

        return NextResponse.json({
            success: true,
            message: isActuallyLateCancellation
                ? 'Shift cancelled. A late cancellation violation has been recorded.'
                : 'Shift cancelled successfully.',
            isLateCancellation: isActuallyLateCancellation
        });

    } catch (error) {
        console.error('Shift cancellation error:', error);
        return NextResponse.json({ error: 'Failed to cancel shift' }, { status: 500 });
    }
}
