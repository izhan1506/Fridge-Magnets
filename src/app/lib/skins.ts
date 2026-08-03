import type { MagnetColor } from "./types";

export const MAGNET_COLORS: Record<MagnetColor, string> = {
  coral: "var(--magnet-coral)",
  pink: "var(--magnet-pink)",
  blue: "var(--magnet-blue)",
  amber: "var(--magnet-amber)",
  teal: "var(--magnet-teal)",
  purple: "var(--magnet-purple)",
};

const COLOR_KEYS: MagnetColor[] = ["coral", "pink", "blue", "amber", "teal", "purple"];

export function randomMagnetColor(): MagnetColor {
  return COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
}

/**
 * Magnet placement canvas as % of the fridge illustration's box (viewBox
 * 400×780). Spans the whole door face — from just below the top trim seam
 * (y≈34) down to the base seam (y=600) — staying clear only of the handle
 * groove on the left edge (x≈56).
 */
export const DOOR_ZONE = { left: 15, top: 5, width: 65, height: 71 };
