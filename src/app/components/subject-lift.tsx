import { useEffect, useState } from "react";

/**
 * The "lift subject from background" reveal, as iOS Photos does it when you
 * long-press a subject.
 *
 * Two effects, both derived from the cutout's own alpha channel so they trace
 * the real silhouette rather than a bounding box:
 *
 *  1. An outline glow — stacked drop-shadow() filters at zero offset. A CSS
 *     filter respects the PNG's transparency, so the glow hugs the subject's
 *     edge for free; no edge detection or SVG path needed.
 *  2. A shimmer sweep — a diagonal highlight travelling across the subject,
 *     clipped with mask-image set to the same cutout so the light only falls
 *     on the subject and never on the transparent surround.
 *
 * The animation plays once on mount and then settles to a resting state, so it
 * reads as "this was just extracted" rather than a permanently glowing sticker.
 */
export function SubjectLift({
  src,
  alt,
  className = "",
  style,
  /** Skip the animation (reduced motion, or re-renders that aren't a fresh cut). */
  animate = true,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  animate?: boolean;
}) {
  const [phase, setPhase] = useState<"lifting" | "settled">(animate ? "lifting" : "settled");

  useEffect(() => {
    if (!animate) return;
    setPhase("lifting");
    // Matches the longest keyframe below; after this the glow holds at a
    // low resting intensity instead of pulsing forever.
    const t = setTimeout(() => setPhase("settled"), 2200);
    return () => clearTimeout(t);
  }, [src, animate]);

  const maskProps: React.CSSProperties = {
    WebkitMaskImage: `url("${src}")`,
    maskImage: `url("${src}")`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };

  return (
    <span className={`subject-lift relative inline-block ${phase} ${className}`} style={style}>
      <img src={src} alt={alt} className="subject-lift__img block h-full w-full object-contain" />
      {phase === "lifting" && (
        <span aria-hidden="true" className="subject-lift__sweep" style={maskProps} />
      )}
    </span>
  );
}
