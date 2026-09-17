import { MapPin } from "lucide-react";
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
 *  `left`/`top` are percentages of the illustration box, and `width` is a
 *  percentage of it too — the same coordinate space DOOR_ZONE uses, so these
 *  land on the door face at any rendered size. `rotate` is each magnet's real
 *  stored rotation, so the arrangement is the owner's, not invented. */
type DoorMagnet = {
  src: string;
  alt: string;
  left: number;
  top: number;
  width: number;
  rotate: number;
};

const DOOR_MAGNETS: DoorMagnet[] = [
  { src: "/magnets/oslo-plate.webp", alt: "An Oslo souvenir number plate magnet", left: 29, top: 12, width: 34, rotate: -5.4 },
  { src: "/magnets/vienna.webp", alt: "A yellow “No Kangaroos in Austria” road sign magnet from Vienna", left: 19, top: 25, width: 26, rotate: 2.2 },
  { src: "/magnets/berlin.webp", alt: "A round SDD Berlin badge magnet", left: 55, top: 26, width: 24, rotate: -4 },
  { src: "/magnets/prague.webp", alt: "A Prague souvenir number plate magnet", left: 32, top: 40, width: 32, rotate: 0.1 },
  { src: "/magnets/oslo-viking.webp", alt: "A cast metal Viking medallion magnet from Oslo", left: 51, top: 50, width: 26, rotate: 1 },
];

/** The magnets lifted off the door and shown as objects either side. */
const FLOATING = {
  farLeft: { src: "/magnets/vienna.webp", alt: "A “No Kangaroos in Austria” magnet from Vienna", city: "Vienna" },
  left: { src: "/magnets/prague.webp", alt: "A Prague souvenir number plate magnet", city: "Prague" },
  right: { src: "/magnets/oslo-plate.webp", alt: "An Oslo souvenir number plate magnet", city: "Oslo" },
  farRight: { src: "/magnets/oslo-viking.webp", alt: "A cast metal Viking medallion magnet from Oslo", city: "Oslo" },
};

/**
 * A magnet shown as an object on a card.
 *
 * The card is fridge-door cream rather than the page's dark surface: these are
 * cutouts with real transparency, and a pale ground is what makes a souvenir
 * magnet read as one instead of dissolving into the background.
 */
function MagnetCard({
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
    <figure
      className={`overflow-hidden rounded-[1.75rem] border border-white/10 p-3.5 ${className}`}
      style={{
        background: "linear-gradient(160deg, var(--skin-steel-a), var(--skin-steel-b))",
        boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7)",
        ...style,
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="h-full w-full select-none object-contain"
      />
    </figure>
  );
}

/** Small location tag, as the map's pins are labelled. */
function CityPill({ city, className = "" }: { city: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[#171717] shadow-lg ${className}`}
    >
      <MapPin size={15} strokeWidth={2.5} className="text-primary" />
      <span className="font-medium leading-none">{city}</span>
    </span>
  );
}

/** Half the phone's width plus a comfortable gap — the closest an inner card
 *  may come to the page centre. Kept in px, not a percentage, so it doesn't
 *  drift into the phone as the viewport narrows. */
const PHONE_CLEARANCE = "182px";

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
                  transform: `rotate(${m.rotate}deg)`,
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
    <section className="relative overflow-hidden px-5 pb-20 md:px-8 md:pb-28">
      {/* ── Decorative ground ──
          A warm sweep behind the phone, echoing the Welcome screen's aurora, so
          the composition has a middle ground between the dark page and the
          product. Purely ornamental: aria-hidden and non-interactive. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-x-0 top-1/2 h-[520px] -translate-y-1/2"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 50%, rgba(244,97,0,0.22) 0%, rgba(244,97,0,0.07) 45%, rgba(244,97,0,0) 72%)",
          }}
        />
        {/* Heavily blurred, because an un-blurred stroke this wide reads as a
            muddy brown stripe across the section rather than as light. */}
        <svg
          viewBox="0 0 1200 520"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-x-0 top-1/2 h-[520px] w-full -translate-y-1/2"
          style={{ filter: "blur(46px)" }}
        >
          <path
            d="M-60 380 C 220 160, 400 460, 620 300 S 1000 120, 1260 250"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="96"
            strokeLinecap="round"
            opacity="0.13"
          />
        </svg>
      </div>

      <div className="relative mx-auto flex max-w-6xl items-center justify-center">
        {/* ── Flanking magnets ──
            Anchored a fixed distance from the page centre rather than by a
            percentage of the half-width, because a percentage scales with the
            viewport while the phone does not: at 768px the cards slid straight
            over the phone and covered its header. PHONE_CLEARANCE is half the
            phone plus a gap, so the inner cards can never reach it.

            Only from lg, and the half-cropped outer pair only from xl — below
            that there is genuinely no room beside a 292px phone. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/2 lg:block">
          <MagnetCard
            {...FLOATING.left}
            className="absolute top-[7%] h-[180px] w-[215px] xl:h-[205px] xl:w-[240px]"
            style={{ right: PHONE_CLEARANCE, transform: "rotate(5deg)" }}
          />
          {/* Half off the page edge, as the reference crops its outermost card. */}
          <MagnetCard
            {...FLOATING.farLeft}
            className="absolute left-[-5%] top-[40%] hidden h-[165px] w-[140px] xl:block"
            style={{ transform: "rotate(-9deg)" }}
          />
        </div>

        <PhoneMock />

        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block">
          <div className="absolute top-[9%]" style={{ left: PHONE_CLEARANCE }}>
            <MagnetCard
              {...FLOATING.right}
              aria-hidden="true"
              className="h-[180px] w-[215px] xl:h-[205px] xl:w-[240px]"
              style={{ transform: "rotate(-5deg)" }}
            />
            {/* Tagged like a map pin, to tie the object back to a place. */}
            <CityPill city={FLOATING.right.city} className="absolute -right-3 -top-4" />
          </div>
          <MagnetCard
            {...FLOATING.farRight}
            aria-hidden="true"
            className="absolute right-[-5%] top-[42%] hidden h-[165px] w-[145px] xl:block"
            style={{ transform: "rotate(8deg)" }}
          />
        </div>
      </div>
    </section>
  );
}
