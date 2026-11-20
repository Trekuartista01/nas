"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Rise from "@/components/motion/Rise";
import { useParallaxScale } from "@/components/motion/useMotionScale";
import LogoBacklight from "@/components/nas/LogoBacklight";
import { NAS_HOME } from "@/data/nas-home";
import { MOTION } from "@/lib/motion";

/**
 * SPORT LINE as a short scroll story (red is the accent here, used more boldly than elsewhere):
 *  1. Full-screen intro: the red scooter on the pedestal wipes in (clip-path) under "THE PERFORMANCE LINE".
 *  2. Lights behind the logo (components/nas/LogoBacklight.tsx): the wordmark large on black, the S
 *     turns red, the logo dims to a silhouette as a bike's lights switch on behind it, then the line. Pinned
 *     on ≥ 768px; phones play it once; reduced motion shows the end state.
 *  3. Labelled detail shots: one large + two smaller, sized so all three fit on one screen from 768px,
 *     light parallax in opposite directions.
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

const SHOTS = [
  { src: "/nas-images/web/sportline-logo-closeup.webp", label: "Sport Line graphics", num: "01" },
  { src: "/nas-images/web/sportline-front.webp", label: "Front", num: "02" },
  { src: "/nas-images/web/hero-ride-side.webp", label: "Tail light", num: "03" },
];

/**
 * 3. One large + two smaller shots, each labelled, with light opposite parallax. From 768px the grid has
 * a fixed height (one screen minus the header and some air) and the photos fill it, so all three fit on
 * screen at once; phones stack them at their own aspect ratios.
 */
function Details() {
  const ref = useRef<HTMLDivElement>(null);
  const k = useParallaxScale();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const up = useTransform(scrollYProgress, [0, 1], [`${6 * k}%`, `${-6 * k}%`]);
  const down = useTransform(scrollYProgress, [0, 1], [`${-6 * k}%`, `${6 * k}%`]);

  return (
    <div ref={ref} className="container-moto pb-[clamp(70px,8vw,110px)]">
      <div className="grid gap-4 md:h-[min(calc(100svh-180px),780px)] md:min-h-[460px] md:grid-cols-[1.6fr_1fr] md:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
        {SHOTS.map((s, i) => (
          <Rise
            key={s.src}
            delay={i * 0.12}
            duration={MOTION.image}
            className={`md:min-h-0 md:[&>div]:h-full ${i === 0 ? "md:row-span-2" : ""}`}
          >
            <figure className="md:flex md:h-full md:flex-col">
              <div className={`relative overflow-hidden bg-black md:aspect-auto md:min-h-0 md:flex-1 ${i === 0 ? "aspect-[4/3]" : "aspect-[16/10]"}`}>
                <motion.div style={{ y: i === 1 ? down : up }} className="absolute inset-x-0 -inset-y-[8%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.src} alt="" loading="lazy" className="size-full object-cover" />
                </motion.div>
              </div>
              <figcaption className="pt-4">
                <span className="flex items-baseline gap-3 text-[13px] uppercase tracking-[0.16em]">
                  <span className="font-bold text-red">{s.num}</span>
                  <span className="text-light">{s.label}</span>
                </span>
              </figcaption>
            </figure>
          </Rise>
        ))}
      </div>
    </div>
  );
}
