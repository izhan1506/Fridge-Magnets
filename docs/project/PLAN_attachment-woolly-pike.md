# Plan: Fridge — a travel memory app

## Context

The user wants to build **Fridge**, a mobile-first PWA where every trip becomes a
digital fridge magnet. A user photographs a souvenir magnet in-app, its
background is removed automatically, and it's pinned to their personal digital
fridge and to a shared world map where other users' fridges are discoverable by
home location. The full product spec lives in
`src/imports/pasted_text/fridge-design-brief.md`.

The user explicitly chose a **real camera + Supabase backend** (not a mock
prototype). So we need: real accounts, persisted magnets/photos, cross-user
discovery on a shared map, live in-app camera capture, and automatic background
removal.

The project is a fresh Figma Make React app (React 18, Vite, Tailwind v4, Radix
UI components in `src/app/components/ui/`, `motion`, `react-router` 7,
`lucide-react`, `sonner`, `ImageWithFallback` present). There is **no**
`@make-kits` design system installed, so we build on the existing Radix `ui/`
primitives + the brief's own two-language design system.

## Design system — two strictly-separated visual languages

Per the brief, this is non-negotiable:

- **App chrome** (onboarding, nav, forms, map UI, settings, modals, toasts):
  **Material 3** — tonal container color roles, rounded corners, flat surfaces,
  generous whitespace, no heavy shadows. Font: **Roboto**.
- **Fridge screen only**: **skeuomorphic** — textured fridge-door background,
  magnets with real drop-shadows + slight random rotation, tactile/warm. Font:
  **Fredoka** (rounded display) for the owner name label and empty-state copy
  only. This texture must NOT bleed into nav/buttons/other screens.

### Tokens & fonts
- Update `src/styles/theme.css` `:root` (preserve `.dark` + `@theme inline`
  mappings) to the brief's Material 3 palette: `--primary` #7F77DD,
  `--secondary` #D85A30, `--accent`/tertiary #1D9E75, `--background` #FFFDF9,
  `--foreground` #1C1B1F, `--border`/outline #888780, plus container tints
  (#EEEDFE, #FAECE7, #E1F5EE). Add extra CSS vars for magnet accent colors
  (#F0997B, #ED93B1, #85B7EB, #EF9F27, #5DCAA5, #AFA9EC) and the 3 fridge skins.
- Add `@import` for Roboto + Fredoka to the **top** of `src/styles/fonts.css`
  only. Set Roboto as the chrome default; scope Fredoka to a `.fridge-*` class.
- Fridge skins as CSS backgrounds: Steel (brushed-metal gray gradient
  #EDEAE2→#E3DFD4), Pastel enamel (mint/blush sheen), Wood panel
  (#C69C6D→#A97C50 grain).

## Architecture

Mobile-first. Render the app inside a centered phone-width column
(max-width ~430px) that expands gracefully at a ~768px breakpoint.

Use **React Router 7** (installed) for navigation across the ~23 screens.
`src/app/App.tsx` = default export hosting `<BrowserRouter>` + an auth-aware
route tree + a `<Toaster />` (sonner) and a shared bottom/top nav where the
brief calls for it.

### New component files (`src/app/components/`)
Build the shared library first (brief §8), then screens.
- `chrome/` — `M3Button`, `TopTabNav` (pill fridge/map switcher),
  `TextField`, `SearchBar`, `VerifiedBadge`, `BottomSheet` (wrap Radix
  dialog/vaul), `NudgeBanner`/toast.
- `fridge/` — `MagnetTile` (states: photo / placeholder-color / dashed
  "add new"; random rotation + drop-shadow), `FridgeSurface` (skin texture),
  `MagnetDetailModal`.
- `map/` — `WorldMap`, `HomePin` (circular-cropped magnet image),
  `ClusterBubble`, `PinPreviewCard`.
- `magnet-add/` — `CameraCapture`, `Processing`, `CutoutPreview`,
  `MagnetDetailsForm`.
- `screens/` — one file per screen group (Onboarding, AddMagnetFlow, Fridge,
  MapScreen, Settings, error states).

### Libraries to add (via pnpm)
- **Map**: `react-leaflet` + `leaflet` (free OSM tiles, no API key) and
  `leaflet.markercluster` (or `react-leaflet-cluster`) for the cluster state.
  Tonal country/visited fills via GeoJSON layers or circle overlays.
- **Background removal**: `@imgly/background-removal` — runs in-browser (WASM),
  **no API key required**. Powers the "Processing" step client-side, output a
  transparent PNG shown on a checkerboard in Cutout preview. (Fallback: if the
  model download is too heavy, degrade to an edge-function bg-removal service —
  would need a secret via `create_supabase_secret`; decide during build.)
- **Camera**: browser `getUserMedia` (no package) for the live capture screen +
  shutter; canvas snapshot → blob.

## Backend (Supabase)

This is a **SupabaseRequired** build. **First implementation step: call the
`supabase_connect` MCP tool** and wait for the user to connect before writing
any backend code. (Note to user: Make is not for collecting PII / securing
sensitive data.) Once connected, these exist: `supabase/functions/server/
index.tsx` (Hono edge server), `supabase/functions/server/kv_store.tsx`,
`utils/supabase/info.tsx`.

### Auth
- Email/password + Google OAuth via Supabase Auth. Signup done server-side
  (auto-confirm email since no mail server configured), session on client.

### Storage
- Create a private bucket for magnet cutout PNGs; serve via signed URLs.

### Data (kv_store, keyed)
- `profile:{userId}` → { name, homeLat, homeLng, homeLabel, fridgeSkin,
  mapPublic }.
- `magnet:{userId}:{magnetId}` → { city, country, lat, lng, caption,
  instagramUrl, photoPath, verified, createdAt }.
- Index helpers for "all public fridges" to power the map + other users' fridges.

### Edge routes (Hono, prefixed `/make-server-xxxx/`)
- `POST /signup`, session-guarded `GET/PUT /profile`,
  `GET/POST/DELETE /magnets`, `GET /fridges` (public list for map),
  `GET /fridge/:userId` (read-only someone-else view),
  `POST /upload` (photo → storage, return path).
- Seed a few mock public fridges/magnets on first run so the map isn't empty.

## Screens (brief §6/§7 — build order)

Onboarding: welcome/splash → auth (email+Google) → set home base (Leaflet
picker + search + confirm) → choose fridge skin (3 skin cards) → empty state.
Add-magnet: GPS detecting → camera capture → processing (bg removal) → cutout
preview (checker bg, confirm/retake) → details (auto city/country editable,
caption, optional IG link w/ skip) → saved confirmation.
Fridge: own fridge (magnet scatter on skin, owner name, top tab to Map) →
magnet detail modal (place, date, verified badge, "view story" opens IG) →
someone-else read-only fridge → empty fridge state.
Map: unified map (visited areas tonally filled, home-base pins = top magnet
image) → cluster bubble → pin-tap preview card ("view full fridge").
Settings: edit home base, change skin, map visibility toggle, log out.
Error/edge: location denied, camera denied, bg-removal failed (retry).

Copy voice per §9 (sentence case, no exclamations, active voice, "your fridge").

## Critical files
- `src/app/App.tsx` — router + auth shell + Toaster (edit, default export).
- `src/styles/theme.css` — Material 3 tokens (edit `:root`, keep `.dark`/`@theme`).
- `src/styles/fonts.css` — Roboto + Fredoka imports at top.
- `src/app/components/**` — new component + screen files listed above.
- `supabase/functions/server/index.tsx` — Hono routes (after connect).
- Reuse existing `src/app/components/ui/*` (button, dialog, input, switch, tabs,
  card) as chrome primitives and `components/figma/ImageWithFallback.tsx` for
  images.

## Verification
1. Connect Supabase; confirm `utils/supabase/info.tsx` + server files exist and
   the edge function deploys (remind user to deploy from Make settings page).
2. In the preview surface: sign up, set home base, pick a skin — profile
   persists across reload.
3. Add a magnet: grant camera, capture, confirm bg removal produces a
   transparent cutout, fill details, save — magnet appears on the fridge with
   rotation/shadow and on the map pin.
4. Open the Map: verify home pin uses the magnet image, cluster bubble shows at
   zoom-out, pin tap opens preview → "view full fridge" shows a read-only
   fridge.
5. Settings: toggle map visibility (public magnet disappears from others' map),
   change skin (fridge texture updates), log out returns to welcome.
6. Error states: deny camera/location and confirm the dedicated screens render;
   simulate bg-removal failure and confirm retry.
7. Confirm the fridge skeuomorphic texture never bleeds into nav/buttons/other
   screens, and chrome uses Roboto while fridge labels use Fredoka.
