'use client';

import { useEffect, useRef } from 'react';

// Example shift postings for the live ticker
const TICKER_ITEMS = [
    { role: 'Front Desk', location: 'Bugis', pay: 15 },
    { role: 'Housekeeping', location: 'Orchard', pay: 14 },
    { role: 'Night Porter', location: 'Marina Bay', pay: 18 },
    { role: 'Concierge', location: 'Sentosa', pay: 16 },
    { role: 'F&B Service', location: 'Raffles Place', pay: 15 },
    { role: 'Room Attendant', location: 'Clarke Quay', pay: 14 },
    { role: 'Bellhop', location: 'Tanjong Pagar', pay: 13 },
    { role: 'Guest Relations', location: 'Chinatown', pay: 17 },
];

export function LiveTicker() {
    const tickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Duplicate items for seamless scrolling
        if (tickerRef.current) {
            const ticker = tickerRef.current;
            const tickerContent = ticker.innerHTML;
            ticker.innerHTML = tickerContent + tickerContent;
        }
    }, []);

    return (
        <div className="ticker-wrap">
            <div className="ticker" ref={tickerRef}>
                {TICKER_ITEMS.map((item, index) => (
                    <div key={index} className="ticker-item">
                        <span>{item.role}</span>
                        <span>@</span>
                        <span>{item.location}</span>
                        <span>—</span>
                        <span className="pay">${item.pay}/hr</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
