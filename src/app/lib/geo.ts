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
  { city: "New York", country: "United States", lat: 40.7128, lng: -74.006 },
  { city: "San Francisco", country: "United States", lat: 37.7749, lng: -122.4194 },
  { city: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332 },
  { city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { city: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393 },
  { city: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
  { city: "Athens", country: "Greece", lat: 37.9838, lng: 23.7275 },
  { city: "Marrakesh", country: "Morocco", lat: 31.6295, lng: -7.9811 },
  { city: "Reykjavík", country: "Iceland", lat: 64.1466, lng: -21.9426 },
  { city: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357 },
  { city: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241 },
  { city: "Mumbai", country: "India", lat: 19.076, lng: 72.8777 },
  { city: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
  { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { city: "Kyoto", country: "Japan", lat: 35.0116, lng: 135.7681 },
  { city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { city: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
  { city: "Cusco", country: "Peru", lat: -13.5319, lng: -71.9675 },
  { city: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816 },
  { city: "Cartagena", country: "Colombia", lat: 10.391, lng: -75.4794 },
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
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(q)}&format=json&limit=10`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) throw new Error("search failed");
    const data = await res.json();

    const results: City[] = data
      .filter((item: any) => item.lat && item.lon)
      .map((item: any) => ({
        city: item.name || item.address?.city || item.address?.town || "",
        country: item.address?.country || "",
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }))
      .filter((c: City) => c.city && c.country)
      .slice(0, 10);

    return results.length > 0 ? results : CITIES.filter(
      (c) => c.city.toLowerCase().includes(q.toLowerCase()) || c.country.toLowerCase().includes(q.toLowerCase()),
    ).slice(0, 6);
  } catch {
    return CITIES.filter(
      (c) => c.city.toLowerCase().includes(q.toLowerCase()) || c.country.toLowerCase().includes(q.toLowerCase()),
    ).slice(0, 6);
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
