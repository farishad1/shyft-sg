import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Calendar, Clock, DollarSign, Building2, Star, TrendingUp } from 'lucide-react';
import { TIER_THRESHOLDS } from '@/lib/tiers';
import { RateHotelButton } from './RateHotelButton';

export default async function WorkerHistoryPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    if (!prisma) return <div>Database not connected</div>;

    const workerProfile = await prisma.workerProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!workerProfile) {
        redirect('/dashboard');
    }

    // Fetch completed shifts
    const completedShifts = await prisma.shift.findMany({
        where: {
            workerId: workerProfile.id,
            isCompleted: true,
        },
        include: {
            hotel: true,
            jobPosting: true,
        },
        orderBy: { completedAt: 'desc' },
    });

    // Calculate total earnings
    const totalEarnings = completedShifts.reduce((sum, shift) => sum + shift.estimatedPay, 0);
    const paidEarnings = completedShifts.filter(s => s.isPaid).reduce((sum, shift) => sum + shift.estimatedPay, 0);
    const pendingPayout = totalEarnings - paidEarnings;

    // Tier progress
    const currentTier = workerProfile.tier;
    const totalHours = workerProfile.totalHoursWorked;
    let nextTier: string | null = null;
    let hoursToNextTier = 0;

    if (currentTier === 'SILVER') {
        nextTier = 'GOLD';
        hoursToNextTier = TIER_THRESHOLDS.GOLD.min - totalHours;
    } else if (currentTier === 'GOLD') {
        nextTier = 'PLATINUM';
        hoursToNextTier = TIER_THRESHOLDS.PLATINUM.min - totalHours;
    }

    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Work History</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Your completed shifts and earnings</p>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard
                    label="Total Earnings"
                    value={`$${totalEarnings.toFixed(2)}`}
                    icon={<DollarSign size={20} color="#22c55e" />}
                    color="#22c55e"
                />
                <StatCard
                    label="Pending Payout"
                    value={`$${pendingPayout.toFixed(2)}`}
                    icon={<Clock size={20} color="#eab308" />}
                    color="#eab308"
                />
                <StatCard
                    label="Total Hours"
                    value={totalHours.toFixed(1)}
                    icon={<TrendingUp size={20} color="var(--accent)" />}
                    color="var(--accent)"
                />
                <StatCard
                    label="Shifts Completed"
                    value={completedShifts.length.toString()}
                    icon={<Calendar size={20} color="var(--accent)" />}
                    color="var(--accent)"
                />
            </div>

            {/* Tier Progress */}
            {nextTier && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(239,191,4,0.1) 0%, rgba(0,0,0,0) 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <span className={`badge badge-${currentTier.toLowerCase()}`} style={{ marginRight: '0.5rem' }}>
                                {currentTier}
                            </span>
                            <span style={{ color: '#888' }}>→</span>
                            <span className={`badge badge-${nextTier.toLowerCase()}`} style={{ marginLeft: '0.5rem' }}>
                                {nextTier}
                            </span>
                        </div>
                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                            {hoursToNextTier.toFixed(1)}h to go
                        </span>
                    </div>
                    <div style={{ height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                            style={{
                                height: '100%',
                                background: 'var(--accent)',
                                width: `${Math.min(100, (totalHours / (currentTier === 'SILVER' ? TIER_THRESHOLDS.GOLD.min : TIER_THRESHOLDS.PLATINUM.min)) * 100)}%`,
                                transition: 'width 0.5s'
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Completed Shifts List */}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Completed Shifts</h2>

            {completedShifts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                    <p>No completed shifts yet. Your work history will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {completedShifts.map((shift) => {
                        const shiftDate = new Date(shift.shiftDate);
                        const startTime = new Date(shift.startTime);
                        const endTime = new Date(shift.endTime);

                        return (
                            <div
                                key={shift.id}
                                className="card"
                                style={{
                                    padding: '1.5rem',
                                    borderLeft: shift.isPaid ? '3px solid #22c55e' : '3px solid #eab308',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontWeight: 600 }}>{shift.jobPosting.title}</h3>
                                            {shift.isPaid && (
                                                <span className="badge badge-verified">Paid</span>
                                            )}
                                        </div>

                                        {/* Hotel Info */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#888' }}>
                                            <Building2 size={14} />
                                            <span>{shift.hotel.hotelName}</span>
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
                                                ({shift.totalHours.toFixed(1)}h)
                                            </span>
                                        </div>

                                        {/* Rating given by hotel */}
                                        {shift.workerRating && (
                                            <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#111', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
                                                <span style={{ color: '#888' }}>Hotel rated you: </span>
                                                <span style={{ color: 'var(--accent)' }}>
                                                    {'★'.repeat(shift.workerRating)}{'☆'.repeat(5 - shift.workerRating)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Your rating for hotel */}
                                        {shift.hotelRating && (
                                            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#111', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
                                                <span style={{ color: '#888' }}>You rated: </span>
                                                <span style={{ color: 'var(--accent)' }}>
                                                    {'★'.repeat(shift.hotelRating)}{'☆'.repeat(5 - shift.hotelRating)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Earnings & Rate */}
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>
                                            ${shift.estimatedPay.toFixed(2)}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.75rem' }}>
                                            {shift.isPaid ? 'Paid' : 'Pending'}
                                        </div>

                                        {!shift.hotelRating && (
                                            <RateHotelButton shiftId={shift.id} />
                                        )}
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

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
    return (
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                background: '#222',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color }}>{value}</div>
            </div>
        </div>
    );
}
