import { useState } from "react";
import { FridgeIllustration } from "../fridge-illustration";
import { FridgeIllustrationDuo } from "../fridge-illustration-duo";

/**
 * Throwaway prototype at /iphone-duo: the fridge screen on a folding phone.
 *
 * Self-contained on purpose. It imports no app chrome, touches no store and
 * sits behind no auth guard, so nothing here can affect the shipped screens —
 * the only edit outside this folder is the route itself.
 *
 * Device figures, from the supplied spec:
 *   outer 5.4in, 1398x2034 physical. sqrt(1398^2+2034^2)/5.4 = 457ppi, so 3x,
 *   giving a 466x678 CSS viewport.
 *   inner 7.6in — the resolution was not supplied. 1812x2176 at 3x is assumed,
 *   the usual panel at that diagonal, giving 604x725. If the real figure
 *   differs, change INNER below; nothing else depends on it.
 */

const OUTER = { w: 466, h: 678, label: "Folded · 5.4″ · 1398×2034 @3x" };
const INNER = { w: 604, h: 725, label: "Unfolded · 7.6″ · 1812×2176 @3x (assumed)" };

/**
 * Stand-in magnets. All one size, and all clear of the handles.
 *
 * The same array renders in both states, so each magnet has to miss two
 * different handle layouts: the folded door's single groove at 11.5-14% of the
 * width, and the duo's pair at 45.5-46.8% and 53.2-54.5% either side of the
 * fold. At SIZE 18 (half-width 9) that leaves two usable bands for a centre —
 * 24-34% and 66-90% — which is where these five sit.
 */
const SIZE = 18;
const MAGNETS = [
  { src: "/magnets/oslo-viking.webp", x: 27, y: 22, rot: -5 },
  { src: "/magnets/oslo-plate.webp", x: 30, y: 47, rot: 3 },
  { src: "/magnets/prague.webp", x: 26, y: 71, rot: -3 },
  { src: "/magnets/berlin.webp", x: 72, y: 27, rot: 4 },
  { src: "/magnets/vienna.webp", x: 74, y: 58, rot: -4 },
];

function Screen({ open }: { open: boolean }) {
  const d = open ? INNER : OUTER;
  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-[2rem] bg-background text-foreground ring-1 ring-white/15"
      style={{ width: d.w, height: d.h }}
    >
      <header className="flex items-center justify-between px-5 pt-5 pb-3">
        <p className="font-fridge text-lg">Your Magnets</p>
        <span className="h-8 w-8 rounded-full bg-white/10" />
      </header>

      {/* The door. Sized by width, exactly like the real screen — so the base
          runs past the bottom rather than shrinking the appliance. */}
      <div className="relative min-h-0 flex-1 px-4">
        <div className="relative w-full">
          {open ? (
            <FridgeIllustrationDuo className="w-full select-none" />
          ) : (
            <FridgeIllustration className="w-full select-none" />
          )}
          {MAGNETS.map((m) => (
            /* Each magnet gets the SAME square box and is contained inside it,
               rather than sharing a width. The cutouts have very different
               aspect ratios — a round coin against a wide number plate — so
               equal width makes the plate read as much the bigger object. A
               shared box means none of them exceeds the same footprint. */
            <span
              key={m.src}
              className="absolute block select-none"
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
                width: `${SIZE}%`,
                aspectRatio: "1 / 1",
                transform: `translate(-50%, -50%) rotate(${m.rot}deg)`,
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.35))",
              }}
            >
              <img
                src={m.src}
                alt=""
                draggable={false}
                className="h-full w-full select-none object-contain"
              />
            </span>
          ))}
          {/* The fold, only when open. */}
          {open && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
              style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.28), rgba(0,0,0,0.05))" }}
            />
          )}
        </div>
      </div>

      <nav className="flex items-center justify-center gap-2 px-4 pb-5 pt-3">
        <span className="rounded-xl bg-black/70 px-4 py-1.5 text-sm">Fridge</span>
        <span className="px-3 py-1.5 text-sm text-muted-foreground">Map</span>
        <span className="ml-1 grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">+</span>
      </nav>
    </div>
  );
}

export function IphoneDuo() {
  const [open, setOpen] = useState(true);
  const d = open ? INNER : OUTER;

  return (
    <div className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary-ink">Prototype</p>
        <h1 className="mt-4 font-fridge text-4xl leading-[1.15] md:text-5xl">
          The fridge on a folding phone
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
          Open, the door splits down the fold and the two handles meet in the middle.
          Nothing here is wired to the app — it is a drawing at device size.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-card px-5 text-card-foreground transition hover:bg-muted"
          >
            {open ? "Fold it" : "Unfold it"}
          </button>
          <p className="text-sm text-muted-foreground">
            {d.label} — {d.w}&times;{d.h} CSS px
          </p>
        </div>

        <div className="mt-10 flex justify-center overflow-x-auto pb-4">
          <Screen open={open} />
        </div>
      </div>
    </div>
  );
}
