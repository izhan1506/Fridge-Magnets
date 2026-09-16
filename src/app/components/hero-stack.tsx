import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useReducedMotion } from "motion/react";
import { M3Button } from "./chrome";

/**
 * Landing hero: a full-bleed stack of photographs of the fridge standing in
 * real places.
 *
 * The images hard-cut between each other — no crossfade, no drift, no zoom. It
 * reads like a cut in film: the frame is simply somewhere else. Every layer is
 * pre-mounted and toggled with visibility, so a cut is instant and never shows
 * a half-loaded image.
 */

export type HeroShot = { src: string; alt: string };

export const HERO_SHOTS: HeroShot[] = [
  { src: "/hero/hero-01.jpg", alt: "A cream retro fridge covered in travel magnets standing on a bridge by Big Ben in London" },
  { src: "/hero/hero-02.jpg", alt: "The fridge at a neon-lit Tokyo crossing at dusk with Tokyo Tower behind it" },
  { src: "/hero/hero-03.jpg", alt: "The fridge on a Paris street beside a café, with the Eiffel Tower in the distance" },
  { src: "/hero/hero-04.jpg", alt: "The fridge under cherry blossom on a rain-slicked Japanese street at twilight" },
  { src: "/hero/hero-05.jpg", alt: "The fridge on a tropical clifftop in Bali at sunset, with a sea temple beyond" },
  { src: "/hero/hero-06.jpg", alt: "The fridge in a whitewashed Greek alley with blue domes and bougainvillea" },
  { src: "/hero/hero-07.jpg", alt: "The fridge on an African savannah at golden hour, with a giraffe and acacia trees" },
  { src: "/hero/hero-08.jpg", alt: "The fridge on a terrace overlooking the Nile and the pyramids at sunset" },
];

const CUT_MS = 2600;

export function HeroStack() {
  const nav = useNavigate();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % HERO_SHOTS.length), CUT_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden">
      {/* All frames stay mounted; only visibility changes, so the cut is
          instantaneous and never waits on a network fetch mid-sequence. */}
      {HERO_SHOTS.map((shot, i) => (
        <img
          key={shot.src}
          src={shot.src}
          alt={i === index ? shot.alt : ""}
          aria-hidden={i !== index}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ visibility: i === index ? "visible" : "hidden" }}
        />
      ))}

      {/* The photographs are bright and busy; overlaid type needs a floor. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.34) 40%, rgba(0,0,0,0.10) 66%, rgba(0,0,0,0.30) 100%)",
        }}
      />

      <div className="absolute inset-0">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col justify-end px-5 pb-14 md:grid md:grid-cols-12 md:items-center md:pb-0 md:px-8">
          {/* Sits right of the fridge, which stands centre-frame in every shot. */}
          <h1 className="font-fridge text-[12vw] uppercase leading-[0.95] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.55)] sm:text-6xl md:col-span-6 md:col-start-7 md:text-7xl lg:text-8xl">
            Turn your travels into tales
          </h1>

          <div className="mt-8 md:col-span-5 md:col-start-1 md:row-start-1 md:mt-0 md:self-end md:pb-24">
            <M3Button onClick={() => nav("/auth")}>Make your fridge</M3Button>
            <p className="mt-4 text-white/75 drop-shadow">
              Free · works in your browser · no app store
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
