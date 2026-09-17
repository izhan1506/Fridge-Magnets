import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import type { Magnet } from "../lib/types";
import { MAGNET_COLORS, DOOR_ZONE } from "../lib/skins";
import { FridgeIllustration } from "./fridge-illustration";
import { BOTTOM_NAV_H } from "./layout";
import { ImageWithFallback } from "./figma/ImageWithFallback";

/** The illustration's viewBox, and so the aspect ratio it must keep. */
const ILLO_W = 400;
const ILLO_H = 950;
/** The illustration never renders wider than this, however much room there is. */
const ILLO_MAX_W = 440;

/**
 * The app's one fridge appliance, standing on the sunset wall. Magnets are
 * scattered inside the door zone via `children`; `overlay` (e.g. the empty
 * state) is centered on the fridge itself, not the offset door zone.
 */
export function FridgeAppliance({ children, overlay }: { children: ReactNode; overlay?: ReactNode }) {
  /* ── Why this is measured rather than expressed in CSS ──
     The illustration is a 400×950 box: 2.375× taller than it is wide. Rendered
     at `w-full` it came out 396×941 on a 412px phone, which is taller than the
     entire viewport before the 88px header and the 80px nav are taken off — so
     the base of the appliance was cut off, by a measured 194px on a Pixel 7 and
     245px on a Galaxy S8.

     Fitting a fixed-ratio box inside a bounded parent has no reliable pure-CSS
     form for a plain div: `aspect-ratio` with `max-height` clamps the height
     without narrowing the width, which just breaks the ratio (402×706 instead
     of 297×706 in the desktop frame). So the available box is measured and the
     width is derived from it. That also removes the old disagreement where the
     door-zone geometry assumed a hardcoded 402pt frame while the illustration
     actually rendered `w-full`.

     The tradeoff is a narrower fridge — ~317px of a 412px Pixel 7 — which is
     the cost of showing the whole appliance instead of most of it. */
  const availableRef = useRef<HTMLDivElement>(null);
  const [illoW, setIlloW] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = availableRef.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      // Contain: as wide as fits, but never so wide that it overflows vertically.
      setIlloW(Math.min(width, ILLO_MAX_W, (height * ILLO_W) / ILLO_H));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    /* pb clears the bottom nav, which is `absolute` and so contributes nothing
       to this column's height — the measured box has to exclude it explicitly. */
    <div
      className="flex min-h-0 flex-1 items-start justify-center overflow-visible px-2"
      style={{ paddingBottom: BOTTOM_NAV_H }}
    >
      {/* Fills the available content box; this is what gets measured. */}
      <div ref={availableRef} className="flex h-full w-full items-start justify-center">
        {/* Exactly the illustration's rendered bounds, so DOOR_ZONE's
            percentages still address the door face correctly. Hidden until
            measured, so the oversized first paint is never shown. */}
        <div
          className="relative"
          style={{ width: illoW ?? undefined, visibility: illoW ? "visible" : "hidden" }}
        >
        <FridgeIllustration className="pointer-events-none w-full select-none" />
        {/* magnet placement canvas (percentages of the image box) — a bounded box
            so magnets can be freely positioned and dragged within the door face */}
        <div
          className="absolute"
          style={{
            left: `${DOOR_ZONE.left}%`,
            top: `${DOOR_ZONE.top}%`,
            width: `${DOOR_ZONE.width}%`,
            height: `${DOOR_ZONE.height}%`,
          }}
        >
          {children}
        </div>
        {overlay && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-12 text-center">
            {overlay}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

/**
 * A magnet tile: the user's background-removed cutout, hand-placed with a slight
 * rotation and a real drop-shadow. Also supports a placeholder-color state.
 */
export function MagnetTile({
  magnet,
  onClick,
  size = 116,
}: {
  magnet: Magnet;
  onClick?: () => void;
  size?: number;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08, rotate: 0, zIndex: 20 }}
      whileTap={{ scale: 0.96 }}
      style={{ rotate: `${magnet.rotation}deg`, width: size, height: size }}
      className="relative shrink-0"
    >
      <div
        className={`flex h-full w-full items-center justify-center ${
          magnet.photoUrl ? "" : "overflow-hidden rounded-2xl"
        }`}
        style={{
          backgroundColor: magnet.photoUrl ? undefined : MAGNET_COLORS[magnet.color],
          filter: "drop-shadow(0 15px 18px rgba(0,0,0,0.28))",
        }}
      >
        {magnet.photoUrl ? (
          <ImageWithFallback
            src={magnet.photoUrl}
            alt={`Magnet from ${magnet.city}, ${magnet.country}`}
            className="h-full w-full select-none object-contain"
            draggable={false}
          />
        ) : (
          <span className="font-fridge px-2 text-center text-white/95">{magnet.city}</span>
        )}
      </div>
      {!magnet.photoUrl && (
        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-white/50 blur-[1px]" />
      )}
    </motion.button>
  );
}
