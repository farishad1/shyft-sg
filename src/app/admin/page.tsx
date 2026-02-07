import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Users, Building2, CheckSquare, BarChart3 } from 'lucide-react';

export default async function AdminOverviewPage() {
    if (!prisma) return <div>Database not connected</div>;

    // Fetch Stats
    const workerCount = await prisma.user.count({ where: { role: 'WORKER' } });
    const hotelCount = await prisma.user.count({ where: { role: 'HOTEL' } });

    const pendingWorkerCount = await prisma.workerProfile.count({
        where: { verificationStatus: 'PENDING' }
    });

    const pendingHotelCount = await prisma.hotelProfile.count({
        where: { verificationStatus: 'PENDING' }
    });

    const totalPending = pendingWorkerCount + pendingHotelCount;

    // Recent Activity (newest users)
    const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            workerProfile: true,
            hotelProfile: true,
        }
    });

    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--accent)' }}>Overview</h1>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    label="Total Workers"
                    value={workerCount}
                    icon={<Users size={24} color="var(--accent)" />}
                />
                <StatCard
                    label="Total Hotels"
                    value={hotelCount}
                    icon={<Building2 size={24} color="var(--accent)" />}
                />
                <StatCard
                    label="Pending Verifications"
                    value={totalPending}
                    icon={<CheckSquare size={24} color={totalPending > 0 ? '#ef4444' : 'var(--accent)'} />}
                    highlight={totalPending > 0}
                />
                <StatCard
                    label="Total Shifts"
                    value={0}
                    icon={<BarChart3 size={24} color="var(--accent)" />}
                />
            </div>

            {/* Quick Actions */}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <Link href="/admin/users" className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', transition: 'border-color 0.2s' }}>
                    <Users size={20} color="var(--accent)" />
                    <span style={{ color: '#fff' }}>Manage Workers</span>
                </Link>
                <Link href="/admin/hotels" className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                    <Building2 size={20} color="var(--accent)" />
                    <span style={{ color: '#fff' }}>Manage Hotels</span>
                </Link>
                <Link href="/admin/verifications" className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', border: totalPending > 0 ? '1px solid #ef4444' : undefined }}>
                    <CheckSquare size={20} color={totalPending > 0 ? '#ef4444' : 'var(--accent)'} />
                    <span style={{ color: '#fff' }}>Verification Queue {totalPending > 0 && `(${totalPending})`}</span>
                </Link>
                <Link href="/admin/financials" className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                    <BarChart3 size={20} color="#22c55e" />
                    <span style={{ color: '#fff' }}>Financials</span>
                </Link>
            </div>

            {/* Recent Activity */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Sign Ups</h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#111', color: '#888', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>User</th>
                            <th style={{ padding: '1rem' }}>Role</th>
                            <th style={{ padding: '1rem' }}>Joined</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentUsers.map(user => {
                            const name = user.role === 'WORKER'
                                ? `${user.workerProfile?.firstName} ${user.workerProfile?.lastName}`
                                : user.hotelProfile?.hotelName || 'No Name';

                            const status = user.role === 'WORKER'
                                ? user.workerProfile?.verificationStatus
                                : user.hotelProfile?.verificationStatus;

                            return (
                                <tr key={user.id} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 500 }}>{name}</div>
                                        <div style={{ fontSize: '0.875rem', color: '#888' }}>{user.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${user.role === 'WORKER' ? 'badge-blue' : 'badge-gold'}`} style={{ fontSize: '0.75rem' }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#ccc' }}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${status === 'VERIFIED' ? 'badge-verified' : status === 'DECLINED' ? 'badge-declined' : 'badge-pending'}`}>
                                            {status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {recentUsers.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No users yet</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, highlight = false }: { label: string; value: number; icon: React.ReactNode; highlight?: boolean }) {
    return (
        <div className="card" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            border: highlight ? '1px solid #ef4444' : '1px solid #333',
            padding: '1.5rem',
            backgroundColor: '#111'
        }}>
            <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                background: '#222',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem'
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.875rem', color: '#888' }}>{label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: highlight ? '#ef4444' : '#fff' }}>{value}</div>
            </div>
        </div>
    );
}

// Icon helper since generic StatCard uses any
