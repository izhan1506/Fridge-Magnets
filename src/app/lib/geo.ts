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
  { city: "Miami", country: "United States", lat: 25.7617, lng: -80.1918 },
  { city: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { city: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207 },
  { city: "Montreal", country: "Canada", lat: 45.5017, lng: -73.5673 },
  { city: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332 },
  { city: "Cancún", country: "Mexico", lat: 21.1619, lng: -86.8515 },
  { city: "Guadalajara", country: "Mexico", lat: 20.6597, lng: -103.2494 },

  // Central America & Caribbean
  { city: "San Juan", country: "Puerto Rico", lat: 18.4861, lng: -66.1193 },
  { city: "Havana", country: "Cuba", lat: 23.1136, lng: -82.3666 },
  { city: "Santo Domingo", country: "Dominican Republic", lat: 18.4861, lng: -69.9312 },
  { city: "San José", country: "Costa Rica", lat: 9.9281, lng: -84.0907 },
  { city: "Panama City", country: "Panama", lat: 8.9824, lng: -79.5199 },

  // South America
  { city: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
  { city: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lng: -43.1729 },
  { city: "Salvador", country: "Brazil", lat: -12.9714, lng: -38.5014 },
  { city: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816 },
  { city: "Córdoba", country: "Argentina", lat: -31.4135, lng: -64.1889 },
  { city: "Lima", country: "Peru", lat: -12.0464, lng: -77.0428 },
  { city: "Cusco", country: "Peru", lat: -13.5316, lng: -71.9877 },
  { city: "Bogotá", country: "Colombia", lat: 4.7110, lng: -74.0721 },
  { city: "Medellín", country: "Colombia", lat: 6.2442, lng: -75.5812 },
  { city: "Santiago", country: "Chile", lat: -33.8688, lng: -51.2093 },
  { city: "Valparaíso", country: "Chile", lat: -33.0458, lng: -71.6127 },
  { city: "Caracas", country: "Venezuela", lat: 10.4806, lng: -66.9036 },
  { city: "Quito", country: "Ecuador", lat: -0.2299, lng: -78.5249 },
  { city: "La Paz", country: "Bolivia", lat: -16.2902, lng: -63.5887 },
  { city: "Asunción", country: "Paraguay", lat: -25.2637, lng: -57.5759 },

  // Western Europe
  { city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { city: "Manchester", country: "United Kingdom", lat: 53.4808, lng: -2.2426 },
  { city: "Edinburgh", country: "United Kingdom", lat: 55.9533, lng: -3.1883 },
  { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { city: "Lyon", country: "France", lat: 45.7640, lng: 4.8357 },
  { city: "Marseille", country: "France", lat: 43.2965, lng: 5.3698 },
  { city: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
  { city: "Rotterdam", country: "Netherlands", lat: 51.9225, lng: 4.4792 },
  { city: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
  { city: "Munich", country: "Germany", lat: 48.1351, lng: 11.5820 },
  { city: "Hamburg", country: "Germany", lat: 53.5511, lng: 9.9937 },
  { city: "Barcelona", country: "Spain", lat: 41.3851, lng: 2.1734 },
  { city: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038 },
  { city: "Valencia", country: "Spain", lat: 39.4699, lng: -0.3763 },
  { city: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393 },
  { city: "Porto", country: "Portugal", lat: 41.1579, lng: -8.6291 },

  // Southern Europe & Mediterranean
  { city: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
  { city: "Milan", country: "Italy", lat: 45.4642, lng: 9.1900 },
  { city: "Venice", country: "Italy", lat: 45.4408, lng: 12.3155 },
  { city: "Athens", country: "Greece", lat: 37.9838, lng: 23.7275 },
  { city: "Thessaloniki", country: "Greece", lat: 40.6401, lng: 22.9444 },
  { city: "Split", country: "Croatia", lat: 43.5081, lng: 16.4402 },
  { city: "Zagreb", country: "Croatia", lat: 45.8150, lng: 15.9819 },

  // Central & Eastern Europe
  { city: "Prague", country: "Czech Republic", lat: 50.0755, lng: 14.4378 },
  { city: "Brno", country: "Czech Republic", lat: 49.1950, lng: 16.6068 },
  { city: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738 },
  { city: "Salzburg", country: "Austria", lat: 47.8095, lng: 13.0550 },
  { city: "Budapest", country: "Hungary", lat: 47.4979, lng: 19.0402 },
  { city: "Debrecen", country: "Hungary", lat: 47.5316, lng: 21.6273 },
  { city: "Warsaw", country: "Poland", lat: 52.2297, lng: 21.0122 },
  { city: "Krakow", country: "Poland", lat: 50.0647, lng: 19.9450 },
  { city: "Gdańsk", country: "Poland", lat: 54.3520, lng: 18.6466 },
  { city: "Bucharest", country: "Romania", lat: 44.4268, lng: 26.1025 },
  { city: "Cluj-Napoca", country: "Romania", lat: 46.7712, lng: 23.6236 },
  { city: "Sofia", country: "Bulgaria", lat: 42.6977, lng: 23.3219 },
  { city: "Plovdiv", country: "Bulgaria", lat: 42.1500, lng: 24.7525 },
  { city: "Belgrade", country: "Serbia", lat: 44.8176, lng: 20.4633 },
  { city: "Ljubljana", country: "Slovenia", lat: 46.0569, lng: 14.5058 },

  // Nordic Countries
  { city: "Stockholm", country: "Sweden", lat: 59.3293, lng: 18.0686 },
  { city: "Gothenburg", country: "Sweden", lat: 57.7089, lng: 11.9746 },
  { city: "Copenhagen", country: "Denmark", lat: 55.6761, lng: 12.5683 },
  { city: "Aarhus", country: "Denmark", lat: 56.1629, lng: 10.2039 },
  { city: "Oslo", country: "Norway", lat: 59.9139, lng: 10.7522 },
  { city: "Bergen", country: "Norway", lat: 60.3913, lng: 5.3221 },
  { city: "Reykjavík", country: "Iceland", lat: 64.1466, lng: -21.9426 },
  { city: "Dublin", country: "Ireland", lat: 53.3498, lng: -6.2603 },
  { city: "Cork", country: "Ireland", lat: 51.8985, lng: -8.4761 },

  // Russia & Former Soviet
  { city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
  { city: "Saint Petersburg", country: "Russia", lat: 59.9516, lng: 30.3597 },
  { city: "Yekaterinburg", country: "Russia", lat: 56.8389, lng: 60.6057 },
  { city: "Kiev", country: "Ukraine", lat: 50.4501, lng: 30.5234 },
  { city: "Kharkiv", country: "Ukraine", lat: 50.0028, lng: 36.2304 },
  { city: "Almaty", country: "Kazakhstan", lat: 43.2380, lng: 76.9502 },
  { city: "Minsk", country: "Belarus", lat: 53.9045, lng: 27.5615 },
  { city: "Tallinn", country: "Estonia", lat: 59.4370, lng: 24.7536 },
  { city: "Riga", country: "Latvia", lat: 56.9496, lng: 24.1052 },
  { city: "Vilnius", country: "Lithuania", lat: 54.6872, lng: 25.2797 },

  // Africa
  { city: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357 },
  { city: "Alexandria", country: "Egypt", lat: 31.2001, lng: 29.9187 },
  { city: "Giza", country: "Egypt", lat: 30.0131, lng: 31.2089 },
  { city: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241 },
  { city: "Johannesburg", country: "South Africa", lat: -26.2023, lng: 28.0436 },
  { city: "Durban", country: "South Africa", lat: -29.8587, lng: 31.0218 },
  { city: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792 },
  { city: "Abuja", country: "Nigeria", lat: 9.0765, lng: 7.3986 },
  { city: "Nairobi", country: "Kenya", lat: -1.2921, lng: 36.8219 },
  { city: "Mombasa", country: "Kenya", lat: -4.0435, lng: 39.6682 },
  { city: "Addis Ababa", country: "Ethiopia", lat: 9.0320, lng: 38.7469 },
  { city: "Dar es Salaam", country: "Tanzania", lat: -6.8000, lng: 39.2833 },
  { city: "Kampala", country: "Uganda", lat: 0.3476, lng: 32.5825 },
  { city: "Accra", country: "Ghana", lat: 5.6037, lng: -0.1870 },
  { city: "Casablanca", country: "Morocco", lat: 33.5731, lng: -7.5898 },
  { city: "Marrakesh", country: "Morocco", lat: 31.6295, lng: -7.9811 },
  { city: "Fez", country: "Morocco", lat: 34.0333, lng: -5.0333 },
  { city: "Tunis", country: "Tunisia", lat: 36.8065, lng: 10.1815 },
  { city: "Algiers", country: "Algeria", lat: 36.7538, lng: 3.0588 },
  { city: "Dakar", country: "Senegal", lat: 14.6928, lng: -17.0467 },

  // Middle East
  { city: "Dubai", country: "United Arab Emirates", lat: 25.2048, lng: 55.2708 },
  { city: "Abu Dhabi", country: "United Arab Emirates", lat: 24.4539, lng: 54.3773 },
  { city: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784 },
  { city: "Ankara", country: "Turkey", lat: 39.9334, lng: 32.8597 },
  { city: "Izmir", country: "Turkey", lat: 38.4161, lng: 27.1302 },
  { city: "Tehran", country: "Iran", lat: 35.6892, lng: 51.3890 },
  { city: "Mashhad", country: "Iran", lat: 36.2605, lng: 59.5832 },
  { city: "Jerusalem", country: "Israel", lat: 31.7683, lng: 35.2137 },
  { city: "Tel Aviv", country: "Israel", lat: 32.0853, lng: 34.7818 },
  { city: "Beirut", country: "Lebanon", lat: 33.8886, lng: 35.4955 },
  { city: "Amman", country: "Jordan", lat: 31.9454, lng: 35.9284 },
  { city: "Baghdad", country: "Iraq", lat: 33.3128, lng: 44.3615 },
  { city: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lng: 46.6753 },
  { city: "Jeddah", country: "Saudi Arabia", lat: 21.5433, lng: 39.1727 },
  { city: "Doha", country: "Qatar", lat: 25.2854, lng: 51.5310 },
  { city: "Kuwait City", country: "Kuwait", lat: 29.3759, lng: 47.9774 },
  { city: "Manama", country: "Bahrain", lat: 26.2167, lng: 50.5833 },

  // South Asia
  { city: "Mumbai", country: "India", lat: 19.076, lng: 72.8777 },
  { city: "Delhi", country: "India", lat: 28.7041, lng: 77.1025 },
  { city: "Bangalore", country: "India", lat: 12.9716, lng: 77.5946 },
  { city: "Kolkata", country: "India", lat: 22.5726, lng: 88.3639 },
  { city: "Chennai", country: "India", lat: 13.0827, lng: 80.2707 },
  { city: "Hyderabad", country: "India", lat: 17.3850, lng: 78.4867 },
  { city: "Dhaka", country: "Bangladesh", lat: 23.8103, lng: 90.4125 },
  { city: "Chittagong", country: "Bangladesh", lat: 22.3569, lng: 91.7832 },
  { city: "Karachi", country: "Pakistan", lat: 24.8607, lng: 67.0011 },
  { city: "Lahore", country: "Pakistan", lat: 31.5497, lng: 74.3436 },
  { city: "Islamabad", country: "Pakistan", lat: 33.6844, lng: 73.0479 },
  { city: "Colombo", country: "Sri Lanka", lat: 6.9271, lng: 80.7789 },
  { city: "Kandy", country: "Sri Lanka", lat: 6.9271, lng: 80.6386 },
  { city: "Kathmandu", country: "Nepal", lat: 27.7172, lng: 85.3240 },

  // Southeast Asia
  { city: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
  { city: "Phuket", country: "Thailand", lat: 8.0863, lng: 98.4038 },
  { city: "Chiang Mai", country: "Thailand", lat: 18.7883, lng: 98.9853 },
  { city: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lng: 106.6297 },
  { city: "Hanoi", country: "Vietnam", lat: 21.0285, lng: 105.8542 },
  { city: "Da Nang", country: "Vietnam", lat: 16.0544, lng: 108.2022 },
  { city: "Yangon", country: "Myanmar", lat: 16.8661, lng: 96.1951 },
  { city: "Mandalay", country: "Myanmar", lat: 21.9588, lng: 96.0891 },
  { city: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456 },
  { city: "Surabaya", country: "Indonesia", lat: -7.2575, lng: 112.7521 },
  { city: "Bandung", country: "Indonesia", lat: -6.9271, lng: 107.6412 },
  { city: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
  { city: "Kuala Lumpur", country: "Malaysia", lat: 3.1390, lng: 101.6869 },
  { city: "George Town", country: "Malaysia", lat: 5.3521, lng: 100.3329 },
  { city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { city: "Manila", country: "Philippines", lat: 14.5995, lng: 120.9842 },
  { city: "Cebu", country: "Philippines", lat: 10.3157, lng: 123.8854 },
  { city: "Bangkok", country: "Philippines", lat: 15.8700, lng: 120.5631 },

  // East Asia
  { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { city: "Kyoto", country: "Japan", lat: 35.0116, lng: 135.7681 },
  { city: "Osaka", country: "Japan", lat: 34.6937, lng: 135.5023 },
  { city: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780 },
  { city: "Busan", country: "South Korea", lat: 35.1796, lng: 129.0756 },
  { city: "Incheon", country: "South Korea", lat: 37.2756, lng: 126.6296 },
  { city: "Beijing", country: "China", lat: 39.9042, lng: 116.4074 },
  { city: "Shanghai", country: "China", lat: 31.2304, lng: 121.4737 },
  { city: "Shenzhen", country: "China", lat: 22.5431, lng: 114.0579 },
  { city: "Hangzhou", country: "China", lat: 30.2741, lng: 120.1551 },
  { city: "Xi'an", country: "China", lat: 34.3416, lng: 108.9398 },
  { city: "Hong Kong", country: "Hong Kong", lat: 22.3193, lng: 114.1694 },
  { city: "Macau", country: "Macau", lat: 22.1987, lng: 113.5439 },
  { city: "Taipei", country: "Taiwan", lat: 25.0330, lng: 121.5654 },
  { city: "Taichung", country: "Taiwan", lat: 24.1372, lng: 120.6736 },
  { city: "Ulaanbaatar", country: "Mongolia", lat: 47.9064, lng: 106.8835 },

  // Central Asia
  { city: "Almaty", country: "Kazakhstan", lat: 43.2380, lng: 76.9502 },
  { city: "Nur-Sultan", country: "Kazakhstan", lat: 51.1694, lng: 71.4491 },
  { city: "Tashkent", country: "Uzbekistan", lat: 41.2995, lng: 69.2401 },
  { city: "Samarkand", country: "Uzbekistan", lat: 39.6548, lng: 66.9597 },
  { city: "Bishkek", country: "Kyrgyzstan", lat: 42.8746, lng: 74.5698 },
  { city: "Dushanbe", country: "Tajikistan", lat: 38.5598, lng: 68.7738 },
  { city: "Ashgabat", country: "Turkmenistan", lat: 37.9601, lng: 58.3261 },

  // Oceania & Pacific
  { city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { city: "Melbourne", country: "Australia", lat: -37.8136, lng: 144.9631 },
  { city: "Brisbane", country: "Australia", lat: -27.4698, lng: 153.0251 },
  { city: "Auckland", country: "New Zealand", lat: -37.0882, lng: 174.8860 },
  { city: "Wellington", country: "New Zealand", lat: -41.2865, lng: 174.7762 },
  { city: "Christchurch", country: "New Zealand", lat: -43.5321, lng: 172.6362 },
  { city: "Honolulu", country: "United States", lat: 21.3099, lng: -157.8581 },
  { city: "Fiji", country: "Fiji", lat: -18.1248, lng: 178.0677 },
  { city: "Samoa", country: "Samoa", lat: -13.8050, lng: -171.7604 },
];

export function reverseGeocode(lat: number, lng: number): { city: string; country: string } | null {
  if (!CITIES.length) return null;
  const closest = CITIES.reduce((prev, curr) => {
    const prevD = haversine(lat, lng, prev.lat, prev.lng);
    const currD = haversine(lat, lng, curr.lat, curr.lng);
    return currD < prevD ? curr : prev;
  });
  return closest;
}
