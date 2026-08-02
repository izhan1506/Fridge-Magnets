/** Geo helpers: haversine distance + reverse geocoding. */

export function haversine(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

interface City {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

const CITIES: City[] = [
  // North America
  { city: "New York", country: "United States", lat: 40.7128, lng: -74.006 },
  { city: "Los Angeles", country: "United States", lat: 34.0522, lng: -118.2437 },
  { city: "Chicago", country: "United States", lat: 41.8781, lng: -87.6298 },
  { city: "Houston", country: "United States", lat: 29.7604, lng: -95.3698 },
  { city: "Phoenix", country: "United States", lat: 33.4484, lng: -112.074 },
  { city: "San Francisco", country: "United States", lat: 37.7749, lng: -122.4194 },
  { city: "Seattle", country: "United States", lat: 47.6062, lng: -122.3321 },
  { city: "Boston", country: "United States", lat: 42.3601, lng: -71.0589 },
  { city: "Miami", country: "United States", lat: 25.7617, lng: -80.1918 },
  { city: "Denver", country: "United States", lat: 39.7392, lng: -104.9903 },
  { city: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { city: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207 },
  { city: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332 },
  { city: "Cancún", country: "Mexico", lat: 21.1619, lng: -86.8515 },

  // Europe
  { city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { city: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
  { city: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
  { city: "Barcelona", country: "Spain", lat: 41.3851, lng: 2.1734 },
  { city: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038 },
  { city: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393 },
  { city: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
  { city: "Venice", country: "Italy", lat: 45.4408, lng: 12.3155 },
  { city: "Florence", country: "Italy", lat: 43.7695, lng: 11.2558 },
  { city: "Milan", country: "Italy", lat: 45.4642, lng: 9.1900 },
  { city: "Athens", country: "Greece", lat: 37.9838, lng: 23.7275 },
  { city: "Prague", country: "Czech Republic", lat: 50.0755, lng: 14.4378 },
  { city: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738 },
  { city: "Budapest", country: "Hungary", lat: 47.4979, lng: 19.0402 },
  { city: "Warsaw", country: "Poland", lat: 52.2297, lng: 21.0122 },
  { city: "Krakow", country: "Poland", lat: 50.0647, lng: 19.9450 },
  { city: "Stockholm", country: "Sweden", lat: 59.3293, lng: 18.0686 },
  { city: "Copenhagen", country: "Denmark", lat: 55.6761, lng: 12.5683 },
  { city: "Oslo", country: "Norway", lat: 59.9139, lng: 10.7522 },
  { city: "Reykjavík", country: "Iceland", lat: 64.1466, lng: -21.9426 },
  { city: "Dublin", country: "Ireland", lat: 53.3498, lng: -6.2603 },

  // Africa
  { city: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357 },
  { city: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241 },
  { city: "Johannesburg", country: "South Africa", lat: -26.2023, lng: 28.0436 },
  { city: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792 },
  { city: "Nairobi", country: "Kenya", lat: -1.2921, lng: 36.8219 },
  { city: "Marrakesh", country: "Morocco", lat: 31.6295, lng: -7.9811 },
  { city: "Casablanca", country: "Morocco", lat: 33.5731, lng: -7.5898 },
  { city: "Tangier", country: "Morocco", lat: 35.7595, lng: -5.8340 },

  // Middle East & Asia
  { city: "Dubai", country: "United Arab Emirates", lat: 25.2048, lng: 55.2708 },
  { city: "Abu Dhabi", country: "United Arab Emirates", lat: 24.4539, lng: 54.3773 },
  { city: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784 },
  { city: "Mumbai", country: "India", lat: 19.076, lng: 72.8777 },
  { city: "Delhi", country: "India", lat: 28.7041, lng: 77.1025 },
  { city: "Bangalore", country: "India", lat: 12.9716, lng: 77.5946 },
  { city: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
  { city: "Phuket", country: "Thailand", lat: 8.0863, lng: 98.3384 },
  { city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { city: "Kuala Lumpur", country: "Malaysia", lat: 3.1390, lng: 101.6869 },
  { city: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456 },
  { city: "Bali", country: "Indonesia", lat: -8.6500, lng: 115.2167 },
  { city: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lng: 106.6330 },
  { city: "Hanoi", country: "Vietnam", lat: 21.0285, lng: 105.8542 },
  { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { city: "Kyoto", country: "Japan", lat: 35.0116, lng: 135.7681 },
  { city: "Osaka", country: "Japan", lat: 34.6937, lng: 135.5023 },
  { city: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780 },
  { city: "Hong Kong", country: "Hong Kong", lat: 22.3193, lng: 114.1694 },
  { city: "Shanghai", country: "China", lat: 31.2304, lng: 121.4737 },
  { city: "Beijing", country: "China", lat: 39.9042, lng: 116.4074 },

  // Oceania & South Pacific
  { city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { city: "Melbourne", country: "Australia", lat: -37.8136, lng: 144.9631 },
  { city: "Brisbane", country: "Australia", lat: -27.4698, lng: 153.0251 },
  { city: "Perth", country: "Australia", lat: -31.9505, lng: 115.8605 },
  { city: "Auckland", country: "New Zealand", lat: -37.7870, lng: 175.2793 },
  { city: "Wellington", country: "New Zealand", lat: -41.2865, lng: 174.7762 },

  // South America
  { city: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
  { city: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lng: -43.1729 },
  { city: "Salvador", country: "Brazil", lat: -12.9714, lng: -38.5014 },
  { city: "Lima", country: "Peru", lat: -12.0464, lng: -77.0428 },
  { city: "Cusco", country: "Peru", lat: -13.5319, lng: -71.9675 },
  { city: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816 },
  { city: "Mendoza", country: "Argentina", lat: -32.8893, lng: -68.8477 },
  { city: "Santiago", country: "Chile", lat: -33.8688, lng: -151.2093 },
  { city: "Bogotá", country: "Colombia", lat: 4.7110, lng: -74.0721 },
  { city: "Cartagena", country: "Colombia", lat: 10.391, lng: -75.4794 },
  { city: "Quito", country: "Ecuador", lat: -0.2299, lng: -78.5099 },
];

export function nearestCity(lat: number, lng: number): City {
  return CITIES.reduce((best, c) =>
    haversine(lat, lng, c.lat, c.lng) < haversine(lat, lng, best.lat, best.lng) ? c : best,
  );
}

export async function searchCities(query: string): Promise<City[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=15&accept-language=en`,
      {
        headers: { Accept: "application/json", "User-Agent": "FridgeMagnets/1.0" },
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error("search failed");
    const data = await res.json();

    const results: City[] = data
      .filter((item: any) => item.lat && item.lon)
      .map((item: any) => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const name = item.name || "";
        const address = item.address || {};
        const city = address.city || address.town || address.village || address.municipality || name;
        const country = address.country || "";

        return {
          city: city.split(",")[0]?.trim() || "",
          country: country,
          lat: isFinite(lat) ? lat : 0,
          lng: isFinite(lng) ? lng : 0,
        };
      })
      .filter((c: City) => c.city && c.country && isFinite(c.lat) && isFinite(c.lng) && (c.lat !== 0 || c.lng !== 0))
      .slice(0, 10);

    return results.length > 0 ? results : CITIES.filter(
      (c) => c.city.toLowerCase().includes(q.toLowerCase()) || c.country.toLowerCase().includes(q.toLowerCase()),
    ).slice(0, 10);
  } catch (err) {
    console.error("City search error:", err);
    // Fall back to local city list
    return CITIES.filter(
      (c) => c.city.toLowerCase().includes(q.toLowerCase()) || c.country.toLowerCase().includes(q.toLowerCase()),
    ).slice(0, 10);
  }
}

// Cache reverse-geocode lookups so repeat taps near the same spot don't
// re-hit Nominatim — good citizenship under its ~1 req/sec usage policy.
const reverseGeocodeCache = new Map<string, { city: string; country: string }>();

function reverseGeocodeCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

/**
 * Reverse geocode via OpenStreetMap Nominatim (no key). Falls back to the
 * nearest built-in city if the network call fails.
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<{ city: string; country: string }> {
  const key = reverseGeocodeCacheKey(lat, lng);
  const cached = reverseGeocodeCache.get(key);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) throw new Error("geocode failed");
    const data = await res.json();
    const a = data.address ?? {};
    const city = a.city || a.town || a.village || a.state || nearestCity(lat, lng).city;
    const country = a.country || nearestCity(lat, lng).country;
    const result = { city, country };
    reverseGeocodeCache.set(key, result);
    return result;
  } catch {
    const c = nearestCity(lat, lng);
    return { city: c.city, country: c.country };
  }
}
