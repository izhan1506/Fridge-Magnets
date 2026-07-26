import { type ReactNode } from "react";
import { motion } from "motion/react";
import type { Magnet } from "../lib/types";
import { MAGNET_COLORS, DOOR_ZONE } from "../lib/skins";
import { FridgeIllustration } from "./fridge-illustration";
import { ImageWithFallback } from "./figma/ImageWithFallback";

/**
 * The app's one fridge appliance, standing on the sunset wall. Magnets are
 * scattered inside the door zone via `children`; `overlay` (e.g. the empty
 * state) is centered on the fridge itself, not the offset door zone.
 */
export function FridgeAppliance({ children, overlay }: { children: ReactNode; overlay?: ReactNode }) {
  return (
    <div className="flex flex-1 items-end justify-center overflow-y-auto px-2">
      <div className="relative w-full max-w-[440px]">
        <FridgeIllustration className="pointer-events-none w-full select-none" />
        {/* magnet placement canvas (percentages of the image box) — a bounded box
            so magnets can be freely positioned and dragged within the door face */}
        <div
          className="absolute"
          style={{
            left: `${DOOR_ZONE.left}%`,
            top: `${DOOR_ZONE.top}%`,
            width: `${DOOR_ZONE.width}%`,
            height: `${DOOR_ZONE.height}%`,
          }}
        >
          {children}
        </div>
        {overlay && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-12 text-center">
            {overlay}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * A magnet tile: the user's background-removed cutout, hand-placed with a slight
 * rotation and a real drop-shadow. Also supports a placeholder-color state.
 */
export function MagnetTile({
  magnet,
  onClick,
  size = 116,
}: {
  magnet: Magnet;
  onClick?: () => void;
  size?: number;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08, rotate: 0, zIndex: 20 }}
      whileTap={{ scale: 0.96 }}
      style={{ rotate: `${magnet.rotation}deg`, width: size, height: size }}
      className="relative shrink-0"
    >
      <div
        className={`flex h-full w-full items-center justify-center ${
          magnet.photoUrl ? "" : "overflow-hidden rounded-2xl"
        }`}
        style={{
          backgroundColor: magnet.photoUrl ? undefined : MAGNET_COLORS[magnet.color],
          filter: "drop-shadow(0 15px 18px rgba(0,0,0,0.28))",
        }}
      >
        {magnet.photoUrl ? (
          <ImageWithFallback
            src={magnet.photoUrl}
            alt={`Magnet from ${magnet.city}, ${magnet.country}`}
            className="h-full w-full select-none object-contain"
            draggable={false}
          />
        ) : (
          <span className="font-fridge px-2 text-center text-white/95">{magnet.city}</span>
        )}
      </div>
      {!magnet.photoUrl && (
        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-white/50 blur-[1px]" />
      )}
    </motion.button>
  );
}
