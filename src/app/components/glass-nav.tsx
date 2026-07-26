import type { ReactNode } from "react";
import { motion } from "motion/react";
import { CircleUserRound, Plus } from "lucide-react";

/**
 * Frosted "liquid glass" bottom nav — Fridge/Map switcher, add-magnet
 * button, and the scrim behind them — used consistently across every main
 * screen. Mirrors the Figma spec at node 463:30/463:34/463:39 (that frame
 * is authored at 1.5x, so px values below are the Figma numbers / 1.5).
 */

const TABS: { id: "fridge" | "map"; label: string }[] = [
  { id: "fridge", label: "Fridge" },
  { id: "map", label: "Map" },
];

export function GlassTabNav({
  value,
  onChange,
}: {
  value: "fridge" | "map";
  onChange: (v: "fridge" | "map") => void;
}) {
  return (
    <div className="relative flex h-[68px] w-48 items-center overflow-hidden rounded-[21px] border border-white/30 bg-white/15 backdrop-blur-[7px]">
      {TABS.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="relative flex h-full flex-1 items-center justify-center rounded-[20px]"
          >
            {active && (
              <motion.span
                layoutId="fridge-map-pill"
                className="absolute inset-0 rounded-[20px] bg-black/80 backdrop-blur-[7px]"
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
              />
            )}
            <span
              className={`relative z-10 text-[13px] leading-[19px] transition-colors duration-200 ${
                active ? "font-medium text-white" : "font-normal text-white/85"
              }`}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function GlassIconButton({
  icon = <Plus size={22} strokeWidth={2.5} />,
  onClick,
  label,
}: {
  icon?: ReactNode;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-[68px] w-[68px] items-center justify-center rounded-[21px] border border-white/30 bg-primary text-primary-foreground"
    >
      {icon}
    </button>
  );
}

/**
 * Squircle frosted-glass icon button — same light-glass treatment as the
 * Fridge/Map toggle (border-white/30 + bg-white/15 + blur), and the same
 * corner-radius proportions as the add-magnet button. Used for the header's
 * notification and profile/settings entry points.
 */
export function GlassSquareIconButton({
  icon = <CircleUserRound size={22} strokeWidth={1.75} />,
  onClick,
  label,
}: {
  icon?: ReactNode;
  onClick?: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-white/30 bg-white/15 text-white backdrop-blur-[7px]"
    >
      {icon}
    </button>
  );
}

/**
 * Bottom nav bar: dark blurred scrim (node 463:39) behind the Fridge/Map
 * toggle + add-magnet button. The toggle and button live directly inside
 * the scrim frame, centered on both axes, so they're always centered
 * relative to that frame rather than merely matching its width by
 * coincidence.
 */
export function BottomNavBar({
  value,
  onTabChange,
  onAdd,
}: {
  value: "fridge" | "map";
  onTabChange: (v: "fridge" | "map") => void;
  onAdd: () => void;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex h-24 items-center justify-center gap-3 bg-black/40 backdrop-blur-[13px]">
      <GlassTabNav value={value} onChange={onTabChange} />
      <GlassIconButton label="Add magnet" onClick={onAdd} />
    </div>
  );
}
