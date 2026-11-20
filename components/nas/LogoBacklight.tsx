"use client";

import {
  animate,
  cubicBezier,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useId, useRef, type CSSProperties } from "react";
import { useInView } from "react-intersection-observer";
import { useMedia, useReducedMotionSafe } from "@/components/motion/useMotionScale";
import { LogoMark } from "@/components/ui/Logo";
import { MOTION, SPORT_BACKLIGHT as B } from "@/lib/motion";

/**
 * Sport Line "lights behind the logo". The NAS wordmark sits large on black; the S turns red, then a
 * compact sportsbike front (two angular LED eyes, DRL slashes, a centre intake light) flashes on behind
 * it, the wordmark dims to a dark silhouette on the final "on", and the caption rises underneath.
 *
 * The stages read ONE progress value (0 → 1):
 *   ≥ 768px:          pinned, scrubbed by scroll (spring-smoothed ≈ ScrollTrigger scrub: 1)
 *   < 768px:          not pinned, plays once as a timed run when the stage is in view (no white wash)
 *   reduced motion:   progress fixed at 1, lights simply on (no flash, no scaling)
 * The flash is time-based: it fires when progress crosses `timeline.lightsOn` and the lights switch off
 * when it goes back below, so it fires again on the next pass.
 * Timeline points, flash timings, colours and sizes: SPORT_BACKLIGHT in lib/motion.ts; shapes: FACE below.
 * Only opacity and transform are animated; blurred bloom copies are small and blurred once.
 */
export default function LogoBacklight({ caption }: { caption: string }) {
  const reduce = useReducedMotionSafe();
  const wide = useMedia("(min-width: 768px)");
  if (wide && !reduce) return <Pinned caption={caption} />;
  return <Unpinned caption={caption} still={reduce} small={!wide} />;
}

function Pinned({ caption }: { caption: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, MOTION.scrub);
  return (
    <div ref={ref} className="relative" style={{ height: `${(B.pinScreens + 1) * 100}svh` }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <Stage p={p} caption={caption} small={false} still={false} />
      </div>
    </div>
  );
}

function Unpinned({ caption, still, small }: { caption: string; still: boolean; small: boolean }) {
  const p = useMotionValue(still ? 1 : 0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  useEffect(() => {
    if (still) {
      p.set(1);
      return;
    }
    if (!inView) return;
    // Linear in time: the eases live in each layer's mapping, as in the scrubbed version.
    const run = animate(p, 1, { duration: B.mobileDuration, ease: "linear" });
    return () => run.stop();
  }, [still, inView, p]);
  return (
    <div ref={ref} className="relative h-[85svh] min-h-[480px] max-h-[960px] overflow-hidden">
      <Stage p={p} caption={caption} small={small} still={still} />
    </div>
  );
}

const C = B.colors;
const T = B.timeline;
const F = B.flash;
/** power2.inOut, for the scrubbed timeline. */
const inOut = cubicBezier(0.45, 0, 0.55, 1);
/** cubic-bezier(.2,.7,.1,1), for reveals. */
const reveal = cubicBezier(...MOTION.ease);

/** The bare wordmark's viewBox is 1576 × 356. */
const RATIO = 1576 / 356;
/** Centre of the S across the wordmark (share of its width). */
const S_X = 0.838;

/**
 * A box positioned in the wordmark's frame: centre (cx of the width, cy of the height),
 * size w × h given as shares of the wordmark WIDTH (so circles stay round).
 */
function box(cx: number, cy: number, w: number, h: number): CSSProperties {
  return {
    left: `${(cx - w / 2) * 100}%`,
    width: `${w * 100}%`,
    top: `${(cy - (h * RATIO) / 2) * 100}%`,
    height: `${h * RATIO * 100}%`,
  };
}

/** Faint film grain so the light reads as light in air, not flat gradients. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const layer = "pointer-events-none absolute will-change-[opacity,transform]";

/** Wordmark width (matches the class on the wordmark box); 1 "--u" = 1px at the full 1100px size. */
const WORDMARK_W = "min(1100px, 86vw)";

/**
 * The sportsbike front, in a 600 × 80 box (an original design). Left side only; the right side is the
 * mirror. At the full 1100px wordmark 1 unit ≈ 0.92px: eyes ≈ 160 × 25px tapering to the centre,
 * a ≈ 60px gap, DRL slashes ≈ 3px tall and a little longer than the eyes, intake line ≈ 60 × 2px.
 */
const FACE = {
  w: 600,
  h: 80,
  /** Narrow slanted eye: high at the outside, tapering to a sharp tip toward the centre (a "frown"). */
  eye: "M92,22 L268,47 L258,57 L112,49 Z",
  /** Thin LED slash above the eye at the same angle. */
  drl: "M52,9 L272,39 L272,42.5 L52,12.5 Z",
  /** Short horizontal LED line between the eyes. */
  intake: { x: 268, y: 64, w: 64, h: 2.2 },
};

/** Everything time-based about the lights: the flash, switching off, the steady shimmer and the dim. */
function useLights(p: MotionValue<number>, still: boolean, small: boolean) {
  const drl = useMotionValue(0);
  const eyes = useMotionValue(0);
  const bloomTight = useMotionValue(0);
  const bloomWide = useMotionValue(0);
  const wash = useMotionValue(0);
  const dim = useMotionValue(0);
  const alive = useMotionValue(1);

  useEffect(() => {
    const ramp = 8; // ms: hard switch, without a one-frame pop
    const a = F.drlIn;
    const b = a + F.on1;
    const c = b + F.off1;
    const d = c + F.on2;
    const e = d + F.off2; // final "on"
    const end = e + ramp;
    type Key = readonly [ms: number, value: number];
    const flashKeys = (peak: number, rest: number): Key[] => [
      [0, 0], [a, 0], [a + ramp, peak], [b, peak], [b + ramp, 0], [c, 0],
      [c + ramp, peak], [d, peak], [d + ramp, 0], [e, 0], [end, rest],
    ];
    const washKeys = (at: number): Key[] => [[at, 0], [at + F.washMs / 2, F.wash], [at + F.washMs, 0]];

    let runs: { stop: () => void }[] = [];
    const stop = () => {
      runs.forEach((r) => r.stop());
      runs = [];
    };
    const play = (mv: MotionValue<number>, keys: Key[]) => {
      const total = keys[keys.length - 1][0];
      runs.push(animate(mv, keys.map((k) => k[1]), { duration: total / 1000, times: keys.map((k) => k[0] / total), ease: "linear" }));
    };

    const allOn = () => {
      stop();
      drl.set(1);
      eyes.set(1);
      bloomTight.set(B.bloom.tight.opacity);
      bloomWide.set(B.bloom.wide.opacity);
      wash.set(0);
      dim.set(1);
      alive.set(1);
    };
    const fire = () => {
      stop();
      play(drl, [[0, 0], [a, 1]]);
      play(eyes, flashKeys(1, 1));
      play(bloomTight, flashKeys(F.bloomPeak, B.bloom.tight.opacity));
      play(bloomWide, flashKeys(F.bloomPeak, B.bloom.wide.opacity));
      if (!small) play(wash, [[0, 0], ...washKeys(a), ...washKeys(Math.max(c, a + F.washMs))]);
      // The silhouette lands on the final "on".
      runs.push(animate(dim, 1, { delay: e / 1000, duration: F.dimMs / 1000, ease: MOTION.ease }));
      runs.push(
        animate(alive, [1, F.shimmerMin, 1], { delay: end / 1000, duration: F.shimmerPeriod, repeat: Infinity, ease: "easeInOut" }),
      );
    };
    const off = () => {
      stop();
      [drl, eyes, bloomTight, bloomWide, wash].forEach((m) => m.set(0));
      alive.set(1);
      runs.push(animate(dim, 0, { duration: 0.15, ease: MOTION.ease }));
    };

    let lit = false;
    const check = (v: number) => {
      if (still) {
        if (!lit) {
          lit = true;
          allOn();
        }
        return;
      }
      if (!lit && v >= T.lightsOn) {
        lit = true;
        fire();
      } else if (lit && v < T.lightsOn - 0.01) {
        lit = false;
        off();
      }
    };
    check(p.get());
    const unsubscribe = p.on("change", check);
    return () => {
      unsubscribe();
      stop();
    };
  }, [p, still, small, drl, eyes, bloomTight, bloomWide, wash, dim, alive]);

  return { drl, eyes, bloomTight, bloomWide, wash, dim, alive };
}

function Stage({ p, caption, small, still }: { p: MotionValue<number>; caption: string; small: boolean; still: boolean }) {
  const L = useLights(p, still, small);

  // 0–20%: settle.
  const logoScale = useTransform(p, [...T.settle], [...T.logoScale], { ease: inOut });
  // 20–35%: the S turns red, tail glow in.
  const redIn = useTransform(p, [...T.red], [0, 1], { ease: inOut });
  const sWhite = useTransform(redIn, (r) => 1 - r);
  const tail = useTransform(redIn, (r) => r * T.tailGlow);
  // Lights on: the wordmark dims to a silhouette (time-based, on the flash's final "on").
  const na = useTransform(L.dim, [0, 1], [1, T.dimNA]);
  const silhouette = useTransform(L.dim, [0, 1], [0, T.silhouette]);
  const sRed = useTransform([redIn, L.dim], ([r, d]: number[]) => r * (1 - d * (1 - T.dimS)));
  const approach = useTransform(p, [...T.approach], [...T.approachScale], { ease: inOut });
  // 60–80%: caption rises, lights breathe.
  const [c0, c1] = T.caption;
  const q = (c1 - c0) / 3;
  const breathe = useTransform(p, [c0, c0 + q, c0 + 2 * q, c1], [1, 1 + T.breathe, 1 - T.breathe, 1], { ease: inOut });
  const captionY = useTransform(p, [c0, c0 + (c1 - c0) * 0.7], ["110%", "0%"], { ease: reveal });

  const blur = (px: number) => `blur(calc(var(--u) * ${px}))`;
  const faceBox = box(0.5, B.face.y, B.face.width, (B.face.width * FACE.h) / FACE.w);

  return (
    <div
      className="relative flex size-full flex-col items-center justify-center px-4"
      style={{ background: C.bg, "--u": `calc(${WORDMARK_W} / 1100)` } as CSSProperties}
    >
      <motion.div style={{ scale: logoScale }} className="relative">
        <div
          role="img"
          aria-label="NAS Sport Line"
          className="relative aspect-[1576/356] w-[min(1100px,86vw)]"
          style={{ "--bl-rim": C.rim, "--bl-red": C.red } as CSSProperties}
        >
          {/* ── Lights (behind the wordmark) ── */}
          <motion.div aria-hidden className={`${layer} inset-0`} style={{ scale: breathe, originY: B.face.y }}>
            {/* Red tail glow: a tight bloom about the size of the S. */}
            <motion.div
              className={layer}
              style={{
                ...box(S_X, 0.5, 0.36, 0.2),
                opacity: tail,
                background: `radial-gradient(closest-side, ${C.redCore} 0%, rgba(234,32,40,.55) 35%, rgba(234,32,40,0) 72%)`,
              }}
            />

            {/* The sportsbike front. */}
            <motion.div className={layer} style={{ ...faceBox, scale: approach, opacity: L.alive }}>
              {B.photo && (
                <motion.div className={`${layer} -inset-x-[20%] -inset-y-[150%] overflow-hidden`} style={{ opacity: L.eyes }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={B.photoSrc}
                    alt=""
                    className="size-full object-cover [filter:brightness(.28)_contrast(1.25)] [mask-image:radial-gradient(closest-side,#000_35%,transparent)]"
                  />
                </motion.div>
              )}
              <motion.div className={`${layer} inset-0`} style={{ opacity: L.bloomWide, filter: blur(B.bloom.wide.blur) }}>
                <Face part="all" />
              </motion.div>
              <motion.div className={`${layer} inset-0`} style={{ opacity: L.bloomTight, filter: blur(B.bloom.tight.blur) }}>
                <Face part="all" />
              </motion.div>
              <motion.div className={`${layer} inset-0`} style={{ opacity: L.drl }}>
                <Face part="drl" />
              </motion.div>
              <motion.div className={`${layer} inset-0`} style={{ opacity: L.eyes }}>
                <Face part="eyes" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ── Wordmark: white N+A and white S, the dark rim-lit silhouette fading in over them,
                 and the red S on top (dimmed less than the rest, so the red still reads) ── */}
          <motion.div aria-hidden className={`${layer} inset-0`} style={{ opacity: na, color: C.white }}>
            <LogoMark bare only="na" className="block size-full" />
          </motion.div>
          <motion.div aria-hidden className={`${layer} inset-0`} style={{ opacity: sWhite, color: C.white }}>
            <LogoMark bare only="s" className="block size-full" />
          </motion.div>
          <motion.div aria-hidden className={`${layer} inset-0`} style={{ opacity: silhouette, color: C.bg }}>
            <LogoMark
              bare
              className="block size-full [&_path]:[paint-order:stroke] [&_path]:[stroke-width:3] [&_path]:[stroke:var(--bl-rim)] [&_path:last-child]:[stroke:var(--bl-red)]"
            />
          </motion.div>
          <motion.div aria-hidden className={`${layer} inset-0`} style={{ opacity: sRed, color: C.red }}>
            <LogoMark bare only="s" className="block size-full" />
          </motion.div>
        </div>
      </motion.div>

      {/* Light hitting the camera on each flash peak (desktop only). */}
      {!small && <motion.div aria-hidden className={`${layer} inset-0 bg-white`} style={{ opacity: L.wash }} />}

      {/* Haze over everything. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[.04]" style={{ backgroundImage: GRAIN, backgroundSize: "180px 180px" }} />

      <div className="relative mt-[clamp(32px,5vw,64px)] overflow-hidden text-center">
        <motion.p data-anim style={{ y: captionY }} className="headline max-w-[16ch] text-[clamp(24px,2.6vw,44px)] leading-tight md:max-w-none">
          {caption}
        </motion.p>
      </div>
    </div>
  );
}

/** The LED shapes: hard white core → cool white at the edges. Right side mirrors the left. */
function Face({ part }: { part: "all" | "drl" | "eyes" }) {
  const id = useId().replace(/:/g, "");
  const showDrl = part !== "eyes";
  const showEyes = part !== "drl";
  const side = (
    <>
      {showDrl && <path d={FACE.drl} fill={`url(#${id}d)`} />}
      {showEyes && <path d={FACE.eye} fill={`url(#${id}e)`} />}
    </>
  );
  const { intake } = FACE;
  return (
    <svg viewBox={`0 0 ${FACE.w} ${FACE.h}`} className="block size-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={`${id}e`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.ledEdge} />
          <stop offset=".3" stopColor={C.white} />
          <stop offset=".8" stopColor={C.white} />
          <stop offset="1" stopColor={C.ledEdge} />
        </linearGradient>
        <linearGradient id={`${id}d`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.ledEdge} stopOpacity=".7" />
          <stop offset=".25" stopColor={C.white} />
          <stop offset="1" stopColor={C.white} />
        </linearGradient>
      </defs>
      {side}
      <g transform={`matrix(-1 0 0 1 ${FACE.w} 0)`}>{side}</g>
      {showEyes && <rect x={intake.x} y={intake.y} width={intake.w} height={intake.h} rx={intake.h / 2} fill={C.white} />}
    </svg>
  );
}
