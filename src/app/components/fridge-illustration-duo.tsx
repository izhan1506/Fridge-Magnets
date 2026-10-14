/**
 * Two-door fridge, for the iPhone Duo prototype at /iphone-duo.
 *
 * A deliberate COPY of fridge-illustration.tsx rather than a prop on it. That
 * file is load-bearing for the real app — `bodyLeftAtY()` is what magnets and
 * the top seam are positioned against — and a prototype is not a good reason to
 * put a branch through it. Nothing here is imported by the shipped screens.
 *
 * Geometry: the single-door body is 400x950 (1:2.375). Doubling the width to
 * 800x950 gives 0.842, which is almost exactly the unfolded panel's 604x725
 * (0.833) — so a two-door fridge fills the open device without distortion.
 * The fold line and the two handles both land on the centre, x = 400.
 */

const VB_W = 800;
const VB_H = 950;
const BODY_X1 = 20;
const BODY_X2 = 780;
const BODY_Y1 = 14;
const BODY_Y2 = 931;
const BODY_R = 46;
const BODY_PATH = `M${BODY_X1},${BODY_Y2} L${BODY_X1},${BODY_Y1 + BODY_R} Q${BODY_X1},${BODY_Y1} ${BODY_X1 + BODY_R},${BODY_Y1} L${BODY_X2 - BODY_R},${BODY_Y1} Q${BODY_X2},${BODY_Y1} ${BODY_X2},${BODY_Y1 + BODY_R} L${BODY_X2},${BODY_Y2} Z`;
const BASE_SEAM_Y = 731;

/** Centre of the body — the fold line, and where both handles sit. */
const MID_X = (BODY_X1 + BODY_X2) / 2;

/** Same as the single-door file: the body's left edge at a given y. */
function bodyLeftAtY(y: number): number {
  if (y >= BODY_Y1 + BODY_R) return BODY_X1;
  if (y <= BODY_Y1) return BODY_X1 + BODY_R;
  const t = 1 - Math.sqrt((y - BODY_Y1) / BODY_R);
  return BODY_X1 + BODY_R * t * t;
}

const TOP_SEAM_Y = BODY_Y1 + BODY_R - 12;
const TOP_SEAM_X = bodyLeftAtY(TOP_SEAM_Y);
const TOP_SEAM_W = BODY_X2 - BODY_X1 - 2 * (TOP_SEAM_X - BODY_X1);

/* Handles. On the one-door fridge the groove sits 26 units in from the body's
   left edge; here each door is mirrored about the centre, so both grooves sit
   26 units in from the fold — they meet in the middle, as asked. */
const HANDLE_INSET = 26;
const HANDLE_W = 10;
const HANDLE_Y = 180;
const HANDLE_H = 340;
const HANDLE_LEFT_X = MID_X - HANDLE_INSET - HANDLE_W;
const HANDLE_RIGHT_X = MID_X + HANDLE_INSET;

export function FridgeIllustrationDuo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className={className}
      style={{
        filter: "drop-shadow(0 24px 26px rgba(0,0,0,0.24))",
        aspectRatio: `${VB_W} / ${VB_H}`,
      }}
    >
      <defs>
        {/* ids are suffixed: the single-door SVG may be on the same page, and
            duplicate ids would make url(#…) resolve to whichever came first. */}
        <linearGradient id="duo-body-grad" x1="0" y1="0" x2="1" y2="0.12">
          <stop offset="0%" stopColor="#EDECE8" />
          <stop offset="55%" stopColor="#E2E0DA" />
          <stop offset="100%" stopColor="#C9C7C0" />
        </linearGradient>
        <radialGradient id="duo-shine" cx="20%" cy="4%" r="46%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <clipPath id="duo-clip">
          <path d={BODY_PATH} />
        </clipPath>
      </defs>

      <path d={BODY_PATH} fill="#DDD9D0" strokeLinecap="round" strokeLinejoin="round" />
      <path d={BODY_PATH} fill="url(#duo-body-grad)" opacity="0.9" strokeLinecap="round" strokeLinejoin="round" />

      <g clipPath="url(#duo-clip)">
        <rect x={BODY_X1} y={BODY_Y1} width={BODY_X2 - BODY_X1} height={BODY_Y2 - BODY_Y1} fill="url(#duo-shine)" opacity="0.7" />
        <rect x={TOP_SEAM_X} y={TOP_SEAM_Y} width={TOP_SEAM_W} height="2" fill="#B9B7B0" />
        <rect x={BODY_X1} y={BASE_SEAM_Y} width={BODY_X2 - BODY_X1} height="2" fill="#B9B7B0" />

        {/* The door split, running the full height of the body. */}
        <rect x={MID_X - 1} y={BODY_Y1} width="2" height={BODY_Y2 - BODY_Y1} fill="#B9B7B0" />
        <rect x={MID_X} y={BODY_Y1} width="1" height={BODY_Y2 - BODY_Y1} fill="#ffffff" opacity="0.5" />

        {/* Two handles, meeting at the fold. */}
        <rect x={HANDLE_LEFT_X} y={HANDLE_Y} width={HANDLE_W} height={HANDLE_H} rx="5" fill="#B7B5AE" />
        <rect x={HANDLE_LEFT_X + 1} y={HANDLE_Y} width="4" height={HANDLE_H} rx="2" fill="#8E8C86" opacity="0.6" />
        <rect x={HANDLE_RIGHT_X} y={HANDLE_Y} width={HANDLE_W} height={HANDLE_H} rx="5" fill="#B7B5AE" />
        <rect x={HANDLE_RIGHT_X + 1} y={HANDLE_Y} width="4" height={HANDLE_H} rx="2" fill="#8E8C86" opacity="0.6" />
      </g>

      <path d={BODY_PATH} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
