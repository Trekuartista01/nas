"use client";

import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useId, useLayoutEffect, useState, type ReactNode } from "react";
import { LineupReveal } from "@/components/catalog/LineupReveal";
import { useIsMobile, useReducedMotionSafe } from "@/components/motion/useMotionScale";

interface ModelsShutterHeroProps {
  title?: string;
  /** The lineup the door opens onto (the catalog filters + grid). */
  children: ReactNode;
  /** Slats on desktop / phones. */
  slats?: number;
  mobileSlats?: number;
  /** How long the door takes to roll up, and how long it stays shut first (seconds). */
  duration?: number;
  delay?: number;
}

/* The housing at the top = the header bar (76px, 80px from 1024px) + a 30px drum (Tailwind classes below). */
/** How far a slat rises into the one above before that one starts moving (fraction of a slat). */
const OVERLAP = 0.4;
/** Bottom rail height, px. */
const RAIL = 26;

/**
 * /modelet: a closed roller shutter with MODELET sprayed on it, over the lineup. When the page opens
 * the door rolls up by itself (`duration`, 1s, after a short `delay`): slat by slat, bottom first, each
 * slat riding up into the one above, then squashing to 0.85 into the drum, and uncovers the lineup
 * (filters + model grid) sitting in its normal place behind it. The door is a fixed overlay that
 * hides when it is up; the page scrolls normally the whole time. At half open it tells the lineup
 * (LineupReveal) to ease in: filters, sort row and cards rise into place one after another.
 * Plays on every visit, also when Next shows a kept-alive copy of the page again.
 * The header stays clear while the door moves (`data-nav-clear` on <html>, as on the Sport Line video).
 * Reduced motion: no door, just the lineup. The slats are aria-hidden; the real <h1> is visually hidden.
 */
export default function ModelsShutterHero({ title = "MODELET", children, slats = 16, mobileSlats = 10, duration = 1, delay = 0.15 }: ModelsShutterHeroProps) {
  const reduce = useReducedMotionSafe();
  const mobile = useIsMobile();
  const n = mobile ? mobileSlats : slats;

  const progress = useMotionValue(0);
  const visibility = useTransform(progress, (v) => (v >= 1 ? "hidden" : "visible"));
  // The lineup eases in once the door is about half open (LineupReveal → CatalogLayout / CatalogGrid);
  // set from the progress change events below.
  const [opened, setOpened] = useState(false);

  // Every visit starts with the door shut, before paint: Next can keep this page alive in the
  // background and show it again (e.g. "See all models" on the homepage), and effects re-run then.
  useLayoutEffect(() => {
    if (!reduce) progress.set(0);
  }, [reduce, progress]);

  // Roll up once, on arrival. Wait until the browser is idle after the page has rendered (hydration
  // and the first image decodes cost long frames), then two frames more, so the door never starts on a
  // busy main thread and stutters.
  useEffect(() => {
    if (reduce) {
      progress.set(1);
      return;
    }
    let controls: ReturnType<typeof animate> | undefined;
    let raf = 0;
    const go = () => {
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          controls = animate(progress, 1, { duration, delay, ease: [0.6, 0, 0.25, 1] });
        });
      });
    };
    // Safari has no requestIdleCallback: a short timeout stands in.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle ? window.requestIdleCallback(go, { timeout: 700 }) : window.setTimeout(go, 200);
    return () => {
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      cancelAnimationFrame(raf);
      controls?.stop();
    };
  }, [reduce, progress, duration, delay]);

  // Header clear while the door is shut or moving.
  useMotionValueEvent(progress, "change", (p) => {
    // Follows the door both ways: the reset to 0 hides the lineup again, half open shows it.
    setOpened(p >= 0.45);
    const html = document.documentElement;
    if (p < 1) html.setAttribute("data-nav-clear", "");
    else html.removeAttribute("data-nav-clear");
  });
  useEffect(() => () => document.documentElement.removeAttribute("data-nav-clear"), []);

  return (
    <>
      <h1 className="sr-only">{title}</h1>
      <LineupReveal.Provider value={opened}>{children}</LineupReveal.Provider>
      {!reduce && (
        <motion.div style={{ visibility }} className="pointer-events-none fixed inset-0 z-40">
          <Shutter title={title} count={n} progress={progress} />
        </motion.div>
      )}
    </>
  );
}

/* ───────────────────────── Shutter (front layer) ───────────────────────── */

function Shutter({ title, count, progress }: { title: string; count: number; progress: MotionValue<number> }) {
  const filterId = useId().replace(/:/g, "");
  // Lift of the bottom slat in "slat heights": the bottom slat travels the whole curtain plus the
  // overlap build-up of every slat above it, plus one slat to clear into the drum.
  const travel = count + (count - 1) * OVERLAP + 1;
  const lift = useTransform(progress, [0, 1], [0, travel]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <svg width="0" height="0" className="absolute">
        <defs>
          {/* Rough spray edge for the stencil paint. */}
          <filter id={`spray-${filterId}`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* The curtain area: below the housing. Slats are clipped at its top edge (into the drum). */}
      <div className="absolute inset-x-0 bottom-0 top-[calc(76px+30px)] overflow-hidden lg:top-[calc(80px+30px)]">
        {Array.from({ length: count }, (_, i) => (
          <Slat key={i} index={i} count={count} lift={lift} title={title} filterId={`spray-${filterId}`} />
        ))}
        <Rail count={count} lift={lift} />
      </div>

      {/* Housing: header height + the drum. */}
      <div className="absolute inset-x-0 top-0 h-[calc(76px+30px)] bg-[linear-gradient(180deg,#050505,#161616_70%,#0b0b0b)] shadow-[0_6px_18px_rgba(0,0,0,.7)] lg:h-[calc(80px+30px)]">
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
        <div className="absolute inset-x-0 bottom-[6px] h-[3px] bg-black/60" />
      </div>

    </div>
  );
}

/**
 * Slat `index` (0 = top). The curtain is `count` slats tall; the rail sits on the bottom slat.
 * The 2px black shadow under each slat covers the hairline seams fractional heights leave.
 */
function Slat({ index, count, lift, title, filterId }: { index: number; count: number; lift: MotionValue<number>; title: string; filterId: string }) {
  const fromBottom = count - 1 - index;
  // Bottom first: this slat starts moving once the ones below have ridden OVERLAP into it.
  const own = useTransform(lift, (l) => Math.max(0, l - fromBottom * OVERLAP));
  const y = useTransform(own, (o) => `${-o * 100}%`);
  // Squash to 0.85 over the last slat and a half before the drum, but only once this slat moves (eased
  // in over its first half slat): at rest every slat is full height, so the closed door has no gaps.
  const scaleY = useTransform(own, (o) => {
    const near = 0.85 + 0.15 * Math.min(Math.max((index - o) / 1.5, 0), 1);
    return 1 - (1 - near) * Math.min(o / 0.5, 1);
  });
  const h = `calc((100% - ${RAIL}px) / ${count})`;

  return (
    <motion.div
      style={{
        y,
        scaleY,
        top: `calc(${h} * ${index})`,
        height: h,
        zIndex: index,
      }}
      className="absolute inset-x-0 origin-top overflow-hidden border-b border-black bg-[linear-gradient(180deg,#2e2e2e_0%,#1d1d1d_38%,#141414_62%,#232323_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,.09),0_2px_0_#000] will-change-transform"
    >
      {/* Brushed metal + grain. */}
      <div className="absolute inset-0 opacity-[.07] [background-image:url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22240%22%20height=%22240%22%3E%3Cfilter%20id=%22b%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.004%200.9%22%20numOctaves=%222%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23b)%22/%3E%3C/svg%3E')]" />
      {/* Ridge: a darker groove a third of the way down. */}
      <div className="absolute inset-x-0 top-[34%] h-px bg-black/50" />
      {/* This slat's slice of the paint: the paint layer is the full curtain, shifted up by this slat's offset. */}
      <div
        className="absolute inset-x-0"
        style={{
          top: `calc(-100% * ${index})`,
          height: `calc(100% * ${count})`,
        }}
      >
        <Paint title={title} filterId={filterId} />
      </div>
    </motion.div>
  );
}

/** The sprayed stencil: MODELET across the middle, the red tag and stripe at the bottom left. */
function Paint({ title, filterId }: { title: string; filterId: string }) {
  const word = "text-[clamp(72px,17vw,300px)] font-extrabold italic uppercase leading-none tracking-[-0.02em]";
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-0 top-[46%] flex -translate-y-1/2 justify-center">
        {/* Overspray halo. */}
        <span className={`${word} absolute text-[#ECE8E1] opacity-10 blur-[6px]`}>{title}</span>
        <span className={`${word} relative text-[#ECE8E1]`} style={{ filter: `url(#${filterId})` }}>
          {title}
        </span>
      </div>
      <div className="absolute bottom-[7%] left-[4vw] flex items-center gap-4" style={{ filter: `url(#${filterId})` }}>
        <span className="h-5 w-16 bg-red [clip-path:polygon(22%_0,100%_0,78%_100%,0_100%)]" />
        <span className="text-[clamp(12px,1.1vw,16px)] font-extrabold uppercase tracking-[0.22em] text-red">NAS — SHOWROOM</span>
      </div>
    </div>
  );
}

/** Thick bottom rail with a centre handle; rides with the bottom slat. A warm glow hangs under it once it lifts. */
function Rail({ count, lift }: { count: number; lift: MotionValue<number> }) {
  const y = useTransform(lift, (l) => `${-l * 100}%`);
  const glow = useTransform(lift, [0, 0.6, 4], [0, 0.7, 1]);
  return (
    <motion.div
      style={{
        y,
        height: `calc((100% - ${RAIL}px) / ${count})`,
        zIndex: count + 1,
      }}
      className="absolute inset-x-0 bottom-0 will-change-transform"
    >
      {/* The rail is the bottom RAIL px of this box (same height as a slat so it moves in step). */}
      <div className="absolute inset-x-0 bottom-0 h-[26px] border-t border-white/15 bg-[linear-gradient(180deg,#3a3a3a,#1a1a1a_60%,#0d0d0d)]">
        <div className="absolute left-1/2 top-1/2 h-2.5 w-24 -translate-x-1/2 -translate-y-1/2 rounded-[2px] border border-black/70 bg-[linear-gradient(180deg,#4a4a4a,#222)]" />
      </div>
      <motion.div
        style={{ opacity: glow }}
        className="absolute inset-x-[8%] top-full h-28 bg-[radial-gradient(ellipse_55%_100%_at_50%_0%,rgba(255,170,80,.2),transparent_70%)]"
      />
    </motion.div>
  );
}
