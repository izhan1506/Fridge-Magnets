import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { M3Button } from "../chrome";

/**
 * Splash / welcome screen. A warm "aurora" glow fills the top and fades to
 * near-black, with the pitch anchored to the bottom over the dark. Adapted from
 * the Meta-glasses splash concept to the Fridge brand.
 */
export function Welcome() {
  const nav = useNavigate();

  return (
    <div className="relative h-full overflow-hidden bg-[#0a0a0a] text-white">
      {/* aurora glow — concentrated up top, fading to black */}
      <motion.div
        initial={{ opacity: 0, scale: 1.12 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(115% 66% at 72% 0%, rgba(255,170,60,0.8) 0%, rgba(255,170,60,0) 40%),
            radial-gradient(100% 60% at 50% 20%, rgba(255,42,0,0.96) 0%, rgba(255,42,0,0) 54%),
            radial-gradient(135% 90% at 44% 30%, rgba(226,66,0,0.9) 0%, rgba(226,66,0,0) 62%)
          `,
        }}
      />
      {/* darken the lower half so the copy stays legible */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to top, #0a0a0a 16%, rgba(10,10,10,0.82) 33%, rgba(10,10,10,0) 56%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        className="relative flex h-full flex-col justify-end px-6 pb-10"
      >
        <h1 className="font-fridge text-[2.7rem] leading-[0.98] tracking-tight">
          Turn your travels
          <br />
          into <span className="text-primary">tales.</span>
        </h1>
        <p className="mt-3.5 max-w-[19rem] text-[15px] leading-relaxed text-white/65">
          Snap a photo from any trip, pin it to your fridge, and find fellow travelers on the map.
        </p>

        <M3Button full className="mt-7" onClick={() => nav("/auth")}>
          Start collecting
        </M3Button>

        <p className="mt-4 text-center text-[15px] text-white/65">
          Already have an account?{" "}
          <button onClick={() => nav("/auth")} className="font-medium text-primary">
            Log in
          </button>
        </p>
      </motion.div>
    </div>
  );
}
