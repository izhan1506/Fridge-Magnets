import { type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Wifi, BatteryFull, SignalHigh } from "lucide-react";

/** iPhone 17 Pro's CSS viewport — 402×874pt. */
export const DEVICE_W = 402;
export const DEVICE_H = 874;

/** iOS-style status bar (desktop/web only). Hidden on mobile. */
function StatusBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 hidden md:flex h-[50px] items-center justify-between px-6 text-white">
      <span className="text-[15px] font-semibold">9:41</span>
      <div className="flex items-center gap-1.5">
        <SignalHigh size={16} strokeWidth={2.5} />
        <Wifi size={16} strokeWidth={2.5} />
        <BatteryFull size={18} strokeWidth={2} />
      </div>
    </div>
  );
}

/** Phone-first shell. On desktop: fixed 402×874 frame with shadow. On mobile: full screen, no frame. */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full overflow-y-auto bg-[#0b0b0b] flex items-center justify-center py-6">
      {/* Desktop: Fixed frame with rounded corners and shadow */}
      <div
        className="hidden md:block relative bg-background shadow-xl overflow-hidden rounded-[2.25rem]"
        style={{ width: DEVICE_W, height: DEVICE_H }}
      >
        {children}
        <StatusBar />
      </div>

      {/* Mobile: Full screen, no frame, no rounded corners */}
      <div className="md:hidden relative w-full h-screen overflow-hidden bg-background">
        {children}
      </div>
    </div>
  );
}

/** Material 3 bottom sheet / modal container. */
export function BottomSheet({
  open,
  onClose,
  children,
  title,
  action,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  action?: { icon: ReactNode; onClick: () => void; label: string };
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            className="relative w-full bg-card rounded-t-3xl p-5 pb-8 max-h-[85%] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
            {title && (
              <div className="mb-3 flex items-center justify-between">
                <h2>{title}</h2>
                <div className="flex items-center gap-2">
                  {action && (
                    <button onClick={action.onClick} className="text-destructive hover:text-destructive/80" aria-label={action.label}>
                      {action.icon}
                    </button>
                  )}
                  <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                    <X size={22} />
                  </button>
                </div>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
