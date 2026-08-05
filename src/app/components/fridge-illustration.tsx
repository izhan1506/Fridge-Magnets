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
        <linearGradient id="fridge-cap-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F8F7F4" />
          <stop offset="100%" stopColor="#DEDCD6" />
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
        {/* Top cap - solid color */}
        <rect x={BODY_X1} y={BODY_Y1} width={BODY_X2 - BODY_X1} height={CAP_Y2 - BODY_Y1} fill="#EAE8E0" />
        
        {/* Cap gradient overlay */}
        <rect x={BODY_X1} y={BODY_Y1} width={BODY_X2 - BODY_X1} height={CAP_Y2 - BODY_Y1} fill="url(#fridge-cap-grad)" opacity="0.8" />
        
        {/* Cap seam */}
        <rect x={BODY_X1} y={CAP_Y2} width={BODY_X2 - BODY_X1} height="2" fill="#B9B7B0" />
        
        {/* Shine effect */}
        <rect x={BODY_X1} y={BODY_Y1} width={BODY_X2 - BODY_X1} height={BODY_Y2 - BODY_Y1} fill="url(#fridge-shine)" opacity="0.7" />
        
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
