# Fridge Magnets — Development Notes

**Last updated:** 2026-09-17
**Live:** https://fridge-magnets-three.vercel.app · **Repo:** izhan1506/Fridge-Magnets
**Stack:** React 18 · Vite · TypeScript · Tailwind v4 · Supabase · MapLibre · motion (Framer)

---

## ⚠️ Read this first

**The branch is merged.** `feat/case-study-and-perf` (17 commits) fast-forwarded
onto `main` on 2026-09-17, so everything below is live via Vercel.

Reviewed before merging with: a clean `vite build`, a full-strict `tsc --noEmit`
compared against the same check on `main` (identical 7 errors — the branch added
none), a real-Chrome render of every new page at 5 widths, the geo math unit-run
against the real coordinate collision in the database, and the payload/fridge-id
claims re-measured against production data. One regression was found and fixed
during review (`00083a5`): route exit transitions had stopped running because
`<Suspense>` landed between `<AnimatePresence>` and the keyed `<Routes>`.

---

## What's verified vs. what isn't

Verified means it was measured or rendered and the result looked at — not "the
code looks right".

| Area | State |
| --- | --- |
| Shared fridge links (`/fridge/fridge-XXXX`) | ✅ all 15 public profiles hash to 15 distinct ids, 0 collisions; unknown id returns null |
| Map query payload | ✅ re-measured 2026-09-17: 7,830.3 KB → 9.4 KB on production data (99.88%); `MAGNET_LIST_COLUMNS` matches the live row exactly, minus `trip_photo_url` |
| WebP conversion | ✅ **now tested with real photos**: 3 real bg-removed cutouts pulled from Storage + a real camera JPEG, run through `toWebp` in Chrome. Alpha byte-identical (mean alpha delta 0.00, transparent-pixel share unchanged), 75–89% smaller on cutouts, 27% on the JPEG, opaque colour drift <1/255. Undecodable blob returns the same object and never throws |
| Session error handling | ✅ stale token + dead backend → error screen with retry, not an infinite spinner |
| Pin ring layout | ✅ 0.9989km spacing on the real Karachi 4-pin collision, deterministic, 500/500 distinct, antimeridian-safe. At a pole the clamp collapses moved pins to lat ±85 (distinct in longitude only) — degenerate but harmless |
| Boot bundle | ✅ CDP network trace on `/landingpage`: exactly 3 assets — entry (195 KB gzip), route chunk (4.1 KB), CSS (28 KB). maplibre and onnx-runtime not fetched |
| Case study / landing pages | ✅ real render at 360/390/412/768/1280 — `scrollWidth == clientWidth` at every width, full text content present, zero console messages |
| Hero hard-cut | ✅ no transition/animation on the images |
| **Native share sheet** | n/a — that feature was reverted |
| Route exit transitions | ✅ A/B against a build of `main`, DOM sampled every 60ms: old screen holds t=61→301ms, new screen mounts at t=362ms on both |
| **Anything on a real Android device** | ❌ **never** |
| **A real signed-in session end to end** | ❌ never — no credentials. Every success path that needs auth (saving a magnet, the WebP upload actually reaching Storage, onboarding) is still unexercised |
| **Types** | ⚠️ no `tsconfig.json`, `typescript` not a dependency. A throwaway full-strict run found 7 errors, all pre-existing on `main` — see open issue 7 |

---

## Open issues, highest value first

1. **Trip photos are base64 in the DB.** One row is **7.5 MB**. `getPublicFridges`
   no longer fetches them, but `getMagnets` and `getFridge` still do — so that
   magnet's owner re-downloads 7.5 MB every time they open their own fridge.
   The real fix is moving them to Supabase Storage like the cutouts. Needs a
   migration for existing rows.
2. **Fridge overflows the bottom nav by ~200px** (194 Pixel 7 / 245 Galaxy S8).
   The base of the appliance is cut off. A fix was written and then reverted by
   request — the tradeoff is a narrower fridge (317px of 412px) to fit it whole.
3. **Fridge id space is 10,000.** `abs(hash) % 10000` → ~50% chance of a
   collision at ~118 users, and a collision makes one fridge unreachable.
   Measured 2026-09-17: 15 public profiles, 15 distinct ids, **0 collisions** —
   so it works today and the risk is purely about growth. Needs a real
   `fridge_id` column with a uniqueness constraint before the user count climbs.
4. **Android black-fridge bug — the original 2026-08 report, still unconfirmed.**
   Ruled out with evidence: SVG gradients render fine, the svg doesn't collapse,
   `aspect-ratio` is supported, and there is **no service worker in the repo at
   all**, so the "stale SW" theory was never possible. Leading untested theory: a
   `vh`/`dvh` mismatch in `layout.tsx` (outer `min-h-screen` = 100vh, inner
   `100dvh`) which only manifests on mobile browsers with a dynamic toolbar.
5. **5 of 15 public profiles are invisible on the map** — home coords are exactly
   `(0,0)`, i.e. they signed up but never finished home-base onboarding.
6. **`ScreenHeading` is `text-[#171717]`** — byte-identical to `--background`, so
   the "Set your home base" title is dark-on-dark. Fix was written then reverted
   along with the glass bar.
7. **No typecheck in the repo.** The build uses esbuild, which strips types
   without checking them; there is no `tsconfig.json` and `typescript` is not a
   dependency, so `npm run typecheck` cannot run.

   A throwaway full-strict `tsc --noEmit` during the merge review found exactly
   **7 errors, all pre-existing** (the identical set appears on `main`). Two are
   real latent bugs, the rest are cosmetic:

   - `AddMagnet.tsx` / `SetHomeBase.tsx` destructure `reverseGeocode()`'s result
     without a null check — **it returns `{city,country} | null`, so a failed
     geocode is a `TypeError` at runtime.** The genuine bug of the seven.
   - `session.tsx` passes `store.signInWithGoogle()` (which returns `void`,
     being a redirect flow) into `loadFor(p: Profile | null)`, so `profile`
     briefly becomes `undefined` rather than `null`. Harmless today because the
     page is navigating away, and `!profile` still reads as signed-out.
   - `MapScreen.tsx` builds a display-only `Profile` without `email`.
   - `main.tsx` imports with an explicit `.tsx` extension — config, not code.

---

## Routes

| Path | Auth | Notes |
| --- | --- | --- |
| `/landingpage`, `/landing` | public | Marketing. Full-bleed hero, hard-cutting photo stack |
| `/casestudy`, `/case-study` | public | Product design case study |
| `/designsystem` | public | Component showcase |
| `/welcome`, `/auth` | public-only | Signed-in users get bounced to `/fridge` |
| `/fridge`, `/map`, `/add`, `/settings`, `/settings/magnets` | protected | |
| `/fridge/:fridgeId` | protected | Someone else's fridge; resolves by id or router state |

`MapScreen`, `AddMagnet`, `DesignSystem`, `CaseStudy` and `LandingPage` are
`React.lazy`. The full-width pages render outside `PhoneFrame` — see
`isFullWidth` in `App.tsx`; **add new full-width routes to that array or they
render inside the 402pt phone frame.**

---

## Architecture notes worth knowing

- **The fridge is one hand-authored SVG** (`fridge-illustration.tsx`), viewBox
  400×950. `bodyLeftAtY()` returns the body's edge at any height by solving the
  corner Bézier — use it for anything that must sit flush to the silhouette.
  The top trim seam is at `BODY_Y1 + BODY_R`, not a magic number.
- **Magnet placement** is a percentage of `DOOR_ZONE` (`skins.ts`), not pixels.
  Note `APPLIANCE_W` in `FridgeView` derives from a hardcoded `DEVICE_W = 402`
  while mobile actually renders `w-full` — these disagree on any non-402px
  screen, and the error grows with width.
- **Map clustering is measured in screen pixels** (`CLUSTER_RADIUS_PX`), not km,
  so it scales with zoom. Pins sharing a coordinate fan onto 1km rings via
  `ringSlot()`. Those offsets are fabricated for legibility — a pin is not where
  that person is. The real fix is finer location at sign-up.
- **`lib/image.ts`** converts every user photo to WebP on capture. It is
  best-effort by design: every failure path returns the original blob, so
  optimisation can never be why a save fails. Safari <16 can't encode WebP and
  `toBlob` silently returns PNG — that's why extension and contentType are read
  off the resulting blob rather than assumed.
- **`SessionProvider` must always leave the loading state.** `setLoading(false)`
  is in a `finally`, with a 12s timeout. Before that, any backend error left the
  app on `<Splash />` forever.

---

## Testing gotchas that cost real time

- **Headless Chrome ignores `--window-size` for layout.** It reported a 500px
  viewport when asked for 412. Screenshots get cropped to the requested size
  while the page lays out wider, which *looks* exactly like a responsive bug.
  Measure inside a fixed-width **iframe** instead — media queries resolve
  correctly there.
- **`--dump-dom` fires before React mounts**, so an empty `#root` means nothing.
- **Chrome throttles offscreen iframes**, stalling timer chains inside them.
  Keep the iframe on screen when driving it.
- **Scroll-driven animations:** don't verify by scrolling an iframe — it silently
  failed to reach the progress values it claimed and made a working transition
  look broken. Pin the progress value directly instead.
- **Freeze CSS animations** for screenshots with a negative `animation-delay`
  plus `animation-play-state: paused`.
- **Element ids built from display labels break `url(#…)`** — spaces and colons
  in an id silently kill SVG `clipPath`/gradient references.

---

## Conventions

- Use `design-system.tsx` components (`M3Button`, `TextField`, `SearchBar`,
  `GlassSquareIconButton`) rather than hand-rolled equivalents.
- Docs live in `docs/` — `setup/`, `design/`, `project/`, `reference/`.
  `docs/setup/oauth/` has seven overlapping guides that should be collapsed.
- `design/source-images/` holds the 19MB hero masters and is gitignored; the
  shipped copies are `public/hero/*.jpg`.
- Vercel auto-deploys `main`; branches get preview URLs.

---

## Environment

`.env` needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The Supabase
project paused once during development (free tier pauses after ~1 week idle) —
DNS stopped resolving and the app hung on the splash screen. If the app won't
load, check the Supabase dashboard before debugging the code.

**Disk:** the machine hit 100% full mid-session and both `npm run build` and
`git commit` failed with `ENOSPC`. ~2GB free at time of writing.
