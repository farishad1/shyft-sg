'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
    MapPin,
    Clock,
    Calendar,
    Building2
} from 'lucide-react';
import { ScarcityBadge } from '@/components/ScarcityBadge';

// Dynamic import of map to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(
    () => import('@/components/InteractiveMap').then(mod => mod.InteractiveMap),
    { ssr: false, loading: () => <div style={{ height: '300px', background: '#111', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }} /> }
);

interface JobPosting {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    totalHours: number;
    hourlyPay: number;
    location: string;
    slotsOpen: number;
    hotel: {
        id: string;
        hotelName: string;
        latitude: number | null;
        longitude: number | null;
        location: string;
    };
}

interface ShiftsClientWrapperProps {
    jobPostings: JobPosting[];
}

export function ShiftsClientWrapper({ jobPostings }: ShiftsClientWrapperProps) {
    // Aggregate hotels with active shift counts for the map
    const hotelsWithShifts = jobPostings.reduce<Map<string, {
        id: string;
        hotelName: string;
        location: string;
        latitude: number | null;
        longitude: number | null;
        activeShiftCount: number;
    }>>((acc, job) => {
        const existing = acc.get(job.hotel.id);
        if (existing) {
            existing.activeShiftCount += 1;
        } else {
            acc.set(job.hotel.id, {
                id: job.hotel.id,
                hotelName: job.hotel.hotelName,
                location: job.hotel.location,
                latitude: job.hotel.latitude,
                longitude: job.hotel.longitude,
                activeShiftCount: 1
            });
        }
        return acc;
    }, new Map());

    const hotelsArray = Array.from(hotelsWithShifts.values());

    return (
        <>
            {/* Interactive Map */}
            {hotelsArray.some(h => h.latitude && h.longitude) && (
                <InteractiveMap hotels={hotelsArray} />
            )}

            {/* Job Postings List */}
            {jobPostings.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '0.5rem' }}>No Shifts Available</h2>
                    <p style={{ color: '#888' }}>Check back soon for new opportunities.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {jobPostings.map((job) => {
                        const startDate = new Date(job.startTime);
                        const endDate = new Date(job.endTime);

                        return (
                            <div key={job.id} className="card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                            <div style={{
                                                width: '2.5rem',
                                                height: '2.5rem',
                                                borderRadius: 'var(--radius-md)',
                                                background: '#222',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Building2 size={18} color="var(--accent)" />
                                            </div>
                                            <div>
                                                <h3 style={{ fontWeight: 600, fontSize: '1.125rem' }}>{job.title}</h3>
                                                <p style={{ fontSize: '0.875rem', color: '#888' }}>{job.hotel.hotelName}</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#ccc', marginBottom: '0.75rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={14} color="#888" />
                                                {startDate.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={14} color="#888" />
                                                {startDate.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}
                                                <span style={{ color: '#888' }}>({job.totalHours.toFixed(1)}h)</span>
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <MapPin size={14} color="#888" />
                                                {job.location}
                                            </span>
                                        </div>

                                        {/* Scarcity Badge */}
                                        <ScarcityBadge slotsOpen={job.slotsOpen} />
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                                            ${job.hourlyPay.toFixed(2)}
                                            <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#888' }}>/hr</span>
                                        </div>
                                        <Link
                                            href={`/dashboard/shifts/${job.id}`}
                                            className={`btn btn-sm ${job.slotsOpen === 0 ? 'btn-ghost' : 'btn-primary'}`}
                                            style={{ marginTop: '0.5rem', pointerEvents: job.slotsOpen === 0 ? 'none' : 'auto', opacity: job.slotsOpen === 0 ? 0.5 : 1 }}
                                        >
                                            {job.slotsOpen === 0 ? 'Full' : 'View Details'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
