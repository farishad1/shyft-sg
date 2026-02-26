import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
    ArrowLeft,
    Building2,
    MapPin,
    Star,
    CheckCircle2,
    Clock,
    Ban,
    Crown
} from 'lucide-react';
import { HotelActions } from './HotelActions';

export default async function AdminHotelsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    if (!prisma) return <div>Database not connected</div>;

    // Verify admin role
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { adminProfile: true }
    });

    if (user?.role !== 'ADMIN') {
        redirect('/');
    }

    // Fetch all hotels with their profiles (excluding removed users)
    const allHotels = await prisma.hotelProfile.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    createdAt: true,
                    isRemoved: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Filter out removed users
    const hotels = allHotels.filter(h => !h.user.isRemoved);
    const activeHotels = hotels.filter(h => !h.isBanned);
    const bannedHotels = hotels.filter(h => h.isBanned);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#9C8F84', textDecoration: 'none', marginBottom: '1.5rem' }}>
                <ArrowLeft size={18} /> Back to Admin
            </Link>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Hotel Management</h1>
                    <p style={{ color: '#9C8F84' }}>View and manage registered hotels</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ textAlign: 'center', padding: '0.75rem 1rem', background: '#FAF6F0', border: '1px solid #E2D3C2', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>{activeHotels.length}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9C8F84' }}>Active</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '0.75rem 1rem', background: '#FAF6F0', border: '1px solid #E2D3C2', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{bannedHotels.length}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9C8F84' }}>Banned</div>
                    </div>
                </div>
            </div>

            {hotels.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#9C8F84' }}>
                    <Building2 size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No Hotels Registered</h3>
                    <p>Hotels will appear here when they sign up.</p>
                </div>
            ) : (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#5A3E2B', borderBottom: '1px solid #E2D3C2', color: '#E6C7A1' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Hotel</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Location</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem' }}>Rating</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem' }}>Joined</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hotels.map((hotel) => (
                                <tr
                                    key={hotel.id}
                                    style={{
                                        borderBottom: '1px solid #E2D3C2',
                                        background: hotel.isBanned ? 'rgba(239,68,68,0.05)' : 'transparent',
                                        opacity: hotel.isBanned ? 0.6 : 1
                                    }}
                                >
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '2.5rem',
                                                height: '2.5rem',
                                                borderRadius: '50%',
                                                background: 'rgba(212,163,115,0.15)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Building2 size={16} color="#888" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {hotel.hotelName}
                                                    {hotel.isPremium && <Crown size={14} color="var(--accent)" />}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#9C8F84' }}>{hotel.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#9C8F84' }}>
                                            <MapPin size={14} />
                                            {hotel.location}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        {hotel.isBanned ? (
                                            <span className="badge badge-declined" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Ban size={12} /> Banned
                                            </span>
                                        ) : hotel.verificationStatus === 'VERIFIED' ? (
                                            <span className="badge badge-verified" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <CheckCircle2 size={12} /> Verified
                                            </span>
                                        ) : (
                                            <span className="badge badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Clock size={12} /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        {hotel.averageRating ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent)' }}>
                                                <Star size={14} fill="var(--accent)" />
                                                {hotel.averageRating.toFixed(1)}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#9C8F84' }}>-</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#9C8F84' }}>
                                        {new Date(hotel.createdAt).toLocaleDateString('en-SG', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <HotelActions
                                            userId={hotel.user.id}
                                            hotelProfileId={hotel.id}
                                            isActive={!hotel.isBanned}
                                            isVerified={hotel.verificationStatus === 'VERIFIED'}
                                            subscriptionActive={hotel.subscriptionActive}
                                            hotel={{
                                                name: hotel.hotelName,
                                                email: hotel.user.email,
                                                uen: hotel.uen,
                                                location: hotel.location
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
