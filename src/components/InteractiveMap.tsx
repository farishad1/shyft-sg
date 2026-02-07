'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Building2, Briefcase } from 'lucide-react';

// Types for hotel data with shifts
interface HotelWithShifts {
    id: string;
    hotelName: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
    activeShiftCount: number;
}

interface InteractiveMapProps {
    hotels: HotelWithShifts[];
}

export function InteractiveMap({ hotels }: InteractiveMapProps) {
    const [mapReady, setMapReady] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState<HotelWithShifts | null>(null);
    const [L, setL] = useState<typeof import('leaflet') | null>(null);

    // Singapore center coordinates
    const SINGAPORE_CENTER = { lat: 1.3521, lng: 103.8198 };

    useEffect(() => {
        // Dynamic import of Leaflet (client-side only)
        import('leaflet').then((leaflet) => {
            setL(leaflet.default);
            setMapReady(true);
        });
    }, []);

    useEffect(() => {
        if (!mapReady || !L) return;

        // Initialize the map
        const map = L.map('hotel-map').setView([SINGAPORE_CENTER.lat, SINGAPORE_CENTER.lng], 12);

        // Add OpenStreetMap tiles (free, no API key required)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Custom marker icon
        const hotelIcon = L.divIcon({
            className: 'custom-hotel-marker',
            html: `<div style="
                width: 32px;
                height: 32px;
                background: var(--accent, #EFBF04);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                border: 2px solid white;
            ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="black" stroke="none">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0l-3-3m-7 3v-3a2 2 0 012-2h2a2 2 0 012 2v3"/>
                </svg>
            </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        // Add markers for each hotel with coordinates
        hotels.forEach((hotel) => {
            if (hotel.latitude && hotel.longitude) {
                const marker = L.marker([hotel.latitude, hotel.longitude], { icon: hotelIcon })
                    .addTo(map);

                // Create popup content
                const popupContent = `
                    <div style="padding: 0.5rem; min-width: 180px; text-align: center;">
                        <div style="font-weight: 700; font-size: 1rem; margin-bottom: 0.25rem;">${hotel.hotelName}</div>
                        <div style="font-size: 0.75rem; color: #666; margin-bottom: 0.5rem;">${hotel.location}</div>
                        <div style="font-size: 0.875rem; color: #22c55e; font-weight: 600; margin-bottom: 0.75rem;">
                            ${hotel.activeShiftCount} shift${hotel.activeShiftCount !== 1 ? 's' : ''} available
                        </div>
                        <a href="/dashboard/shifts?hotel=${hotel.id}" 
                           style="
                               display: inline-block;
                               padding: 0.5rem 1rem;
                               background: #EFBF04;
                               color: #000;
                               text-decoration: none;
                               border-radius: 6px;
                               font-weight: 600;
                               font-size: 0.875rem;
                           ">
                            View Shifts
                        </a>
                    </div>
                `;

                marker.bindPopup(popupContent);

                marker.on('click', () => {
                    setSelectedHotel(hotel);
                });
            }
        });

        // Cleanup on unmount
        return () => {
            map.remove();
        };
    }, [mapReady, L, hotels]);

    // Filter hotels with valid coordinates
    const hotelsWithCoords = hotels.filter(h => h.latitude && h.longitude);

    if (hotelsWithCoords.length === 0) {
        return (
            <div className="card" style={{
                padding: '2rem',
                textAlign: 'center',
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
                border: '1px solid #333'
            }}>
                <MapPin size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Active Shifts Nearby</h3>
                <p style={{ color: '#888', margin: 0, fontSize: '0.875rem' }}>
                    Hotels with available shifts will appear on the map.
                </p>
            </div>
        );
    }

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            {/* Map Container */}
            <div
                id="hotel-map"
                style={{
                    height: '300px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid #333',
                    background: '#111'
                }}
            />

            {/* Hotels Legend */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '0.75rem',
                padding: '0.75rem',
                background: '#111',
                borderRadius: 'var(--radius-md)',
                overflowX: 'auto'
            }}>
                {hotelsWithCoords.map(hotel => (
                    <div
                        key={hotel.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            background: selectedHotel?.id === hotel.id ? 'rgba(239,191,4,0.2)' : '#1a1a1a',
                            borderRadius: 'var(--radius-sm)',
                            border: selectedHotel?.id === hotel.id ? '1px solid var(--accent)' : '1px solid transparent',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onClick={() => setSelectedHotel(hotel)}
                    >
                        <Building2 size={14} color="var(--accent)" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{hotel.hotelName}</span>
                        <span style={{
                            padding: '0.125rem 0.5rem',
                            background: 'var(--accent)',
                            color: '#000',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 700
                        }}>
                            {hotel.activeShiftCount}
                        </span>
                    </div>
                ))}
            </div>

            {/* Leaflet CSS import */}
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                crossOrigin=""
            />
        </div>
    );
}
