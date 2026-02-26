import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
    Clock,
    CheckCircle2,
    DollarSign,
    Calendar,
    Search
} from 'lucide-react';
import { TierStatusCard } from '@/components/TierStatusCard';

export default async function WorkerDashboardPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    // Fetch worker profile
    if (!prisma) return <div>Database not connected</div>;

    const workerProfile = await prisma.workerProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            shifts: {
                where: { isCompleted: true },
                select: { estimatedPay: true }
            }
        }
    });

    if (!workerProfile) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <h2>Profile Not Found</h2>
                <p className="text-muted">Please complete your worker registration.</p>
            </div>
        );
    }

    const { verificationStatus } = workerProfile;
    const isVerified = verificationStatus === 'VERIFIED';
    const totalEarnings = workerProfile.shifts.reduce((sum, s) => sum + s.estimatedPay, 0);

    // STATE A: Pending Verification
    if (verificationStatus === 'PENDING') {
        return (
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>
                    Welcome, {workerProfile.firstName}!
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
                                Your profile is currently under review. This usually takes 24-48 hours.
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span className="badge badge-pending">Identity Pending</span>
                                <span className="badge badge-pending">Work Pass Pending</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid #E2D3C2' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#9C8F84' }}>While You Wait...</h3>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#888', lineHeight: 1.8 }}>
                        <li>Make sure your contact information is up to date</li>
                        <li>Review our <Link href="/#faq" style={{ color: 'var(--accent)' }}>FAQ</Link> to learn more about Shyft Sg</li>
                        <li>Once approved, you can start booking shifts immediately!</li>
                    </ul>
                </div>
            </div>
        );
    }

    // STATE B: Ready to Work (Verified)
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Welcome back, {workerProfile.firstName}!
                    </h1>
                    <p style={{ color: '#9C8F84' }}>You&apos;re all set to find shifts.</p>
                </div>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid #22c55e',
                    borderRadius: 'var(--radius-md)'
                }}>
                    <CheckCircle2 size={18} color="#22c55e" />
                    <span style={{ color: '#22c55e', fontWeight: 500 }}>Verified</span>
                </div>
            </div>

            {/* Tier Status Card with Progress Bar */}
            <TierStatusCard
                tier={workerProfile.tier}
                hoursWorked={workerProfile.totalHoursWorked}
            />

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem', marginTop: '1.5rem' }}>
                <StatCard
                    label="Total Earnings"
                    value={`$${totalEarnings.toFixed(2)}`}
                    icon={<DollarSign size={20} color="var(--accent)" />}
                />
                <StatCard
                    label="Completed Shifts"
                    value={workerProfile.shifts.length.toString()}
                    icon={<Calendar size={20} color="var(--accent)" />}
                />
                <StatCard
                    label="Hours Worked"
                    value={`${workerProfile.totalHoursWorked.toFixed(1)}h`}
                    icon={<Clock size={20} color="var(--accent)" />}
                />
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <Link href="/dashboard/shifts" className="card" style={{
                    padding: '1.5rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    border: '2px solid var(--accent)',
                    transition: 'transform 0.2s'
                }}>
                    <Search size={24} color="var(--accent)" />
                    <div>
                        <div style={{ fontWeight: 600, color: '#2F2A26' }}>Find Shifts</div>
                        <div style={{ fontSize: '0.875rem', color: '#9C8F84' }}>Browse available opportunities</div>
                    </div>
                </Link>

                <Link href="/dashboard/schedule" className="card" style={{
                    padding: '1.5rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'transform 0.2s'
                }}>
                    <Calendar size={24} color="var(--accent)" />
                    <div>
                        <div style={{ fontWeight: 600, color: '#2F2A26' }}>My Schedule</div>
                        <div style={{ fontSize: '0.875rem', color: '#9C8F84' }}>View upcoming shifts</div>
                    </div>
                </Link>

                <Link href="/dashboard/history" className="card" style={{
                    padding: '1.5rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'transform 0.2s'
                }}>
                    <DollarSign size={24} color="var(--accent)" />
                    <div>
                        <div style={{ fontWeight: 600, color: '#2F2A26' }}>Earnings</div>
                        <div style={{ fontSize: '0.875rem', color: '#9C8F84' }}>View shift history & pay</div>
                    </div>
                </Link>
            </div>

            {/* Recent Shifts */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E2D3C2' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recent Shifts</h2>
                </div>
                {workerProfile.shifts.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#9C8F84' }}>
                        <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>No shifts yet. Start browsing to find your first opportunity!</p>
                        <Link href="/dashboard/shifts" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            Browse Shifts
                        </Link>
                    </div>
                ) : (
                    <div style={{ padding: '1rem', color: '#9C8F84', textAlign: 'center' }}>
                        <Link href="/dashboard/history" className="btn btn-ghost">
                            View All Shifts →
                        </Link>
                    </div>
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
