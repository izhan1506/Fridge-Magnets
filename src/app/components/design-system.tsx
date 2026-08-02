import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { Check, Search, Plus, CircleUserRound } from "lucide-react";
import { motion, LayoutGroup } from "motion/react";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FRIDGE MAGNETS DESIGN SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Centralized button component library with two primary design languages:
 *
 * 1. MATERIAL 3 (M3) — General-purpose buttons for modals, dialogs, CTAs
 *    - Variants: filled, tonal, outline, text
 *    - Colors: Primary fills with white glass borders
 *    - Use for: Forms, confirmations, secondary navigation
 *
 * 2. GLASS COMPONENTS — Frosted glass design for the main app chrome
 *    - Tab toggle, icon buttons, bottom nav
 *    - Semi-transparent white/glass treatment
 *    - Backdrop blur, rounded corners (squircles)
 *    - Use for: Primary navigation, add-magnet, header actions
 *
 * All components follow Material 3 design specs with custom glass tweaks.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ──────────────────────────────────────────────────────────────────────────
 * MATERIAL 3 BUTTON
 * ────────────────────────────────────────────────────────────────────────── */

type M3Variant = "filled" | "tonal" | "text" | "outline";

interface M3ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: M3Variant;
  icon?: ReactNode;
  full?: boolean;
}

const M3_VARIANTS: Record<M3Variant, string> = {
  filled:
    "border border-white/30 bg-primary text-primary-foreground hover:brightness-105 active:brightness-95",
  tonal:
    "border border-white/30 bg-white/15 text-white backdrop-blur-[7px] hover:bg-white/25 active:bg-white/20",
  outline:
    "border border-white/30 bg-white/10 text-white backdrop-blur-[7px] hover:bg-white/20 active:bg-white/15",
  text: "bg-transparent text-primary hover:bg-primary-container/60",
};

/**
 * Material 3 button — primary CTA button for dialogs, forms, and general use.
 * Supports 4 variants: filled (primary), tonal (secondary), outline, text.
 *
 * @param variant - "filled" (default) | "tonal" | "outline" | "text"
 * @param icon - Optional leading icon (lucide-react)
 * @param full - If true, button spans full width
 *
 * @example
 * <M3Button variant="filled">Save changes</M3Button>
 * <M3Button variant="tonal" icon={<Plus />}>Add new</M3Button>
 */
export const M3Button = forwardRef<HTMLButtonElement, M3ButtonProps>(function M3Button(
  { variant = "filled", icon, full, className = "", children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 h-12 transition disabled:opacity-40 disabled:pointer-events-none ${
        M3_VARIANTS[variant]
      } ${full ? "w-full" : ""} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
});

/* ──────────────────────────────────────────────────────────────────────────
 * GLASS TAB TOGGLE (Fridge/Map)
 * ────────────────────────────────────────────────────────────────────────── */

interface GlassTabNavProps {
  value: "fridge" | "map";
  onChange: (v: "fridge" | "map") => void;
}

const TABS: { id: "fridge" | "map"; label: string }[] = [
  { id: "fridge", label: "Fridge" },
  { id: "map", label: "Map" },
];

/**
 * Glass toggle — Fridge/Map switcher in the bottom nav.
 * Animates an underlay pill when switching between tabs with smooth transitions.
 *
 * @param value - Current tab: "fridge" | "map"
 * @param onChange - Callback fired when tab changes
 *
 * @example
 * <GlassTabToggle value={tab} onChange={setTab} />
 */
export function GlassTabToggle({ value, onChange }: GlassTabNavProps) {
  const pillPosition = value === "fridge" ? "0" : "100%";

  return (
    <div className="relative flex h-[68px] w-48 items-center overflow-hidden rounded-[21px] border border-white/30 bg-white/15 backdrop-blur-[7px]">
      {/* Animated pill background */}
      <div
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-[18px] bg-black/80 backdrop-blur-[7px]"
        style={{
          transform: `translateX(${pillPosition})`,
          transition: "transform 500ms cubic-bezier(0.32, 0.72, 0.29, 1)",
        }}
      />

      {/* Tab buttons */}
      {TABS.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="relative flex h-full flex-1 items-center justify-center rounded-[20px]"
          >
            <span
              className={`relative z-10 text-[13px] leading-[19px] font-medium transition-all duration-300 ${
                active ? "text-white opacity-100 scale-100" : "text-white/70 opacity-90 scale-95"
              }`}
              style={{
                transformOrigin: "center",
              }}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Deprecated alias for GlassTabToggle. Use GlassTabToggle instead.
 */
export function GlassTabNav(props: GlassTabNavProps) {
  return <GlassTabToggle {...props} />;
}

/* ──────────────────────────────────────────────────────────────────────────
 * GLASS ICON BUTTONS
 * ────────────────────────────────────────────────────────────────────────── */

interface GlassIconButtonProps {
  icon?: ReactNode;
  onClick?: () => void;
  label?: string;
}

/**
 * Rounded icon button — typically used for the "add magnet" button in bottom nav.
 * Primary orange fill with rounded square (squircle) shape.
 *
 * @param icon - Icon to display (defaults to Plus icon)
 * @param onClick - Click handler
 * @param label - aria-label for accessibility
 *
 * @example
 * <GlassIconButton label="Add magnet" onClick={handleAdd} />
 */
export function GlassIconButton({
  icon = <Plus size={22} strokeWidth={2.5} />,
  onClick,
  label,
}: GlassIconButtonProps) {
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

interface GlassSquareIconButtonProps {
  icon?: ReactNode;
  onClick?: () => void;
  label: string;
}

/**
 * Smaller square icon button — for header actions (notifications, profile/settings).
 * Glass frosted treatment: semi-transparent white fill + backdrop blur.
 *
 * @param icon - Icon to display (defaults to CircleUserRound)
 * @param onClick - Click handler
 * @param label - aria-label for accessibility (required)
 *
 * @example
 * <GlassSquareIconButton
 *   icon={<Bell />}
 *   label="Notifications"
 *   onClick={handleNotifications}
 * />
 */
export function GlassSquareIconButton({
  icon = <CircleUserRound size={22} strokeWidth={1.75} />,
  onClick,
  label,
}: GlassSquareIconButtonProps) {
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

/* ──────────────────────────────────────────────────────────────────────────
 * ADDITIONAL M3 COMPONENTS
 * ────────────────────────────────────────────────────────────────────────── */

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  trailing?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, trailing, className = "", ...props },
  ref,
) {
  return (
    <label className="block">
      {label && <span className="block mb-1.5 text-muted-foreground">{label}</span>}
      <span className="relative flex items-center">
        <input
          ref={ref}
          className={`w-full h-12 rounded-2xl bg-input-background border border-border px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25 ${
            trailing ? "pr-11" : ""
          } ${className}`}
          {...props}
        />
        {trailing && <span className="absolute right-3 text-muted-foreground">{trailing}</span>}
      </span>
      {hint && <span className="mt-1 block text-muted-foreground">{hint}</span>}
    </label>
  );
});

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {}

export function SearchBar({ className = "", ...props }: SearchBarProps) {
  return (
    <div className={`flex items-center gap-2 h-12 rounded-full bg-card border border-border px-4 shadow-sm ${className}`}>
      <Search size={20} className="text-muted-foreground shrink-0" />
      <input
        className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
        {...props}
      />
    </div>
  );
}

export function VerifiedBadge({ label = "Verified" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-container text-on-tertiary-container px-2.5 py-1 leading-none">
      <Check size={14} strokeWidth={3} />
      <span className="text-[13px]">{label}</span>
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * SCREEN HEADING
 * ────────────────────────────────────────────────────────────────────────── */

interface ScreenHeadingProps {
  children: ReactNode;
  className?: string;
}

/**
 * Screen heading with automatic contrast:
 * - Uses background color (#171717) as text color
 * - Ensures readability on light/bright backgrounds
 *
 * @example
 * <ScreenHeading>Set your home base</ScreenHeading>
 */
export function ScreenHeading({ children, className = "" }: ScreenHeadingProps) {
  return (
    <h2 className={`font-bold text-[#171717] ${className}`}>
      {children}
    </h2>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * BOTTOM NAV BAR (Composed)
 * ────────────────────────────────────────────────────────────────────────── */

interface BottomNavBarProps {
  value: "fridge" | "map";
  onTabChange: (v: "fridge" | "map") => void;
  onAdd: () => void;
}

/**
 * Full bottom navigation bar — dark scrim with toggle and add-magnet button.
 * Combines GlassTabToggle + GlassIconButton in a centered layout.
 *
 * @param value - Current tab: "fridge" | "map"
 * @param onTabChange - Fired when user switches tabs
 * @param onAdd - Fired when user clicks add-magnet button
 *
 * @example
 * <BottomNavBar
 *   value={currentTab}
 *   onTabChange={setCurrentTab}
 *   onAdd={handleAddMagnet}
 * />
 */
export function BottomNavBar({ value, onTabChange, onAdd }: BottomNavBarProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex h-24 items-center justify-center gap-3 bg-black/40 backdrop-blur-[13px]">
      <GlassTabToggle value={value} onChange={onTabChange} />
      <GlassIconButton label="Add magnet" onClick={onAdd} />
    </div>
  );
}
