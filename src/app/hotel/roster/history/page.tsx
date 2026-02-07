import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, DollarSign, Star, CheckCircle2, User } from 'lucide-react';
import { ShiftActions } from './ShiftActions';

export default async function HotelRosterHistoryPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    if (!prisma) return <div>Database not connected</div>;

    const hotelProfile = await prisma.hotelProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!hotelProfile) {
        redirect('/hotel');
    }

    const now = new Date();

    // Fetch past shifts (where endTime has passed)
    const pastShifts = await prisma.shift.findMany({
        where: {
            hotelId: hotelProfile.id,
            endTime: { lt: now },
        },
        include: {
            worker: { include: { user: true } },
            jobPosting: true,
        },
        orderBy: { shiftDate: 'desc' },
    });

    return (
        <div>
            <Link href="/hotel/roster" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#888', textDecoration: 'none', marginBottom: '2rem' }}>
                <ArrowLeft size={18} /> Back to Roster
            </Link>

            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Shift History</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Verify attendance and rate workers</p>

            {pastShifts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '0.5rem' }}>No Past Shifts</h2>
                    <p style={{ color: '#888' }}>Shifts will appear here after they end.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {pastShifts.map((shift) => {
                        const shiftDate = new Date(shift.shiftDate);
                        const startTime = new Date(shift.startTime);
                        const endTime = new Date(shift.endTime);

                        return (
                            <div
                                key={shift.id}
                                className="card"
                                style={{
                                    padding: '1.5rem',
                                    borderLeft: shift.isCompleted ? '3px solid #22c55e' : '3px solid #eab308',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                    {/* Left: Shift Info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                            <h3 style={{ fontWeight: 600, fontSize: '1.125rem' }}>{shift.jobPosting.title}</h3>
                                            {shift.isCompleted ? (
                                                <span className="badge badge-verified">
                                                    <CheckCircle2 size={12} /> Completed
                                                </span>
                                            ) : (
                                                <span className="badge badge-pending">Pending Verification</span>
                                            )}
                                        </div>

                                        {/* Worker Info */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                            <div style={{
                                                width: '2rem',
                                                height: '2rem',
                                                borderRadius: '50%',
                                                background: '#333',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                {shift.worker.firstName[0]}{shift.worker.lastName[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{shift.worker.firstName} {shift.worker.lastName}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#888' }}>
                                                    <span className={`badge badge-${shift.worker.tier.toLowerCase()}`} style={{ fontSize: '0.625rem' }}>
                                                        {shift.worker.tier}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shift Details */}
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#888' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={14} />
                                                {shiftDate.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={14} />
                                                {startTime.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <DollarSign size={14} />
                                                ${shift.estimatedPay.toFixed(2)}
                                            </span>
                                        </div>

                                        {/* Rating display if already rated */}
                                        {shift.workerRating && (
                                            <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#111', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
                                                <span style={{ color: 'var(--accent)' }}>
                                                    {'★'.repeat(shift.workerRating)}{'☆'.repeat(5 - shift.workerRating)}
                                                </span>
                                                {shift.workerReview && (
                                                    <span style={{ color: '#888', marginLeft: '0.5rem' }}>"{shift.workerReview}"</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Actions */}
                                    <div style={{ textAlign: 'right' }}>
                                        <ShiftActions
                                            shiftId={shift.id}
                                            isCompleted={shift.isCompleted}
                                            hasRated={!!shift.workerRating}
                                        />
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
