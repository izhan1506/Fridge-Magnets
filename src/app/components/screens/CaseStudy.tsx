import { type ReactNode } from "react";
import { FridgeIllustration } from "../fridge-illustration";

/**
 * Product design case study — a standalone marketing/portfolio page at
 * /casestudy. Rendered outside PhoneFrame (see AppLayout) because it's a wide
 * editorial page rather than part of the phone app.
 *
 * Content is drawn from the actual product and build. Sections that would
 * normally carry usage metrics are deliberately framed as "what I'd validate"
 * rather than invented numbers — the product hasn't launched yet.
 */

/* ── Small building blocks ───────────────────────────────────────────────── */

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
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
  return (
    <p className="max-w-3xl text-lg leading-relaxed text-foreground/85 md:text-xl">{children}</p>
  );
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

function Card({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-7">
      {eyebrow && (
        <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      )}
      <h3 className="font-fridge text-xl leading-tight md:text-2xl">{title}</h3>
      <div className="mt-3 leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

/** A before → after pair with a small diagram above each caption. */
function BeforeAfter({
  before,
  after,
  beforeLabel,
  afterLabel,
}: {
  before: ReactNode;
  after: ReactNode;
  beforeLabel: string;
  afterLabel: string;
}) {
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

/* ── Diagrams (inline SVG, no assets) ────────────────────────────────────── */

/** Map pins sharing one city centroid, stacked vs fanned onto a 1km ring. */
function PinDiagram({ spread }: { spread: boolean }) {
  const pins = [0, 1, 2, 3, 4, 5];
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" role="img" aria-hidden="true">
      <circle cx="100" cy="60" r="34" fill="none" stroke="rgba(255,255,255,0.10)" strokeDasharray="3 4" />
      {pins.map((i) => {
        const angle = (i / pins.length) * Math.PI * 2;
        const cx = spread ? 100 + Math.cos(angle) * 30 : 100 + i * 0.6;
        const cy = spread ? 60 + Math.sin(angle) * 30 : 60 - i * 0.6;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r="9" fill="var(--primary)" stroke="#fff" strokeWidth="2" />
          </g>
        );
      })}
    </svg>
  );
}

/** The fridge overflowing its viewport vs fitted to it. */
function FitDiagram({ fits }: { fits: boolean }) {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" role="img" aria-hidden="true">
      <rect x="62" y="6" width="76" height="108" rx="10" fill="none" stroke="rgba(255,255,255,0.18)" />
      <text x="100" y="0" />
      {fits ? (
        <rect x="76" y="20" width="48" height="82" rx="7" fill="#DDD9D0" />
      ) : (
        <rect x="70" y="20" width="60" height="128" rx="7" fill="#DDD9D0" />
      )}
      <rect x="62" y="100" width="76" height="14" rx="4" fill="rgba(0,0,0,0.55)" />
    </svg>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export function CaseStudy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-5 md:px-8">
        {/* ── Hero ── */}
        <header className="pb-16 pt-16 md:pb-24 md:pt-28">
          <p className="text-[11px] uppercase tracking-[0.24em] text-primary">
            Product design case study
          </p>

          <div className="mt-8 grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h1 className="font-fridge text-6xl leading-[0.92] md:text-8xl">
                Turn your
                <br />
                travels into
                <br />
                <span className="text-primary">tales.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-foreground/85 md:text-xl">
                Fridge is a mobile app that turns souvenir photos into magnets on a
                shared, skeuomorphic refrigerator — and pins every trip to a world
                map other travellers can explore.
              </p>
            </div>

            {/* The real product asset, not a mockup of one. */}
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
            Fridge magnets are the one souvenir people actually keep — and the only
            one with a display surface built into the house. That surface is where
            the memory lives, and it's the part that never makes it online.
          </Lede>
          <Body>
            Travel photos go to a camera roll that nobody scrolls back through, or to
            a feed where they're gone in a day. The fridge is the opposite: a small,
            curated, permanent collection you walk past every morning, assembled
            slowly, arranged by hand, and shared with anyone who visits the kitchen.
          </Body>
          <Body>
            The design question was whether that object could be moved onto a phone
            without losing what makes it work — the physicality, the accumulation,
            and the fact that it's yours before it's anyone else's.
          </Body>
        </Section>

        {/* ── 02 ── */}
        <Section index="02" title="Principles">
          <div className="grid gap-4 md:grid-cols-3">
            <Card eyebrow="01" title="Skeuomorphic, on purpose">
              The fridge is drawn, not decorated. It gives every magnet a believable
              place to sit and makes "add" mean something physical instead of
              appending a row to a list.
            </Card>
            <Card eyebrow="02" title="Hand-placed, never a grid">
              Magnets can overlap, tilt, and sit wherever they're dropped. A tidy grid
              would have been easier to build and would have thrown away the whole
              metaphor.
            </Card>
            <Card eyebrow="03" title="Yours first, social second">
              The fridge works alone. The map is a place to wander, not a feed with a
              follower count — there are no likes, and nothing is ranked.
            </Card>
          </div>
        </Section>

        {/* ── 03 ── */}
        <Section index="03" title="The core loop">
          <Lede>
            Three steps, and the difficult one is invisible.
          </Lede>
          <div className="grid gap-4 md:grid-cols-3">
            <Card eyebrow="Step 1" title="Capture">
              Shoot the magnet on the fridge door, or pick a photo. No framing
              guides, no crop step — the next stage makes it forgiving.
            </Card>
            <Card eyebrow="Step 2" title="Cut out">
              The background is removed automatically, in the browser, so a snapshot
              taken on a hotel desk becomes an object with a real silhouette.
            </Card>
            <Card eyebrow="Step 3" title="Place">
              The cutout drops onto the door with a slight random tilt. Long-press
              lifts it; it's saved wherever it's let go.
            </Card>
          </div>
          <Body>
            Background removal runs entirely on-device via WebAssembly. That was a
            privacy decision before it was a technical one — a photo taken inside
            someone's home never leaves their phone to be processed. It costs a
            large one-time model download, which is the trade being made.
          </Body>
        </Section>

        {/* ── 04 ── */}
        <Section index="04" title="Designing the object">
          <Lede>
            The fridge is a single hand-authored SVG on a 400 × 950 canvas, not a
            photograph.
          </Lede>
          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Why vector">
              It scales to any screen without a second asset, re-colours with the
              theme, weighs a few kilobytes, and lets the magnet placement area be
              defined as a percentage of the door rather than pixels of a bitmap.
            </Card>
            <Card title="Why restrained">
              The fridge is a stage, not the subject. It's built from two soft
              gradients, one specular highlight and two seams — enough to read as an
              appliance, quiet enough that the photos on it stay the brightest thing
              on screen.
            </Card>
          </div>
          <Body>
            The interface floating over it is frosted glass — the navigation, the
            back buttons, the tab switcher. Chrome sits above the object without
            boxing it in, and the same treatment is reused everywhere so the app
            reads as one surface with things resting on it.
          </Body>
        </Section>

        {/* ── 05 ── */}
        <Section index="05" title="Two problems worth showing">
          <Lede>
            The interesting design work wasn't the happy path — it was the two places
            where the metaphor collided with reality.
          </Lede>

          <div className="pt-4">
            <h3 className="font-fridge text-2xl">A fridge is the wrong shape for a phone</h3>
            <Body>
              A believable refrigerator is roughly 1:2.4. A phone screen, minus a
              header and a nav bar, is far squarer than that. Sizing the illustration
              by width alone — the obvious approach — made it overflow the screen and
              get cut off, hiding the bottom third of the object.
            </Body>
            <div className="mt-6">
              <BeforeAfter
                before={<FitDiagram fits={false} />}
                after={<FitDiagram fits />}
                beforeLabel="Width-driven sizing: the fridge runs past the viewport and behind the nav bar, cropping its base."
                afterLabel="Fitted to the smaller of the two axes. The whole object is always visible, at the cost of side margins."
              />
            </div>
            <Body>
              The resolution was to let whichever axis runs out first decide the size,
              and to accept a narrower fridge on tall screens. Losing width was the
              cheaper sacrifice — a cropped appliance stops reading as an appliance.
            </Body>
          </div>

          <div className="pt-10">
            <h3 className="font-fridge text-2xl">Everyone in a city is at the same point</h3>
            <Body>
              Home base is chosen as a city, so every user who picks London is stored
              at one identical coordinate. On the map their pins landed exactly on top
              of each other — a city of travellers rendered as a single dot.
            </Body>
            <div className="mt-6">
              <BeforeAfter
                before={<PinDiagram spread={false} />}
                after={<PinDiagram spread />}
                beforeLabel="Six fridges in one city, stacked on one centroid. Only the top pin is reachable."
                afterLabel="Fanned onto concentric rings a kilometre apart, so each is individually visible and tappable."
              />
            </div>
            <Body>
              Pins that share a coordinate are now laid out on rings around it, with
              anyone who doesn't collide left exactly where they are. Clustering is
              measured in screen pixels rather than kilometres, so a city collapses to
              one bubble at world zoom and separates into individual pins as you move
              in. The offsets are honest fiction: they're a legibility device, and the
              real fix is finer location data at sign-up.
            </Body>
          </div>
        </Section>

        {/* ── 06 ── */}
        <Section index="06" title="Making it feel instant">
          <Lede>
            A memory app that takes six seconds to open isn't a memory app.
          </Lede>
          <div className="grid gap-4 md:grid-cols-3">
            <Card eyebrow="Payload" title="Split the heavy things out">
              The map engine and the background-removal model were being downloaded by
              everyone at launch, including people who only wanted to look at their
              own fridge. Both now load on demand.
            </Card>
            <Card eyebrow="Data" title="Stop over-fetching">
              Opening the map was pulling every other user's full-resolution trip
              photos to render a name and a count. The list query now asks only for
              what it draws.
            </Card>
            <Card eyebrow="Images" title="Convert on the way in">
              Every photo is re-encoded to WebP at the moment it's captured, keeping
              transparency for the cutouts and cutting the bytes stored per magnet.
            </Card>
          </div>
          <Body>
            None of this is visible in a screenshot, which is exactly why it belongs
            in the case study. The perceived quality of a photo-heavy app is mostly
            decided by how fast the photos arrive.
          </Body>
        </Section>

        {/* ── 07 ── */}
        <Section index="07" title="Where it stands">
          <Lede>
            The MVP is complete and the product has not launched. No usage data
            exists yet, so there are no outcomes to report — only intentions worth
            testing.
          </Lede>
          <div className="grid gap-4 md:grid-cols-2">
            <Card eyebrow="Next" title="What I'd validate first">
              Whether the cutout step feels like magic or like a wait. It's the one
              moment the user has to trust the app before seeing any payoff, and it's
              where I'd expect the first drop-off.
            </Card>
            <Card eyebrow="Next" title="What I'd measure">
              How many magnets a fridge holds after a month. The whole premise rests
              on accumulation — a fridge with two magnets is a screenshot, a fridge
              with twenty is a habit.
            </Card>
            <Card eyebrow="Open" title="Location precision">
              City-level home bases are too coarse for a map that's meant to feel
              populated. Finer location — and the privacy questions that come with
              it — is the biggest unresolved design problem.
            </Card>
            <Card eyebrow="Open" title="A reason to return">
              Adding a magnet is inherently rare; you travel a few times a year. The
              map is the current answer to "why open this on a Tuesday", and it isn't
              a proven one.
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
            <a
              href="/fridge"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/30 bg-primary px-6 text-primary-foreground transition hover:brightness-105"
            >
              Open the app
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
