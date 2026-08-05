import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { X } from "lucide-react";
import type { Magnet, PublicFridge } from "../lib/types";
import { MAGNET_COLORS } from "../lib/skins";
import { generateFridgeId } from "../lib/fridge-id";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { M3Button } from "./chrome";

/**
 * The fridge's most popular magnet — there's no view/like counter yet, so
 * "most seen" is approximated as the newest verified magnet (falling back to
 * the newest magnet overall; both lists already arrive sorted by recency).
 */
function featuredMagnet(fridge: PublicFridge): Magnet | undefined {
  return fridge.magnets.find((m) => m.verified) ?? fridge.magnets[0];
}

/** Photo-card tail: a rotated square whose corner reads as a downward point. */
function PinTail({ color = "white" }: { color?: string }) {
  return (
    <span
      className="mt-[-6px] h-3.5 w-3.5 rotate-45 rounded-[3px] shadow-[2px_2px_3px_rgba(0,0,0,0.12)]"
      style={{ backgroundColor: color }}
    />
  );
}

/** Home-base marker: the fridge's most popular magnet photo on a rounded photo card. */
export function HomePin({ fridge, onClick }: { fridge: PublicFridge; onClick: () => void }) {
  const top = featuredMagnet(fridge);
  return (
    <motion.button
      onClick={(e) => {
        console.log(`[HomePin] Clicked for ${fridge.profile.name}`);
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.94 }}
      className="relative flex flex-col items-center pointer-events-auto cursor-pointer"
      type="button"
    >
      <span
        className="h-16 w-16 overflow-hidden rounded-[20px] border-[3px] border-white shadow-[0_10px_20px_rgba(0,0,0,0.28)]"
        style={{ backgroundColor: top ? MAGNET_COLORS[top.color] : "var(--magnet-blue)" }}
      >
        {top?.photoUrl && (
          <ImageWithFallback
            src={top.photoUrl}
            alt={`${fridge.profile.name}'s fridge`}
            className="h-full w-full object-cover"
          />
        )}
      </span>
      <PinTail />
    </motion.button>
  );
}

/** Cluster bubble shown when a dense area is zoomed out — same photo-card family as HomePin. */
export function ClusterBubble({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <motion.button
      onClick={(e) => {
        console.log(`[ClusterBubble] Clicked with ${count} fridges`);
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.94 }}
      className="relative flex flex-col items-center pointer-events-auto cursor-pointer"
      type="button"
    >
      <span className="flex h-16 w-16 flex-col items-center justify-center rounded-[20px] border-[3px] border-white bg-primary text-primary-foreground shadow-[0_10px_20px_rgba(0,0,0,0.28)]">
        <span className="leading-none">{count}</span>
        <span className="text-[11px] leading-none opacity-90">fridges</span>
      </span>
      <PinTail color="var(--primary)" />
    </motion.button>
  );
}

/** List of fridges in a cluster shown as scrollable sheet. */
export function ClusterListSheet({
  fridges,
  onSelectFridge,
  onClose,
}: {
  fridges: PublicFridge[];
  onSelectFridge: (fridge: PublicFridge) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }}
      className="absolute inset-x-4 bottom-24 z-20 rounded-3xl bg-card p-4 shadow-2xl max-h-96 flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-fridge">{fridges.length} fridges</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 space-y-2 pr-2">
        {fridges.map((fridge) => {
          const top = featuredMagnet(fridge);
          return (
            <motion.button
              key={fridge.profile.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectFridge(fridge);
              }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition text-left pointer-events-auto cursor-pointer"
            >
              <span
                className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-white/30 shadow-md"
                style={{ backgroundColor: top ? MAGNET_COLORS[top.color] : "var(--magnet-blue)" }}
              >
                {top?.photoUrl && (
                  <ImageWithFallback
                    src={top.photoUrl}
                    alt={`${fridge.profile.name}'s fridge`}
                    className="h-full w-full object-cover"
                  />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{fridge.profile.name}'s fridge</p>
                <p className="text-sm text-muted-foreground truncate">{fridge.profile.homeLabel}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{fridge.magnets.length} magnets</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

/** Small preview card shown on pin tap. */
export function PinPreviewCard({
  fridge,
  onClose,
}: {
  fridge: PublicFridge;
  onClose: () => void;
}) {
  const nav = useNavigate();

  const handleViewFridge = () => {
    const fridgeId = generateFridgeId(fridge.profile.id);
    console.log(`[PinPreviewCard] Button clicked! Navigating to /fridge/${fridgeId} (userId: ${fridge.profile.id})`);
    nav(`/fridge/${fridgeId}`, { state: { userId: fridge.profile.id } });
  };

  useEffect(() => {
    console.log(`[PinPreviewCard] Rendered for fridge: ${fridge.profile.name}`);
  }, [fridge.profile.name]);

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }}
      className="absolute inset-x-4 bottom-24 z-20 rounded-3xl bg-card p-4 shadow-2xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-fridge">{fridge.profile.name}'s fridge</h3>
          <p className="text-muted-foreground">{fridge.profile.homeLabel}</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
      </div>
      <div className="mt-3 flex gap-2 overflow-hidden">
        {fridge.magnets.slice(0, 4).map((m) => (
          <span
            key={m.id}
            className="h-14 w-14 shrink-0 overflow-hidden rounded-xl cursor-pointer hover:opacity-80 transition"
            style={{ backgroundColor: MAGNET_COLORS[m.color], rotate: `${m.rotation}deg` }}
            onClick={handleViewFridge}
          >
            {m.photoUrl && <ImageWithFallback src={m.photoUrl} alt={m.city} className="h-full w-full object-cover" />}
          </span>
        ))}
      </div>
      <M3Button
        full
        className="mt-4 relative z-30"
        onClick={handleViewFridge}
      >
        View full fridge
      </M3Button>
    </motion.div>
  );
}
