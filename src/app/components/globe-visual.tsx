import React, { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from "react";
import type { GlobeMarker, Globe3DConfig } from "./ui/3d-globe";

/**
 * The visual in the landing page's "Every fridge has an address" section.
 *
 * Wraps the Aceternity 3D globe (`ui/3d-globe.tsx`, three + @react-three/fiber
 * + @react-three/drei) in the three things it needs to be safe on a public
 * marketing page:
 *
 * 1. **It is never in the boot bundle.** three/fiber/drei are an order of
 *    magnitude larger than this entire app, so the import is `React.lazy` and
 *    is not even started until an IntersectionObserver says the section is
 *    near the viewport. Landing on `/landingpage` and not scrolling downloads
 *    none of it.
 * 2. **It degrades to the old SVG.** If WebGL is unavailable or the chunk
 *    fails to load, the error boundary below renders the hand-drawn globe that
 *    used to live in LandingPage.tsx. That is also the Suspense fallback, so
 *    the space is filled the whole time rather than collapsing.
 * 3. **It respects `prefers-reduced-motion`.** Auto-rotation is the entire
 *    motion of the piece, so under reduced motion the globe is held still
 *    instead of spinning.
 */

const Globe3D = lazy(() =>
  import("./ui/3d-globe").then((m) => ({ default: m.Globe3D })),
);

/* ── Fallback ────────────────────────────────────────────────────────────── */

/**
 * The original hand-drawn globe. Kept as the fallback rather than deleted: it
 * needs no WebGL, no network and no JavaScript beyond React, so it is what
 * everyone who can't run the real thing sees.
 */
export const globeFallback = (
  <svg viewBox="0 0 240 200" className="h-auto w-full" aria-hidden="true">
    <defs>
      <radialGradient id="lp-map-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(244,97,0,0.18)" />
        <stop offset="100%" stopColor="rgba(244,97,0,0)" />
      </radialGradient>
    </defs>
    <circle cx="120" cy="100" r="92" fill="url(#lp-map-glow)" />
    <circle cx="120" cy="100" r="78" fill="none" stroke="color-mix(in srgb, var(--foreground) 16%, transparent)" />
    <ellipse cx="120" cy="100" rx="78" ry="30" fill="none" stroke="color-mix(in srgb, var(--foreground) 13%, transparent)" strokeDasharray="4 5" />
    <ellipse cx="120" cy="100" rx="78" ry="58" fill="none" stroke="color-mix(in srgb, var(--foreground) 10%, transparent)" strokeDasharray="4 5" />
    <ellipse cx="120" cy="100" rx="34" ry="78" fill="none" stroke="color-mix(in srgb, var(--foreground) 13%, transparent)" strokeDasharray="4 5" />
    <line x1="42" y1="100" x2="198" y2="100" stroke="color-mix(in srgb, var(--foreground) 13%, transparent)" strokeDasharray="4 5" />
    {[[86, 74, 1], [150, 86, 0.85], [112, 132, 0.95], [168, 140, 0.7]].map(([x, y, k], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
        <ellipse cx="0" cy="3" rx="9" ry="3" fill="rgba(0,0,0,0.45)" />
        <path d="M0 -30c-7.2 0-13 5.5-13 12.4C-13 -8.6 0 2 0 2s13-10.6 13-19.6C13 -24.5 7.2 -30 0 -30z" fill="var(--primary)" />
        <circle cx="0" cy="-17.6" r="4.6" fill="var(--primary-foreground)" />
      </g>
    ))}
  </svg>
);

/* ── Markers ─────────────────────────────────────────────────────────────── */

/**
 * The thirteen cities and avatars from the component's own demo, self-hosted
 * rather than hotlinked off assets.aceternity.com (602KB of source images comes
 * to 19.5KB once they are sized for the ~12px they actually render at).
 *
 * Note these are the demo's stock portraits, not this product's users — the
 * fridges they imply do not exist. Everything else on this page is deliberately
 * literal about that, so this is the one decorative claim on it.
 */
const MARKERS: GlobeMarker[] = [
  { lat: 40.7128, lng: -74.006, src: "/globe/avatars/1.webp", label: "New York" },
  { lat: 51.5074, lng: -0.1278, src: "/globe/avatars/2.webp", label: "London" },
  { lat: 35.6762, lng: 139.6503, src: "/globe/avatars/3.webp", label: "Tokyo" },
  { lat: -33.8688, lng: 151.2093, src: "/globe/avatars/4.webp", label: "Sydney" },
  { lat: 48.8566, lng: 2.3522, src: "/globe/avatars/5.webp", label: "Paris" },
  { lat: 28.6139, lng: 77.209, src: "/globe/avatars/6.webp", label: "New Delhi" },
  { lat: 55.7558, lng: 37.6173, src: "/globe/avatars/7.webp", label: "Moscow" },
  { lat: -22.9068, lng: -43.1729, src: "/globe/avatars/8.webp", label: "Rio de Janeiro" },
  { lat: 31.2304, lng: 121.4737, src: "/globe/avatars/9.webp", label: "Shanghai" },
  { lat: 25.2048, lng: 55.2708, src: "/globe/avatars/10.webp", label: "Dubai" },
  { lat: -34.6037, lng: -58.3816, src: "/globe/avatars/11.webp", label: "Buenos Aires" },
  { lat: 1.3521, lng: 103.8198, src: "/globe/avatars/12.webp", label: "Singapore" },
  { lat: 37.5665, lng: 126.978, src: "/globe/avatars/13.webp", label: "Seoul" },
];
/** Tuned to the page: transparent, dark earth, the primary orange as the halo. */
const BASE_CONFIG: Globe3DConfig = {
  radius: 2,
  enableZoom: false,
  enablePan: false,
  // Off. The shader shell is scaled outside the planet and its fresnel peaks
  // at ITS silhouette, so at any intensity it reads as a hoop floating off the
  // globe rather than atmosphere. Set showAtmosphere true to bring it back.
  showAtmosphere: false,
  atmosphereColor: "#4da6ff",
  atmosphereIntensity: 0.9,
  atmosphereBlur: 2,
  bumpScale: 5,
  ambientIntensity: 0.6,
  pointLightIntensity: 1.5,
  backgroundColor: null,
  // 10px. Upstream hardcodes the marker to 8px and never reads markerSize;
  // that is wired up now, and the avatars need a little more than 8 to read.
  markerSize: 0.1,
  // Puts the centroid of the four cities dead centre and facing the camera on
  // arrival, so every marker is visible before auto-rotation carries them off.
  // Solved numerically against three's Euler XYZ convention, not eyeballed.
  initialRotation: { x: 0.3498, y: -1.7425 },
};

// Frozen at module scope: Globe3D memoises on `config` identity, so a fresh
// object each render would rebuild the scene every time.
const CONFIG_MOVING: Globe3DConfig = { ...BASE_CONFIG, autoRotateSpeed: 0.35 };
const CONFIG_STILL: Globe3DConfig = { ...BASE_CONFIG, autoRotateSpeed: 0 };

/* ── WebGL probe ─────────────────────────────────────────────────────────── */

/**
 * Whether this browser can actually give us a WebGL context.
 *
 * Checked *before* the dynamic import, not just caught by the boundary
 * afterwards: without it a browser with WebGL disabled still downloads the
 * whole three/fiber/drei chunk (230KB gzip) only to throw and fall back to the
 * SVG anyway. Measured — that download really does happen.
 *
 * Cached, because creating a context is not free and the answer can't change.
 */
let webglSupport: boolean | null = null;
function hasWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    const c = document.createElement("canvas");
    webglSupport = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

/* ── Error boundary ──────────────────────────────────────────────────────── */

class GlobeBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    // No WebGL, a blocked chunk, a driver that refuses the context — all of
    // them land here and none of them should take the section down.
    console.warn("[GlobeVisual] 3D globe unavailable, using the SVG fallback:", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ── Component ───────────────────────────────────────────────────────────── */

export function GlobeVisual() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    // Nothing to load if it could never run. The boundary still backstops the
    // cases this can't predict (context lost, driver refuses on creation).
    if (!hasWebGL()) return;
    // No IntersectionObserver (or no window) — just load it.
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      // Start fetching a screen early so it is usually ready on arrival.
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    // aspect-square reserves the box up front, so the fallback, the loading
    // state and the globe all occupy exactly the same space — nothing reflows.
    /* isolate: drei's Html markers carry very large inline z-indexes. Without a
       stacking context here they paint over the sticky nav; with one, the whole
       globe — markers included — stays behind the page chrome no matter what
       z-index the library picks. */
    <div ref={hostRef} className="relative isolate aspect-square w-full">
      {near ? (
        <GlobeBoundary fallback={<CenteredFallback />}>
          <Suspense fallback={<CenteredFallback />}>
            <Globe3D
              markers={MARKERS}
              config={still ? CONFIG_STILL : CONFIG_MOVING}
              className="!h-full !w-full"
            />
          </Suspense>
        </GlobeBoundary>
      ) : (
        <CenteredFallback />
      )}
    </div>
  );
}

function CenteredFallback() {
  return <div className="flex h-full w-full items-center justify-center">{globeFallback}</div>;
}
