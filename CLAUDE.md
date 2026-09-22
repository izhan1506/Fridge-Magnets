# Fridge Magnets — Development Notes

**Last updated:** 2026-09-22
**Live:** https://fridge-magnets-three.vercel.app · **Repo:** izhan1506/Fridge-Magnets
**Stack:** React 18 · Vite · TypeScript · Tailwind v4 · Supabase · MapLibre · motion (Framer)

---

## ⚠️ Read this first

Everything is on `main` and live — `feat/case-study-and-perf` was merged
2026-09-17 and the landing page was rebuilt on 2026-09-20. There is no unmerged
work.

Two standing rules, both learned the hard way:

1. **Don't shrink the fridge to make it fit** (open issue 2). That fit has been
   written and reverted twice.
2. **Keep `npm run typecheck` passing** (see "Settled" below). The build strips types
   without checking them, so that command is the only thing that reads them.

The one outstanding action is the trip-photo backfill (open issue 1), which
needs a service-role key and so has to be run by hand.

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
| Case study page | ✅ real render at 360/390/412/768/1280 — `scrollWidth == clientWidth` at every width, full text content present, zero console messages |
| Landing page layout | ✅ measured 2026-09-20 at 320/360/390/640/768/900/1024/1068/1280/1440/1700: no horizontal overflow at any width, nav wordmark on one line, nav links centred to 0px from lg, hero heading holds two lines |
| Hero match cut | ✅ hard cut confirmed — `transition-duration: 0s`, opacity pinned at 1, exactly one frame visible at every sample. Holds ~581ms measured over 240 samples (1.50× faster than the previous 870ms; 4.5× the original 2600ms). Gated on all 8 frames loading: on Fast 3G it holds frame 0 and makes **0 cuts before the set arrives**, then releases. Reduced motion holds frame 0 and never advances |
| Landing page after the 2026-09-22 rebuild | ✅ 0 horizontal overflow at 320/360/390/640/768/900/1024/1068/1280/1440/1700, in **both** themes. Hero heading holds two lines at every width. 0 console entries |
| 3D globe | ✅ boot trace: landing on `/landingpage` and not scrolling fetches **0** globe/three assets; the 231KB gzip chunk and its textures only arrive on scroll. No WebGL → SVG fallback and **0** globe bytes downloaded. `prefers-reduced-motion` holds it still while the control rotates |
| Light theme | ✅ toggle flips every token, persists across reload, and 7 text roles pass WCAG AA in **both** themes. Brand orange is identical in both |
| Production deploy (2026-09-22) | ✅ verified on the live URL, not just pushed: all 6 new assets serve as `image/webp` with matching byte sizes, globe renders with 13 markers, 0 failed requests, 0 console entries |
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
3. **Fridge id — code shipped 2026-09-22, MIGRATION NOT YET RUN.**
   `abs(hash) % 10000` → ~50% chance of a collision at ~118 users, and a
   collision makes one fridge unreachable. 15 public profiles, 15 distinct ids,
   **0 collisions** today.

   `supabase/migrations/0004_fridge_id.sql` adds the column, the uniqueness
   constraint and allocation at signup. It has **not been applied** — it needs
   the SQL Editor or a direct Postgres connection, because PostgREST can't do
   DDL. Then `scripts/assign-fridge-ids.mjs --apply` backfills it (service-role
   key; preserves every existing link, and says so loudly if one must change).

   Safe to be in this half-state: `getFridgeByPublicId` prefers the column and
   falls back to the legacy hash scan on Postgres **42703**, verified against
   production — 15/15 profiles still resolve with the column absent. Once every
   row has an id, the fallback can go.

   The backfill is deliberately **not** in the SQL: reproducing that JS hash
   (int32 wraparound and all) in plpgsql would be a second implementation that
   nothing checks against the first.
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

7. **The globe's 13 avatars are stock portraits.** They come from the
   component's demo and imply users and fridges that do not exist. Every other
   claim on that page is deliberately literal — no invented user counts, no
   testimonials — so this is the one decorative fiction on it, and it is live.
   Swapping in the owner's own magnets or dropping to fewer markers are both
   small changes; the markers are `MARKERS` in `globe-visual.tsx`.

8. **"Instagram stories" overstates what the app does.** The hero subheading
   and step three both say it, but the app takes a **post or Reel** link
   (`AddMagnet.tsx`: "a post or Reel link plays inline"). Instagram Stories are
   the ephemeral 24-hour format and are not what gets attached. The body copy
   under step three is accurate; the headings are not.

---

## Settled, with the reasoning kept

Recorded so nobody re-opens them or repeats the investigation.

### Typecheck — settled 2026-09-17

`typescript`, `@types/react` and
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
| `/landingpage`, `/landing` | public | Marketing. App-icon mark + wordmark "My Fridge Tales" (mark alone below 430px); centred hero ("Turn your travels into tales.") over a 16/9 match-cut photo panel, then how-it-works / map / why / CTA. Footer carries a light/dark toggle scoped to this page |
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
- **`fridge-showcase.tsx` is dead code.** The showcase section and the stat
  strip were removed from the landing page on 2026-09-22; nothing imports it,
  and `public/magnets/*.webp` are unreferenced with it. Both are kept rather
  than deleted so the section is one revert away.
- **The map section's globe is the Aceternity 3D globe**, vendored into
  `ui/3d-globe.tsx` and wrapped by `globe-visual.tsx`. three + fiber v8 +
  drei v9 are **pinned for React 18** — fiber v9 needs React 19, so the plain
  `npx shadcn add` would install a broken combination. The wrapper is what
  keeps it off the boot path: `React.lazy` + a WebGL feature check +
  an IntersectionObserver, falling back to the old hand-drawn SVG. Three
  upstream config props were dead on arrival and are wired up here —
  `initialRotation`, `markerSize` and `marker.size`.
- **`hero-stack.tsx` is a match cut, so the transition must stay a cut.** No
  crossfade, no drift — frames are pre-mounted and toggled with `visibility`.
  It also waits for all eight frames to load before starting; at 870ms a cycle
  is shorter than the download on a slow link, and without the gate it cuts to
  empty frames. If you change `CUT_MS`, re-check that gate.
- **The landing page is the only screen with a light theme.** `theme-toggle.tsx`
  returns a value for `data-theme` on the *page root*, never `<html>` — the app
  screens are dark-only by design and would break. `:root` in `theme.css` **is**
  the dark theme; `[data-theme="light"]` overrides it. The `.dark` block in that
  file is dead shadcn scaffold that nothing applies and is **not this brand**
  (it sets `--primary` to near-white) — never wire a theme switch to it.
  Decorative SVG art is expressed as `color-mix(… var(--foreground) …)` so it
  inverts instead of vanishing on white, and `--primary-ink` exists because
  brand orange only manages 3.04:1 on the light background.
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
- **`Runtime.evaluate` with `returnByValue` can't serialise a DOM node.**
  `waitFor("document.querySelector('h1')")` waits forever because the result
  comes back falsy even though the element exists. Always assert on a boolean or
  a number — `!!document.querySelector(…)` or `.length`.
- **Lazy images inside a `display:none` container never load**, so
  `[...document.images].every(i => i.complete)` can never become true on a page
  with responsive `hidden` blocks. Filter to visible images (`offsetParent !==
  null`) before waiting on them.
- **`Page.captureScreenshot` won't capture below the fold.** Clipping to a
  section's `getBoundingClientRect()` without scrolling to it first returns a
  blank image — it looks exactly like a section that failed to render. Scroll it
  into view, then shoot.
- **Assert geometry, don't eyeball it.** Overlap bugs in the showcase (cards
  sitting on top of the phone at one breakpoint) were invisible in the
  screenshots that mattered and obvious the moment rectangles were intersected
  in code. Same for "is this centred" — compare against `clientWidth / 2`.
- **A 200 from Vercel proves nothing about an asset.** The SPA's catch-all
  rewrite serves `index.html` for any unknown path, so a missing file returns
  `200 text/html`. Check `content-type` against a known-bad control path.
- **Grid items have `min-width: auto`, and it silently overrides `fr` tracks.**
  Bit twice in one day: react-three-fiber puts a `width` attribute on its
  `<canvas>`, and an `aspect-ratio` cell derives a minimum from its height —
  both made a column refuse to shrink, once overflowing a 320px screen by 33px
  and once handing an image 76% of a banner. `min-w-0` is the fix.
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
- `public/magnets/*.webp` are five real cutouts from the owner's own fridge.
  **No longer used on the landing page** since the showcase was removed. **Only the owner's magnets** — the Storage bucket
  also holds four other users' cutouts, which are not ours to put on a marketing
  page. They were prepared by cropping to the **alpha bounding box** and then
  re-encoding: 9.1MB of camera-resolution PNGs → 314KB. The crop matters as much
  as the resize; background removal leaves so much transparent margin that the
  subject filled only ~19-27% of each frame, so `object-contain` rendered them
  far smaller than they should be.
- Vercel auto-deploys `main`; branches get preview URLs.

---

## Environment

`.env` needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The Supabase
project paused once during development (free tier pauses after ~1 week idle) —
DNS stopped resolving and the app hung on the splash screen. If the app won't
load, check the Supabase dashboard before debugging the code.

**Disk:** the machine hit 100% full mid-session and both `npm run build` and
`git commit` failed with `ENOSPC`. ~2GB free at time of writing.
