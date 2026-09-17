import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * The hero photo stack, as an **object match cut**.
 *
 * Eight photographs of the same fridge standing in eight different places. The
 * fridge is framed identically in every shot, so cutting between them holds the
 * object still while the world behind it changes — London, then Tokyo, then
 * Paris — which is the whole pitch of the product in one gesture: one fridge,
 * many places.
 *
 * That only reads as a match cut if the transition is a *cut*. No crossfade, no
 * drift, no zoom, no easing — a dissolve would smear the two locations together
 * and turn the effect into mush. So every layer is pre-mounted and toggled with
 * `visibility`, which swaps on a single frame and can never catch a half-decoded
 * image mid-transition.
 *
 * Presentation is deliberately a contained panel rather than a full-bleed
 * backdrop: the headline sits above it as type on the page, so the photograph is
 * a framed object being shown, not a surface with text dropped on top.
 */

export type HeroShot = { src: string; alt: string };

export const HERO_SHOTS: HeroShot[] = [
  { src: "/hero/hero-01.jpg", alt: "A cream retro fridge covered in travel magnets standing on a bridge by Big Ben in London" },
  { src: "/hero/hero-02.jpg", alt: "The same fridge at a neon-lit Tokyo crossing at dusk with Tokyo Tower behind it" },
  { src: "/hero/hero-03.jpg", alt: "The same fridge on a Paris street beside a café, with the Eiffel Tower in the distance" },
  { src: "/hero/hero-04.jpg", alt: "The same fridge under cherry blossom on a rain-slicked Japanese street at twilight" },
  { src: "/hero/hero-05.jpg", alt: "The same fridge on a tropical clifftop in Bali at sunset, with a sea temple beyond" },
  { src: "/hero/hero-06.jpg", alt: "The same fridge in a whitewashed Greek alley with blue domes and bougainvillea" },
  { src: "/hero/hero-07.jpg", alt: "The same fridge on an African savannah at golden hour, with a giraffe and acacia trees" },
  { src: "/hero/hero-08.jpg", alt: "The same fridge on a terrace overlooking the Nile and the pyramids at sunset" },
];

/** How long each location holds before the cut. ~870ms is a fast, deliberate
 *  rhythm — 3x the original 2600ms — so the full eight-location cycle runs in
 *  about 7s instead of 21s. */
const CUT_MS = 870;

export function HeroMatchCut({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  /* ── Don't cut to a frame that hasn't arrived ──
     At 870ms a full cycle is ~7s, but the eight photographs take ~8s to
     download on a 1.6Mbps link — so the sequence outran the network and spent
     roughly half of the first cycle showing an empty panel where a photo should
     be (measured: 138 of 280 samples on Fast 3G). Holding on the first frame
     until the whole set has settled costs a few static seconds on a slow
     connection and shows a real photograph throughout, instead of flickering
     through blanks.

     Keyed by src so a ref callback firing more than once can't double-count,
     and `onError` settles too — a missing file shouldn't freeze the sequence
     forever. */
  const [ready, setReady] = useState(false);
  const settledRef = useRef<Set<string>>(new Set());

  const settle = useCallback((src: string) => {
    if (settledRef.current.has(src)) return;
    settledRef.current.add(src);
    if (settledRef.current.size >= HERO_SHOTS.length) setReady(true);
  }, []);

  useEffect(() => {
    // Respect reduced motion by simply not cutting — the first shot stands on
    // its own, and nothing about the page depends on the sequence advancing.
    if (reduceMotion || !ready) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % HERO_SHOTS.length), CUT_MS);
    return () => clearInterval(id);
  }, [reduceMotion, ready]);

  return (
    <figure
      className={`relative overflow-hidden rounded-3xl border border-border bg-card ${className}`}
      /* The source images are 1200×675, so a 16/9 frame crops nothing and the
         fridge lands on the same pixels in every shot — which is what keeps the
         cut registering as a match rather than a jump. */
      style={{ aspectRatio: "16 / 9" }}
    >
      {HERO_SHOTS.map((shot, i) => {
        const active = i === index;
        return (
          <img
            key={shot.src}
            src={shot.src}
            /* Only the visible frame carries its description; the rest are
               decorative duplicates of the same subject and would otherwise be
               announced eight times over. */
            alt={active ? shot.alt : ""}
            aria-hidden={!active}
            /* Still lazy for frames 1-7: they're all inside the viewport so the
               browser fetches them immediately anyway, and marking them eager
               would only make 1.4MB of photographs compete with the CSS and JS
               the page needs to render at all. */
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            /* A cached image can be complete before React attaches onLoad, so
               check on attach as well as on the event. */
            ref={(el) => {
              if (el?.complete && el.naturalWidth > 0) settle(shot.src);
            }}
            onLoad={() => settle(shot.src)}
            onError={() => settle(shot.src)}
            className="absolute inset-0 h-full w-full select-none object-cover"
            style={{ visibility: active ? "visible" : "hidden" }}
          />
        );
      })}
    </figure>
  );
}
