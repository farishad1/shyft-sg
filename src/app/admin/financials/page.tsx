import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, DollarSign, TrendingUp, Building2, Users, Calendar, Crown, Target, Briefcase } from 'lucide-react';
import { getPlatformStats } from '../actions';

export default async function AdminFinancialsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    if (!prisma) return <div>Database not connected</div>;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (user?.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    const stats = await getPlatformStats();

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Link href="/admin" className="btn btn-ghost btn-sm">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Financial Dashboard</h1>
                    <p style={{ color: '#888' }}>Platform health and business metrics</p>
                </div>
            </div>

            {/* KPI Cards Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <KPICard
                    title="Total Revenue"
                    value={`$${stats.totalGMV.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    subtitle="Platform earnings to date"
                    icon={<DollarSign size={24} />}
                    color="#22c55e"
                />
                <KPICard
                    title="Total Sales"
                    value={`$${stats.potentialRevenue.toLocaleString()}/mo`}
                    subtitle={`${stats.activeHotels} active hotels × $100`}
                    icon={<TrendingUp size={24} />}
                    color="var(--accent)"
                />
                <KPICard
                    title="Fill Rate"
                    value={`${stats.fillRate.toFixed(1)}%`}
                    subtitle={`${stats.completedShifts} completed shifts`}
                    icon={<Target size={24} />}
                    color={stats.fillRate >= 70 ? '#22c55e' : stats.fillRate >= 40 ? '#eab308' : '#ef4444'}
                />
                <KPICard
                    title="Shifts Today"
                    value={stats.todayShifts.toString()}
                    subtitle="Active shifts"
                    icon={<Calendar size={24} />}
                    color="#3b82f6"
                />
            </div>

            {/* KPI Cards Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <KPICard
                    title="Active Workers"
                    value={stats.activeWorkers.toString()}
                    subtitle={`of ${stats.totalWorkers} registered`}
                    icon={<Users size={24} />}
                    color="#8b5cf6"
                />
                <KPICard
                    title="Active Hotels"
                    value={stats.activeHotels.toString()}
                    subtitle="With subscription"
                    icon={<Building2 size={24} />}
                    color="#ec4899"
                />
                <KPICard
                    title="Completed Shifts"
                    value={stats.completedShifts.toString()}
                    subtitle="All time"
                    icon={<Briefcase size={24} />}
                    color="#14b8a6"
                />
            </div>

            {/* Leaderboards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {/* Top Earners */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Crown size={18} color="var(--accent)" /> Top Earners
                    </h2>
                    {stats.topEarners.length === 0 ? (
                        <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>No data yet</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {stats.topEarners.map((earner, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#111', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{
                                        width: '2rem',
                                        height: '2rem',
                                        borderRadius: '50%',
                                        background: index === 0 ? 'var(--accent)' : index === 1 ? '#888' : '#444',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        color: index === 0 ? '#000' : '#fff',
                                        fontSize: '0.875rem'
                                    }}>
                                        {index + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 500 }}>{earner.name}</span>
                                            <span className={`badge badge-${earner.tier.toLowerCase()}`} style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem' }}>
                                                {earner.tier}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#888' }}>{earner.email}</span>
                                    </div>
                                    <div style={{ fontWeight: 600, color: '#22c55e' }}>
                                        ${earner.totalEarnings.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Spenders */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building2 size={18} color="#3b82f6" /> Top Spenders
                    </h2>
                    {stats.topSpenders.length === 0 ? (
                        <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>No data yet</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {stats.topSpenders.map((spender, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#111', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{
                                        width: '2rem',
                                        height: '2rem',
                                        borderRadius: 'var(--radius-sm)',
                                        background: index === 0 ? '#3b82f6' : index === 1 ? '#888' : '#444',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        color: '#fff',
                                        fontSize: '0.875rem'
                                    }}>
                                        {index + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 500 }}>{spender.name}</span>
                                            <span className={`badge badge-${spender.tier.toLowerCase()}`} style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem' }}>
                                                {spender.tier}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 600, color: '#3b82f6' }}>
                                        ${spender.totalSpent.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function KPICard({
    title,
    value,
    subtitle,
    icon,
    color
}: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#888', fontWeight: 500 }}>{title}</span>
                <div style={{ color }}>{icon}</div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color, marginBottom: '0.25rem' }}>
                {value}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#666' }}>{subtitle}</span>
        </div>
    );
}
