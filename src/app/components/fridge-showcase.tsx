import { FridgeIllustration } from "./fridge-illustration";
import { BottomNavBar, GlassSquareIconButton } from "./design-system";

/**
 * The product shot that sits under the hero: the real fridge screen in a phone,
 * with the magnets that are on it lifted out and floating either side.
 *
 * Every magnet here is a real cutout from the owner's own fridge — the files
 * the app itself produced. For the web they were cropped to their alpha bounds
 * and re-encoded as WebP: 9.1MB of camera-resolution PNGs (one was 2268×4032)
 * down to 314KB, alpha intact. The crop matters as much as the resize — the
 * cutouts carried so much transparent margin that the subject filled only
 * ~19-27% of each frame, so `object-contain` rendered them far smaller than
 * they should be.
 *
 * Nothing here is stock photography, and no other user's magnets are used.
 *
 * The phone deliberately shows the fridge the way the app actually renders it:
 * sized by width, so its base runs past the bottom nav and is clipped. That
 * overflow is the app's intended behaviour (see FridgeAppliance), so faking a
 * fully-visible fridge here would be advertising a screen that doesn't exist.
 */

/** A magnet on the showcase fridge door.
 *
 *  `left`/`top` are the magnet's CENTRE as a percentage of the illustration box
 *  — the same coordinate space DOOR_ZONE uses — and `width` is a percentage of
 *  the box's width. Centring is done with a transform rather than by offsetting
 *  the top-left, so placing one needs no per-image aspect-ratio arithmetic.
 *  `rotate` is each magnet's real stored rotation. */
type DoorMagnet = {
  src: string;
  alt: string;
  left: number;
  top: number;
  width: number;
  rotate: number;
};

const DOOR_MAGNETS: DoorMagnet[] = [
  { src: "/magnets/oslo-viking.webp", alt: "A cast metal Viking medallion magnet from Oslo", left: 32, top: 16, width: 20, rotate: 1 },
  { src: "/magnets/oslo-plate.webp", alt: "An Oslo souvenir number plate magnet", left: 65, top: 12, width: 23, rotate: -5.4 },
  { src: "/magnets/vienna.webp", alt: "A yellow “No Kangaroos in Austria” road sign magnet from Vienna", left: 46, top: 25, width: 16, rotate: 2.2 },
  { src: "/magnets/berlin.webp", alt: "A round SDD Berlin badge magnet", left: 72, top: 25, width: 16, rotate: -4 },
  { src: "/magnets/prague.webp", alt: "A Prague souvenir number plate magnet", left: 67, top: 36, width: 20, rotate: 0.1 },
];

/** The magnets lifted off the door and shown as objects either side. Four
 *  different ones — a medallion, a plate, a badge and a road sign — so the pair
 *  either side reads as a collection rather than one magnet duplicated. */
const FLOATING = {
  farLeft: { src: "/magnets/vienna.webp", alt: "A “No Kangaroos in Austria” magnet from Vienna" },
  left: { src: "/magnets/oslo-viking.webp", alt: "A cast metal Viking medallion magnet from Oslo" },
  right: { src: "/magnets/oslo-plate.webp", alt: "An Oslo souvenir number plate magnet" },
  farRight: { src: "/magnets/berlin.webp", alt: "A round SDD Berlin badge magnet" },
};

/**
 * A magnet floating on the page, as an object rather than a picture of one.
 *
 * No card, no frame, no backdrop — the cutout's own silhouette is the shape,
 * which is the whole point of the background removal, and a drop-shadow filter
 * follows that silhouette instead of a bounding box. An earlier version sat
 * these on cream cards; the cards turned the objects into stamps in a field and
 * are gone.
 */
function FloatingMagnet({
  src,
  alt,
  className = "",
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`absolute select-none object-contain ${className}`}
      style={{ filter: "drop-shadow(0 26px 30px rgba(0,0,0,0.65))", ...style }}
    />
  );
}

/** Half the phone's width plus a gap — the closest a flanking magnet may come
 *  to the page centre. Kept in px, not a percentage, because a percentage
 *  scales with the viewport while the phone does not: as a percentage these
 *  slid straight over the phone at 768px and covered its header. */
const PHONE_CLEARANCE = "164px";

/** The phone, with the fridge screen inside it. */
function PhoneMock() {
  return (
    <div
      className="relative w-[260px] shrink-0 rounded-[2.75rem] border-[7px] border-[#0b0b0b] bg-[#0b0b0b] sm:w-[292px]"
      style={{ boxShadow: "0 45px 90px -25px rgba(0,0,0,0.85)" }}
    >
      {/* Screen. Overflow hidden is what clips the fridge's base, exactly as the
          device does. */}
      <div className="relative aspect-[9/19] overflow-hidden rounded-[2.2rem] bg-background">
        {/* Dynamic island */}
        <div className="absolute left-1/2 top-2.5 z-30 h-[18px] w-[72px] -translate-x-1/2 rounded-full bg-[#0b0b0b]" />

        {/* Screen header — the app's own, at the app's own proportions */}
        <div className="flex items-center justify-between px-4 pb-4 pt-9">
          <p className="font-fridge text-[1.05rem] leading-none text-foreground/90">Your Magnets</p>
          <div className="scale-[0.78] origin-right">
            <GlassSquareIconButton label="Profile" />
          </div>
        </div>

        {/* The fridge, sized by width like the real screen */}
        <div className="relative px-2">
          <div className="relative">
            <FridgeIllustration className="pointer-events-none w-full select-none" />
            {DOOR_MAGNETS.map((m) => (
              <img
                key={m.src + m.left}
                src={m.src}
                alt={m.alt}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="pointer-events-none absolute select-none"
                style={{
                  left: `${m.left}%`,
                  top: `${m.top}%`,
                  width: `${m.width}%`,
                  transform: `translate(-50%, -50%) rotate(${m.rotate}deg)`,
                  filter: "drop-shadow(0 6px 7px rgba(0,0,0,0.28))",
                }}
              />
            ))}
          </div>
        </div>

        <BottomNavBar value="fridge" onTabChange={() => {}} onAdd={() => {}} />
      </div>
    </div>
  );
}

export function FridgeShowcase() {
  return (
    /* No horizontal padding and overflow-hidden: the outermost magnets are meant
       to run off the page and be cropped by its edge, which needs the flanking
       tracks to reach the viewport rather than stopping at a centred container.
       The phone is a fixed width and centres itself, so it needs no gutter. */
    <section className="relative overflow-hidden pb-20 md:pb-28">
      <div className="relative flex w-full items-center justify-center">
        {/* ── Flanking magnets ──
            Bare cutouts on the page, not pictures in frames.

            Inner ones are anchored a fixed number of pixels from the centre
            (PHONE_CLEARANCE) rather than by a percentage of the half-width: a
            percentage scales with the viewport while the phone does not, and at
            768px that put them straight over the phone's header. Outer ones ARE
            positioned by percentage, because those are supposed to track the
            page edge and be cropped by it.

            Hidden below lg — there is no room beside a 292px phone. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/2 lg:block">
          <FloatingMagnet
            {...FLOATING.left}
            className="top-1/2 h-[180px] w-[180px] xl:h-[215px] xl:w-[215px]"
            style={{ right: PHONE_CLEARANCE, transform: "translateY(-50%) rotate(-6deg)" }}
          />
          <FloatingMagnet
            {...FLOATING.farLeft}
            className="left-[-9%] top-[52%] h-[165px] w-[165px] xl:h-[195px] xl:w-[195px]"
            style={{ transform: "translateY(-50%) rotate(-11deg)" }}
          />
        </div>

        <PhoneMock />

        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block">
          <FloatingMagnet
            {...FLOATING.right}
            className="top-1/2 h-[150px] w-[215px] xl:h-[175px] xl:w-[250px]"
            style={{ left: PHONE_CLEARANCE, transform: "translateY(-50%) rotate(5deg)" }}
          />
          <FloatingMagnet
            {...FLOATING.farRight}
            className="right-[-9%] top-[54%] h-[165px] w-[165px] xl:h-[195px] xl:w-[195px]"
            style={{ transform: "translateY(-50%) rotate(9deg)" }}
          />
        </div>
      </div>
    </section>
  );
}
