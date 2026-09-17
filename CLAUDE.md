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
| **Types** | ✅ `npm run typecheck` works and **passes clean** under full `strict`. `typescript` + React types are devDependencies and `tsconfig.json` is checked in |

---

## Open issues, highest value first

1. **Trip photos — code done, migration still to run.** New trip photos go to
   Supabase Storage (`magnet-photos/<userId>/<magnetId>-trip.<ext>`, same bucket
   and prefix as the cutouts, so no new bucket or RLS policy). **The 3 legacy
   rows are still base64** until you run the backfill:

   ```
   node scripts/check-trip-photos.mjs                    # read-only audit, anon key
   SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-trip-photos.mjs          # dry run
   SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-trip-photos.mjs --apply
   ```

   It needs the service-role key because the rows span three users and RLS
   blocks the anon key. Idempotent, and it confirms each upload is publicly
   readable before repointing the row. Current state: 17 magnets, 3 with a trip
   photo, `select("*")` over all of them = **7.65 MB**; user `40f5b3ca`
   downloads **7.41 MB** per fridge open.

   Note the migration moves bytes verbatim — it does not re-encode. The Berlin
   photo stays a 5.6 MB JPEG object; the win is that it leaves the row, so it's
   fetched only when the story viewer opens it.
2. **Fridge overflows the bottom nav by ~200px — WON'T FIX. Do not "fix" this
   again without asking.** The base of the appliance is cut off: measured 194px
   past the nav on a Pixel 7, 279px with browser chrome, 245px on a Galaxy S8,
   211px in the desktop frame.

   A working fit has now been written and **reverted twice by request** — once
   in 2026-08, and again on 2026-09-17. Both times the reason was the same: the
   illustration is 2.375× taller than wide, so fitting it whole means deriving
   its width from the available height, which shrinks it to ~315px of a 412px
   Pixel 7 and leaves wide empty margins either side. **A big fridge that runs
   off the bottom is preferred to a small one that fits.**

   If it is ever revisited, the fix itself is known and is not the hard part
   (see `f3dcb1e`, reverted in `HEAD`): measure the available box with a
   ResizeObserver and derive the width, minus the shared `BOTTOM_NAV_H`. There
   is no pure-CSS form — `aspect-ratio` + `max-height` clamps the height without
   narrowing the width, which just breaks the ratio. The real fix is a shorter
   fridge illustration, not a smaller one.
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
7. ~~**No typecheck.**~~ **Done.** `typescript`, `@types/react` and
   `@types/react-dom` are devDependencies, `tsconfig.json` is checked in, and
   `npm run typecheck` passes clean under full `strict`. **Keep it passing** —
   the build strips types without checking them, so this command is the only
   thing that ever reads them.

   The 7 errors it originally surfaced (the identical set was on `main`, so the
   landing/perf branch added none) are all fixed:

   - `AddMagnet.tsx` / `SetHomeBase.tsx` destructured `reverseGeocode()`'s
     result without a null check. **Correction to an earlier note in this file
     that called this a live crash: it isn't.** `CITIES` is a hardcoded
     193-entry literal, so the `null` branch is unreachable today. The call
     sites are guarded anyway, so it stays safe if that list ever becomes
     data-loaded.
   - `session.tsx` passed `store.signInWithGoogle()` (`void`, being a redirect
     flow) into `loadFor(p: Profile | null)`, setting `profile` to `undefined`
     rather than `null`. Now it just calls it; the profile arrives via
     `onAuthStateChange` on the way back.
   - `MapScreen.tsx` built a display-only `Profile` without `email`.
   - `main.tsx` imports with an explicit `.tsx` extension — handled with
     `allowImportingTsExtensions` rather than churning the source.

---

## Routes

| Path | Auth | Notes |
| --- | --- | --- |
| `/landingpage`, `/landing` | public | Marketing. Wordmark "My Fridge Tales"; centred hero over a contained 16/9 match-cut photo panel |
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
- **`PhoneFrame` renders `children` TWICE** — once in the desktop branch
  (`hidden md:block`) and once in the mobile one (`md:hidden`). A bare
  `document.querySelector` finds the *hidden* copy first and every rect reads 0,
  which looks exactly like a collapsed layout. Scope queries to whichever branch
  has `display !== 'none'`.
- **`Emulation.setDeviceMetricsOverride` did not drive the `md:` breakpoint** in
  headless Chrome here — the desktop branch kept rendering at a 360px override,
  so the app was measured in its 402pt frame while the numbers claimed a phone.
  The fixed-width **iframe** is what actually works (as noted above). Confirm
  you're in the right branch before trusting any measurement.
- **A probe page must import `src/styles/index.css`**, not `theme.css`.
  `index.css` is what pulls in Tailwind; import `theme.css` alone and every
  class silently does nothing — `getComputedStyle` reports `display: block`
  everywhere and the layout looks broken in a very convincing way.
- **Check your selector still matches after a refactor.** A nav probe keyed on
  `h-20` silently stopped matching when that became an inline style, and the
  overflow measurement fell back to the viewport bottom — reporting "fits" for
  the wrong reason.
- **`Prefer: count=exact` makes PostgREST return `206`, not `200`.** A
  `status !== 200` guard rejects perfectly good responses.
- **`Network.responseReceived`'s `encodedDataLength` is headers-only.** Byte
  totals gathered there are nonsense; the URL list is still reliable, and real
  sizes come from the build output or `Network.loadingFinished`.
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
