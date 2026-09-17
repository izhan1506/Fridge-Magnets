# Fridge Magnets — Project Summary

## Overview

A social travel app where users snap photos from trips, background-remove them into "magnet" cutouts, pin them at randomized-but-persistent positions on a virtual skeuomorphic fridge door, and discover other travelers' fridges on a world map. Built with React 18, TypeScript, Vite, Tailwind CSS, and backed by Supabase for authentication, Postgres database, and photo storage.

## Core Features

### 1. Authentication & Onboarding
- **Email/password signup and login** via Supabase Auth.
- **Google OAuth sign-in** (configurable, optional).
- **Home base setup** (onboarding): users pick a home city via search or map to establish their profile's origin on the public map.

### 2. Fridge View (Main Screen)
- **Skeuomorphic fridge illustration** (SVG, single-door design, 400×780 viewBox).
- **Magnet placement**: photos are enlarged to 120px base, randomly scattered within the fridge door zone (top 5%–71% of the door height), with per-magnet random rotation (±6°) and optional scale adjustment (0.6×–1.5×).
- **Persistent positioning**: users long-press (300ms) to drag magnets; positions are persisted per magnet (`posX`/`posY`, normalized [0,1]).
- **Story viewer**: tap a magnet to open full-screen photo carousel with:
  - Auto-advance every 4.5s between magnets.
  - Hold-to-pause on Instagram embeds (posts/Reels only; stories cannot embed).
  - Blur-to-sharp entrance animation on photos.
  - Keyboard navigation (Esc/arrows).

### 3. Add Magnet Flow
- **Camera capture or photo upload**: in-browser background removal via `@imgly/background-removal` (WASM, no API calls except asset fetch).
- **Resize preview**: live slider to adjust magnet scale before saving (0.6×–1.5×).
- **Auto-detect location**: via geolocation API with fallback to manual city entry (reverse geocoding via free OpenStreetMap Nominatim API).
- **Photo upload**: processed image is uploaded to Supabase Storage at `magnet-photos/{userId}/{magnetId}.png`; public URL is stored in the database.
- **Instagram link**: optional post/Reel embed (stories blocked by IG).

### 4. Map & Discovery
- **MapLibre GL + react-map-gl**: real-time, interactive world map.
- **Vector tiles**: free OpenFreeMap "Positron" style (no API key, no rate limits).
- **Proximity clustering**: magnets grouped by ~1200km bins; click cluster or pin to preview a user's fridge.
- **Public discovery**: only users with `map_public = true` appear on the map; their magnets are visible to everyone.

### 5. Settings & Profile
- **Profile management**: name, home city, email.
- **Map privacy toggle**: `map_public` controls whether you appear on the world map.
- **Magnets list**: view all your magnets; tap to edit Instagram link or delete (with confirmation).
- **Sign out** (destructive red button).

### 6. UI & Design Language
- **Glass morphism**: frosted white glass buttons and nav elements (`bg-white/15`, `border-white/30`, `backdrop-blur-[7px]`).
- **Squircle buttons**: all buttons use `rounded-2xl` (16px radius) for a modern, cohesive look.
- **Typography**: Anton (headings, display), Roboto (body). All headings are Title Case.
- **Toast notifications**: via Sonner, positioned inside the phone frame (absolute, offset below status bar).
- **Phone frame wrapper**: fixed 402×874px (iPhone 17 Pro dimensions), centered on desktop via flexbox, no responsive redesign.

## Tech Stack

### Frontend
- **React 18.3.1** with React Router 7.13.0 (SPA routing).
- **TypeScript 5** (strict mode).
- **Tailwind CSS 4** (utility-first, Vite plugin).
- **Framer Motion 12** (`motion` package; spring curves, scale lifts, pause on hold).
- **Sonner 2.0.3** (toast notifications, positioned inside phone frame).
- **Lucide React** (22px icons, strokeWidth 2–2.5).
- **MapLibre GL 5.24** + **react-map-gl 8.1** (map rendering, free tiles).

### Backend & Services
- **Supabase** (Postgres database + Auth + Storage):
  - **Profiles table**: user account info (id, name, email, home coordinates, home label, map_public flag).
  - **Magnets table**: user-uploaded photos with metadata (city, country, lat/lng, caption, Instagram URL, photo URL, color, verified, rotation, scale, position).
  - **Row Level Security (RLS)**: users can only read/update their own profile and magnets; public data is readable by everyone; private data never returned to other users' sessions.
  - **Storage bucket** (`magnet-photos`): public bucket storing magnet photos at `{userId}/{magnetId}.png` paths; only owners can write/delete.
  - **Auth trigger**: auto-creates a `profiles` row when a user signs up, mirroring their `auth.users` identity.

### External APIs
- **OpenStreetMap Nominatim** (reverse geocoding; free, no key, ~1 req/sec usage policy).
- **Google OAuth** (sign-in provider, optional; requires Google Cloud OAuth client credentials).
- **Instagram Embed API** (regex parsing to iframe URLs; posts and Reels only).

### Build & Deployment
- **Vite 6.3.5** (frontend build, HMR dev server).
- **Vercel** (static SPA hosting with client-side route rewrite).

## Data Models

### Profile
```typescript
{
  id: string;              // UUID, links to auth.users.id
  name: string;
  email: string;
  homeLat: number;
  homeLng: number;
  homeLabel: string;       // e.g., "Mumbai, India"
  mapPublic: boolean;      // true = visible on world map
}
```

### Magnet
```typescript
{
  id: string;              // UUID, auto-generated
  userId: string;          // FK to profiles.id
  city: string;
  country: string;
  lat: number;
  lng: number;
  caption: string;
  instagramUrl?: string;   // post/Reel embed URL (stories blocked)
  photoUrl: string;        // HTTPS URL from Supabase Storage
  color: MagnetColor;      // 'coral' | 'pink' | 'blue' | 'amber' | 'teal' | 'purple'
  verified: boolean;       // true = GPS verified location
  rotation: number;        // ±6° random hand-placed angle
  scale?: number;          // 0.6–1.5× multiplier, user-set
  posX?: number;           // [0,1] normalized center X, persisted
  posY?: number;           // [0,1] normalized center Y, persisted
  createdAt: number;       // milliseconds timestamp
}
```

## Key Implementation Details

### Fridge Placement & Collision
- **Door zone**: 16% left, 5% top, 77% wide, 71% tall (% of illustration bounding box).
- **Random placement**: seeded PRNG (mulberry32 + hash) for deterministic scatter. Once user drags a magnet, position persists in `posX`/`posY`.
- **Overlap allowed**: no collision detection; magnets can stack freely like a real packed fridge.

### Magnet Rendering
- **Base size**: 120px (previously 80px, upscaled 150%).
- **Actual size**: `MAGNET_SIZE * (scale ?? 1)`.
- **Rotation**: CSS `rotate(${rotation}deg)`.
- **Tap-to-open**: Framer Motion scale lift (1→1.12) on long-press (300ms).

### Photo Upload Flow (Supabase Storage)
1. User captures/uploads photo.
2. In-browser background removal (WASM, no network call except model asset fetch).
3. Generate client-side UUID for magnet (`crypto.randomUUID()`).
4. Upload Blob to `magnet-photos/{userId}/{magnetId}.png` via `supabase.storage.upload()`.
5. Retrieve public URL via `getPublicUrl()`.
6. Store URL in `Magnet.photoUrl` and save magnet record to DB.
7. On delete: remove both DB row and Storage object.

### Story Viewer
- Full-bleed image or iframe embed (Instagram posts/Reels).
- Tap zones narrowed (10% edges for embeds, 30%/70% for photos) to allow iframe controls.
- Hold-to-pause on embeds; auto-advance on photos (4.5s).

### Map & Discovery
- Query all public profiles: `select * from profiles where map_public = true`.
- Batch-fetch their magnets: `select * from magnets where user_id = any(:ids)`.
- Cluster proximity (~1200km greedy bins).
- Pin preview shows featured magnet (first verified, or newest).

## File Structure

```
src/
├── app/
│   ├── components/
│   │   ├── screens/
│   │   │   ├── Welcome.tsx
│   │   │   ├── Auth.tsx
│   │   │   ├── SetHomeBase.tsx
│   │   │   ├── FridgeScreen.tsx
│   │   │   ├── FridgeView.tsx (shared fridge renderer)
│   │   │   ├── OtherFridge.tsx
│   │   │   ├── MapScreen.tsx
│   │   │   ├── AddMagnet.tsx
│   │   │   ├── SettingsScreen.tsx
│   │   │   └── MagnetSettings.tsx
│   │   ├── fridge.tsx (FridgeAppliance, MagnetTile)
│   │   ├── fridge-illustration.tsx (SVG fridge)
│   │   ├── story-viewer.tsx (carousel, embeds, hold-to-pause)
│   │   ├── worldmap.tsx (MapLibre wrapper)
│   │   ├── glass-nav.tsx (glass buttons, bottom nav)
│   │   ├── chrome.tsx (M3-style inputs, buttons)
│   │   ├── layout.tsx (PhoneFrame wrapper)
│   │   ├── mappins.tsx (cluster bubbles, pin preview)
│   │   └── ui/ (Radix UI + shadcn primitives)
│   ├── lib/
│   │   ├── supabase.ts (Supabase client)
│   │   ├── store.ts (data layer; Supabase queries)
│   │   ├── session.tsx (React Context; auth + magnet operations)
│   │   ├── storage.ts (photo upload/delete helpers)
│   │   ├── types.ts (Profile, Magnet, etc.)
│   │   ├── skins.ts (magnet colors, door geometry)
│   │   ├── geo.ts (haversine, reverse geocoding, city search)
│   │   ├── instagram.ts (embed URL parsing)
│   │   └── bgRemoval.ts (background removal wrapper)
│   ├── styles/
│   │   ├── index.css
│   │   ├── globals.css (CSS variables, dark theme)
│   │   ├── theme.css (headings, status bar, etc.)
│   │   ├── tailwind.css
│   │   └── fonts.css (Anton + Roboto)
│   └── App.tsx (router + SessionProvider + Toaster)
├── main.tsx (React root)
├── vite-env.d.ts (Vite env typing)
├── vite.config.ts
├── package.json
├── tsconfig.json
├── vercel.json (SPA rewrite)
├── .env.example
└── supabase/
    └── migrations/
        ├── 0001_init.sql (schema + RLS + trigger)
        └── 0002_storage.sql (storage policies)
    └── seed.sql (3 demo fridges)
└── docs/
    └── DEPLOY.md (step-by-step Vercel + Supabase setup)
```

## Routes

- `/welcome` — splash screen.
- `/auth` — email/password + Google OAuth.
- `/onboarding/home` — set home base (protected; redirects unonboarded users here).
- `/fridge` — owner's fridge (main screen).
- `/fridge/:userId` — read-only view of another user's fridge.
- `/map` — world map of public fridges.
- `/add` — add magnet flow.
- `/settings` — profile + privacy settings.
- `/settings/magnets` — magnet details / management.

## Security & Privacy

- **Row Level Security (RLS)** enforces access control at the database layer:
  - Users can only create/read/update their own profile and magnets.
  - Public profiles and their magnets are readable by anyone.
  - Private profiles' data is never returned by any query, even if a session attempts to fetch it.
- **Storage policies** allow public read (so photo URLs work universally) but owner-only write/delete.
- **Google OAuth** is optional; email/password auth is always available.
- **No email confirmation** required by default (can be enabled in Supabase settings for extra security, but adds friction to signup).

## Known Constraints

- Instagram stories cannot be embedded (IG blocks them programmatically).
- Background removal is client-side (WASM) — large photos may be slow on older devices.
- Magnets overlap freely; no smart collision avoidance.
- Map is live (no caching of public fridges list) — refreshing the page re-queries the DB.
- Photo storage is Supabase Storage URLs; if you export the database to CSV, URLs remain valid as long as the bucket exists.

## Production Readiness

The app is **production-ready** after deploying to Vercel and Supabase (see `docs/DEPLOY.md`):
- ✅ Real authentication (Supabase Auth + Google OAuth).
- ✅ Real database (Postgres with Row Level Security).
- ✅ Real file storage (Supabase Storage).
- ✅ Cross-user data sharing (public fridges on world map).
- ✅ Responsive to mobile (fixed 402×874 frame on all screens).
- ✅ Static deployment (Vercel static hosting).
- ✅ No API rate limits (local WASM for BG removal, Nominatim usage within policy, MapLibre/OpenFreeMap free tiles).

## Future Enhancements

- **Notifications**: real-time alerts when someone visits your fridge or adds a magnet in your area.
- **Likes/views**: a counter on each magnet (not implemented; would require a `reactions` table).
- **Fridge skins**: alternate fridge designs (currently just one SVG).
- **PWA**: manifest + service worker for installability.
- **Offline mode**: persist magnets locally and sync on reconnect.
- **E2E tests**: Cypress/Playwright for full user workflows.
- **Analytics**: track map views, signup source, etc.

---

**Last updated**: July 2026. Reflects Supabase backend integration and Vercel deployment setup.
