import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, Lock, AlertTriangle, Star } from 'lucide-react';
import { BUSINESS_RULES } from '@/lib/constants';
import { ApplicantsTable } from './ApplicantsTable';
import { ShiftActions } from '@/app/hotel/roster/history/ShiftActions';

export default async function JobDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    if (!prisma) return <div>Database not connected</div>;

    try {
        const hotelProfile = await prisma.hotelProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!hotelProfile) {
            redirect('/hotel');
        }

        // Fetch job posting with applications
        const jobPosting = await prisma.jobPosting.findUnique({
            where: { id: params.id },
            include: {
                applications: {
                    include: {
                        worker: {
                            include: { user: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                shift: {
                    include: {
                        worker: { include: { user: true } }
                    }
                }
            },
        });

        if (!jobPosting || jobPosting.hotelId !== hotelProfile.id) {
            redirect('/hotel/jobs');
        }

        const isPastShift = new Date(jobPosting.endTime) < new Date();

        const startDate = new Date(jobPosting.startTime);
        const endDate = new Date(jobPosting.endTime);
        const hoursUntilShift = (startDate.getTime() - Date.now()) / (1000 * 60 * 60);
        const isLocked = hoursUntilShift < BUSINESS_RULES.APPLICATION_LOCK_HOURS;

        return (
            <div>
                <Link href="/hotel/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#888', textDecoration: 'none', marginBottom: '2rem' }}>
                    <ArrowLeft size={18} /> Back to Job Postings
                </Link>

                {/* Job Details Card */}
                <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                {jobPosting.title}
                            </h1>
                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: '#888', fontSize: '0.875rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={14} />
                                    {startDate.toLocaleDateString('en-SG', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={14} />
                                    {startDate.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}
                                    ({jobPosting.totalHours.toFixed(1)}h)
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={14} />
                                    {jobPosting.location}
                                </span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                                ${jobPosting.hourlyPay.toFixed(2)}<span style={{ fontSize: '0.875rem', color: '#888' }}>/hr</span>
                            </div>
                            <span className={`badge ${jobPosting.isFilled ? 'badge-verified' : 'badge-pending'}`}>
                                {jobPosting.isFilled ? 'Filled' : 'Open'}
                            </span>
                        </div>
                    </div>

                    {jobPosting.note && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#111', borderRadius: 'var(--radius-md)', color: '#ccc' }}>
                            <strong>Notes:</strong> {jobPosting.note}
                        </div>
                    )}
                </div>

                {/* 12-Hour Lock Warning */}
                {isLocked && !jobPosting.isFilled && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        background: 'rgba(234,179,8,0.1)',
                        border: '1px solid #eab308',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        color: '#eab308'
                    }}>
                        <Lock size={20} />
                        <div>
                            <strong>Roster Locked (12-Hour Rule)</strong>
                            <p style={{ fontSize: '0.875rem', margin: 0 }}>
                                This shift starts in less than 12 hours. You cannot decline applicants at this time.
                            </p>
                        </div>
                    </div>
                )}

                {/* Filled Shift Info */}
                {jobPosting.isFilled && jobPosting.shift && (
                    <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid #22c55e' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#22c55e' }}>
                            ✓ Shift Assigned
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '3rem',
                                height: '3rem',
                                borderRadius: '50%',
                                background: 'var(--accent)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                color: '#000'
                            }}>
                                {jobPosting.shift.worker?.firstName?.[0] ?? '?'}{jobPosting.shift.worker?.lastName?.[0] ?? '?'}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>
                                    {jobPosting.shift.worker?.firstName ?? 'Unknown'} {jobPosting.shift.worker?.lastName ?? 'Worker'}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#888' }}>
                                    {jobPosting.shift.worker?.user?.email ?? 'N/A'}
                                </div>
                                {jobPosting.shift.worker?.profileImageUrl && (
                                    <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#666' }}>
                                        📷 Profile photo on file
                                    </div>
                                )}
                            </div>
                            <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                <span className={`badge badge-${jobPosting.shift.worker?.tier?.toLowerCase() ?? 'silver'}`}>
                                    {jobPosting.shift.worker?.tier ?? 'SILVER'}
                                </span>
                                {isPastShift && (
                                    <ShiftActions
                                        shiftId={jobPosting.shift.id}
                                        isCompleted={jobPosting.shift.isCompleted}
                                        hasRated={jobPosting.shift.workerRating !== null}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Applicants List or Expired Message */}
                {!jobPosting.isFilled && (
                    isPastShift ? (
                        <div className="card" style={{
                            padding: '2rem', textAlign: 'center',
                            border: '1px solid #333', opacity: 0.7,
                        }}>
                            <AlertTriangle size={36} style={{ color: '#888', marginBottom: '1rem' }} />
                            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#888' }}>
                                Shift Expired — No Applicants Hired
                            </h3>
                            <p style={{ color: '#666', fontSize: '0.875rem' }}>
                                This shift has passed without being filled. Consider reposting with adjusted timing or pay.
                            </p>
                            <Link href="/hotel/jobs/new" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                                Repost Shift
                            </Link>
                        </div>
                    ) : (
                        <ApplicantsTable
                            applications={jobPosting.applications.map(app => ({
                                ...app,
                                worker: {
                                    ...app.worker,
                                    dateOfBirth: app.worker.dateOfBirth
                                }
                            }))}
                            isPremium={hotelProfile.isPremium}
                            isLocked={isLocked}
                        />
                    )
                )}
            </div>
        );
    } catch (error) {
        console.error('Error loading job details:', error);
        redirect('/hotel/jobs');
    }
}
