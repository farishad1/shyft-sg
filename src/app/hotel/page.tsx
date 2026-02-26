import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
    Clock,
    CheckCircle2,
    PlusCircle,
    Calendar,
    Users,
    DollarSign
} from 'lucide-react';

export default async function HotelDashboardPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    if (!prisma) return <div>Database not connected</div>;

    const hotelProfile = await prisma.hotelProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!hotelProfile) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <h2>Profile Not Found</h2>
                <p className="text-muted">Please complete your hotel registration.</p>
            </div>
        );
    }

    const { verificationStatus } = hotelProfile;
    const isVerified = verificationStatus === 'VERIFIED';

    // STATE A: Pending Verification
    if (!isVerified) {
        return (
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>
                    Welcome, {hotelProfile.hotelName}!
                </h1>

                <div className="card" style={{
                    border: '1px solid #eab308',
                    background: 'linear-gradient(135deg, rgba(234,179,8,0.1) 0%, rgba(0,0,0,0) 100%)',
                    padding: '2rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                        <div style={{
                            width: '3rem',
                            height: '3rem',
                            borderRadius: '50%',
                            background: 'rgba(234,179,8,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Clock size={24} color="#eab308" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: '#eab308' }}>
                                Verification In Progress
                            </h2>
                            <p style={{ color: '#9C8F84', marginBottom: '1rem' }}>
                                Your hotel profile is currently under review by our team. This process usually takes 24-48 hours.
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span className="badge badge-pending">UEN Verification Pending</span>
                                <span className="badge badge-pending">Business License Pending</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid #E2D3C2' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#9C8F84' }}>While You Wait...</h3>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#9C8F84', lineHeight: 1.8 }}>
                        <li>Ensure your UEN ({hotelProfile.uen}) is correctly registered</li>
                        <li>Review our <Link href="/faq" style={{ color: 'var(--accent)' }}>FAQ</Link> for hotel partners</li>
                        <li>Prepare your first job posting details</li>
                    </ul>
                </div>

                <div style={{ marginTop: '2rem', padding: '1rem', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid #E2D3C2', opacity: 0.5 }}>
                    <button className="btn btn-primary btn-lg" disabled style={{ width: '100%', cursor: 'not-allowed' }}>
                        <PlusCircle size={18} style={{ marginRight: '0.5rem' }} />
                        Post New Shift (Verification Required)
                    </button>
                </div>
            </div>
        );
    }

    // STATE B: Verified - Full Access
    // Fetch stats
    const activeJobsCount = await prisma.jobPosting.count({
        where: { hotelId: hotelProfile.id, isActive: true, isFilled: false }
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaysShiftsCount = await prisma.shift.count({
        where: {
            hotelId: hotelProfile.id,
            shiftDate: { gte: todayStart, lte: todayEnd }
        }
    });

    // Fetch upcoming shifts with workers
    const upcomingShifts = await prisma.shift.findMany({
        where: {
            hotelId: hotelProfile.id,
            shiftDate: { gte: new Date() }
        },
        include: {
            worker: { include: { user: true } },
            jobPosting: true
        },
        orderBy: { shiftDate: 'asc' },
        take: 5
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {hotelProfile.hotelName}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} color="#22c55e" />
                        <span style={{ color: '#22c55e', fontSize: '0.875rem' }}>Verified Hotel</span>
                    </div>
                </div>

                <Link href="/hotel/jobs/new" className="btn btn-primary btn-lg">
                    <PlusCircle size={18} style={{ marginRight: '0.5rem' }} />
                    Post New Shift
                </Link>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard
                    label="Active Job Postings"
                    value={activeJobsCount.toString()}
                    icon={<Calendar size={20} color="var(--accent)" />}
                />
                <StatCard
                    label="Today's Shifts"
                    value={todaysShiftsCount.toString()}
                    icon={<Users size={20} color="var(--accent)" />}
                />
                <StatCard
                    label="Total Hours Hired"
                    value={hotelProfile.totalHoursHired.toFixed(1)}
                    icon={<DollarSign size={20} color="var(--accent)" />}
                />
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <Link href="/hotel/jobs/new" className="card" style={{
                    padding: '1.5rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    border: '1px solid var(--accent)',
                    transition: 'transform 0.2s'
                }}>
                    <PlusCircle size={24} color="var(--accent)" />
                    <div>
                        <div style={{ fontWeight: 600, color: '#2F2A26' }}>Post New Shift</div>
                        <div style={{ fontSize: '0.875rem', color: '#9C8F84' }}>Create a job listing</div>
                    </div>
                </Link>

                <Link href="/hotel/jobs" className="card" style={{
                    padding: '1.5rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'transform 0.2s'
                }}>
                    <Calendar size={24} color="var(--accent)" />
                    <div>
                        <div style={{ fontWeight: 600, color: '#2F2A26' }}>Manage Postings</div>
                        <div style={{ fontSize: '0.875rem', color: '#9C8F84' }}>View applicants and status</div>
                    </div>
                </Link>
            </div>

            {/* Upcoming Roster */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E2D3C2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Upcoming Roster</h2>
                    <Link href="/hotel/roster" style={{ color: 'var(--accent)', fontSize: '0.875rem', textDecoration: 'none' }}>
                        View All →
                    </Link>
                </div>

                {upcomingShifts.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#9C8F84' }}>
                        <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>No upcoming shifts scheduled</p>
                        <Link href="/hotel/jobs/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            Post Your First Shift
                        </Link>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#5A3E2B', color: '#E6C7A1', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            <tr>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>Role</th>
                                <th style={{ padding: '1rem' }}>Time</th>
                                <th style={{ padding: '1rem' }}>Worker</th>
                            </tr>
                        </thead>
                        <tbody>
                            {upcomingShifts.map((shift) => (
                                <tr key={shift.id} style={{ borderBottom: '1px solid #E2D3C2' }}>
                                    <td style={{ padding: '1rem' }}>
                                        {new Date(shift.shiftDate).toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '1rem' }}>{shift.jobPosting.title}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {new Date(shift.startTime).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })} -
                                        {new Date(shift.endTime).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                width: '1.5rem',
                                                height: '1.5rem',
                                                borderRadius: '50%',
                                                background: 'var(--accent)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.625rem',
                                                fontWeight: 700,
                                                color: '#000'
                                            }}>
                                                {shift.worker.firstName[0]}{shift.worker.lastName[0]}
                                            </div>
                                            <span>{shift.worker.firstName} {shift.worker.lastName}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                background: 'rgba(212, 163, 115, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.75rem', color: '#9C8F84', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#5A3E2B' }}>{value}</div>
            </div>
        </div>
    );
}
