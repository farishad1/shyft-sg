import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { differenceInYears } from 'date-fns';
import { AlertTriangle, Filter } from 'lucide-react';
import { BUSINESS_RULES } from '@/lib/constants';
import { ShiftsClientWrapper } from './ShiftsClientWrapper';

export default async function ShiftsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    if (!prisma) return <div>Database not connected</div>;

    const workerProfile = await prisma.workerProfile.findUnique({
        where: { userId: session.user.id },
    });

    // Must be verified to access shifts
    if (!workerProfile || workerProfile.verificationStatus !== 'VERIFIED') {
        redirect('/dashboard');
    }

    // Calculate worker age for Minor Protection Filter
    const workerAge = differenceInYears(new Date(), new Date(workerProfile.dateOfBirth));
    const isMinor = workerAge < BUSINESS_RULES.MINOR_AGE_THRESHOLD; // Under 16

    // Fetch available job postings with hotel coordinates
    let jobPostings = await prisma.jobPosting.findMany({
        where: {
            isActive: true,
            isFilled: false,
            shiftDate: { gte: new Date() }, // Only future shifts
        },
        include: {
            hotel: {
                select: {
                    id: true,
                    hotelName: true,
                    location: true,
                    latitude: true,
                    longitude: true,
                }
            },
        },
        orderBy: { shiftDate: 'asc' },
        take: 20,
    });

    // MINOR PROTECTION FILTER (Critical)
    if (isMinor) {
        jobPostings = jobPostings.filter((job) => {
            const endHour = new Date(job.endTime).getHours();
            const durationHours = job.totalHours;

            // Filter out shifts that end after 11PM or before 6AM
            const isLateNight = endHour >= BUSINESS_RULES.MINOR_RESTRICTIONS.NIGHT_SHIFT_START
                || endHour < BUSINESS_RULES.MINOR_RESTRICTIONS.NIGHT_SHIFT_END;

            // Filter out shifts longer than 6 hours
            const isTooLong = durationHours > BUSINESS_RULES.MINOR_RESTRICTIONS.MAX_SHIFT_HOURS;

            return !isLateNight && !isTooLong;
        });
    }

    // Transform for client component (serialize dates)
    const serializedJobs = jobPostings.map(job => ({
        id: job.id,
        title: job.title,
        startTime: job.startTime,
        endTime: job.endTime,
        totalHours: job.totalHours,
        hourlyPay: job.hourlyPay,
        location: job.location,
        slotsOpen: job.slotsOpen,
        hotel: {
            id: job.hotel.id,
            hotelName: job.hotel.hotelName,
            location: job.hotel.location,
            latitude: job.hotel.latitude,
            longitude: job.hotel.longitude,
        }
    }));

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Find Shifts</h1>
                    <p style={{ color: '#888' }}>Browse available opportunities</p>
                </div>

                {isMinor && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(234,179,8,0.1)',
                        border: '1px solid #eab308',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        color: '#eab308'
                    }}>
                        <AlertTriangle size={16} />
                        <span>Under 16 restrictions apply</span>
                    </div>
                )}
            </div>

            {/* Filters Bar (Placeholder) */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn btn-ghost btn-sm" style={{ display: 'flex', gap: '0.5rem' }}>
                    <Filter size={16} /> All Shifts
                </button>
                <button className="btn btn-ghost btn-sm">This Week</button>
                <button className="btn btn-ghost btn-sm">Weekends</button>
                <button className="btn btn-ghost btn-sm">Near Me</button>
            </div>

            {/* Map + Shifts List (Client Component) */}
            <ShiftsClientWrapper jobPostings={serializedJobs} />
        </div>
    );
}
