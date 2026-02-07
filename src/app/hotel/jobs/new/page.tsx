import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { JobPostingForm } from './JobPostingForm';

export default async function NewJobPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    if (!prisma) return <div>Database not connected</div>;

    const hotelProfile = await prisma.hotelProfile.findUnique({
        where: { userId: session.user.id },
    });

    // Must be verified to post jobs
    if (!hotelProfile || hotelProfile.verificationStatus !== 'VERIFIED') {
        redirect('/hotel');
    }

    return (
        <div style={{ maxWidth: '600px' }}>
            <Link href="/hotel" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#888', textDecoration: 'none', marginBottom: '2rem' }}>
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>

            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent)' }}>
                Post New Shift
            </h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>
                Create a job posting for workers to apply.
            </p>

            <div className="card" style={{ padding: '1.5rem' }}>
                <JobPostingForm defaultLocation={hotelProfile.location} />
            </div>
        </div>
    );
}
