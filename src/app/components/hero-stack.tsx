import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { FridgeIllustration } from "./fridge-illustration";

/**
 * Landing hero: a stack of photographs of the fridge standing in real places,
 * which cycles on its own, and which the reader then scrolls *into* the app.
 *
 * The scroll gesture is the argument the page is making: the same fridge you
 * just saw in Tokyo shrinks down and becomes the screen on your phone. It's
 * driven by scroll progress over a tall section with a sticky stage, so the
 * transition is scrubable rather than a timed animation that fires once.
 */

export type HeroShot = { src: string; place: string; alt: string };

export const HERO_SHOTS: HeroShot[] = [
  { src: "/hero/hero-01.jpg", place: "London", alt: "A cream retro fridge covered in travel magnets standing on a bridge by Big Ben and the Houses of Parliament in London" },
  { src: "/hero/hero-02.jpg", place: "Tokyo", alt: "The fridge standing at a neon-lit Tokyo crossing at dusk with Tokyo Tower behind it" },
  { src: "/hero/hero-03.jpg", place: "Paris", alt: "The fridge on a Paris street beside a café, with the Eiffel Tower in the distance" },
  { src: "/hero/hero-04.jpg", place: "Tokyo", alt: "The fridge under cherry blossom on a rain-slicked Japanese street at twilight" },
  { src: "/hero/hero-05.jpg", place: "Bali", alt: "The fridge on a tropical clifftop in Bali at sunset, with a sea temple beyond" },
  { src: "/hero/hero-06.jpg", place: "Santorini", alt: "The fridge in a whitewashed Greek alley with blue domes and bougainvillea" },
  { src: "/hero/hero-07.jpg", place: "Serengeti", alt: "The fridge on an African savannah at golden hour, with a giraffe and acacia trees" },
  { src: "/hero/hero-08.jpg", place: "Cairo", alt: "The fridge on a terrace overlooking the Nile and the pyramids at sunset" },
];

const CYCLE_MS = 3400;

/** The sticky scroll stage needs a two-column layout to fit in one viewport;
 *  below md the hero renders as an ordinary block instead. */
function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

/** The layered cards sitting behind the front photo. */
const BACKERS = [
  { x: 26, y: 20, rotate: 5, opacity: 0.30, scale: 0.955 },
  { x: 13, y: 10, rotate: 2.5, opacity: 0.55, scale: 0.978 },
];

export function HeroStack() {
  const reduceMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const [index, setIndex] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  /* Scroll-scrubbing only where there's room for it. */
  const scrub = isDesktop && !reduceMotion;

  // Auto-advance. Paused for reduced-motion users, who get a single still.
  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % HERO_SHOTS.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  /* "end end", not "end start". With a sticky h-screen child, the stage stops
     being visible once the container's bottom reaches the viewport bottom — at
     which point "end start" progress is only ~0.58, so the transition would
     never finish on screen. "end end" makes progress 1 land exactly there. */
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });

  /* The photo shrinks and drops until it's sitting exactly where the phone's
     screen is, the handset fades in around it, and the app view takes over. */
  const photoScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.335]);
  const photoY = useTransform(scrollYProgress, [0, 0.8], [0, 96]);
  const photoRadius = useTransform(scrollYProgress, [0, 0.8], [24, 44]);
  const photoOpacity = useTransform(scrollYProgress, [0.6, 0.82], [1, 0]);
  const phoneOpacity = useTransform(scrollYProgress, [0.35, 0.7], [0, 1]);
  const phoneScale = useTransform(scrollYProgress, [0.35, 0.8], [0.86, 1]);
  const copyOpacity = useTransform(scrollYProgress, [0.1, 0.5], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0.1, 0.5], [0, -36]);
  const captionOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const shot = HERO_SHOTS[index];

  return (
    <div ref={stageRef} className="relative md:h-[240vh]">
      <div className="md:sticky md:top-0 flex flex-col justify-center overflow-hidden py-14 md:h-screen md:py-0">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 md:grid-cols-[1.02fr_1fr] md:px-8">
          {/* ── Copy ── */}
          <motion.div style={scrub ? { opacity: copyOpacity, y: copyY } : undefined}>
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary">A home for your souvenirs</p>
            <h1 className="mt-6 font-fridge text-5xl leading-[0.9] sm:text-6xl md:text-8xl">
              Turn your<br />travels into<br /><span className="text-primary">tales.</span>
            </h1>
            <p className="mt-6 max-w-xl leading-relaxed text-foreground/85 md:text-xl">
              Snap the magnets you bring home, and they become a fridge you can
              actually keep — arranged by hand, pinned to a world map, and shared
              with whoever you like.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="/auth" className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-primary px-7 text-primary-foreground transition hover:brightness-105" style={{ height: 52 }}>
                Start your fridge
              </a>
              <a href="/casestudy" className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-7 backdrop-blur-[7px] transition hover:bg-white/20" style={{ height: 52 }}>
                Read the case study
              </a>
            </div>
            <p className="mt-5 text-muted-foreground">Free · works in your browser · no app store</p>
          </motion.div>

          {/* ── Stage ── */}
          <div className="relative mx-auto flex w-full max-w-[440px] items-center justify-center">
            {/* Handset, revealed as the photo shrinks into it */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute z-20"
              style={scrub ? { opacity: phoneOpacity, scale: phoneScale, y: 96 } : { opacity: 0 }}
            >
              <PhonePreview />
            </motion.div>

            {/* Photo stack */}
            <motion.div
              className="relative z-10 w-full"
              style={scrub ? { scale: photoScale, y: photoY, opacity: photoOpacity } : undefined}
            >
              {BACKERS.map((b, i) => (
                <motion.div
                  key={i}
                  aria-hidden="true"
                  className="absolute inset-0 overflow-hidden rounded-3xl border border-white/10 bg-card"
                  style={{ x: b.x, y: b.y, rotate: b.rotate, opacity: b.opacity, scale: b.scale }}
                />
              ))}

              <motion.div
                className="relative overflow-hidden border border-white/12 shadow-2xl"
                style={scrub ? { borderRadius: photoRadius } : { borderRadius: 24 }}
              >
                <div className="relative aspect-[16/11]">
                  <AnimatePresence initial={false}>
                    <motion.img
                      key={shot.src}
                      src={shot.src}
                      alt={shot.alt}
                      // The first frame is the LCP image; the rest can wait.
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                      initial={{ opacity: 0, scale: 1.06 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ opacity: { duration: 0.9 }, scale: { duration: CYCLE_MS / 1000 + 1, ease: "linear" } }}
                    />
                  </AnimatePresence>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                </div>

                {/* Place label + progress dots */}
                <motion.div
                  className="absolute inset-x-0 bottom-0 flex h-9 items-center justify-between px-5 pb-4"
                  style={scrub ? { opacity: captionOpacity } : undefined}
                >
                  {/* No mode="wait" — it holds the outgoing label for the full
                      length of its exit while the photo has already crossfaded,
                      so the caption visibly names the previous city. Both now
                      crossfade together. */}
                  <AnimatePresence initial={false}>
                    <motion.span
                      key={`${index}-${shot.place}`}
                      className="absolute font-fridge text-lg text-white drop-shadow"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.75 }}
                    >
                      {shot.place}
                    </motion.span>
                  </AnimatePresence>
                  <span className="flex gap-1.5">
                    {HERO_SHOTS.map((s, i) => (
                      <span
                        key={s.src}
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: i === index ? 18 : 6,
                          background: i === index ? "var(--primary)" : "rgba(255,255,255,0.45)",
                        }}
                      />
                    ))}
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll affordance — the transition is invisible if nobody scrolls */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center md:flex"
          style={scrub ? { opacity: captionOpacity } : undefined}
        >
          <span className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-[11px] uppercase tracking-[0.18em]">Scroll</span>
            <span className="h-9 w-[22px] rounded-full border border-white/25 p-1">
              <motion.span
                className="block h-1.5 w-1.5 rounded-full bg-primary"
                style={{ marginInline: "auto" }}
                animate={reduceMotion ? undefined : { y: [0, 12, 0] }}
                transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          </span>
        </motion.div>
      </div>
    </div>
  );
}

/** The app, as it looks on a handset — the thing the photo turns into. */
function PhonePreview() {
  return (
    <div className="w-[228px] rounded-[2.2rem] border border-white/15 bg-[#0d0d0d] p-2.5 shadow-[0_40px_80px_rgba(0,0,0,0.65)]">
      <div className="overflow-hidden rounded-[1.7rem] bg-background">
        <div className="flex items-center justify-between px-3.5 pb-2 pt-3">
          <span className="font-fridge text-[13px]">Your Magnets</span>
          <span className="flex gap-1">
            <span className="h-4 w-4 rounded-[5px] border border-white/25 bg-white/10" />
            <span className="h-4 w-4 rounded-[5px] border border-white/25 bg-white/10" />
          </span>
        </div>
        <div className="relative px-2">
          <FridgeIllustration className="w-full select-none" />
          <span className="absolute left-[27%] top-[13%] h-8 w-8 rotate-[-9deg] rounded-lg bg-primary shadow-lg" />
          <span className="absolute left-[54%] top-[26%] h-7 w-7 rotate-[7deg] rounded-lg bg-tertiary shadow-lg" />
          <span className="absolute left-[33%] top-[41%] h-8 w-8 rotate-[4deg] rounded-lg bg-secondary shadow-lg" />
        </div>
        <div className="m-2 flex items-center justify-center gap-1.5 rounded-2xl bg-black/50 py-1.5 backdrop-blur">
          <span className="rounded-lg bg-black/80 px-2.5 py-1 text-[9px]">Fridge</span>
          <span className="px-1.5 py-1 text-[9px] text-muted-foreground">Map</span>
          <span className="h-5 w-5 rounded-lg bg-primary" />
        </div>
      </div>
    </div>
  );
}
