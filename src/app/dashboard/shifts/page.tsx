import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { differenceInYears } from 'date-fns';
import {
    MapPin,
    Clock,
    DollarSign,
    Calendar,
    Building2,
    AlertTriangle,
    Filter
} from 'lucide-react';
import { BUSINESS_RULES } from '@/lib/constants';

export default async function ShiftsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    if (!prisma) return <div>Database not connected</div>;

    const workerProfile = await prisma.workerProfile.findUnique({
        where: { userId: session.user.id },
    });

    // Must be verified AND training complete to access shifts
    if (!workerProfile || workerProfile.verificationStatus !== 'VERIFIED') {
        redirect('/dashboard');
    }

    if (workerProfile.trainingProgress < 100) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <AlertTriangle size={48} color="#eab308" style={{ marginBottom: '1rem' }} />
                <h2 style={{ marginBottom: '0.5rem' }}>Training Required</h2>
                <p style={{ color: '#888', marginBottom: '1.5rem' }}>
                    Complete the Shyft Academy to unlock shift browsing.
                </p>
                <Link href="/academy" className="btn btn-primary">
                    Go to Academy
                </Link>
            </div>
        );
    }

    // Calculate worker age for Minor Protection Filter
    const workerAge = differenceInYears(new Date(), new Date(workerProfile.dateOfBirth));
    const isMinor = workerAge < BUSINESS_RULES.MINOR_AGE_THRESHOLD; // Under 16

    // Fetch available job postings (not Shift - that's for confirmed assignments)
    let jobPostings = await prisma.jobPosting.findMany({
        where: {
            isActive: true,
            isFilled: false,
            shiftDate: { gte: new Date() }, // Only future shifts
        },
        include: {
            hotel: true, // HotelProfile relation
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

            {/* Job Postings List */}
            {jobPostings.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '0.5rem' }}>No Shifts Available</h2>
                    <p style={{ color: '#888' }}>
                        {isMinor
                            ? "No shifts match your age restrictions. Check back soon!"
                            : "Check back soon for new opportunities."}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {jobPostings.map((job) => {
                        const startDate = new Date(job.startTime);
                        const endDate = new Date(job.endTime);

                        return (
                            <div key={job.id} className="card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                            <div style={{
                                                width: '2.5rem',
                                                height: '2.5rem',
                                                borderRadius: 'var(--radius-md)',
                                                background: '#222',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Building2 size={18} color="var(--accent)" />
                                            </div>
                                            <div>
                                                <h3 style={{ fontWeight: 600, fontSize: '1.125rem' }}>{job.title}</h3>
                                                <p style={{ fontSize: '0.875rem', color: '#888' }}>{job.hotel.hotelName}</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#ccc' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={14} color="#888" />
                                                {startDate.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={14} color="#888" />
                                                {startDate.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}
                                                <span style={{ color: '#888' }}>({job.totalHours.toFixed(1)}h)</span>
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <MapPin size={14} color="#888" />
                                                {job.location}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                                            ${job.hourlyPay.toFixed(2)}
                                            <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#888' }}>/hr</span>
                                        </div>
                                        <Link href={`/dashboard/shifts/${job.id}`} className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
