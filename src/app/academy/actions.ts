'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * Complete Training - Updates trainingProgress to 100%
 */
export async function completeTraining(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    // Validate quiz answer
    const answer = formData.get('answer') as string;
    const correctAnswer = 'B'; // Guest Experience is the correct answer

    if (answer !== correctAnswer) {
        // Return error - they need to try again
        return { success: false, error: 'Incorrect answer. Please try again.' };
    }

    if (!prisma) {
        throw new Error('Database not connected');
    }

    // Update training progress to 100%
    await prisma.workerProfile.update({
        where: { userId: session.user.id },
        data: { trainingProgress: 100 },
    });

    // Revalidate and redirect
    revalidatePath('/dashboard');
    revalidatePath('/academy');
    redirect('/dashboard?trained=true');
}
