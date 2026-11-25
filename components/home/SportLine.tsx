"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import Rise from "@/components/motion/Rise";
import { useMedia, useParallaxScale, useReducedMotionSafe } from "@/components/motion/useMotionScale";
import LogoBacklight from "@/components/nas/LogoBacklight";
import { NAS_HOME } from "@/data/nas-home";
import { MOTION, SPORT_VIDEO_PIN } from "@/lib/motion";

/**
 * SPORT LINE as a short scroll story (red is the accent here, used more boldly than elsewhere):
 *  1. Full-screen intro: the red scooter on the pedestal wipes in (clip-path) under "THE PERFORMANCE LINE".
 *  2. Lights behind the logo (components/nas/LogoBacklight.tsx): the wordmark large on black, the S
 *     turns red, the logo dims to a silhouette as a bike's lights switch on behind it, then the line. Pinned
 *     on ≥ 768px; phones play it once; reduced motion shows the end state.
 *  3. Detail video (public/videos/sport-line.mp4), pinned full screen from 768px like The Range: it holds
 *     for SPORT_VIDEO_PIN.holdVh of scrolling (lib/motion.ts) and the header goes transparent over it.
 * (The models block with "Explore Sport Line" was removed, Nov 2026.)
 */
export default function SportLine() {
  return (
    <section id="sport-line" aria-label="Sport Line" className="relative scroll-mt-20 bg-ink">
      <Intro />
      <RedS />
      <Details />
    </section>
  );
}

/** 1. Full-screen pedestal shot wiped in from the top, image counter-scaling 1.15 → 1. */
function Intro() {
  // Phones: logo first, then the photo in a square frame cropped to the scooter (a full-screen crop of the wide shot loses the bike).
  return (
    <motion.div
      className="relative flex flex-col overflow-hidden bg-black md:block md:h-svh md:min-h-[560px]"
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* The wipe sits on an inner layer: the trigger box itself is never clipped (a clipped box never "enters view"). */}
      <motion.div
        data-anim
        className="relative order-2 aspect-square md:absolute md:inset-0 md:aspect-auto"
        variants={{
          hidden: { clipPath: "inset(0 0 100% 0)" },
          shown: { clipPath: "inset(0 0 0% 0)", transition: { duration: MOTION.wipeDuration, ease: MOTION.wipe } },
        }}
      >
        <motion.img
          data-anim
          src={NAS_HOME.sportLine.pedestal}
          alt="NAS Sport Line në piedestal"
          className="size-full object-cover object-[52%_62%] md:object-[50%_60%]"
          variants={{ hidden: { scale: 1.15 }, shown: { scale: 1, transition: { duration: MOTION.wipeDuration, ease: MOTION.ease } } }}
        />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.65),transparent_40%,transparent_70%,rgba(10,10,10,1))]" />
      </motion.div>
      <div className="container-moto relative order-1 pb-6 pt-20 md:pb-0 md:pt-[clamp(110px,16vh,170px)]">
        <motion.p
          data-anim
          className="text-[13px] font-bold tracking-[0.2em] text-red"
          variants={{
            hidden: { opacity: 0, y: MOTION.rise },
            shown: { opacity: 1, y: 0, transition: { duration: MOTION.text, ease: MOTION.ease, delay: 0.5 } },
          }}
        >
          THE PERFORMANCE LINE
        </motion.p>
      </div>
    </motion.div>
  );
}

const RED_S_LINE = "In the Sport Line, red is the signal of performance.";

/** 2. Lights behind the logo: the S turns red, the wordmark dims and a bike's lights switch on behind it. */
function RedS() {
  return <LogoBacklight caption={RED_S_LINE} />;
}

const DETAIL_VIDEO = "/videos/sport-line.mp4";

/**
 * 3. Detail video (replaced the three labelled shots, Nov 2026). From 768px it pins like The Range: the
 * block is one screen + SPORT_VIDEO_PIN.holdVh tall and the video sticks full screen (under the bar) while
 * that extra distance is scrolled, easing from a slight zoom to 1. While it fills the screen the header
 * goes transparent (`data-nav-clear` on <html>, read by Header). Phones / reduced motion: 16:9, no pin.
 * Muted, looped, inline.
 */
function Details() {
  const ref = useRef<HTMLDivElement>(null);
  const k = useParallaxScale();
  const reduce = useReducedMotionSafe();
  const pin = useMedia("(min-width: 768px)") && !reduce;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1 + 0.08 * k, 1]);

  // Header transparent while the video covers the whole screen (pinned stretch only).
  useEffect(() => {
    const el = ref.current;
    if (!pin || !el) return;
    const root = document.documentElement;
    const update = () => {
      const { top, bottom } = el.getBoundingClientRect();
      const covering = top <= 1 && bottom >= window.innerHeight - 1;
      if (covering) root.dataset.navClear = "";
      else delete root.dataset.navClear;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      delete root.dataset.navClear;
    };
  }, [pin]);

  return (
    // The pinned block starts right under the logo section; the extra height is the hold.
    <div className="container-moto pb-[clamp(70px,8vw,110px)] md:max-w-none md:px-0">
      <div ref={ref} className="relative" style={pin ? { height: `calc(100svh + ${SPORT_VIDEO_PIN.holdVh}svh)` } : undefined}>
        <div className={`overflow-hidden bg-black ${pin ? "sticky top-0 h-svh min-h-[460px]" : "relative aspect-video"}`}>
          <Rise duration={MOTION.image} className="absolute inset-0">
            <motion.div style={pin ? { scale } : undefined} className="absolute inset-0">
              <video
                src={DETAIL_VIDEO}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="NAS Sport Line nga afër"
                className="size-full object-cover"
              />
            </motion.div>
          </Rise>
          {/* Soft shade at the top so the transparent header stays readable over the video. */}
          {pin && <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent" />}
        </div>
      </div>
    </div>
  );
}
