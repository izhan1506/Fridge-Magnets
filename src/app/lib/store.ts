import type { Magnet, Profile, PublicFridge } from "./types";

/**
 * Persistence layer for Fridge.
 *
 * Today this is backed by localStorage so the whole app is functional offline.
 * Every function is async and returns the same shapes the Supabase edge server
 * exposes, so swapping this file's internals for `fetch()` calls against
 * `supabase/functions/server` is a drop-in change — no screen code changes.
 */

const LS_PROFILE = "fridge.profile";
const LS_MAGNETS = "fridge.magnets";
const LS_SESSION = "fridge.session";
const LS_USERS = "fridge.users"; // email -> {password, profile}

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Seeded public fridges (other users discoverable on the map) ──
const SEED: PublicFridge[] = [
  {
    profile: {
      id: "seed-priya",
      name: "Priya",
      email: "priya@example.com",
      homeLat: 19.076,
      homeLng: 72.8777,
      homeLabel: "Mumbai, India",
      mapPublic: true,
    },
    magnets: [
      seedMagnet("seed-priya", "Kyoto", "Japan", 35.0116, 135.7681, "purple",
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&h=300&fit=crop&auto=format", true),
      seedMagnet("seed-priya", "Lisbon", "Portugal", 38.7223, -9.1393, "coral",
        "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=300&h=300&fit=crop&auto=format", true),
      seedMagnet("seed-priya", "Reykjavík", "Iceland", 64.1466, -21.9426, "blue",
        "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=300&h=300&fit=crop&auto=format", false),
    ],
  },
  {
    profile: {
      id: "seed-marco",
      name: "Marco",
      email: "marco@example.com",
      homeLat: 41.9028,
      homeLng: 12.4964,
      homeLabel: "Rome, Italy",
      mapPublic: true,
    },
    magnets: [
      seedMagnet("seed-marco", "Marrakesh", "Morocco", 31.6295, -7.9811, "amber",
        "https://images.unsplash.com/photo-1597211684565-dca64d72c3ug?w=300&h=300&fit=crop&auto=format", true),
      seedMagnet("seed-marco", "Athens", "Greece", 37.9838, 23.7275, "teal",
        "https://images.unsplash.com/photo-1555993539-1732b0258235?w=300&h=300&fit=crop&auto=format", true),
    ],
  },
  {
    profile: {
      id: "seed-ana",
      name: "Ana",
      email: "ana@example.com",
      homeLat: -23.5505,
      homeLng: -46.6333,
      homeLabel: "São Paulo, Brazil",
      mapPublic: true,
    },
    magnets: [
      seedMagnet("seed-ana", "Cusco", "Peru", -13.5319, -71.9675, "pink",
        "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=300&h=300&fit=crop&auto=format", true),
      seedMagnet("seed-ana", "Cartagena", "Colombia", 10.391, -75.4794, "coral",
        "https://images.unsplash.com/photo-1583997052103-b4a1cb974ce5?w=300&h=300&fit=crop&auto=format", false),
      seedMagnet("seed-ana", "Mexico City", "Mexico", 19.4326, -99.1332, "amber",
        "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=300&h=300&fit=crop&auto=format", true),
    ],
  },
];

function seedMagnet(
  userId: string,
  city: string,
  country: string,
  lat: number,
  lng: number,
  color: Magnet["color"],
  photoUrl: string,
  verified: boolean,
): Magnet {
  return {
    id: `${userId}-${city}`,
    userId,
    city,
    country,
    lat,
    lng,
    caption: `A little piece of ${city}.`,
    photoUrl,
    color,
    verified,
    rotation: (Math.random() * 12 - 6),
    createdAt: Date.now() - Math.floor(Math.random() * 1e10),
  };
}

// ── Auth ──
type Users = Record<string, { password: string; profile: Profile }>;

export async function signUp(email: string, password: string, name: string): Promise<Profile> {
  await delay();
  const users = read<Users>(LS_USERS, {});
  if (users[email]) throw new Error("An account with that email already exists");
  const profile: Profile = {
    id: `u-${Date.now()}`,
    name,
    email,
    homeLat: 0,
    homeLng: 0,
    homeLabel: "",
    mapPublic: true,
  };
  users[email] = { password, profile };
  write(LS_USERS, users);
  write(LS_SESSION, email);
  write(LS_PROFILE, profile);
  return profile;
}

export async function signIn(email: string, password: string): Promise<Profile> {
  await delay();
  const users = read<Users>(LS_USERS, {});
  const entry = users[email];
  if (!entry || entry.password !== password) throw new Error("Wrong email or password");
  write(LS_SESSION, email);
  write(LS_PROFILE, entry.profile);
  return entry.profile;
}

export async function signInWithGoogle(): Promise<Profile> {
  await delay(400);
  const email = "you@gmail.com";
  const users = read<Users>(LS_USERS, {});
  if (!users[email]) {
    const profile: Profile = {
      id: `u-google`,
      name: "You",
      email,
      homeLat: 0,
      homeLng: 0,
      homeLabel: "",
        mapPublic: true,
    };
    users[email] = { password: "", profile };
    write(LS_USERS, users);
  }
  write(LS_SESSION, email);
  write(LS_PROFILE, users[email].profile);
  return users[email].profile;
}

export async function signOut(): Promise<void> {
  await delay(120);
  localStorage.removeItem(LS_SESSION);
}

export async function getSession(): Promise<Profile | null> {
  await delay(80);
  const email = read<string | null>(LS_SESSION, null);
  if (!email) return null;
  const users = read<Users>(LS_USERS, {});
  return users[email]?.profile ?? read<Profile | null>(LS_PROFILE, null);
}

// ── Profile ──
export async function saveProfile(profile: Profile): Promise<Profile> {
  await delay(120);
  const users = read<Users>(LS_USERS, {});
  if (users[profile.email]) {
    users[profile.email].profile = profile;
    write(LS_USERS, users);
  }
  write(LS_PROFILE, profile);
  return profile;
}

// ── Magnets (current user) ──
export async function getMagnets(userId: string): Promise<Magnet[]> {
  await delay(120);
  const all = read<Magnet[]>(LS_MAGNETS, []);
  return all.filter((m) => m.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
}

export async function addMagnet(magnet: Magnet): Promise<Magnet> {
  await delay(160);
  const all = read<Magnet[]>(LS_MAGNETS, []);
  all.push(magnet);
  write(LS_MAGNETS, all);
  return magnet;
}

export async function deleteMagnet(id: string): Promise<void> {
  await delay(120);
  const all = read<Magnet[]>(LS_MAGNETS, []);
  write(LS_MAGNETS, all.filter((m) => m.id !== id));
}

export async function updateMagnet(id: string, patch: Partial<Magnet>): Promise<Magnet | null> {
  await delay(120);
  const all = read<Magnet[]>(LS_MAGNETS, []);
  const idx = all.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  const updated = { ...all[idx], ...patch };
  all[idx] = updated;
  write(LS_MAGNETS, all);
  return updated;
}

// ── Public fridges (map + read-only views) ──
export async function getPublicFridges(excludeUserId?: string): Promise<PublicFridge[]> {
  await delay(200);
  const users = read<Users>(LS_USERS, {});
  const all = read<Magnet[]>(LS_MAGNETS, []);
  const realPublic: PublicFridge[] = Object.values(users)
    .filter((u) => u.profile.mapPublic && u.profile.homeLabel)
    .map((u) => ({
      profile: u.profile,
      magnets: all
        .filter((m) => m.userId === u.profile.id)
        .sort((a, b) => b.createdAt - a.createdAt),
    }))
    .filter((f) => f.magnets.length > 0);

  return [...SEED, ...realPublic].filter((f) => f.profile.id !== excludeUserId);
}

export async function getFridge(userId: string): Promise<PublicFridge | null> {
  await delay(160);
  const seed = SEED.find((f) => f.profile.id === userId);
  if (seed) return seed;
  const users = read<Users>(LS_USERS, {});
  const entry = Object.values(users).find((u) => u.profile.id === userId);
  if (!entry) return null;
  const all = read<Magnet[]>(LS_MAGNETS, []);
  return {
    profile: entry.profile,
    magnets: all.filter((m) => m.userId === userId).sort((a, b) => b.createdAt - a.createdAt),
  };
}
