# Fridge Magnets — Development Notes

**Last updated:** 2026-09-17
**Live:** https://fridge-magnets-three.vercel.app · **Repo:** izhan1506/Fridge-Magnets
**Stack:** React 18 · Vite · TypeScript · Tailwind v4 · Supabase · MapLibre · motion (Framer)

---

## ⚠️ Read this first

**15 commits sit unmerged on `feat/case-study-and-perf`.**
Nothing below is live. `main` is untouched. Merging that branch is the single
highest-value action available.

```
fd39762 fix(fridge): make shared fridge links actually resolve
5bc756b feat(landing): match hero copy to the app heading style, anchor it to the fridge
281b2ee chore: organise the repo root
4c60b8b feat(landing): hard-cut hero, design-system heading and button
de52c9d feat(landing): photo stack hero that scrolls into the app
208db3d feat: add public landing page at /landingpage
1abe688 feat(add): iOS-style "lift subject" reveal on the cutout
a7cfbe2 fix(session): never strand the app on the loading screen
2e81cc3 feat(casestudy): add research section, step-by-step flow and visuals
7c7948a feat: add public case study page, lazy-load heavy screens
09112ad perf(data): stop fetching trip photos in the map list query
5da0ad4 feat(map): fan out coincident pins and scale clustering with zoom
3570af7 perf(images): convert user photos to WebP on capture
a0db8da style: match SearchBar radius to TextField, relabel magnets row
19fa456 fix(fridge): fit the illustration on screen and clear the header
```

---

## What's verified vs. what isn't

Verified means it was measured or rendered and the result looked at — not "the
code looks right".

| Area | State |
| --- | --- |
| Shared fridge links (`/fridge/fridge-XXXX`) | ✅ 4 real ids resolved to the right owners, ~30ms; unknown id returns null |
| Map query payload | ✅ 7,830 KB → 9.4 KB on real data (99.9%) |
| WebP conversion | ✅ alpha preserved, Safari fallback guarded — but tested with synthetic images, not a real photo through the real flow |
| Session error handling | ✅ stale token + dead backend → error screen with retry, not an infinite spinner |
| Pin ring layout | ✅ 0.999km spacing, deterministic, 500/500 distinct, pole/antimeridian safe |
| Boot bundle | ✅ browser fetches only main JS + CSS; maplibre (1MB) no longer eager |
| Case study / landing pages | ✅ no horizontal scroll at 360/390/768/1280 |
| Hero hard-cut | ✅ no transition/animation on the images |
| **Anything on a real Android device** | ❌ **never** |
| **A real signed-in session end to end** | ❌ never — no credentials |
| **Native share sheet** | n/a — that feature was reverted |
| **Types** | ❌ `typescript` isn't a dependency; `npm run typecheck` cannot run |

---

## Open issues, highest value first

1. **Merge the branch.** 15 verified commits are doing nothing on a branch.
2. **Trip photos are base64 in the DB.** One row is **7.5 MB**. `getPublicFridges`
   no longer fetches them, but `getMagnets` and `getFridge` still do — so that
   magnet's owner re-downloads 7.5 MB every time they open their own fridge.
   The real fix is moving them to Supabase Storage like the cutouts. Needs a
   migration for existing rows.
3. **Fridge overflows the bottom nav by ~200px** (194 Pixel 7 / 245 Galaxy S8).
   The base of the appliance is cut off. A fix was written and then reverted by
   request — the tradeoff is a narrower fridge (317px of 412px) to fit it whole.
4. **Fridge id space is 10,000.** `abs(hash) % 10000` → ~50% chance of a
   collision at ~118 users, and a collision makes one fridge unreachable. Needs
   a real `fridge_id` column with a uniqueness constraint.
5. **Android black-fridge bug — the original 2026-08 report, still unconfirmed.**
   Ruled out with evidence: SVG gradients render fine, the svg doesn't collapse,
   `aspect-ratio` is supported, and there is **no service worker in the repo at
   all**, so the "stale SW" theory was never possible. Leading untested theory: a
   `vh`/`dvh` mismatch in `layout.tsx` (outer `min-h-screen` = 100vh, inner
   `100dvh`) which only manifests on mobile browsers with a dynamic toolbar.
6. **5 of 15 public profiles are invisible on the map** — home coords are exactly
   `(0,0)`, i.e. they signed up but never finished home-base onboarding.
7. **`ScreenHeading` is `text-[#171717]`** — byte-identical to `--background`, so
   the "Set your home base" title is dark-on-dark. Fix was written then reverted
   along with the glass bar.
8. **No typecheck.** Add `typescript` as a devDependency; the build uses esbuild,
   which strips types without checking them.

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
