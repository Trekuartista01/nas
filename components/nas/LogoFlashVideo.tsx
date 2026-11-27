"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useInView } from "react-intersection-observer";
import { useMedia, useReducedMotionSafe } from "@/components/motion/useMotionScale";
import { LogoMark } from "@/components/ui/Logo";
import { MOTION, SPORT_FLASH as F } from "@/lib/motion";
import { setNavClear } from "@/components/motion/navClear";
import { siteMedia } from "@/lib/supabase/config";

/**
 * Sport Line: white NAS wordmark → the S turns red (caption rises) → the logo punches out in a white flash
 * and the Sport Line video takes the screen (replaced "lights behind the logo", Nov 2026).
 *   ≥ 768px:         one sticky full-screen scene. Scroll progress only picks the step (SPORT_FLASH.steps);
 *                    each step plays at a fixed speed, so one wheel notch / swipe past a point is enough.
 *                    Scrolling back reverses it. The header goes transparent while the video fills the screen.
 *   < 768px:         not pinned: when the box is in view the S turns red, then it flashes into the video.
 *   reduced motion:  red S + caption, the video below it as a plain block. No flash.
 * Timings and colours: SPORT_FLASH in lib/motion.ts.
 */
export default function LogoFlashVideo({ caption }: { caption: ReactNode }) {
  const reduce = useReducedMotionSafe();
  const wide = useMedia("(min-width: 768px)");
  if (reduce) return <Still caption={caption} />;
  if (wide) return <Pinned caption={caption} />;
  return <Timed caption={caption} />;
}

const VIDEO = siteMedia("/videos/sport-line.mp4");
const C = F.colors;

type Step = 0 | 1 | 2;

function Pinned({ caption }: { caption: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>(0);
  // True once the pinned screen reaches the top: the logo pops in then (it sits under the intro until that moment).
  const [arrived, setArrived] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setStep(v >= F.steps.video ? 2 : v >= F.steps.red ? 1 : 0));

  // Header transparent while the video covers the whole screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const { top, bottom } = el.getBoundingClientRect();
      setArrived(top <= 1);
      setNavClear("sport-flash", step === 2 && top <= 1 && bottom >= window.innerHeight - 1);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      setNavClear("sport-flash", false);
    };
  }, [step]);

  return (
    <div ref={ref} className="relative" style={{ height: `${(F.pinScreens + 1) * 100}svh` }}>
      <div className="sticky top-0 h-svh min-h-[460px] overflow-hidden">
        <Scene step={step} caption={caption} shade pop={arrived} />
      </div>
    </div>
  );
}

function Timed({ caption }: { caption: ReactNode }) {
  const [step, setStep] = useState<Step>(0);
  const timer = useRef(0);
  const { ref } = useInView({
    triggerOnce: true,
    threshold: 0.6,
    onChange: (inView) => {
      if (!inView) return;
      setStep(1);
      timer.current = window.setTimeout(() => setStep(2), (F.redDuration + F.mobileDelay) * 1000);
    },
  });
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <div ref={ref} className="relative aspect-[4/3] overflow-hidden">
      <Scene step={step} caption={caption} />
    </div>
  );
}

function Still({ caption }: { caption: ReactNode }) {
  return (
    <>
      <div className="relative h-[70svh] min-h-[420px] max-h-[860px] overflow-hidden">
        <Scene step={1} caption={caption} still />
      </div>
      <div className="container-moto pb-[clamp(40px,6vw,80px)] md:max-w-none md:px-0">
        <video src={VIDEO} autoPlay muted loop playsInline preload="metadata" aria-label="NAS Sport Line" className="aspect-video w-full object-cover" />
      </div>
    </>
  );
}

const layer = "pointer-events-none absolute will-change-[opacity,transform]";

function Scene({
  step,
  caption,
  shade = false,
  still = false,
  pop,
}: {
  step: Step;
  caption: ReactNode;
  shade?: boolean;
  still?: boolean;
  /** Pinned scene: the logo pops in when true (scale .6 → 1, spring) and hides again when false. Omitted: fades in on view. */
  pop?: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  // Start loading the video a screen before the scene arrives, so it is ready for the flash.
  const { ref: near, inView: isNear } = useInView({ triggerOnce: true, rootMargin: "100% 0px" });
  const on = step === 2;
  const red = step >= 1;

  useEffect(() => {
    const v = video.current;
    if (!v || still) return;
    if (on) {
      v.currentTime = 0;
      v.play().catch(() => {});
      return;
    }
    const t = window.setTimeout(() => v.pause(), F.back * 1000);
    return () => window.clearTimeout(t);
  }, [on, still]);

  const fast = { duration: F.redDuration, ease: MOTION.ease };
  const instant = { duration: 0 };

  return (
    <div ref={near} className="relative size-full" style={{ background: C.bg }}>
      {/* ── The video, waiting under the logo ── */}
      {!still && (
        <motion.div
          aria-hidden={!on}
          className={`${layer} inset-0`}
          initial={false}
          animate={
            on
              ? { opacity: 1, scale: 1, transition: { opacity: { duration: 0.01, delay: F.flash.peak }, scale: { duration: F.videoIn.duration, delay: F.flash.peak, ease: MOTION.ease } } }
              : { opacity: 0, scale: F.videoIn.scale, transition: { duration: F.back, ease: MOTION.ease } }
          }
        >
          <video
            ref={video}
            src={VIDEO}
            muted
            loop
            playsInline
            preload={isNear ? "auto" : "none"}
            aria-label="NAS Sport Line"
            className="size-full object-cover"
          />
          {/* Soft shade at the top so the transparent header stays readable over the video. */}
          {shade && <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent" />}
        </motion.div>
      )}

      {/* ── Logo + caption: punch toward the camera and vanish on the flash ── */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-4"
        initial={false}
        animate={
          on
            ? { opacity: 0, scale: F.punch.scale, transition: { duration: F.punch.duration, ease: [0.6, 0, 1, 1] } }
            : { opacity: 1, scale: 1, transition: { duration: F.back, ease: MOTION.ease } }
        }
      >
        <motion.div
          {...(pop === undefined
            ? {
                initial: still ? false : { opacity: 0, scale: 0.96 },
                whileInView: { opacity: 1, scale: 1 },
                viewport: { once: true, amount: 0.5 },
                transition: { duration: MOTION.text, ease: MOTION.ease },
              }
            : {
                initial: false,
                animate: pop ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 },
                transition: pop ? { type: "spring", stiffness: 260, damping: 18 } : { duration: 0.15 },
              })}
          role="img"
          aria-label="NAS Sport Line"
          className="relative aspect-[1576/356] w-[min(1100px,86vw)]"
        >
          {/* Red glow behind the S. */}
          <motion.div
            aria-hidden
            className={layer}
            style={{
              left: "65.8%",
              width: "36%",
              top: "-30%",
              height: "160%",
              background: `radial-gradient(closest-side, ${C.redCore} 0%, rgba(234,32,40,.5) 35%, rgba(234,32,40,0) 72%)`,
            }}
            initial={false}
            animate={{ opacity: red ? 0.55 : 0 }}
            transition={still ? instant : fast}
          />
          <div aria-hidden className={`${layer} inset-0`} style={{ color: C.white }}>
            <LogoMark bare only="na" className="block size-full" />
          </div>
          <motion.div aria-hidden className={`${layer} inset-0`} style={{ color: C.white }} initial={false} animate={{ opacity: red ? 0 : 1 }} transition={still ? instant : fast}>
            <LogoMark bare only="s" className="block size-full" />
          </motion.div>
          <motion.div aria-hidden className={`${layer} inset-0`} style={{ color: C.red }} initial={false} animate={{ opacity: red ? 1 : 0 }} transition={still ? instant : fast}>
            <LogoMark bare only="s" className="block size-full" />
          </motion.div>
        </motion.div>

        <div className="relative mt-[clamp(20px,5vw,64px)] overflow-hidden text-center">
          <motion.p
            className="headline max-w-[18ch] text-[clamp(18px,2.6vw,44px)] leading-tight md:max-w-none"
            initial={false}
            animate={{ y: red ? "0%" : "110%" }}
            transition={still ? instant : { ...fast, duration: MOTION.text }}
          >
            {caption}
          </motion.p>
        </div>
      </motion.div>

      {!still && (
        <>
          {/* Red light streak across the middle, then the white flash. */}
          <motion.div
            aria-hidden
            className={`${layer} inset-x-0 top-1/2 h-[3px] -translate-y-1/2 origin-center`}
            style={{ background: `linear-gradient(90deg, transparent, ${C.red} 20%, ${C.redCore} 50%, ${C.red} 80%, transparent)`, boxShadow: `0 0 24px 4px ${C.red}` } as CSSProperties}
            initial={false}
            animate={on ? { scaleX: [0, 1, 1], opacity: [0, 1, 0] } : { scaleX: 0, opacity: 0 }}
            transition={on ? { duration: F.flash.total, times: [0, F.flash.peak / F.flash.total, 1], ease: "easeOut" } : instant}
          />
          <motion.div
            aria-hidden
            className={`${layer} inset-0 bg-white`}
            initial={false}
            animate={on ? { opacity: [0, F.flash.opacity, 0] } : { opacity: 0 }}
            transition={on ? { duration: F.flash.total, times: [0, F.flash.peak / F.flash.total, 1], ease: "easeOut" } : instant}
          />
        </>
      )}
    </div>
  );
}
