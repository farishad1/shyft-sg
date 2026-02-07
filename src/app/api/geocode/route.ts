import { NextResponse } from 'next/server';
import { geocodeAddress } from '@/lib/geocoding';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { address } = body;

        if (!address || typeof address !== 'string') {
            return NextResponse.json(
                { error: 'Address is required' },
                { status: 400 }
            );
        }

        const result = await geocodeAddress(address);

        if (!result) {
            return NextResponse.json(
                { error: 'Could not geocode address. Please verify the address or enter coordinates manually.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            latitude: result.latitude,
            longitude: result.longitude,
            displayName: result.displayName
        });
    } catch (error) {
        console.error('Geocoding API error:', error);
        return NextResponse.json(
            { error: 'Geocoding service unavailable' },
            { status: 500 }
        );
    }
}
