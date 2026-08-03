import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue } from "motion/react";
import type { Magnet, PublicFridge } from "../../lib/types";
import { DOOR_ZONE } from "../../lib/skins";
import { useSession } from "../../lib/session";
import { FridgeAppliance, MagnetTile } from "../fridge";
import { DEVICE_W } from "../layout";
import { StoryViewer } from "../story-viewer";

/* ── Door canvas geometry ──
 * The app is fixed to the 402pt frame (layout.tsx); FridgeAppliance renders the
 * illustration at min(frame − 2×8px padding, 440px) wide, and the placement
 * canvas is a % sub-box of that (skins.ts DOOR_ZONE). So the canvas pixel size
 * is deterministic and matches the on-screen box exactly. */
const MAGNET_SIZE = 120; // base tile side, px (a magnet's scale multiplies this)
const APPLIANCE_W = Math.min(DEVICE_W - 16, 440);
const ILLO_H = (APPLIANCE_W * 780) / 400; // illustration viewBox is 400×780
const CANVAS_W = APPLIANCE_W * (DOOR_ZONE.width / 100);
const CANVAS_H = ILLO_H * (DOOR_ZONE.height / 100);

/* Magnets may overlap each other (like a real fridge), so there's no collision
 * math — we only keep each tile within the door. `halfBox` is a tile's half-size
 * after its ±6° rotation (~1.1× the side), used to keep it inside the canvas. */
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const tileSize = (m: Magnet) => MAGNET_SIZE * (m.scale ?? 1);
const halfBox = (size: number) => (size * 1.05) / 2; // half of the rotated bounding box

/** Deterministic PRNG (mulberry32) so an unplaced magnet set lands the same way
 *  across renders/sessions (until placement is persisted). */
function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Resolve every magnet to a canvas position: stored positions are honored;
 * magnets without one get a random spot (seeded by id, so it's stable across
 * renders/sessions until it's persisted). Magnets may overlap each other — like
 * a real fridge — so there's no collision avoidance; each is only kept within the
 * door so it doesn't clip off the edge. Pure/stable → safe to memoize.
 */
function placeMagnets(magnets: Magnet[]): Map<string, { posX: number; posY: number }> {
  const out = new Map<string, { posX: number; posY: number }>();
  for (const m of magnets) {
    if (m.posX != null && m.posY != null) {
      out.set(m.id, { posX: m.posX, posY: m.posY });
      continue;
    }
    const half = halfBox(tileSize(m));
    const rng = mulberry32(hashStr(m.id));
    const cx = clamp(half + rng() * (CANVAS_W - 2 * half), half, CANVAS_W - half);
    const cy = clamp(half + rng() * (CANVAS_H - 2 * half), half, CANVAS_H - half);
    out.set(m.id, { posX: cx / CANVAS_W, posY: cy / CANVAS_H });
  }
  return out;
}

/**
 * The skeuomorphic fridge: an appliance standing on the wall with magnets
 * scattered across its upper door. Magnets are randomly placed and may overlap,
 * and on the owner's own fridge can be long-pressed and dragged to a new spot,
 * which is saved. Reused for the read-only "someone else's fridge" view, where
 * dragging is disabled.
 */
export function FridgeView({
  fridge,
  readOnly,
  headerAction,
}: {
  fridge: PublicFridge;
  readOnly?: boolean;
  headerAction?: ReactNode;
}) {
  const { updateMagnet } = useSession();
  const [storyIndex, setStoryIndex] = useState<number | null>(null);
  const { profile, magnets } = fridge;
  const empty = magnets.length === 0;

  const resolved = useMemo(() => placeMagnets(magnets), [magnets]);

  // Persist the auto-assigned spot for any magnet that doesn't have one yet, so
  // the random layout is stable and becomes the starting point for dragging.
  const persistedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (readOnly) return;
    for (const m of magnets) {
      if (m.posX == null && !persistedRef.current.has(m.id)) {
        persistedRef.current.add(m.id);
        const p = resolved.get(m.id);
        if (p) updateMagnet(m.id, { posX: p.posX, posY: p.posY });
      }
    }
  }, [magnets, resolved, readOnly, updateMagnet]);

  return (
    <>
      {!readOnly && (
        <div className="absolute inset-x-0 top-0 pt-6 pb-6 mb-6 z-30 flex items-center justify-between px-6 gap-4">
          <p className="font-fridge text-[1.4rem] text-foreground/90">
            Your Magnets
          </p>
          {headerAction}
        </div>
      )}

      <div className="mt-8">
      <FridgeAppliance
        overlay={
          empty ? (
            <p className="max-w-[220px] text-muted-foreground">
              {readOnly
                ? `${profile.name} hasn't added any magnets yet.`
                : "Tap the plus below to add your first magnet."}
            </p>
          ) : undefined
        }
      >
        {empty
          ? null
          : magnets.map((m, i) => {
            const p = resolved.get(m.id)!;
            return (
              <DraggableMagnet
                key={m.id}
                magnet={m}
                size={tileSize(m)}
                posX={p.posX}
                posY={p.posY}
                editable={!readOnly}
                onOpen={() => setStoryIndex(i)}
                onMoved={(nx, ny) => updateMagnet(m.id, { posX: nx, posY: ny })}
              />
            );
          })}
      </FridgeAppliance>
      </div>

      {storyIndex !== null && (
        <StoryViewer
          magnets={magnets}
          startIndex={storyIndex}
          ownerName={profile.name}
          onClose={() => setStoryIndex(null)}
        />
      )}
    </>
  );
}

/**
 * A magnet you can long-press to pick up and drag. A quick tap opens its story;
 * pressing and holding (~300ms) lifts it so it can be dragged to a new spot on
 * the door, and the position is saved on release. Dragging is off when readOnly.
 *
 * Drag is done by hand (pointer events + pointer capture) rather than a library
 * gesture, so a *delayed* long-press can reliably begin tracking mid-press.
 */
function DraggableMagnet({
  magnet,
  size,
  posX,
  posY,
  editable,
  onOpen,
  onMoved,
}: {
  magnet: Magnet;
  size: number;
  posX: number;
  posY: number;
  editable: boolean;
  onOpen: () => void;
  onMoved: (posX: number, posY: number) => void;
}) {
  const holdTimer = useRef<number>();
  const dragging = useRef(false);
  const didDrag = useRef(false);
  const start = useRef({ px: 0, py: 0, bx: 0, by: 0 });
  const cleanup = useRef<() => void>();
  const [lifted, setLifted] = useState(false);

  const tileHalf = size / 2;
  const rotHalf = halfBox(size); // keeps the rotated tile inside the canvas
  const baseX = posX * CANVAS_W - tileHalf;
  const baseY = posY * CANVAS_H - tileHalf;
  const x = useMotionValue(baseX);
  const y = useMotionValue(baseY);

  // Follow external position changes (e.g. once the auto-placed spot is saved),
  // but never yank the tile out from under an in-progress drag.
  useEffect(() => {
    if (!lifted) {
      x.set(baseX);
      y.set(baseY);
    }
  }, [baseX, baseY]); // eslint-disable-line react-hooks/exhaustive-deps

  // Once lifted, track the pointer on `window` so the tile keeps following even
  // as it slides out from under the cursor (element-level capture is unreliable
  // here because the child button runs its own tap gesture).
  function beginDrag() {
    dragging.current = true;
    didDrag.current = true; // suppresses the click-to-open on release
    setLifted(true);

    const onMove = (e: PointerEvent) => {
      const { px, py, bx, by } = start.current;
      x.set(bx + (e.clientX - px));
      y.set(by + (e.clientY - py));
    };
    const onUp = () => {
      cleanup.current?.();
      dragging.current = false;
      setLifted(false);
      const cx = clamp(x.get() + tileHalf, 0, CANVAS_W);
      const cy = clamp(y.get() + tileHalf, 0, CANVAS_H);
      x.set(cx - tileHalf);
      y.set(cy - tileHalf);
      onMoved(cx / CANVAS_W, cy / CANVAS_H);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    cleanup.current = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      cleanup.current = undefined;
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!editable) return;
    didDrag.current = false;
    start.current = { px: e.clientX, py: e.clientY, bx: x.get(), by: y.get() };
    holdTimer.current = window.setTimeout(beginDrag, 300);
  }
  function endHold() {
    // Cancels a would-be long-press; an active drag is ended by its window `up`.
    clearTimeout(holdTimer.current);
  }
  function handleClick() {
    if (didDrag.current) return;
    onOpen();
  }

  // Drop any live drag listeners if the tile unmounts mid-drag.
  useEffect(() => () => cleanup.current?.(), []);

  return (
    <motion.div
      className="absolute left-0 top-0 touch-none"
      style={{ x, y, width: size, height: size, zIndex: lifted ? 50 : 1 }}
      onPointerDown={onPointerDown}
      onPointerUp={endHold}
      onPointerLeave={endHold}
      animate={{ scale: lifted ? 1.12 : 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <MagnetTile magnet={magnet} size={size} onClick={handleClick} />
    </motion.div>
  );
}
