import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Building2, Search, ArrowLeft, Crown, Briefcase, DollarSign } from 'lucide-react';
import { HotelActions } from './HotelActions';

export default async function AdminHotelsPage({
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

    // Fetch all hotels with optional search
    const hotels = await prisma.hotelProfile.findMany({
        where: searchQuery ? {
            OR: [
                { hotelName: { contains: searchQuery, mode: 'insensitive' } },
                { uen: { contains: searchQuery, mode: 'insensitive' } },
                { user: { email: { contains: searchQuery, mode: 'insensitive' } } },
            ],
        } : {},
        include: {
            user: true,
            shifts: {
                where: { isCompleted: true },
                select: { estimatedPay: true },
            },
            jobPostings: {
                select: { id: true },
            },
        },
        orderBy: [
            { tier: 'desc' },
            { totalHoursHired: 'desc' },
        ],
    });

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Link href="/admin" className="btn btn-ghost btn-sm">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Hotel Management</h1>
                    <p style={{ color: '#888' }}>{hotels.length} hotels registered</p>
                </div>
            </div>

            {/* Search */}
            <form action="/admin/hotels" method="GET" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                        <input
                            type="text"
                            name="q"
                            defaultValue={searchQuery}
                            placeholder="Search by hotel name, UEN, or email..."
                            className="input"
                            style={{ paddingLeft: '2.75rem', width: '100%' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Search</button>
                </div>
            </form>

            {/* Hotels Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', background: '#111' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Hotel Name</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>UEN</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Tier</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Subscription</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Jobs</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Total Spent</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hotels.map((hotel) => {
                                const totalSpent = hotel.shifts.reduce((sum, s) => sum + s.estimatedPay, 0);
                                return (
                                    <tr key={hotel.id} style={{ borderBottom: '1px solid #222' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '2rem',
                                                    height: '2rem',
                                                    borderRadius: 'var(--radius-sm)',
                                                    background: hotel.tier === 'PLATINUM' ? '#333' : hotel.tier === 'GOLD' ? 'var(--accent)' : '#222',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: hotel.tier === 'GOLD' ? '#000' : '#fff',
                                                    border: hotel.tier === 'PLATINUM' ? '2px solid #E5E4E2' : 'none'
                                                }}>
                                                    🏨
                                                </div>
                                                <div>
                                                    <span style={{ fontWeight: 500 }}>{hotel.hotelName}</span>
                                                    {hotel.tier === 'PLATINUM' && <Crown size={12} color="#E5E4E2" style={{ marginLeft: '0.5rem' }} />}
                                                    {hotel.tier === 'GOLD' && <Crown size={12} color="var(--accent)" style={{ marginLeft: '0.5rem' }} />}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#888', fontFamily: 'monospace' }}>{hotel.uen}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span className={`badge badge-${hotel.tier.toLowerCase()}`}>{hotel.tier}</span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {hotel.subscriptionActive ? (
                                                <span className="badge badge-verified">Active</span>
                                            ) : (
                                                <span className="badge" style={{ background: '#333', color: '#888' }}>Inactive</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {!hotel.isActive ? (
                                                <span className="badge badge-declined">Banned</span>
                                            ) : hotel.verificationStatus === 'VERIFIED' ? (
                                                <span className="badge badge-verified">Verified</span>
                                            ) : hotel.verificationStatus === 'PENDING' ? (
                                                <span className="badge badge-pending">Pending</span>
                                            ) : (
                                                <span className="badge badge-declined">Declined</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                                <Briefcase size={14} color="#888" />
                                                {hotel.jobPostings.length}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500, color: '#ef4444' }}>
                                            ${totalSpent.toFixed(2)}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <HotelActions
                                                userId={hotel.userId}
                                                hotelProfileId={hotel.id}
                                                isActive={hotel.isActive}
                                                isVerified={hotel.verificationStatus === 'VERIFIED'}
                                                subscriptionActive={hotel.subscriptionActive}
                                                hotel={{
                                                    name: hotel.hotelName,
                                                    email: hotel.user.email,
                                                    uen: hotel.uen,
                                                    location: hotel.location || 'N/A',
                                                }}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {hotels.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                        <Building2 size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>No hotels found{searchQuery && ` matching "${searchQuery}"`}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
