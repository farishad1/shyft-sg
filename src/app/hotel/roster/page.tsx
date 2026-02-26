import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, Clock, Users, History } from 'lucide-react';

export default async function HotelRosterPage() {
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

    // Fetch upcoming shifts
    const upcomingShifts = await prisma.shift.findMany({
        where: {
            hotelId: hotelProfile.id,
            shiftDate: { gte: now },
        },
        include: {
            worker: { include: { user: true } },
            jobPosting: true,
        },
        orderBy: { shiftDate: 'asc' },
    });

    // Count past shifts needing verification
    const pastShiftsCount = await prisma.shift.count({
        where: {
            hotelId: hotelProfile.id,
            endTime: { lt: now },
            isCompleted: false,
        },
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Roster</h1>
                    <p style={{ color: '#9C8F84' }}>Manage your scheduled shifts</p>
                </div>

                <Link href="/hotel/roster/history" className="btn btn-ghost" style={{ display: 'flex', gap: '0.5rem' }}>
                    <History size={18} />
                    Past Shifts
                    {pastShiftsCount > 0 && (
                        <span className="badge badge-pending">{pastShiftsCount}</span>
                    )}
                </Link>
            </div>

            {upcomingShifts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '0.5rem' }}>No Upcoming Shifts</h2>
                    <p style={{ color: '#9C8F84', marginBottom: '1.5rem' }}>When you accept applicants, shifts will appear here.</p>
                    <Link href="/hotel/jobs/new" className="btn btn-primary">
                        Post a Shift
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {upcomingShifts.map((shift) => {
                        const shiftDate = new Date(shift.shiftDate);
                        const startTime = new Date(shift.startTime);
                        const endTime = new Date(shift.endTime);

                        return (
                            <div key={shift.id} className="card" style={{ padding: '1.5rem', borderLeft: '3px solid var(--accent)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>{shift.jobPosting.title}</h3>

                                        {/* Worker Info */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                            <div style={{
                                                width: '2rem',
                                                height: '2rem',
                                                borderRadius: '50%',
                                                background: 'var(--accent)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                color: '#FFFFFF'
                                            }}>
                                                {shift.worker.firstName[0]}{shift.worker.lastName[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{shift.worker.firstName} {shift.worker.lastName}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#9C8F84' }}>{shift.worker.user.email}</div>
                                            </div>
                                            <span className={`badge badge-${shift.worker.tier.toLowerCase()}`}>{shift.worker.tier}</span>
                                        </div>

                                        {/* Shift Details */}
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#9C8F84' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={14} />
                                                {shiftDate.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={14} />
                                                {startTime.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
                                            ${shift.estimatedPay.toFixed(2)}
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#9C8F84' }}>estimated pay</span>
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
