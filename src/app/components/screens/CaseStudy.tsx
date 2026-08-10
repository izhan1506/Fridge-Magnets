import { type ReactNode } from "react";
import { FridgeIllustration } from "../fridge-illustration";

/**
 * Product design case study — a standalone editorial page at /casestudy,
 * rendered outside PhoneFrame (see AppLayout).
 *
 * Content is drawn from the actual product and build. The research section
 * documents desk research, stated assumptions and a test plan — NOT invented
 * interviews or statistics. Slots marked "To fill in after beta" are deliberate
 * placeholders for real findings; the product hasn't launched.
 */

/* ── Building blocks ─────────────────────────────────────────────────────── */

function Section({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border/60 py-16 md:py-24">
      <div className="mb-8 flex items-baseline gap-4">
        <span className="font-mono text-sm text-primary">{index}</span>
        <h2 className="font-fridge text-3xl leading-none md:text-5xl">{title}</h2>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Lede({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-lg leading-relaxed text-foreground/85 md:text-xl">{children}</p>;
}

function Body({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl leading-relaxed text-muted-foreground">{children}</p>;
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 text-foreground">{value}</dd>
    </div>
  );
}

function Card({ eyebrow, title, children }: { eyebrow?: string; title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-7">
      {eyebrow && <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
      <h3 className="font-fridge text-xl leading-tight md:text-2xl">{title}</h3>
      <div className="mt-3 leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

/** Flags content that is explicitly not yet evidenced. */
function Placeholder({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/[0.06] p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-primary">To fill in after beta</p>
      <p className="mt-2 leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

function BeforeAfter({
  before, after, beforeLabel, afterLabel,
}: { before: ReactNode; after: ReactNode; beforeLabel: string; afterLabel: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[
        { art: before, label: beforeLabel, tone: "text-destructive", tag: "Before" },
        { art: after, label: afterLabel, tone: "text-tertiary", tag: "After" },
      ].map((col) => (
        <figure key={col.tag} className="rounded-3xl border border-border bg-card p-5">
          <div className="flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-background">
            {col.art}
          </div>
          <figcaption className="mt-4">
            <span className={`text-[11px] uppercase tracking-[0.18em] ${col.tone}`}>{col.tag}</span>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{col.label}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* ── Diagrams ────────────────────────────────────────────────────────────── */

function PinDiagram({ spread }: { spread: boolean }) {
  const pins = [0, 1, 2, 3, 4, 5];
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" aria-hidden="true">
      <circle cx="100" cy="60" r="34" fill="none" stroke="rgba(255,255,255,0.10)" strokeDasharray="3 4" />
      {pins.map((i) => {
        const a = (i / pins.length) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={spread ? 100 + Math.cos(a) * 30 : 100 + i * 0.6}
            cy={spread ? 60 + Math.sin(a) * 30 : 60 - i * 0.6}
            r="9" fill="var(--primary)" stroke="#fff" strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}

function FitDiagram({ fits }: { fits: boolean }) {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" aria-hidden="true">
      <rect x="62" y="6" width="76" height="108" rx="10" fill="none" stroke="rgba(255,255,255,0.18)" />
      {fits
        ? <rect x="76" y="20" width="48" height="82" rx="7" fill="#DDD9D0" />
        : <rect x="70" y="20" width="60" height="128" rx="7" fill="#DDD9D0" />}
      <rect x="62" y="100" width="76" height="14" rx="4" fill="rgba(0,0,0,0.55)" />
    </svg>
  );
}

/* ── Step illustrations ──────────────────────────────────────────────────── */

const STROKE = "rgba(245,245,240,0.55)";

function StepArt({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 90" className="h-24 w-full" aria-hidden="true">
      {children}
    </svg>
  );
}

const ART = {
  home: (
    <StepArt>
      <ellipse cx="60" cy="62" rx="38" ry="14" fill="none" stroke={STROKE} strokeDasharray="3 4" />
      <path d="M60 20c-8 0-14 6-14 14 0 10 14 24 14 24s14-14 14-24c0-8-6-14-14-14z" fill="var(--primary)" />
      <circle cx="60" cy="34" r="5" fill="#fff" />
    </StepArt>
  ),
  scan: (
    <StepArt>
      <rect x="30" y="16" width="60" height="58" rx="8" fill="none" stroke={STROKE} />
      {[[34, 20, 1, 1], [86, 20, -1, 1], [34, 70, 1, -1], [86, 70, -1, -1]].map(([x, y, sx, sy], i) => (
        <path key={i} d={`M${x} ${(y as number) + 10 * (sy as number)} L${x} ${y} L${(x as number) + 10 * (sx as number)} ${y}`}
          fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
      ))}
      <circle cx="60" cy="45" r="13" fill="#DDD9D0" />
    </StepArt>
  ),
  cutout: (
    <StepArt>
      <defs>
        <pattern id="cs-checker" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="rgba(255,255,255,0.04)" />
          <rect width="4" height="4" fill="rgba(255,255,255,0.08)" />
          <rect x="4" y="4" width="4" height="4" fill="rgba(255,255,255,0.08)" />
        </pattern>
      </defs>
      <rect x="26" y="16" width="68" height="58" rx="8" fill="url(#cs-checker)" stroke={STROKE} />
      <circle cx="60" cy="45" r="17" fill="#DDD9D0" />
      <circle cx="60" cy="45" r="22" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="4 4" />
    </StepArt>
  ),
  story: (
    <StepArt>
      <rect x="26" y="14" width="68" height="62" rx="8" fill="none" stroke={STROKE} />
      {[24, 38, 52].map((y, i) => (
        <g key={y}>
          <rect x="34" y={y} width={i === 2 ? 30 : 52} height="7" rx="3.5" fill="rgba(255,255,255,0.14)" />
        </g>
      ))}
      <rect x="34" y="63" width="24" height="7" rx="3.5" fill="var(--primary)" />
    </StepArt>
  ),
  place: (
    <StepArt>
      <rect x="38" y="8" width="44" height="74" rx="8" fill="#DDD9D0" />
      <rect x="38" y="22" width="44" height="1.8" fill="#B9B7B0" />
      <circle cx="55" cy="42" r="8" fill="var(--primary)" />
      <circle cx="69" cy="61" r="7" fill="var(--tertiary)" />
    </StepArt>
  ),
  share: (
    // Pill sized to the 11-character id at 12px monospace (~79px) plus padding;
    // at 72px wide the text spilled past both ends of the outline.
    <StepArt>
      <rect x="14" y="31" width="92" height="26" rx="13" fill="none" stroke={STROKE} />
      <text x="60" y="48" textAnchor="middle" fill="var(--primary)"
        style={{ font: "600 12px ui-monospace, monospace" }}>fridge-0426</text>
    </StepArt>
  ),
};

function Step({ n, art, title, children }: { n: string; art: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="mb-4 rounded-2xl bg-background py-4">{art}</div>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-primary">{n}</span>
        <h3 className="font-fridge text-lg leading-tight md:text-xl">{title}</h3>
      </div>
      <p className="mt-2 leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

/** Device mockup rendering the real illustration, not a picture of it. */
function PhoneMock({ label }: { label: string }) {
  return (
    <figure>
      <div className="relative mx-auto w-full max-w-[230px] overflow-hidden rounded-[2rem] border border-border bg-background p-3 shadow-2xl">
        <div className="flex items-center justify-between px-1 pb-3 pt-1">
          <span className="font-fridge text-sm">Your Magnets</span>
          <span className="flex gap-1.5">
            <span className="h-5 w-5 rounded-md border border-white/25 bg-white/10" />
            <span className="h-5 w-5 rounded-md border border-white/25 bg-white/10" />
          </span>
        </div>
        <div className="relative">
          <FridgeIllustration className="w-full select-none" />
          <span className="absolute left-[30%] top-[18%] h-9 w-9 rotate-[-8deg] rounded-lg bg-primary shadow-lg" />
          <span className="absolute left-[52%] top-[34%] h-8 w-8 rotate-[6deg] rounded-lg bg-tertiary shadow-lg" />
          <span className="absolute left-[34%] top-[50%] h-9 w-9 rotate-[3deg] rounded-lg bg-secondary shadow-lg" />
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-black/40 py-2 backdrop-blur">
          <span className="rounded-lg bg-black/80 px-3 py-1 text-[10px]">Fridge</span>
          <span className="px-2 py-1 text-[10px] text-muted-foreground">Map</span>
          <span className="h-6 w-6 rounded-lg bg-primary" />
        </div>
      </div>
      <figcaption className="mt-4 text-center text-sm text-muted-foreground">{label}</figcaption>
    </figure>
  );
}

/** Live specimen pulled from the app's own theme tokens. */
function Specimen() {
  const swatches = [
    ["Primary", "var(--primary)"],
    ["Secondary", "var(--secondary)"],
    ["Tertiary", "var(--tertiary)"],
    ["Surface", "var(--card)"],
    ["Background", "var(--background)"],
  ] as const;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-border bg-card p-6">
        <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-primary">Palette</p>
        <div className="flex flex-wrap gap-3">
          {swatches.map(([name, value]) => (
            <div key={name} className="w-[86px]">
              <div className="h-14 w-full rounded-xl border border-border" style={{ background: value }} />
              <p className="mt-1.5 text-xs text-muted-foreground">{name}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-6">
        <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-primary">Type</p>
        <p className="font-fridge text-4xl leading-none">Anton</p>
        <p className="mt-1 text-sm text-muted-foreground">Display — headings, the wordmark, magnet labels</p>
        <p className="mt-5 text-2xl">Roboto</p>
        <p className="mt-1 text-sm text-muted-foreground">Interface — body copy, forms, navigation</p>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export function CaseStudy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-5 md:px-8">
        {/* ── Hero ── */}
        <header className="pb-16 pt-16 md:pb-24 md:pt-28">
          <p className="text-[11px] uppercase tracking-[0.24em] text-primary">Product design case study</p>
          <div className="mt-8 grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h1 className="font-fridge text-6xl leading-[0.92] md:text-8xl">
                Turn your<br />travels into<br /><span className="text-primary">tales.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-foreground/85 md:text-xl">
                Fridge is a mobile app that turns souvenir photos into magnets on a
                shared, skeuomorphic refrigerator — and pins every trip to a world map
                other travellers can explore.
              </p>
            </div>
            <div className="mx-auto w-44 md:w-full md:max-w-[220px]">
              <FridgeIllustration className="w-full select-none" />
            </div>
          </div>
          <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-border/60 pt-8 sm:grid-cols-4">
            <Meta label="Role" value="Product design & build" />
            <Meta label="Platform" value="Mobile web / PWA" />
            <Meta label="Scope" value="0 → 1, MVP" />
            <Meta label="Status" value="Pre-beta" />
          </dl>
        </header>

        {/* ── 01 ── */}
        <Section index="01" title="The premise">
          <Lede>
            Fridge magnets are the one souvenir people actually keep — and the only one
            with a display surface built into the house. That surface is where the
            memory lives, and it's the part that never makes it online.
          </Lede>
          <Body>
            Travel photos go to a camera roll nobody scrolls back through, or to a feed
            where they're gone in a day. The fridge is the opposite: a small, curated,
            permanent collection you walk past every morning, assembled slowly,
            arranged by hand, and shared with anyone who visits the kitchen.
          </Body>
          <Body>
            The design question was whether that object could move onto a phone without
            losing what makes it work — the physicality, the accumulation, and the fact
            that it's yours before it's anyone else's.
          </Body>
        </Section>

        {/* ── 02 · Research ── */}
        <Section index="02" title="Research">
          <Lede>
            No user interviews have been run yet. What follows is the desk research and
            the assumptions it produced — written down explicitly so they can be
            attacked, rather than dressed up as findings.
          </Lede>

          <h3 className="pt-4 font-fridge text-2xl">Landscape</h3>
          <Body>
            Four categories already hold travel memories. Each is good at something
            Fridge deliberately isn't, and each leaves the same thing out.
          </Body>
          <div className="grid gap-4 md:grid-cols-2">
            <Card eyebrow="Category" title="The camera roll">
              Infinite capacity, zero curation. Everything is kept, so nothing is
              chosen — and a memory you never surface again is functionally lost.
            </Card>
            <Card eyebrow="Category" title="Social feeds">
              Built for reach and recency. A trip performs for 24 hours and then sinks;
              the archive exists but nobody visits it, including the author.
            </Card>
            <Card eyebrow="Category" title="Trip trackers">
              Polarsteps, Journi and similar are excellent at routes, dates and
              distance. They document the journey — the logistics — rather than the
              object you brought home from it.
            </Card>
            <Card eyebrow="Category" title="Physical souvenirs">
              The real thing, already working. It's limited by fridge door space, and
              it's invisible to anyone not standing in your kitchen.
            </Card>
          </div>
          <Body>
            The gap all four share: none treats the souvenir as the unit of memory, and
            none gives a small, finite, deliberately curated collection somewhere to
            live. That's the space Fridge is aimed at.
          </Body>

          <h3 className="pt-8 font-fridge text-2xl">Assumptions on the table</h3>
          <Body>
            The product rests on four beliefs. None is currently evidenced — each is
            paired with the cheapest test I could design for it.
          </Body>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="border-b border-border py-3 pr-4 font-normal">Assumption</th>
                  <th className="border-b border-border py-3 pr-4 font-normal">Risk if wrong</th>
                  <th className="border-b border-border py-3 font-normal">How I'd test it</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {[
                  ["People photograph souvenirs they already own", "The empty-fridge state never fills; there's no first magnet", "Ask 10 travellers to add one magnet unprompted; count who finds a subject"],
                  ["The cutout feels like magic, not like waiting", "Drop-off at the one step with no payoff yet", "Time the step on real devices; test a fake-instant preview against the true wait"],
                  ["A fridge is worth returning to between trips", "Usage collapses to a few days a year", "Measure sessions with no magnet added, and what pulled them in"],
                  ["Strangers' fridges are interesting", "The map is decoration and the social layer is dead weight", "Track map → fridge taps per session before building anything further"],
                ].map(([a, r, t]) => (
                  <tr key={a}>
                    <td className="border-b border-border/60 py-4 pr-4 text-foreground">{a}</td>
                    <td className="border-b border-border/60 py-4 pr-4 text-muted-foreground">{r}</td>
                    <td className="border-b border-border/60 py-4 text-muted-foreground">{t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4">
            <Placeholder>
              Findings from the first 10 beta testers go here — what they tried to add
              first, where they hesitated, and which of the four assumptions above
              survived contact.
            </Placeholder>
          </div>
        </Section>

        {/* ── 03 · Principles ── */}
        <Section index="03" title="Principles">
          <div className="grid gap-4 md:grid-cols-3">
            <Card eyebrow="01" title="Skeuomorphic, on purpose">
              The fridge is drawn, not decorated. It gives every magnet a believable
              place to sit and makes "add" mean something physical instead of appending
              a row to a list.
            </Card>
            <Card eyebrow="02" title="Hand-placed, never a grid">
              Magnets can overlap, tilt, and sit wherever they're dropped. A tidy grid
              would have been easier to build and would have thrown away the metaphor.
            </Card>
            <Card eyebrow="03" title="Yours first, social second">
              The fridge works alone. The map is a place to wander, not a feed with a
              follower count — there are no likes, and nothing is ranked.
            </Card>
          </div>
        </Section>

        {/* ── 04 · How it works ── */}
        <Section index="04" title="How it works">
          <Lede>
            Six steps from opening the app to a magnet on the door. Only one of them
            asks the user to do anything difficult, and it's the first.
          </Lede>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Step n="01" art={ART.home} title="Set your home base">
              Pick a city from 193 worldwide, or drop a pin on the map. This is where
              your fridge sits for everyone else browsing.
            </Step>
            <Step n="02" art={ART.scan} title="Scan the magnet">
              Point the camera at the magnet on your real fridge and shoot — or pick a
              photo from the library. No cropping, no framing guides.
            </Step>
            <Step n="03" art={ART.cutout} title="It cuts itself out">
              The background is removed automatically, on-device, turning a snapshot
              into an object with a real silhouette. Resize it if you want.
            </Step>
            <Step n="04" art={ART.story} title="Add the story">
              City, country, a one-line caption, and optionally an Instagram post — the
              tale behind the magnet, not just the place.
            </Step>
            <Step n="05" art={ART.place} title="Place it on the door">
              It lands with a slight random tilt. Long-press to lift, drag anywhere,
              let go to save. Magnets overlap freely, like the real thing.
            </Step>
            <Step n="06" art={ART.share} title="Share the fridge">
              Every fridge gets a short readable ID. Share it, or let people find you
              by home base on the world map.
            </Step>
          </div>

          <Body>
            Background removal runs entirely in the browser via WebAssembly. That was a
            privacy decision before a technical one — a photo taken inside someone's
            home never leaves the phone to be processed. It costs a large one-time
            model download, which is the trade being made.
          </Body>
        </Section>

        {/* ── 05 · The object ── */}
        <Section index="05" title="Designing the object">
          <Lede>
            The fridge is a single hand-authored SVG on a 400 × 950 canvas, not a
            photograph.
          </Lede>

          <div className="grid items-center gap-8 md:grid-cols-[1fr_1.1fr]">
            <PhoneMock label="The fridge screen — the illustration here is the live component, not a screenshot." />
            <div className="space-y-4">
              <Card title="Why vector">
                It scales to any screen without a second asset, re-colours with the
                theme, weighs a few kilobytes, and lets the magnet placement area be
                defined as a percentage of the door rather than pixels of a bitmap.
              </Card>
              <Card title="Why restrained">
                The fridge is a stage, not the subject. Two soft gradients, one
                specular highlight and two seams — enough to read as an appliance,
                quiet enough that the photos stay the brightest thing on screen.
              </Card>
            </div>
          </div>

          <Body>
            The interface floating over it is frosted glass — navigation, back buttons,
            the tab switcher. Chrome sits above the object without boxing it in, and
            the treatment is reused everywhere so the app reads as one surface with
            things resting on it.
          </Body>

          <div className="pt-4">
            <Specimen />
          </div>
        </Section>

        {/* ── 06 · Problems ── */}
        <Section index="06" title="Two problems worth showing">
          <Lede>
            The interesting work wasn't the happy path — it was the two places where
            the metaphor collided with reality.
          </Lede>

          <div className="pt-4">
            <h3 className="font-fridge text-2xl">A fridge is the wrong shape for a phone</h3>
            <Body>
              A believable refrigerator is roughly 1:2.4. A phone screen, minus a header
              and a nav bar, is far squarer. Sizing the illustration by width alone —
              the obvious approach — made it overflow and get cut off, hiding the bottom
              third of the object.
            </Body>
            <div className="mt-6">
              <BeforeAfter
                before={<FitDiagram fits={false} />} after={<FitDiagram fits />}
                beforeLabel="Width-driven sizing: the fridge runs past the viewport and behind the nav bar, cropping its base."
                afterLabel="Fitted to the smaller of the two axes. The whole object is always visible, at the cost of side margins."
              />
            </div>
            <Body>
              The resolution was to let whichever axis runs out first decide the size,
              and accept a narrower fridge on tall screens. Losing width was the cheaper
              sacrifice — a cropped appliance stops reading as an appliance.
            </Body>
          </div>

          <div className="pt-10">
            <h3 className="font-fridge text-2xl">Everyone in a city is at the same point</h3>
            <Body>
              Home base is chosen as a city, so every user who picks London is stored at
              one identical coordinate. On the map their pins landed exactly on top of
              each other — a city of travellers rendered as a single dot.
            </Body>
            <div className="mt-6">
              <BeforeAfter
                before={<PinDiagram spread={false} />} after={<PinDiagram spread />}
                beforeLabel="Six fridges in one city, stacked on one centroid. Only the top pin is reachable."
                afterLabel="Fanned onto concentric rings a kilometre apart, so each is individually visible and tappable."
              />
            </div>
            <Body>
              Pins sharing a coordinate are now laid out on rings around it, with anyone
              who doesn't collide left exactly where they are. Clustering is measured in
              screen pixels rather than kilometres, so a city collapses to one bubble at
              world zoom and separates as you move in. The offsets are honest fiction:
              a legibility device, and the real fix is finer location data at sign-up.
            </Body>
          </div>
        </Section>

        {/* ── 07 · Performance ── */}
        <Section index="07" title="Making it feel instant">
          <Lede>A memory app that takes six seconds to open isn't a memory app.</Lede>
          <div className="grid gap-4 md:grid-cols-3">
            <Card eyebrow="Payload" title="Split the heavy things out">
              The map engine and the background-removal model were downloaded by
              everyone at launch, including people who only wanted their own fridge.
              Both now load on demand.
            </Card>
            <Card eyebrow="Data" title="Stop over-fetching">
              Opening the map pulled every other user's full-resolution trip photos to
              render a name and a count. The list query now asks only for what it draws.
            </Card>
            <Card eyebrow="Images" title="Convert on the way in">
              Every photo is re-encoded to WebP at capture, keeping transparency for the
              cutouts and cutting the bytes stored per magnet.
            </Card>
          </div>
          <Body>
            None of this shows up in a screenshot, which is exactly why it belongs in
            the case study. The perceived quality of a photo-heavy app is mostly decided
            by how fast the photos arrive.
          </Body>
        </Section>

        {/* ── 08 · Status ── */}
        <Section index="08" title="Where it stands">
          <Lede>
            The MVP is complete and the product has not launched. No usage data exists,
            so there are no outcomes to report — only intentions worth testing.
          </Lede>
          <div className="grid gap-4 md:grid-cols-2">
            <Card eyebrow="Next" title="What I'd validate first">
              Whether the cutout step feels like magic or like a wait. It's the one
              moment the user has to trust the app before seeing any payoff, and where
              I'd expect the first drop-off.
            </Card>
            <Card eyebrow="Next" title="What I'd measure">
              How many magnets a fridge holds after a month. The premise rests on
              accumulation — a fridge with two magnets is a screenshot, a fridge with
              twenty is a habit.
            </Card>
            <Card eyebrow="Open" title="Location precision">
              City-level home bases are too coarse for a map meant to feel populated.
              Finer location — and the privacy questions that come with it — is the
              biggest unresolved design problem.
            </Card>
            <Card eyebrow="Open" title="A reason to return">
              Adding a magnet is inherently rare; you travel a few times a year. The map
              is the current answer to "why open this on a Tuesday", and it isn't a
              proven one.
            </Card>
          </div>
        </Section>

        {/* ── Colophon ── */}
        <footer className="border-t border-border/60 py-14">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-fridge text-2xl">Fridge</p>
              <p className="mt-1 text-muted-foreground">Turn your travels into tales.</p>
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:text-right">
              <Meta label="Built with" value="React · Vite · Supabase" />
              <Meta label="Map" value="MapLibre · OpenFreeMap" />
            </dl>
          </div>
          <div className="mt-10">
            <a href="/fridge"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/30 bg-primary px-6 text-primary-foreground transition hover:brightness-105">
              Open the app
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
