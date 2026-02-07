import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Building2,
    DollarSign,
    Star
} from 'lucide-react';
import { ApplyButton } from './ApplyButton';

export default async function ShiftDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    if (!prisma) return <div>Database not connected</div>;

    const workerProfile = await prisma.workerProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!workerProfile || workerProfile.verificationStatus !== 'VERIFIED') {
        redirect('/dashboard');
    }

    if (workerProfile.trainingProgress < 100) {
        redirect('/academy');
    }

    // Fetch job posting with hotel info
    const jobPosting = await prisma.jobPosting.findUnique({
        where: { id: params.id },
        include: {
            hotel: true,
        },
    });

    if (!jobPosting || !jobPosting.isActive) {
        redirect('/dashboard/shifts');
    }

    // Check if worker already applied
    const existingApplication = await prisma.application.findUnique({
        where: {
            jobPostingId_workerId: {
                jobPostingId: jobPosting.id,
                workerId: workerProfile.id,
            },
        },
    });

    const startDate = new Date(jobPosting.startTime);
    const endDate = new Date(jobPosting.endTime);
    const shiftDate = new Date(jobPosting.shiftDate);

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <Link href="/dashboard/shifts" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#888', textDecoration: 'none', marginBottom: '2rem' }}>
                <ArrowLeft size={18} /> Back to Shifts
            </Link>

            {/* Header with Pay */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '2rem',
                padding: '2rem',
                background: 'linear-gradient(135deg, rgba(239,191,4,0.1) 0%, rgba(0,0,0,0) 100%)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(239,191,4,0.3)'
            }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {jobPosting.title}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888' }}>
                        <Building2 size={18} />
                        <span style={{ fontSize: '1.125rem' }}>{jobPosting.hotel.hotelName}</span>
                        {jobPosting.hotel.averageRating && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent)' }}>
                                <Star size={14} fill="var(--accent)" /> {jobPosting.hotel.averageRating.toFixed(1)}
                            </span>
                        )}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                        ${jobPosting.hourlyPay.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#888' }}>per hour</div>
                </div>
            </div>

            {/* Job Details Card */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#888' }}>Shift Details</h2>

                <div style={{ display: 'grid', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            background: '#222',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Calendar size={18} color="var(--accent)" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Date</div>
                            <div style={{ fontWeight: 500 }}>
                                {shiftDate.toLocaleDateString('en-SG', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            background: '#222',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Clock size={18} color="var(--accent)" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Time</div>
                            <div style={{ fontWeight: 500 }}>
                                {startDate.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}
                                <span style={{ color: '#888', marginLeft: '0.5rem' }}>({jobPosting.totalHours.toFixed(1)} hours)</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            background: '#222',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <MapPin size={18} color="var(--accent)" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Location</div>
                            <div style={{ fontWeight: 500 }}>{jobPosting.location}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            background: '#222',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <DollarSign size={18} color="var(--accent)" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Estimated Earnings</div>
                            <div style={{ fontWeight: 500, color: 'var(--accent)' }}>
                                ${(jobPosting.hourlyPay * jobPosting.totalHours).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {jobPosting.note && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#888' }}>Notes from Hotel</h2>
                    <p style={{ color: '#ccc', lineHeight: 1.6 }}>{jobPosting.note}</p>
                </div>
            )}

            {/* Apply Section */}
            <div className="card" style={{ padding: '1.5rem' }}>
                {jobPosting.isFilled ? (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <span className="badge badge-gray" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
                            Position Filled
                        </span>
                        <p style={{ color: '#888', marginTop: '1rem' }}>
                            This shift has been assigned to another worker.
                        </p>
                    </div>
                ) : existingApplication ? (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <span className={`badge ${existingApplication.status === 'PENDING' ? 'badge-pending' :
                                existingApplication.status === 'ACCEPTED' ? 'badge-verified' :
                                    'badge-declined'
                            }`} style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
                            {existingApplication.status === 'PENDING' ? 'Pending Approval' :
                                existingApplication.status === 'ACCEPTED' ? '✓ Accepted!' :
                                    'Application Declined'}
                        </span>
                        <p style={{ color: '#888', marginTop: '1rem' }}>
                            {existingApplication.status === 'PENDING' && 'The hotel will review your application.'}
                            {existingApplication.status === 'ACCEPTED' && 'Check your Schedule for shift details.'}
                            {existingApplication.status === 'DECLINED' && 'This application was not selected.'}
                        </p>
                    </div>
                ) : (
                    <ApplyButton jobPostingId={jobPosting.id} />
                )}
            </div>

            {/* Hotel Info */}
            <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem', background: '#111' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#888' }}>About the Hotel</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Building2 size={20} color="#000" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{jobPosting.hotel.hotelName}</div>
                        <div style={{ fontSize: '0.875rem', color: '#888' }}>{jobPosting.hotel.location}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <span className={`badge badge-${jobPosting.hotel.tier.toLowerCase()}`}>
                            {jobPosting.hotel.tier}
                        </span>
                    </div>
                </div>
                {jobPosting.hotel.description && (
                    <p style={{ color: '#888', marginTop: '1rem', fontSize: '0.875rem', lineHeight: 1.6 }}>
                        {jobPosting.hotel.description}
                    </p>
                )}
            </div>
        </div>
    );
}
