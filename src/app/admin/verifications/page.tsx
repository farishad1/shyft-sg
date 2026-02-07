import Link from 'next/link';
import prisma from '@/lib/prisma';
import { differenceInYears } from 'date-fns';
import { VerificationActions } from './VerificationActions';
import { AlertTriangle } from 'lucide-react';
import { BUSINESS_RULES } from '@/lib/constants';

export default async function VerificationsPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const { tab: tabParam } = await searchParams;
    const tab = tabParam || 'workers'; // 'workers' | 'hotels'

    // Fetch data based on tab
    // Note: We fetch ALL pending for now. Pagination in future.
    let workers: any[] = [];
    let hotels: any[] = [];

    if (tab === 'workers') {
        if (prisma) {
            workers = await prisma.workerProfile.findMany({
                where: { verificationStatus: 'PENDING' },
                include: { user: true },
                orderBy: { updatedAt: 'desc' },
            });
        }
    } else {
        if (prisma) {
            hotels = await prisma.hotelProfile.findMany({
                where: { verificationStatus: 'PENDING' },
                include: { user: true },
                orderBy: { updatedAt: 'desc' },
            });
        }
    }

    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--accent)' }}>
                Verifications
            </h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #333' }}>
                <Link
                    href="/admin/verifications?tab=workers"
                    style={{
                        padding: '1rem',
                        color: tab === 'workers' ? '#fff' : '#888',
                        borderBottom: tab === 'workers' ? '2px solid var(--accent)' : 'none',
                        textDecoration: 'none',
                        fontWeight: 500
                    }}
                >
                    Pending Workers
                </Link>
                <Link
                    href="/admin/verifications?tab=hotels"
                    style={{
                        padding: '1rem',
                        color: tab === 'hotels' ? '#fff' : '#888',
                        borderBottom: tab === 'hotels' ? '2px solid var(--accent)' : 'none',
                        textDecoration: 'none',
                        fontWeight: 500
                    }}
                >
                    Pending Hotels
                </Link>
            </div>

            {/* Content */}
            {tab === 'workers' ? (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#111', color: '#888', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            <tr>
                                <th style={{ padding: '1rem' }}>Name</th>
                                <th style={{ padding: '1rem' }}>Age</th>
                                <th style={{ padding: '1rem' }}>Pass</th>
                                <th style={{ padding: '1rem' }}>Skills</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workers.map((worker) => {
                                const age = differenceInYears(new Date(), new Date(worker.dateOfBirth));
                                const isMinor = age < 16; // BUSINESS_RULES.MINOR_AGE limit is just a flag here

                                return (
                                    <tr key={worker.id} style={{ borderBottom: '1px solid #222' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 500 }}>{worker.firstName} {worker.lastName}</div>
                                            <div style={{ fontSize: '0.875rem', color: '#888' }}>{worker.user.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {age}
                                                {isMinor && (
                                                    <span title="Minor (<16)" style={{ color: '#eab308' }}>
                                                        <AlertTriangle size={16} />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div className="badge badge-gray">{worker.workPassType}</div>
                                            {worker.workPassType === 'STUDENT_PASS' && (
                                                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                                                    {worker.schoolName}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {worker.hasBasicEnglish && <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>English</span>}
                                                {worker.hasComputerSkills && <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>PC</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <VerificationActions id={worker.id} type="WORKER" />
                                        </td>
                                    </tr>
                                );
                            })}
                            {workers.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                                        No pending worker verifications
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#111', color: '#888', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            <tr>
                                <th style={{ padding: '1rem' }}>Hotel Name</th>
                                <th style={{ padding: '1rem' }}>UEN</th>
                                <th style={{ padding: '1rem' }}>Location</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hotels.map((hotel) => (
                                <tr key={hotel.id} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 500 }}>{hotel.hotelName}</div>
                                        <div style={{ fontSize: '0.875rem', color: '#888' }}>{hotel.user.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{hotel.uen}</td>
                                    <td style={{ padding: '1rem' }}>{hotel.location}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <VerificationActions id={hotel.id} type="HOTEL" />
                                    </td>
                                </tr>
                            ))}
                            {hotels.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                                        No pending hotel verifications
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
