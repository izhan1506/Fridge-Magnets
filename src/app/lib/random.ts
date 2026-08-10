/**
 * Seeded, deterministic randomness.
 *
 * Used anywhere a value must look arbitrary but stay identical across renders,
 * sessions and devices — magnet auto-placement, map pin jitter — so the same id
 * always produces the same result.
 */

/** Deterministic PRNG (mulberry32). Same seed → same sequence, everywhere. */
export function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a — turns an id string into a stable 32-bit seed. */
export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
