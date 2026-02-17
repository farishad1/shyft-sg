'use client';

import { useEffect, useRef } from 'react';

interface LiveTickerProps {
    shifts?: {
        id: string;
        title: string;
        hotelName: string;
        hourlyPay: number;
    }[];
}

export function LiveTicker({ shifts = [] }: LiveTickerProps) {
    const tickerRef = useRef<HTMLDivElement>(null);

    // Fallback if no shifts are passed
    const displayShifts = shifts.length > 0 ? shifts : [
        { id: '1', title: 'Front Desk', hotelName: 'The Quay Hotel', hourlyPay: 15 },
        { id: '2', title: 'Housekeeping', hotelName: 'Lloyd\'s Inn', hourlyPay: 16 },
        { id: '3', title: 'Barista', hotelName: 'Warehouse Hotel', hourlyPay: 14 },
    ];

    useEffect(() => {
        // Simple CSS animation is handled by class
    }, []);

    return (
        <div className="ticker-wrap">
            <div className="ticker" ref={tickerRef}>
                {[...displayShifts, ...displayShifts, ...displayShifts].map((item, index) => (
                    <div key={`${item.id}-${index}`} className="ticker-item">
                        <span style={{ fontWeight: 600 }}>{item.title}</span>
                        <span style={{ color: 'var(--accent)' }}>@</span>
                        <span>{item.hotelName}</span>
                        <span style={{ color: '#666' }}>—</span>
                        <span className="pay" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                            ${item.hourlyPay.toFixed(2)}/hr
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
