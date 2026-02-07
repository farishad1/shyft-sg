import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
    Clock,
    CheckCircle2,
    AlertTriangle,
    GraduationCap,
    DollarSign,
    Calendar,
    Award
} from 'lucide-react';

export default async function WorkerDashboardPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    // Fetch worker profile
    if (!prisma) return <div>Database not connected</div>;

    const workerProfile = await prisma.workerProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!workerProfile) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <h2>Profile Not Found</h2>
                <p className="text-muted">Please complete your worker registration.</p>
            </div>
        );
    }

    const { verificationStatus, trainingProgress } = workerProfile;
    const isVerified = verificationStatus === 'VERIFIED';
    const isTrainingComplete = trainingProgress >= 100;

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
                            <p style={{ color: '#ccc', marginBottom: '1rem' }}>
                                Your profile is currently under review by our team. This process usually takes 24-48 hours.
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span className="badge badge-pending">Identity Pending</span>
                                <span className="badge badge-pending">Work Pass Pending</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#111', borderRadius: 'var(--radius-md)', border: '1px solid #333' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#888' }}>While You Wait...</h3>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#888', lineHeight: 1.8 }}>
                        <li>Make sure your contact information is up to date</li>
                        <li>Review our <Link href="/faq" style={{ color: 'var(--accent)' }}>FAQ</Link> to learn more about Shyft Sg</li>
                        <li>Prepare for the Shyft Academy training once verified</li>
                    </ul>
                </div>
            </div>
        );
    }

    // STATE B: Verified but Training Incomplete
    if (isVerified && !isTrainingComplete) {
        return (
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>
                    Welcome, {workerProfile.firstName}!
                </h1>

                {/* Verified Badge */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid #22c55e',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '2rem'
                }}>
                    <CheckCircle2 size={18} color="#22c55e" />
                    <span style={{ color: '#22c55e', fontWeight: 500 }}>Identity Verified</span>
                </div>

                {/* Training Call-to-Action */}
                <div className="card" style={{
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(0,0,0,0) 100%)',
                    border: '2px solid var(--accent)',
                    padding: '2rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '4rem',
                            height: '4rem',
                            borderRadius: '50%',
                            background: 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <GraduationCap size={32} color="#000" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                Unlock Your First Shift
                            </h2>
                            <p style={{ color: '#ccc', marginBottom: '1rem' }}>
                                Complete the Shyft Academy training to start finding shifts at premium hotels.
                            </p>
                            <Link href="/academy" className="btn btn-primary btn-lg">
                                Start Shyft Academy →
                            </Link>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#888' }}>Training Progress</span>
                            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{trainingProgress}%</span>
                        </div>
                        <div style={{ height: '8px', background: '#333', borderRadius: '4px', marginTop: '0.5rem', overflow: 'hidden' }}>
                            <div style={{ width: `${trainingProgress}%`, height: '100%', background: 'var(--accent)', borderRadius: '4px' }} />
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', padding: '1rem', background: '#111', borderRadius: 'var(--radius-md)', border: '1px solid #333' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <AlertTriangle size={18} color="#888" />
                        <span style={{ color: '#888', fontSize: '0.875rem' }}>
                            Complete training to unlock the "Find Shifts" feature
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // STATE C: Ready to Work (Verified + Training Complete)
    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Welcome back, {workerProfile.firstName}!
            </h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>You're all set to find shifts.</p>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard
                    label="Estimated Earnings"
                    value="$0.00"
                    icon={<DollarSign size={20} color="var(--accent)" />}
                />
                <StatCard
                    label="Completed Shifts"
                    value="0"
                    icon={<Calendar size={20} color="var(--accent)" />}
                />
                <StatCard
                    label="Current Tier"
                    value={workerProfile.tier}
                    icon={<Award size={20} color="var(--accent)" />}
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
                    border: '1px solid var(--accent)',
                    transition: 'transform 0.2s'
                }}>
                    <Calendar size={24} color="var(--accent)" />
                    <div>
                        <div style={{ fontWeight: 600, color: '#fff' }}>Find Shifts</div>
                        <div style={{ fontSize: '0.875rem', color: '#888' }}>Browse available opportunities</div>
                    </div>
                </Link>

                <Link href="/dashboard/profile" className="card" style={{
                    padding: '1.5rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'transform 0.2s'
                }}>
                    <Award size={24} color="var(--accent)" />
                    <div>
                        <div style={{ fontWeight: 600, color: '#fff' }}>My Profile</div>
                        <div style={{ fontSize: '0.875rem', color: '#888' }}>View tier and ratings</div>
                    </div>
                </Link>
            </div>

            {/* Recent Shifts */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #333' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recent Shifts</h2>
                </div>
                <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                    <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>No shifts yet. Start browsing to find your first opportunity!</p>
                    <Link href="/dashboard/shifts" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        Browse Shifts
                    </Link>
                </div>
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
                background: '#222',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{value}</div>
            </div>
        </div>
    );
}
