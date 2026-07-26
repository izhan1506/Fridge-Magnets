import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { X, ExternalLink, CalendarDays } from "lucide-react";
import type { Magnet } from "../lib/types";
import { VerifiedBadge } from "./chrome";
import { getInstagramEmbedUrl } from "../lib/instagram";

const DURATION_MS = 4500;
/** Below this press length, a tap-and-release counts as a tap (navigate); at or above, it's a hold (pause). */
const HOLD_THRESHOLD_MS = 200;

/**
 * Full-screen, auto-advancing story playback for a fridge's magnets —
 * segmented top progress bar, tap left/right to go back/forward, closes
 * after the last one. An original build of the familiar "stories" pattern
 * (Instagram/Snapchat/WhatsApp all share it), not a copy of any of them.
 */
export function StoryViewer({
  magnets,
  startIndex,
  ownerName,
  onClose,
}: {
  magnets: Magnet[];
  startIndex: number;
  ownerName: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const rafRef = useRef<number>();
  const elapsedRef = useRef(0);
  const pressStartRef = useRef(0);

  const magnet = magnets[index];
  const embedUrl = magnet ? getInstagramEmbedUrl(magnet.instagramUrl ?? "") : null;

  function goTo(next: number) {
    if (next < 0) {
      setIndex(0);
      setProgress(0);
      elapsedRef.current = 0;
      return;
    }
    if (next >= magnets.length) {
      onClose();
      return;
    }
    setIndex(next);
    setProgress(0);
    elapsedRef.current = 0;
  }

  // Press-and-hold pauses immediately; releasing quickly (a tap) navigates,
  // releasing after a hold just resumes playback where it was.
  function onPressStart() {
    pressStartRef.current = performance.now();
    setPaused(true);
  }
  function onPressEnd(direction: -1 | 1) {
    const held = performance.now() - pressStartRef.current;
    setPaused(false);
    if (held < HOLD_THRESHOLD_MS) goTo(index + direction);
  }
  function onPressCancel() {
    setPaused(false);
  }

  useEffect(() => {
    // Embedded posts/Reels play on their own timeline — let the viewer sit
    // on that segment until the person taps through instead of guessing a duration.
    // Holding a tap zone pauses the same way, freezing elapsedRef until released.
    if (embedUrl || paused) return;
    let start = performance.now() - elapsedRef.current;
    function tick(now: number) {
      elapsedRef.current = now - start;
      const p = Math.min(1, elapsedRef.current / DURATION_MS);
      setProgress(p);
      if (p >= 1) {
        goTo(index + 1);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, embedUrl, paused]);

  // Preload the next photo so advancing never shows a blank frame while it loads.
  useEffect(() => {
    const next = magnets[index + 1];
    if (next?.photoUrl) {
      const img = new Image();
      img.src = next.photoUrl;
    }
  }, [index, magnets]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!magnet) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* segmented progress bar — skipped over an embed, which plays edge-to-edge with no chrome of ours on top */}
      {!embedUrl && (
        <div className="absolute inset-x-3 top-3 z-10 flex gap-1">
          {magnets.map((m, i) => (
            <div key={m.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full bg-white"
                style={{
                  width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%",
                  transition: i === index ? "none" : undefined,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* header — the embed already carries Instagram's own avatar/username, so we only show ours for the plain photo view */}
      {embedUrl ? (
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm hover:bg-black/60"
        >
          <X size={22} />
        </button>
      ) : (
        <div className="absolute inset-x-3 top-8 z-10 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 font-fridge">
              {ownerName.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">{ownerName}</p>
              <p className="text-xs leading-tight text-white/70">
                {magnet.city}
                {magnet.country ? `, ${magnet.country}` : ""}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-white/10">
            <X size={24} />
          </button>
        </div>
      )}

      {/* media — an embed fills the whole screen edge-to-edge, same as a native story */}
      {embedUrl ? (
        <iframe
          key={magnet.id}
          src={embedUrl}
          title={`Instagram post from ${magnet.city}`}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; encrypted-media"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {magnet.photoUrl && (
            <motion.img
              key={magnet.id}
              src={magnet.photoUrl}
              alt={`Magnet from ${magnet.city}`}
              className="max-h-full max-w-full object-contain"
              initial={{ opacity: 0, filter: "blur(18px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}
        </div>
      )}
      {!embedUrl && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />
      )}

      {/* tap zones — narrowed to the edges over an embed so its own controls stay clickable.
          A quick press navigates; holding past HOLD_THRESHOLD_MS pauses in place instead. */}
      <button
        onPointerDown={onPressStart}
        onPointerUp={() => onPressEnd(-1)}
        onPointerLeave={onPressCancel}
        onPointerCancel={onPressCancel}
        aria-label="Previous magnet"
        className={`absolute inset-y-0 left-0 z-[5] ${embedUrl ? "w-[10%]" : "w-[30%]"}`}
      />
      <button
        onPointerDown={onPressStart}
        onPointerUp={() => onPressEnd(1)}
        onPointerLeave={onPressCancel}
        onPointerCancel={onPressCancel}
        aria-label="Next magnet"
        className={`absolute inset-y-0 right-0 z-[5] ${embedUrl ? "w-[10%]" : "w-[70%]"}`}
      />

      {/* footer — the embed already carries its own caption/likes chrome, so we only add our own for the plain photo view */}
      {!embedUrl && (
        <div className="pointer-events-none absolute inset-x-4 bottom-6 z-10 text-white">
          {magnet.caption && <p className="mb-2 pointer-events-none">{magnet.caption}</p>}
          <div className="flex items-center gap-3 text-white/80">
            {magnet.verified && <VerifiedBadge />}
            <span className="flex items-center gap-1 text-xs">
              <CalendarDays size={14} />
              {new Date(magnet.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          {magnet.instagramUrl && (
            <a
              href={magnet.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto relative z-20 mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur-sm hover:bg-white/25"
            >
              <ExternalLink size={16} />
              View on Instagram
            </a>
          )}
        </div>
      )}
    </div>
  );
}
