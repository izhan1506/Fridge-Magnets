const VB_W = 400;
const VB_H = 950;
const BODY_X1 = 20;
const BODY_X2 = 380;
const BODY_Y1 = 14;
const BODY_Y2 = 931;
const BODY_R = 46;
const BODY_PATH = `M${BODY_X1},${BODY_Y2} L${BODY_X1},${BODY_Y1 + BODY_R} Q${BODY_X1},${BODY_Y1} ${BODY_X1 + BODY_R},${BODY_Y1} L${BODY_X2 - BODY_R},${BODY_Y1} Q${BODY_X2},${BODY_Y1} ${BODY_X2},${BODY_Y1 + BODY_R} L${BODY_X2},${BODY_Y2} Z`;
const CAP_Y2 = 34;
const BASE_SEAM_Y = 731;

/**
 * X of the body's left edge at a given y, following the top corner curve.
 * The corner is a quadratic Bézier P0=(X1,Y1+R) P1=(X1,Y1) P2=(X1+R,Y1), which
 * simplifies to y = Y1 + R(1−t)² and x = X1 + Rt² — so the edge at any y is
 * exact, no sampling needed. Below the corner it's just X1.
 */
function bodyLeftAtY(y: number): number {
  if (y >= BODY_Y1 + BODY_R) return BODY_X1;
  if (y <= BODY_Y1) return BODY_X1 + BODY_R;
  const t = 1 - Math.sqrt((y - BODY_Y1) / BODY_R);
  return BODY_X1 + BODY_R * t * t;
}

/* Top trim seam (the freezer/door split). The viewBox is 400 wide and renders
 * ~396 CSS px on a phone, so a viewBox unit is ≈1px — this sits 12px above the
 * point the corner radius ends. That's mid-curve, where the body is narrower
 * than its full width, so the seam is inset to match the silhouette exactly
 * instead of relying on the clip to trim the overhang. */
const TOP_SEAM_Y = BODY_Y1 + BODY_R - 12;
const TOP_SEAM_X = bodyLeftAtY(TOP_SEAM_Y);
const TOP_SEAM_W = BODY_X2 - BODY_X1 - 2 * (TOP_SEAM_X - BODY_X1);

export function FridgeIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className={`${className}`}
      style={{
        filter: "drop-shadow(0 24px 26px rgba(0,0,0,0.24))",
        aspectRatio: `${VB_W} / ${VB_H}`
      }}
    >
      <defs>
        <linearGradient id="fridge-body-grad" x1="0" y1="0" x2="1" y2="0.12">
          <stop offset="0%" stopColor="#EDECE8" />
          <stop offset="55%" stopColor="#E2E0DA" />
          <stop offset="100%" stopColor="#C9C7C0" />
        </linearGradient>
        <radialGradient id="fridge-shine" cx="20%" cy="4%" r="46%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <clipPath id="fridge-clip">
          <path d={BODY_PATH} />
        </clipPath>
      </defs>

      {/* Main fridge body - solid color with gradient overlay */}
      <path d={BODY_PATH} fill="#DDD9D0" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Gradient overlay for depth (supports gradient) */}
      <path d={BODY_PATH} fill="url(#fridge-body-grad)" opacity="0.9" strokeLinecap="round" strokeLinejoin="round" />

      <g clipPath="url(#fridge-clip)">
        {/* Shine effect */}
        <rect x={BODY_X1} y={BODY_Y1} width={BODY_X2 - BODY_X1} height={BODY_Y2 - BODY_Y1} fill="url(#fridge-shine)" opacity="0.7" />
        
        {/* Top trim seam — inset to the body's true width at this height */}
        <rect x={TOP_SEAM_X} y={TOP_SEAM_Y} width={TOP_SEAM_W} height="2" fill="#B9B7B0" />

        {/* Base seam */}
        <rect x={BODY_X1} y={BASE_SEAM_Y} width={BODY_X2 - BODY_X1} height="2" fill="#B9B7B0" />

        {/* Handle groove - solid colors */}
        <rect x="46" y="180" width="10" height="340" rx="5" fill="#B7B5AE" />
        <rect x="47" y="180" width="4" height="340" rx="2" fill="#8E8C86" opacity="0.6" />
      </g>
      
      {/* Border */}
      <path d={BODY_PATH} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
