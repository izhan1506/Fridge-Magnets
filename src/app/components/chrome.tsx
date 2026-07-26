import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { Check, Search } from "lucide-react";

/* ────────────────────────────────────────────────────────────
 * Material 3 app-chrome primitives.
 * Tonal color roles, rounded corners, flat surfaces, no heavy shadows.
 * (The skeuomorphic fridge screen deliberately does NOT use these.)
 * ──────────────────────────────────────────────────────────── */

type Variant = "filled" | "tonal" | "text" | "outline";

interface M3ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  full?: boolean;
}

/**
 * Glass button family — one design language, taken from the add-magnet button in
 * the bottom nav: a white glass rim on a rounded squircle. Only the fill changes:
 * - `filled` (primary CTA): primary/orange fill, exactly like the add-magnet button.
 * - `tonal` / `outline` (secondary): frosted white-glass fill, like the header's
 *   notification and profile icon buttons — translucent white over the dark
 *   surface, white text, soft blur.
 * - `text`: low-emphasis, no surface.
 */
const VARIANTS: Record<Variant, string> = {
  filled:
    "border border-white/30 bg-primary text-primary-foreground hover:brightness-105 active:brightness-95",
  tonal:
    "border border-white/30 bg-white/15 text-white backdrop-blur-[7px] hover:bg-white/25 active:bg-white/20",
  outline:
    "border border-white/30 bg-white/10 text-white backdrop-blur-[7px] hover:bg-white/20 active:bg-white/15",
  text: "bg-transparent text-primary hover:bg-primary-container/60",
};

export const M3Button = forwardRef<HTMLButtonElement, M3ButtonProps>(function M3Button(
  { variant = "filled", icon, full, className = "", children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 h-12 transition disabled:opacity-40 disabled:pointer-events-none ${VARIANTS[variant]} ${
        full ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
});

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
