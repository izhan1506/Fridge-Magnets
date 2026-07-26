# Fridge Magnets App — Project Summary

## Overview
A social travel app where users snap photos from trips, pin them as "magnets" to a virtual fridge display, and discover fellow travelers on a world map. The app uses a skeuomorphic fridge interface as its core metaphor.

## Core Features Implemented

### 1. Splash & Onboarding
- **Splash Screen** (Welcome.tsx): Warm amber→red radial aurora gradient background, bottom-anchored pitch. Copy: "Every trip becomes a magnet." with accent on "magnet."
- **Auth Flow**: Email/password signup + Google OAuth
- **Home Base Setup** (SetHomeBase.tsx): Map-based city picker for user's home location (used on the public map)

### 2. Fridge View (Main Screen)
- **Skeuomorphic Fridge Illustration** (FridgeIllustration.tsx): Single-door satin white fridge with top trim, handle groove, base seam. No digital display panel.
- **Magnet Placement**:
  - Enlarged to 120px base (150% of original)
  - Random scatter within door zone (top 5% to bottom 71% of fridge door)
  - **Magnets can overlap** — like a real packed fridge
  - Per-magnet resize at creation (0.6×–1.5× scale multiplier)
  - Long-press (300ms) drag to reposition; positions persist per magnet (posX/posY normalized [0,1])
  - Tap to open story viewer

- **Story Viewer** (StoryViewer.tsx): 
  - Full-bleed display of magnet photo
  - Hold-to-pause on Instagram iframe embeds (posts/Reels only; stories cannot embed)
  - Carousel swipe through magnets
  - Blur-to-sharp entrance animation on photos

- **Magnet Settings** (MagnetSettings.tsx):
  - Edit Instagram link (post/Reel embeds play inline)
  - Delete magnet with confirmation dialog
  - Styled with glass morphism design language

### 3. Add Magnet Flow (AddMagnet.tsx)
- Camera capture or photo upload (background removal via API)
- Resize preview (0.6×–1.5× scale) with live slider before saving
- Auto-detect location via GPS (fallback to manual entry)
- Persist city, country, caption, Instagram link, and scale

### 4. Map & Discovery
- **WorldMap** (MapScreen.tsx): Leaflet-based map showing all public fridges and their locations
- Toggle between Fridge and Map views (GlassTabNav)
- Click magnet on map to visit another user's fridge (read-only, no drag)

### 5. Settings & Profile
- **Settings Screen** (SettingsScreen.tsx): Notification preferences, profile info, log out (destructive button with red fill)
- **Other Fridges** (OtherFridge.tsx): Read-only view of shared fridges (dragging disabled)

### 6. UI & Design Language
- **Glass Morphism**: Frosted white glass (`bg-white/15` + `border-white/30` + `backdrop-blur-[7px]`) for secondary buttons, nav, settings buttons
- **Button Family**: Unified squircle shape (`rounded-2xl`, 16px radius) across all buttons
  - `filled`: Orange primary fill (same as add-magnet button)
  - `tonal`/`outline`: Frosted glass fill
  - Destructive: Red fill with glass rim
  - All with white glass rim
- **Typography**: Anton (display, headings), Roboto (body text). All headings: Title Case (first letter of every word capitalized)
- **Toast Notifications**: Now render inside the phone frame (absolute positioning, offset below status bar) instead of escaping to viewport

## Tech Stack

### Frontend
- **React 18** + React Router v6 (SPA routing)
- **TypeScript** (strict mode)
- **Tailwind CSS** (utility-first styling)
- **Framer Motion** (animations: spring curves, hold-to-pause, scale lifts)
- **Sonner** (toast notifications, v2.0.3)
- **Lucide Icons** (UI icons)
- **Leaflet** + **React-Leaflet** (map component)

### Services & APIs
- **Firebase** (authentication, Firestore database)
- **Reverse Geocoding** (city/country lookup from lat/lng)
- **Background Removal API** (removes photo backgrounds for magnet cutouts)
- **Instagram Embed API** (iframe embedding for posts/Reels)

### State Management
- **Custom `useSession` hook** (React Context) for auth + fridge data
- LocalStorage for offline magnet/profile cache

## Data Models

### Profile
```typescript
{
  id: string;
  name: string;
  email: string;
  homeLat: number;
  homeLng: number;
  homeLabel: string;
  mapPublic: boolean;
}
```

### Magnet
```typescript
{
  id: string;
  userId: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  caption: string;
  instagramUrl?: string; // post/Reel only; stories embed-blocked by IG
  photoUrl: string; // data URL (cutout) or remote URL
  color: MagnetColor; // placeholder before photo loads
  verified: boolean; // has GPS coords
  rotation: number; // ±6° random hand-placed rotation
  scale?: number; // 0.6–1.5× multiplier, set at creation
  posX?: number; // [0,1] normalized center position (persisted after drag)
  posY?: number;
  createdAt: number;
}
```

### MagnetColor
`"coral" | "pink" | "blue" | "amber" | "teal" | "purple"`

## Key Implementation Details

### Fridge Placement & Collision
- **Door Zone**: 16% left, 5% top, 77% wide, 71% tall (of illustration bounding box)
- **Random Placement**: Seeded PRNG (mulberry32 + hash) for deterministic, stable scatter
- **Overlap Allowed**: No collision detection; magnets can stack freely
- **Drag Bounds**: Clamped to half-box (rotated tile kept within door)

### Magnet Rendering
- Base size: 120px (1.5× scale on the old 80px)
- Each magnet's actual size = `MAGNET_SIZE * (scale ?? 1)`
- Rotation applied via CSS transform: `rotate(${rotation}deg)`
- Tap-to-open uses motion scale lift (1→1.12) on long-press

### Story Viewer
- Full-bleed image or iframe embed
- Tap zones narrowed (10% edges for embeds vs. 30%/70% for photos) to allow iframe controls
- Hold gesture pauses auto-advance on embeds
- Blur-to-sharp animation on image load

### Toasts
- Positioned inside frame (switched from viewport-fixed to frame-relative absolute)
- Offset 58px below top (below status bar)
- Scoped to frame via CSS: `[data-sonner-toaster] { position: absolute !important; }`

## Design Language Specifics

### Colors
- **Primary (CTA)**: Orange (`var(--primary)`, app-dependent color token)
- **Foreground**: Off-white/light gray on dark bg
- **Muted**: Lower contrast text (descriptions, hints)
- **Background**: Very dark (`#0a0a0a`-ish), high contrast for night mode

### Spacing & Sizing
- **Button radius**: `rounded-2xl` (16px, squircle shape)
- **Nav radius**: `rounded-[21px]` (glass nav pill)
- **Status bar clearance**: 58px (toasts, modals)
- **Frame padding**: 8px–16px horizontal, varies by screen

### Icons & Images
- Lucide React for all icons (22px typical, strokeWidth 2–2.5)
- Magnet photos: 120px base, rounded corners, drop shadow
- Fridge illustration: SVG, viewBox 400×780, scaled to fit frame

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
│   │   │   ├── AddMagnet.tsx
│   │   │   ├── MagnetSettings.tsx
│   │   │   ├── MapScreen.tsx
│   │   │   ├── SettingsScreen.tsx
│   │   │   └── OtherFridge.tsx
│   │   ├── chrome.tsx (M3Button, TextField, SearchBar)
│   │   ├── fridge.tsx (FridgeAppliance, MagnetTile)
│   │   ├── glass-nav.tsx (GlassTabNav, GlassIconButton, BottomNavBar)
│   │   ├── story-viewer.tsx (StoryViewer, carousel logic)
│   │   ├── fridge-illustration.tsx (SVG fridge)
│   │   ├── worldmap.tsx (Leaflet map wrapper)
│   │   ├── layout.tsx (PhoneFrame wrapper, responsive)
│   │   └── ui/ (Shadcn components)
│   ├── lib/
│   │   ├── session.ts (Context hook for auth + data)
│   │   ├── types.ts (Profile, Magnet, etc.)
│   │   ├── skins.ts (colors, door zone, random color)
│   │   ├── geo.ts (city search, reverse geocoding)
│   │   ├── instagram.ts (embed URL parsing)
│   │   └── bgRemoval.ts (background removal API)
│   ├── styles/
│   │   ├── index.css (imports all)
│   │   ├── fonts.css (Anton + Roboto)
│   │   ├── tailwind.css (Tailwind directives)
│   │   ├── theme.css (heading capitalize, toaster absolute, checker, etc.)
│   │   └── globals.css (CSS variables, theme tokens)
│   ├── App.tsx (Router + Toaster)
│   └── main.tsx (React root)
└── package.json
```

## Dependencies (Key)
```json
{
  "react": "^18",
  "react-router": "^6",
  "typescript": "^5",
  "tailwindcss": "^3",
  "motion": "^11", // Framer Motion
  "sonner": "^2.0.3",
  "leaflet": "^1.9",
  "react-leaflet": "^4",
  "firebase": "^9",
  "lucide-react": "^latest"
}
```

## Important Notes for React Native Port

1. **Fridge Illustration**: Currently SVG. For RN, convert to React Native SVG or use `react-native-svg`.
2. **Animations**: Framer Motion → React Native Animated / Reanimated.
3. **Routing**: React Router → React Navigation.
4. **Maps**: Leaflet → `react-native-maps`.
5. **Storage**: LocalStorage → AsyncStorage (React Native).
6. **Toast**: Sonner → Use react-native-toast-notifications or similar.
7. **Styling**: Tailwind → StyleSheet / NativeWind (if using Expo).
8. **Images**: Tailwind `bg-gradient-to-t` → LinearGradient from `react-native-linear-gradient`.
9. **Long-press**: RN Pressable with onLongPress, similar timer logic.
10. **Camera**: expo-camera for photo capture.
11. **Gestures**: React Native Gesture Handler for drag/swipe.

## URLs & Routes
- `/welcome` — splash screen
- `/auth` — auth flow
- `/onboarding/home` — set home base
- `/fridge` — main fridge screen (owned)
- `/fridge/:userId` — read-only fridge (other user)
- `/map` — world map discovery
- `/add` — add magnet flow
- `/settings` — profile & preferences
- `/settings/magnets` — magnet details editor

## Known Constraints
- Instagram stories cannot be embedded (IG blocks them); only posts and Reels work
- Background removal is API-based (not on-device)
- Magnets overlap freely; no collision avoidance
- Magnet photos are base64 data URLs or remote HTTP(S)
- No offline sync; relies on Firebase real-time updates

## Session Summary
All requested features have been implemented and verified end-to-end. The app is production-ready for web. A React Native port would require re-implementing the UI layer and swapping web-specific libraries for mobile equivalents, but the business logic (data models, API calls, state management) can largely transfer as-is.
