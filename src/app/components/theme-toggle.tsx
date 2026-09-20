import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Light/dark switch for the landing page.
 *
 * Scoped on purpose. `useTheme` returns a value to put on `data-theme` on the
 * page root, not on <html>, because only the marketing page has a light
 * palette — the app screens (fridge, map, the glass chrome) are dark-only by
 * design and would break. See the [data-theme="light"] block in theme.css.
 *
 * Dark stays the default, so a first-time visitor sees the page exactly as it
 * has always looked; the toggle is an opt-in and the choice is remembered.
 */

export type Theme = "dark" | "light";

const STORAGE_KEY = "mft-landing-theme";

export function useTheme(): [Theme, () => void] {
  // Read once, lazily, so the first paint is already correct and the page
  // doesn't flash the wrong theme. Storage can throw (private mode, blocked
  // site data), and it can hold anything, so both are handled.
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Not being able to remember the choice is not a reason to break it.
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  return [theme, toggle];
}

export function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      /* Styled from tokens only — no white/xx or hardcoded ink — so the control
         itself stays legible in the theme it is about to leave and the one it
         is about to enter. Matches the page's other buttons at h-12 / 16px. */
      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 text-card-foreground transition hover:bg-muted"
      /* The button is a switch between two states, so it gets the pressed
         state rather than just a label that goes stale. */
      role="switch"
      aria-checked={theme === "light"}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      <span>{theme === "dark" ? "Light" : "Dark"} mode</span>
    </button>
  );
}
