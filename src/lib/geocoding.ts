// Geocoding utility using OpenStreetMap Nominatim (free, no API key required)
// This converts an address string to latitude/longitude coordinates

interface GeocodingResult {
    latitude: number;
    longitude: number;
    displayName: string;
}

/**
 * Geocode a Singapore address to lat/lng coordinates
 * Uses OpenStreetMap Nominatim API (free, rate-limited to 1 req/sec)
 * 
 * @param address - The address string to geocode
 * @returns GeocodingResult with coordinates, or null if not found
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
    try {
        // Ensure address includes Singapore for better results
        const searchQuery = address.toLowerCase().includes('singapore')
            ? address
            : `${address}, Singapore`;

        const encodedAddress = encodeURIComponent(searchQuery);

        // Using Nominatim (OpenStreetMap's geocoding service)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&countrycodes=sg&limit=1`,
            {
                headers: {
                    'User-Agent': 'Shyft-SG-App/1.0' // Required by Nominatim TOS
                }
            }
        );

        if (!response.ok) {
            console.error('Geocoding API error:', response.status);
            return null;
        }

        const data = await response.json();

        if (data.length === 0) {
            console.log('No geocoding results for:', address);
            return null;
        }

        const result = data[0];
        return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            displayName: result.display_name
        };
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

/**
 * Validate that coordinates are within Singapore bounds
 * Singapore approximate bounds: 1.1 to 1.5 latitude, 103.6 to 104.1 longitude
 */
export function isValidSingaporeCoordinates(lat: number, lng: number): boolean {
    return lat >= 1.1 && lat <= 1.5 && lng >= 103.6 && lng <= 104.1;
}

/**
 * Get default Singapore center coordinates
 */
export function getSingaporeCenter() {
    return { lat: 1.3521, lng: 103.8198 };
}
