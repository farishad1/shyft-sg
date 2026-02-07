import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Users, Search, ArrowLeft, Crown, Clock, DollarSign } from 'lucide-react';
import { UserActions } from './UserActions';

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: { q?: string };
}) {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    if (!prisma) return <div>Database not connected</div>;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (user?.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    const searchQuery = searchParams.q || '';

    // Fetch all workers with optional search (excluding removed users)
    const workers = await prisma.workerProfile.findMany({
        where: {
            user: { isRemoved: false },
            ...(searchQuery ? {
                OR: [
                    { firstName: { contains: searchQuery, mode: 'insensitive' } },
                    { lastName: { contains: searchQuery, mode: 'insensitive' } },
                    { user: { email: { contains: searchQuery, mode: 'insensitive' } } },
                ],
            } : {}),
        },
        include: {
            user: true,
            shifts: {
                where: { isCompleted: true },
                select: { totalHours: true, estimatedPay: true },
            },
        },
        orderBy: [
            { tier: 'desc' },
            { totalHoursWorked: 'desc' },
        ],
    });

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Link href="/admin" className="btn btn-ghost btn-sm">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>User Management</h1>
                    <p style={{ color: '#888' }}>{workers.length} workers registered</p>
                </div>
            </div>

            {/* Search */}
            <form action="/admin/users" method="GET" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                        <input
                            type="text"
                            name="q"
                            defaultValue={searchQuery}
                            placeholder="Search by name or email..."
                            className="input"
                            style={{ paddingLeft: '2.75rem', width: '100%' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Search</button>
                </div>
            </form>

            {/* Users Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', background: '#111' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Name</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Email</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Tier</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Hours</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Earnings</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workers.map((worker) => {
                                const totalEarnings = worker.shifts.reduce((sum, s) => sum + s.estimatedPay, 0);
                                return (
                                    <tr key={worker.id} style={{ borderBottom: '1px solid #222' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '2rem',
                                                    height: '2rem',
                                                    borderRadius: '50%',
                                                    background: worker.tier === 'PLATINUM' ? '#333' : worker.tier === 'GOLD' ? 'var(--accent)' : '#222',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    color: worker.tier === 'GOLD' ? '#000' : '#fff',
                                                    border: worker.tier === 'PLATINUM' ? '2px solid #E5E4E2' : 'none'
                                                }}>
                                                    {worker.firstName[0]}{worker.lastName[0]}
                                                </div>
                                                <div>
                                                    <span style={{ fontWeight: 500 }}>{worker.firstName} {worker.lastName}</span>
                                                    {worker.tier === 'PLATINUM' && <Crown size={12} color="#E5E4E2" style={{ marginLeft: '0.5rem' }} />}
                                                    {worker.tier === 'GOLD' && <Crown size={12} color="var(--accent)" style={{ marginLeft: '0.5rem' }} />}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#888' }}>{worker.user.email}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span className={`badge badge-${worker.tier.toLowerCase()}`}>{worker.tier}</span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {!worker.isActive ? (
                                                <span className="badge badge-declined">Banned</span>
                                            ) : worker.verificationStatus === 'VERIFIED' ? (
                                                <span className="badge badge-verified">Active</span>
                                            ) : worker.verificationStatus === 'PENDING' ? (
                                                <span className="badge badge-pending">Pending</span>
                                            ) : (
                                                <span className="badge badge-declined">Declined</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                                <Clock size={14} color="#888" />
                                                {worker.totalHoursWorked.toFixed(1)}h
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500, color: '#22c55e' }}>
                                            ${totalEarnings.toFixed(2)}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <UserActions
                                                userId={worker.userId}
                                                isActive={worker.isActive}
                                                isVerified={worker.verificationStatus === 'VERIFIED'}
                                                worker={{
                                                    name: `${worker.firstName} ${worker.lastName}`,
                                                    email: worker.user.email,
                                                    phone: worker.phoneNumber || 'N/A',
                                                    dob: new Date(worker.dateOfBirth).toLocaleDateString(),
                                                    school: worker.schoolName || 'N/A',
                                                    workPass: worker.workPassType,
                                                }}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {workers.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                        <Users size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>No workers found{searchQuery && ` matching "${searchQuery}"`}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
