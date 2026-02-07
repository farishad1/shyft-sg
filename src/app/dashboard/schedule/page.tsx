import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
    Calendar,
    Clock,
    MapPin,
    CheckCircle2,
    HelpCircle,
    History,
    DollarSign
} from 'lucide-react';

export default async function SchedulePage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    if (!prisma) return <div>Database not connected</div>;

    const workerProfile = await prisma.workerProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!workerProfile) {
        redirect('/dashboard');
    }

    const now = new Date();

    // Fetch upcoming ACCEPTED shifts
    const upcomingShifts = await prisma.shift.findMany({
        where: {
            workerId: workerProfile.id,
            shiftDate: { gte: now },
        },
        include: {
            jobPosting: true,
            hotel: true,
        },
        orderBy: { shiftDate: 'asc' },
    });

    // Fetch PENDING applications
    const pendingApplications = await prisma.application.findMany({
        where: {
            workerId: workerProfile.id,
            status: 'PENDING',
        },
        include: {
            jobPosting: {
                include: { hotel: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    // Fetch past shifts and declined applications
    const pastShifts = await prisma.shift.findMany({
        where: {
            workerId: workerProfile.id,
            shiftDate: { lt: now },
        },
        include: {
            jobPosting: true,
            hotel: true,
        },
        orderBy: { shiftDate: 'desc' },
        take: 10,
    });

    const declinedApplications = await prisma.application.findMany({
        where: {
            workerId: workerProfile.id,
            status: 'DECLINED',
        },
        include: {
            jobPosting: {
                include: { hotel: true },
            },
        },
        orderBy: { respondedAt: 'desc' },
        take: 5,
    });

    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>My Schedule</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Track your shifts and applications</p>

            {/* Tabs Container */}
            <div style={{ display: 'grid', gap: '2rem' }}>

                {/* UPCOMING (Accepted) */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <CheckCircle2 size={20} color="#22c55e" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Upcoming Shifts</h2>
                        <span className="badge badge-verified">{upcomingShifts.length}</span>
                    </div>

                    {upcomingShifts.length === 0 ? (
                        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                            <Calendar size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                            <p>No upcoming shifts scheduled</p>
                            <Link href="/dashboard/shifts" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                Find Shifts
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {upcomingShifts.map((shift) => (
                                <ShiftCard
                                    key={shift.id}
                                    type="upcoming"
                                    title={shift.jobPosting.title}
                                    hotelName={shift.hotel.hotelName}
                                    date={new Date(shift.shiftDate)}
                                    startTime={new Date(shift.startTime)}
                                    endTime={new Date(shift.endTime)}
                                    location={shift.hotel.location}
                                    earnings={shift.estimatedPay}
                                    note={shift.jobPosting.note}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* PENDING */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <HelpCircle size={20} color="#eab308" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Pending Applications</h2>
                        <span className="badge badge-pending">{pendingApplications.length}</span>
                    </div>

                    {pendingApplications.length === 0 ? (
                        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                            <p>No pending applications</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {pendingApplications.map((app) => (
                                <ShiftCard
                                    key={app.id}
                                    type="pending"
                                    title={app.jobPosting.title}
                                    hotelName={app.jobPosting.hotel.hotelName}
                                    date={new Date(app.jobPosting.shiftDate)}
                                    startTime={new Date(app.jobPosting.startTime)}
                                    endTime={new Date(app.jobPosting.endTime)}
                                    location={app.jobPosting.location}
                                    earnings={app.jobPosting.hourlyPay * app.jobPosting.totalHours}
                                    linkTo={`/dashboard/shifts/${app.jobPostingId}`}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* HISTORY */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <History size={20} color="#888" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>History</h2>
                    </div>

                    {pastShifts.length === 0 && declinedApplications.length === 0 ? (
                        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                            <p>No past shifts yet</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {pastShifts.map((shift) => (
                                <ShiftCard
                                    key={shift.id}
                                    type="history"
                                    title={shift.jobPosting.title}
                                    hotelName={shift.hotel.hotelName}
                                    date={new Date(shift.shiftDate)}
                                    startTime={new Date(shift.startTime)}
                                    endTime={new Date(shift.endTime)}
                                    location={shift.hotel.location}
                                    earnings={shift.isPaid ? shift.estimatedPay : undefined}
                                    isPaid={shift.isPaid}
                                />
                            ))}
                            {declinedApplications.map((app) => (
                                <div
                                    key={app.id}
                                    className="card"
                                    style={{ padding: '1rem', opacity: 0.6, borderColor: '#333' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 500, color: '#888' }}>{app.jobPosting.title}</div>
                                            <div style={{ fontSize: '0.875rem', color: '#666' }}>{app.jobPosting.hotel.hotelName}</div>
                                        </div>
                                        <span className="badge badge-declined">Declined</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

interface ShiftCardProps {
    type: 'upcoming' | 'pending' | 'history';
    title: string;
    hotelName: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    location: string;
    earnings?: number;
    note?: string | null;
    linkTo?: string;
    isPaid?: boolean;
}

function ShiftCard({ type, title, hotelName, date, startTime, endTime, location, earnings, note, linkTo, isPaid }: ShiftCardProps) {
    const borderColor = type === 'upcoming' ? '#22c55e' : type === 'pending' ? '#eab308' : '#333';

    const content = (
        <div
            className="card"
            style={{
                padding: '1.25rem',
                borderLeft: `3px solid ${borderColor}`,
                transition: 'transform 0.2s'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{title}</h3>
                    <div style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.75rem' }}>{hotelName}</div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#aaa' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={14} />
                            {date.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={14} />
                            {startTime.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={14} />
                            {location}
                        </span>
                    </div>

                    {note && type === 'upcoming' && (
                        <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#111', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: '#888' }}>
                            📋 {note}
                        </div>
                    )}
                </div>

                {earnings !== undefined && (
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: type === 'history' && isPaid ? '#22c55e' : 'var(--accent)' }}>
                            ${earnings.toFixed(2)}
                        </div>
                        {type === 'history' && (
                            <span style={{ fontSize: '0.75rem', color: isPaid ? '#22c55e' : '#888' }}>
                                {isPaid ? '✓ Paid' : 'Pending Payment'}
                            </span>
                        )}
                    </div>
                )}

                {type === 'pending' && (
                    <div style={{ textAlign: 'right' }}>
                        <span className="badge badge-pending">Awaiting Review</span>
                    </div>
                )}
            </div>
        </div>
    );

    if (linkTo) {
        return <Link href={linkTo} style={{ textDecoration: 'none' }}>{content}</Link>;
    }

    return content;
}
