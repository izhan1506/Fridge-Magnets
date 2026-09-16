import { type ReactNode } from "react";
import { Link } from "react-router";
import { HeroStack } from "../hero-stack";

/**
 * Public marketing page at /landingpage. Rendered full-bleed, outside
 * PhoneFrame (see AppLayout), and deliberately unauthenticated.
 *
 * Claims here are kept to things that are actually true of the product — the
 * city count is read off geo.ts, and on-device processing is a real property of
 * the WASM background remover. No invented user counts or testimonials.
 */

const CITY_COUNT = 192;
const COUNTRY_COUNT = 96;

/* ── Pieces ──────────────────────────────────────────────────────────────── */

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[11px] uppercase tracking-[0.22em] text-primary">{children}</p>;
}

function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`py-20 md:py-28 ${className}`}>{children}</section>;
}

function Feature({ art, title, children }: { art: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-7">
      <div className="mb-5 flex h-28 items-center justify-center rounded-2xl bg-background">{art}</div>
      <h3 className="font-fridge text-xl leading-tight md:text-2xl">{title}</h3>
      <p className="mt-2.5 leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

const STROKE = "rgba(245,245,240,0.5)";

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
    <circle cx="60" cy="44" r="12" fill="#DDD9D0" />
  </Art>
);

const artCut = (
  <Art>
    <defs>
      <pattern id="lp-checker" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="rgba(255,255,255,0.04)" />
        <rect width="4" height="4" fill="rgba(255,255,255,0.07)" />
        <rect x="4" y="4" width="4" height="4" fill="rgba(255,255,255,0.07)" />
      </pattern>
    </defs>
    <rect x="28" y="14" width="64" height="60" rx="8" fill="url(#lp-checker)" stroke={STROKE} />
    <circle cx="60" cy="44" r="15" fill="#DDD9D0" />
    <circle cx="60" cy="44" r="20" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="4 4" />
  </Art>
);

const artPlace = (
  <Art>
    <rect x="40" y="10" width="40" height="70" rx="8" fill="#DDD9D0" />
    <rect x="40" y="23" width="40" height="1.6" fill="#B9B7B0" />
    <circle cx="56" cy="42" r="8" fill="var(--primary)" />
    <circle cx="70" cy="60" r="6.5" fill="var(--tertiary)" />
  </Art>
);

/** Full-size map visual for the map section (the h-24 Art icon is far too
 *  small to carry a half-width column on its own). */
const mapVisual = (
  <svg viewBox="0 0 240 200" className="h-auto w-full" aria-hidden="true">
    <defs>
      <radialGradient id="lp-map-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(244,97,0,0.18)" />
        <stop offset="100%" stopColor="rgba(244,97,0,0)" />
      </radialGradient>
    </defs>
    <circle cx="120" cy="100" r="92" fill="url(#lp-map-glow)" />
    <circle cx="120" cy="100" r="78" fill="none" stroke="rgba(245,245,240,0.16)" />
    <ellipse cx="120" cy="100" rx="78" ry="30" fill="none" stroke="rgba(245,245,240,0.13)" strokeDasharray="4 5" />
    <ellipse cx="120" cy="100" rx="78" ry="58" fill="none" stroke="rgba(245,245,240,0.10)" strokeDasharray="4 5" />
    <ellipse cx="120" cy="100" rx="34" ry="78" fill="none" stroke="rgba(245,245,240,0.13)" strokeDasharray="4 5" />
    <line x1="42" y1="100" x2="198" y2="100" stroke="rgba(245,245,240,0.13)" strokeDasharray="4 5" />
    {[[86, 74, 1], [150, 86, 0.85], [112, 132, 0.95], [168, 140, 0.7]].map(([x, y, k], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
        <ellipse cx="0" cy="3" rx="9" ry="3" fill="rgba(0,0,0,0.45)" />
        <path d="M0 -30c-7.2 0-13 5.5-13 12.4C-13 -8.6 0 2 0 2s13-10.6 13-19.6C13 -24.5 7.2 -30 0 -30z" fill="var(--primary)" />
        <circle cx="0" cy="-17.6" r="4.6" fill="#fff" />
      </g>
    ))}
  </svg>
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
        fill={i === 0 ? "var(--primary)" : "rgba(255,255,255,0.22)"} />
    ))}
    <circle cx="60" cy="38" r="11" fill="rgba(255,255,255,0.14)" />
    <rect x="44" y="58" width="32" height="5" rx="2.5" fill="rgba(255,255,255,0.16)" />
    <rect x="50" y="68" width="20" height="5" rx="2.5" fill="rgba(255,255,255,0.10)" />
  </Art>
);

/* ── Page ────────────────────────────────────────────────────────────────── */

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-[10px]">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <span className="font-fridge text-xl">Fridge</span>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/casestudy" className="hidden px-2 py-1 text-muted-foreground transition hover:text-foreground sm:block">
              Case study
            </Link>
            <Link
              to="/auth"
              className="inline-flex h-10 items-center rounded-xl border border-white/30 bg-white/10 px-4 backdrop-blur-[7px] transition hover:bg-white/20"
            >
              Sign in
            </Link>
          </div>
        </nav>
      </header>

      <HeroStack />

      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        {/* ── Hero ── handled by HeroStack, which owns its own sticky
            scroll stage and so sits outside the page's max-width wrapper. */}
        {/* ── Stat strip ── */}
        <div className="grid grid-cols-2 gap-6 border-y border-border/60 py-10 sm:grid-cols-4">
          {[
            [`${CITY_COUNT}`, "cities to pin"],
            [`${COUNTRY_COUNT}`, "countries"],
            ["1 tap", "to cut the background"],
            ["0", "ads, likes or rankings"],
          ].map(([big, small]) => (
            <div key={small}>
              <p className="font-fridge text-3xl leading-none md:text-4xl">{big}</p>
              <p className="mt-2 text-muted-foreground">{small}</p>
            </div>
          ))}
        </div>

        {/* ── How it works ── */}
        <Section>
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-5 max-w-2xl font-fridge text-4xl leading-none md:text-6xl">
            Three steps, and the hard one is automatic.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <Feature art={artScan} title="Snap it">
              Photograph the magnet on your real fridge, or pick a photo you already
              have. No cropping, no framing guides — just take the picture.
            </Feature>
            <Feature art={artCut} title="It cuts itself out">
              The background disappears on its own, turning a kitchen snapshot into a
              clean object with a real silhouette.
            </Feature>
            <Feature art={artPlace} title="Place it">
              Drop it anywhere on the door. Tilt it, overlap it, move it whenever you
              like — it's your fridge, not a grid.
            </Feature>
          </div>
        </Section>

        {/* ── Map ── */}
        <Section className="!pt-0">
          <div className="grid items-center gap-12 rounded-[2rem] border border-border bg-card p-8 md:grid-cols-2 md:p-14">
            <div>
              <Eyebrow>The map</Eyebrow>
              <h2 className="mt-5 font-fridge text-3xl leading-tight md:text-5xl">
                Every fridge has an address.
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
            <div className="flex items-center justify-center">
              <div className="w-full max-w-[380px]">{mapVisual}</div>
            </div>
          </div>
        </Section>

        {/* ── Why ── */}
        <Section className="!pt-0">
          <Eyebrow>Why it's different</Eyebrow>
          <h2 className="mt-5 max-w-2xl font-fridge text-4xl leading-none md:text-6xl">
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
          <div className="relative overflow-hidden rounded-[2rem] border border-border px-8 py-16 text-center md:px-14 md:py-20">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(circle at 50% 0%, rgba(244,97,0,0.20), transparent 62%)" }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-3xl font-fridge text-4xl leading-[0.95] md:text-6xl">
                Your next trip deserves better than the camera roll.
              </h2>
              <p className="mx-auto mt-6 max-w-lg leading-relaxed text-muted-foreground">
                Start with one magnet. The fridge fills itself from there.
              </p>
              <Link
                to="/auth"
                className="mt-9 inline-flex items-center justify-center rounded-2xl border border-white/30 bg-primary px-8 text-primary-foreground transition hover:brightness-105"
                style={{ height: 54 }}
              >
                Start your fridge — it's free
              </Link>
            </div>
          </div>
        </Section>

        {/* ── Footer ── */}
        <footer className="flex flex-col gap-6 border-t border-border/60 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-fridge text-2xl">Fridge</p>
            <p className="mt-1 text-muted-foreground">Turn your travels into tales.</p>
          </div>
          <div className="flex flex-wrap gap-x-7 gap-y-2 text-muted-foreground">
            <Link to="/casestudy" className="transition hover:text-foreground">Case study</Link>
            <Link to="/auth" className="transition hover:text-foreground">Sign in</Link>
            <Link to="/fridge" className="transition hover:text-foreground">Open the app</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
