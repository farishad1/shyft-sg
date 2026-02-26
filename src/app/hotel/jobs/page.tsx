import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, Clock, Users, PlusCircle } from 'lucide-react';

export default async function HotelJobsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    if (!prisma) return <div>Database not connected</div>;

    const hotelProfile = await prisma.hotelProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!hotelProfile) {
        redirect('/hotel');
    }

    // Fetch all job postings for this hotel
    const jobPostings = await prisma.jobPosting.findMany({
        where: { hotelId: hotelProfile.id },
        include: {
            applications: {
                where: { status: 'PENDING' }
            }
        },
        orderBy: { shiftDate: 'desc' },
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>My Job Postings</h1>
                    <p style={{ color: '#9C8F84' }}>Manage your shift listings and applicants</p>
                </div>

                {hotelProfile.verificationStatus === 'VERIFIED' && (
                    <Link href="/hotel/jobs/new" className="btn btn-primary">
                        <PlusCircle size={18} style={{ marginRight: '0.5rem' }} />
                        Post New Shift
                    </Link>
                )}
            </div>

            {jobPostings.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '0.5rem' }}>No Job Postings Yet</h2>
                    <p style={{ color: '#9C8F84', marginBottom: '1.5rem' }}>
                        Create your first job posting to start receiving applications.
                    </p>
                    {hotelProfile.verificationStatus === 'VERIFIED' && (
                        <Link href="/hotel/jobs/new" className="btn btn-primary">
                            Post Your First Shift
                        </Link>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {jobPostings.map((job) => {
                        const startDate = new Date(job.startTime);
                        const endDate = new Date(job.endTime);
                        const isPast = startDate < new Date();

                        return (
                            <Link
                                key={job.id}
                                href={`/hotel/jobs/${job.id}`}
                                className="card"
                                style={{
                                    padding: '1.5rem',
                                    textDecoration: 'none',
                                    opacity: isPast ? 0.5 : 1,
                                    filter: isPast ? 'grayscale(1)' : 'none',
                                    transition: 'transform 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem', color: '#2F2A26' }}>
                                            {job.title}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#9C8F84' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={14} />
                                                {startDate.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={14} />
                                                {startDate.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Users size={14} />
                                                {job.applications.length} pending applicant{job.applications.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
                                            ${job.hourlyPay.toFixed(2)}<span style={{ fontSize: '0.75rem', color: '#9C8F84' }}>/hr</span>
                                        </div>
                                        <span className={`badge ${job.isFilled ? 'badge-verified' : job.isActive ? 'badge-pending' : 'badge-gray'}`}>
                                            {job.isFilled ? 'Filled' : job.isActive ? 'Open' : 'Closed'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
