import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { HeroMatchCut, HERO_SHOTS } from "../hero-stack";
import { M3Button } from "../design-system";
import { ThemeToggle, useTheme } from "../theme-toggle";
import { GlobeVisual } from "../globe-visual";

/**
 * Public marketing page at /landingpage. Rendered full-bleed, outside
 * PhoneFrame (see AppLayout), and deliberately unauthenticated.
 *
 * Claims here are kept to things that are actually true of the product —
 * on-device processing is a real property of the WASM background remover. No
 * invented user counts or testimonials.
 */

/** Shipped copy of design/source-images/Smartphone-Presentation-Mockup.png
 *  (that folder is gitignored): cropped to the phone and hand and re-encoded,
 *  6.7MB PNG -> 41KB WebP. */
const CTA_MOCKUP = "/cta/phone-in-hand.webp";

/** 128px WebP of public/app-icon.png, for the nav mark. */
const LOGO_MARK = "/logo-mark.webp";

/* ── Pieces ──────────────────────────────────────────────────────────────── */

/**
 * The inline magnet that sits in the headline.
 *
 * Not an icon of a magnet — an actual one. Same construction as the souvenir
 * magnets stuck to the fridge in the hero photographs directly below: a travel
 * photo in a white-bordered square, tacked on at a slight angle with a real
 * drop shadow. So the headline's own punctuation is a specimen of the thing the
 * product makes, and it rhymes with the photo panel underneath.
 *
 * `hero-01` is already fetched eagerly for the match cut, so reusing it here
 * costs nothing and ties the glyph to the first frame of the sequence.
 *
 * Sized in `em` throughout so it tracks the heading at every breakpoint rather
 * than drifting out of alignment on mobile.
 */
function MagnetGlyph() {
  return (
    <span
      aria-hidden="true"
      className="relative inline-block"
      style={{
        width: "0.78em",
        height: "0.78em",
        // Sits on the baseline, tipped like something placed by hand.
        transform: "rotate(-8deg)",
        verticalAlign: "-0.04em",
        filter: "drop-shadow(0 0.06em 0.08em rgba(0,0,0,0.45))",
      }}
    >
      <span
        className="block h-full w-full overflow-hidden bg-white"
        style={{ borderRadius: "0.1em", padding: "0.055em" }}
      >
        <img
          src={HERO_SHOTS[0].src}
          alt=""
          draggable={false}
          className="h-full w-full select-none object-cover"
          style={{ borderRadius: "0.055em" }}
        />
      </span>
    </span>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  /* primary-ink, not primary: at 11px the brand orange fails AA on the
     light background. Identical to --primary in the dark theme. */
  return <p className="text-[11px] uppercase tracking-[0.22em] text-primary-ink">{children}</p>;
}

function Section({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`py-20 md:py-28 ${className}`}>{children}</section>;
}

function Feature({ art, title, children }: { art: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-[0.75rem] border border-border bg-card p-7">
      <div className="mb-5 flex h-28 items-center justify-center rounded-[0.5rem] bg-background">{art}</div>
      <h3 className="font-fridge text-xl leading-tight md:text-2xl">{title}</h3>
      <p className="mt-2.5 leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

/* Art colours are expressed against --foreground rather than hardcoded
   white, so the decorative SVGs invert with the theme instead of vanishing
   on a light background. */
const STROKE = "color-mix(in srgb, var(--foreground) 50%, transparent)";
const ART_SOLID = "color-mix(in srgb, var(--foreground) 85%, transparent)";
const ART_SOLID_DIM = "color-mix(in srgb, var(--foreground) 62%, transparent)";

function Art({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 120 90" className="h-24 w-full" aria-hidden="true">{children}</svg>;
}

/* ── Illustrations ───────────────────────────────────────────────────────── */

const artScan = (
  <Art>
    <rect x="32" y="14" width="56" height="60" rx="8" fill="none" stroke={STROKE} />
    {[[36, 18, 1, 1], [84, 18, -1, 1], [36, 70, 1, -1], [84, 70, -1, -1]].map(([x, y, sx, sy], i) => (
      <path key={i} d={`M${x} ${(y as number) + 9 * (sy as number)} L${x} ${y} L${(x as number) + 9 * (sx as number)} ${y}`}
        fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
    ))}
    <circle cx="60" cy="44" r="12" fill={ART_SOLID} />
  </Art>
);

const artPlace = (
  <Art>
    <rect x="40" y="10" width="40" height="70" rx="8" fill={ART_SOLID} />
    <rect x="40" y="23" width="40" height="1.6" fill={ART_SOLID_DIM} />
    <circle cx="56" cy="42" r="8" fill="var(--primary)" />
    <circle cx="70" cy="60" r="6.5" fill="var(--tertiary)" />
  </Art>
);

const artPrivacy = (
  <Art>
    <path d="M60 14l22 8v20c0 14-9.4 25.4-22 30-12.6-4.6-22-16-22-30V22l22-8z"
      fill="none" stroke={STROKE} strokeWidth="2" />
    <path d="M52 44l6 6 12-13" fill="none" stroke="var(--tertiary)" strokeWidth="3.4"
      strokeLinecap="round" strokeLinejoin="round" />
  </Art>
);

const artStory = (
  <Art>
    <rect x="34" y="12" width="52" height="66" rx="8" fill="none" stroke={STROKE} />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={40 + i * 14} y="8" width="10" height="3" rx="1.5"
        fill={i === 0 ? "var(--primary)" : "color-mix(in srgb, var(--foreground) 22%, transparent)"} />
    ))}
    <circle cx="60" cy="38" r="11" fill="color-mix(in srgb, var(--foreground) 14%, transparent)" />
    <rect x="44" y="58" width="32" height="5" rx="2.5" fill="color-mix(in srgb, var(--foreground) 16%, transparent)" />
    <rect x="50" y="68" width="20" height="5" rx="2.5" fill="color-mix(in srgb, var(--foreground) 10%, transparent)" />
  </Art>
);

/**
 * Step three: the magnet linked to the post behind it.
 *
 * Deliberately not another rounded portrait rectangle — artPlace (a fridge)
 * and artStory (a phone) already are, and putting a third beside them made
 * steps two and three read as the same picture at 96px. This one is a story
 * ring with a play mark, tethered to a magnet, so the row has three distinct
 * silhouettes.
 */
const artConnect = (
  <Art>
    {/* the magnet */}
    <rect x="18" y="33" width="24" height="24" rx="5" fill={ART_SOLID} />
    {/* the tether */}
    <path d="M44 45 H58" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" />
    {/* the story ring */}
    <circle cx="82" cy="45" r="21" fill="none" stroke="var(--primary)" strokeWidth="3" />
    <circle cx="82" cy="45" r="14" fill="color-mix(in srgb, var(--foreground) 14%, transparent)" />
    {/* play */}
    <path d="M78 39 L89 45 L78 51 Z" fill="var(--primary)" />
  </Art>
);

/* ── Page ────────────────────────────────────────────────────────────────── */

export function LandingPage() {
  const nav = useNavigate();
  const [theme, toggleTheme] = useTheme();

  return (
    /* data-theme scopes the palette to this page. It is deliberately not on
       <html>: only the marketing page has a light theme, and the app screens
       behind /fridge and /map are dark-only by design. */
    <div data-theme={theme} className="min-h-screen bg-background text-foreground">
      {/* ── Nav ──
          Three tracks, so the wordmark is centred on the page rather than
          centred in whatever space the side groups leave over. The nav links
          are anchors to sections that genuinely exist further down. */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-[10px]">
        {/* Below lg this collapses to a two-track flex row — wordmark left,
            actions right, links hidden — because there is no room for the link
            group. The switch is at lg, not md: at exactly 768px the four links
            plus the actions overflow the page by 8px. */}
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:gap-3 sm:px-5 md:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4">
          {/* A step down below sm: "My Fridge Tales" plus "Log in" plus the
              pill overflows a 360px screen by 3px at text-xl. */}
          {/* The app's own home-screen icon, shipped small: /app-icon.png is a
              203KB 496px PNG for the manifest, which is a lot to fetch for a
              36px mark, so this is a 3KB 128px WebP of the same artwork. */}
          <Link to="/landingpage" className="flex items-center gap-2.5 lg:justify-self-start">
            <img
              src={LOGO_MARK}
              alt=""
              aria-hidden="true"
              draggable={false}
              /* 8px — a slight softening, the same step the page uses for its
                 small surfaces. A 4xl radius (32px) is clamped by CSS to
                 half the box on a 36px mark, which renders a full circle. */
              className="h-9 w-9 shrink-0 select-none rounded-[0.5rem]"
            />
            {/* The mark costs ~44px of a nav that was already tight: with the
                wordmark too, the row overflows by 44px at 360, 21px at 320 and
                14px at 390, and first fits at ~410. Below that the mark stands
                in for the wordmark on its own — same rationale as "Log in"
                dropping under 360. */}
            <span className="font-fridge whitespace-nowrap text-lg leading-none max-[429px]:hidden sm:text-xl">
              My Fridge Tales
            </span>
          </Link>

          {/* Centred on the page, not in the leftover space: the two outer
              tracks are both 1fr, so the auto middle track lands on the page's
              centre line regardless of how wide the wordmark or actions are. */}
          <div className="hidden items-center gap-7 text-muted-foreground lg:flex lg:justify-self-center">
            <a href="#how" className="whitespace-nowrap transition hover:text-foreground">How it works</a>
            <a href="#map" className="whitespace-nowrap transition hover:text-foreground">The map</a>
            <a href="#why" className="whitespace-nowrap transition hover:text-foreground">Why it's different</a>
            <Link to="/casestudy" className="whitespace-nowrap transition hover:text-foreground">Case study</Link>
          </div>

          <div className="flex items-center gap-1 lg:justify-self-end lg:gap-4">
            {/* Below 360px the longer wordmark, "Log in" and the pill can't all
                fit. The pill wins: /auth handles signing in as well as signing
                up, so nothing becomes unreachable. */}
            <Link to="/auth" className="whitespace-nowrap px-2 py-1 transition hover:text-primary max-[359px]:hidden">
              Log in
            </Link>
            <M3Button
              onClick={() => nav("/auth")}
              className="whitespace-nowrap"
            >
              Start collecting
            </M3Button>
          </div>
        </nav>
      </header>

      {/* ── Hero ──
          Type on the page, photograph underneath. The copy is the app's own
          (Welcome screen), and the photo panel is the match cut: one fridge,
          eight places, cutting on the object. */}
      <section className="mx-auto w-full max-w-6xl px-5 pt-8 pb-20 text-center md:px-8 md:pt-12 md:pb-28">
        {/* 30% down from 52/72/96px. Kept as explicit values rather than
            snapping to Tailwind's scale, which has nothing within 7% of the
            large end. */}
        {/* Back to the product's own line — the same one the footer tagline
            and the case study hero use, so the three agree. The accent and the
            inline magnet sit on the last word, as before.

            Short enough again that the top size step is back at md; it was
            moved to lg only because the previous, much longer headline wrapped
            each half at 768. */}
        <h1 className="mx-auto max-w-4xl text-balance font-fridge text-[2.275rem] leading-[1.15] tracking-tight sm:text-[3.15rem] md:text-[4.2rem]">
          Turn your travels
          <br />
          into <MagnetGlyph /> <span className="text-primary">tales.</span>
        </h1>

        {/* Three beats, in the order they happen: collect the souvenir, put it
            on the fridge, tie it back to the post you already made. */}
        <p className="mx-auto mt-7 max-w-2xl text-balance leading-relaxed text-muted-foreground md:text-lg">
          Collect magnets from your trip, place on your digital fridge and
          connect them to your Instagram posts.
        </p>

        {/* One route out of the hero, not two. The case study is still linked
            from the nav and the footer, so dropping it here costs nothing and
            stops the page offering a reader two competing next steps at the
            top. Full-width on mobile so it is never a small target. */}
        <div className="mt-6 flex flex-col items-stretch justify-center sm:flex-row sm:items-center">
          <M3Button onClick={() => nav("/auth")} className="sm:!px-8">
            Start your collection — it's free
          </M3Button>
        </div>

        <HeroMatchCut className="mt-8 md:mt-10" />
      </section>

      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        {/* ── How it works ── */}
        <Section className="!pt-0 scroll-mt-24" id="how">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-5 max-w-2xl font-fridge text-4xl leading-[1.15] md:text-6xl">
            Three steps, and the hard one is automatic.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <Feature art={artScan} title="Take a picture of your magnet">
              Photograph it on your real fridge, or pick a photo you already have.
              The background then cuts itself out — that is the hard step, and you
              do not do it.
            </Feature>
            <Feature art={artPlace} title="Place it on your fridge">
              Drop it anywhere on the door. Tilt it, overlap it, move it whenever you
              like — it's your fridge, not a grid.
            </Feature>
            <Feature art={artConnect} title="Connect your Instagram posts">
              Add the post or Reel behind the trip and it plays inline when someone
              taps the magnet.
            </Feature>
          </div>
        </Section>

        {/* ── Map ── */}
        <Section className="!pt-0 scroll-mt-24" id="map">
          <div className="grid items-center gap-12 rounded-2xl border border-border bg-surface-sunken p-8 md:grid-cols-[1.25fr_1fr] md:p-10">
            <div>
              <Eyebrow>The map</Eyebrow>
              <h2 className="mt-5 font-fridge text-3xl leading-tight md:text-5xl">
                Your fridge is your base address.
              </h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                Pick a home base and your fridge appears on a shared world map.
                Wander it, open someone else's door, and see what they brought back
                from somewhere you've never been.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                No follower counts, no ranking, no feed. Just fridges, where their
                owners live.
              </p>
            </div>
            {/* min-w-0: react-three-fiber puts a `width` attribute on the
                <canvas>, which gives it an intrinsic width. Grid items default
                to `min-width: auto`, so without this the column refuses to
                shrink below that number and the whole card — text included —
                overflows a 320px screen. */}
            <div className="flex min-w-0 items-center justify-center">
              {/* No max-width: the globe takes the whole column, which is the
                  wider of the two tracks above. */}
              <div className="w-full">
                <GlobeVisual />
              </div>
            </div>
          </div>
        </Section>

        {/* ── Why ── */}
        <Section className="!pt-0 scroll-mt-24" id="why">
          <Eyebrow>Why it's different</Eyebrow>
          <h2 className="mt-5 max-w-2xl font-fridge text-4xl leading-[1.15] md:text-6xl">
            Built to be kept, not scrolled.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <Feature art={artPrivacy} title="Your photos stay yours">
              Background removal runs on your own device — the photo you take inside
              your home is never uploaded to be processed.
            </Feature>
            <Feature art={artStory} title="Every magnet has a story">
              Add the city, a line about the trip, and a link to the post if you made
              one. Tap a magnet to read it back.
            </Feature>
            <Feature art={artPlace} title="A collection, not a feed">
              A fridge fills up over years, not minutes. Nothing expires, nothing gets
              buried, and nothing is ordered by an algorithm.
            </Feature>
          </div>
        </Section>

        {/* ── CTA ── */}
        <Section className="!pt-0">
          {/* Two panels: copy left, mockup right, the mockup bleeding to the
              top, right and bottom edges. The image cell carries a 2:3 aspect
              so IT sets the row height — that is what lets the whole phone show
              instead of being clipped. At these widths object-cover scales the
              900x1209 asset to the cell's full height and trims ~58px off the
              sides, which is the hand, not the phone. */}
          <div className="relative overflow-hidden rounded-2xl border border-border md:grid md:grid-cols-[1.04fr_1fr]">
            <div
              className="pointer-events-none absolute inset-0 z-10"
              style={{ background: "radial-gradient(circle at 50% 0%, rgba(244,97,0,0.20), transparent 62%)" }}
            />

            {/* Copy sizes are unchanged; it is vertically centred against the
                taller image panel rather than sitting at the top of it. */}
            <div className="relative z-20 px-8 py-16 text-center md:flex md:flex-col md:justify-center md:px-14 md:py-20 md:text-left">
              <h2 className="mx-auto max-w-3xl font-fridge text-4xl leading-[1.15] md:mx-0 md:text-6xl">
                Your next trip deserves better than the camera roll.
              </h2>
              <p className="mx-auto mt-6 max-w-lg leading-relaxed text-muted-foreground md:mx-0">
                Start with one magnet. The fridge fills itself from there.
              </p>
              <div className="md:self-start">
                <M3Button onClick={() => nav("/auth")} className="mt-9 !px-8">
                  Start your fridge — it's free
                </M3Button>
              </div>
            </div>

            {/* Below md there is no room beside the copy, so it sits under it
                as a band cropped to the magnets. */}
            {/* min-w-0 is load-bearing: a grid item's automatic minimum size is
                derived from its aspect-ratio and its height, so without it this
                cell demanded rowHeight x 2/3 of width and silently overrode the
                fr tracks — at 768 that handed the image 76% of the banner and
                squeezed the copy into 169px. */}
            <div className="relative h-56 w-full min-w-0 md:h-auto md:aspect-[2/3]">
              <img
                src={CTA_MOCKUP}
                alt="The app open on a phone, a fridge with magnets stuck to its door"
                draggable={false}
                className="absolute inset-0 h-full w-full select-none object-cover object-[50%_35%] md:object-center"
              />
            </div>
          </div>
        </Section>

        {/* ── Footer ── */}
        <footer className="flex flex-col gap-6 border-t border-border/60 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-fridge text-2xl">My Fridge Tales</p>
            <p className="mt-1 text-muted-foreground">Turn your travels into tales.</p>
          </div>
          <div className="flex flex-col gap-6 sm:items-end">
            <div className="flex flex-wrap gap-x-7 gap-y-2 text-muted-foreground">
              <Link to="/casestudy" className="transition hover:text-foreground">Case study</Link>
              <Link to="/auth" className="transition hover:text-foreground">Sign in</Link>
              <Link to="/fridge" className="transition hover:text-foreground">Open the app</Link>
            </div>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </footer>
      </div>
    </div>
  );
}
