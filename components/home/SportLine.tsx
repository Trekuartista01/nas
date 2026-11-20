"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import Rise from "@/components/motion/Rise";
import { useParallaxScale, usePinnable } from "@/components/motion/useMotionScale";
import DarkModelCard from "@/components/nas/DarkModelCard";
import { BlockButton } from "@/components/ui/Buttons";
import { LogoMark } from "@/components/ui/Logo";
import type { Model } from "@/data/models";
import { NAS_HOME } from "@/data/nas-home";
import { MOTION } from "@/lib/motion";

const RED = "#e10600"; // --color-red (animated colour values need the literal)
const WHITE = "#ffffff";

/**
 * SPORT LINE as a short scroll story (red is the accent here, used more boldly than elsewhere):
 *  1. Full-screen intro: the red scooter on the pedestal wipes in (clip-path) with the Sport Line logo.
 *  2. The red S: the plain NAS wordmark, large and white. Desktop: pinned for one screen of scroll,
 *     the S fills red, then the line underneath reveals (scrubbed). Phones / reduced motion: it plays
 *     once when in view.
 *  3. Labelled detail shots: one large + two smaller, red lines drawing under the labels, light
 *     parallax in opposite directions.
 *  4. The Sport Line models (type "sport") and an "Explore Sport Line" button to /sport-line.
 * `models`: the published catalog.
 */
export default function SportLine({ models }: { models: Model[] }) {
  const sport = models.filter((m) => m.type === "sport");
  return (
    <section id="sport-line" aria-label="Sport Line" className="relative scroll-mt-20 bg-ink">
      <Intro />
      <RedS />
      <Details />

      {/* ───── 4. Models + CTA ───── */}
      <div className="container-moto pb-[clamp(90px,10vw,150px)]">
        <div className="flex flex-wrap items-end justify-between gap-8 border-t border-red pt-12">
          <Rise>
            <p className="text-[13px] font-bold tracking-[0.2em] text-red">IN THE LINE</p>
            <h3 className="headline mt-4 text-[clamp(36px,4vw,64px)]">
              SPORT LINE MODELS<span className="text-red">.</span>
            </h3>
          </Rise>
          <Rise delay={0.15}>
            <BlockButton href="/sport-line">Explore Sport Line</BlockButton>
          </Rise>
        </div>
        {sport.length ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sport.map((m, i) => (
              <Rise key={m.slug} delay={i * MOTION.rangeStagger} duration={MOTION.image}>
                <DarkModelCard model={m} index={i} accent className="aspect-[520/620] w-full" />
              </Rise>
            ))}
          </div>
        ) : (
          <Rise delay={0.2} className="mt-8">
            <p className="text-[17px] text-body">[Confirm which models carry the Sport Line badge.]</p>
          </Rise>
        )}
      </div>
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
      <div className="container-moto relative order-1 pt-20 md:pt-[clamp(110px,16vh,170px)]">
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
        <div className="mt-5 overflow-hidden">
          <motion.div data-anim variants={{ hidden: { y: "105%" }, shown: { y: "0%", transition: { duration: MOTION.image, ease: MOTION.ease, delay: 0.6 } } }}>
            <LogoMark bare accent title="NAS Sport Line" className="h-[clamp(56px,7.5vw,120px)] w-auto text-white" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

const RED_S_LINE = "In the Sport Line, red is the signal of performance.";
const WORDMARK = "h-auto w-[min(1100px,86vw)] text-white";

/** 2. The red S. Pinned and scrubbed on desktop; played once when in view elsewhere. */
function RedS() {
  return usePinnable() ? <RedSPinned /> : <RedSOnce />;
}

/** Desktop: one screen of pinned scroll; the S fills red, then the line reveals (scrubbed). */
function RedSPinned() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, MOTION.scrub);
  const sFill = useTransform(p, [0.12, 0.45], [WHITE, RED]);
  const lineClip = useTransform(p, [0.5, 0.85], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);
  const lineY = useTransform(p, [0.5, 0.85], [24, 0]);
  const bar = useTransform(p, [0.5, 0.9], [0, 1]);

  return (
    <div ref={ref} className="relative h-[200svh]">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-10 overflow-hidden px-4">
        <motion.div style={{ "--s-fill": sFill } as unknown as React.CSSProperties}>
          <LogoMark bare sVariable title="NAS" className={WORDMARK} />
        </motion.div>
        <div className="text-center">
          <motion.p style={{ clipPath: lineClip, y: lineY }} className="headline text-[clamp(24px,2.6vw,44px)] leading-tight">
            {RED_S_LINE}
          </motion.p>
          <motion.span aria-hidden style={{ scaleX: bar }} className="mx-auto mt-6 block h-[3px] w-40 origin-left bg-red" />
        </div>
      </div>
    </div>
  );
}

/** Phones and reduced motion: plays once when in view. */
function RedSOnce() {
  return (
    <motion.div
      className="flex flex-col items-center gap-8 px-4 py-[clamp(90px,14vw,140px)]"
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.6 }}
    >
      <motion.div variants={{ hidden: { "--s-fill": WHITE }, shown: { "--s-fill": RED, transition: { duration: 1, ease: MOTION.ease, delay: 0.2 } } }}>
        <LogoMark bare sVariable title="NAS" className={WORDMARK} />
      </motion.div>
      <motion.p
        data-anim
        className="headline max-w-[640px] text-center text-[clamp(24px,6vw,44px)] leading-tight"
        variants={{ hidden: { opacity: 0, y: MOTION.rise }, shown: { opacity: 1, y: 0, transition: { duration: MOTION.text, ease: MOTION.ease, delay: 0.9 } } }}
      >
        {RED_S_LINE}
      </motion.p>
      <motion.span
        aria-hidden
        data-anim
        className="block h-[3px] w-32 origin-left bg-red"
        variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1, transition: { duration: MOTION.wipeDuration, ease: MOTION.wipe, delay: 1.1 } } }}
      />
    </motion.div>
  );
}

const SHOTS = [
  { src: "/nas-images/web/sportline-logo-closeup.webp", label: "Sport Line graphics", num: "01" },
  { src: "/nas-images/web/sportline-front.webp", label: "Front", num: "02" },
  { src: "/nas-images/web/hero-ride-side.webp", label: "Tail light", num: "03" },
];

/** 3. One large + two smaller shots, each labelled, with light opposite parallax. */
function Details() {
  const ref = useRef<HTMLDivElement>(null);
  const k = useParallaxScale();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const up = useTransform(scrollYProgress, [0, 1], [`${6 * k}%`, `${-6 * k}%`]);
  const down = useTransform(scrollYProgress, [0, 1], [`${-6 * k}%`, `${6 * k}%`]);

  return (
    <div ref={ref} className="container-moto grid gap-4 pb-[clamp(70px,8vw,110px)] md:grid-cols-[1.6fr_1fr] md:grid-rows-2">
      {SHOTS.map((s, i) => (
        <Rise key={s.src} delay={i * 0.12} duration={MOTION.image} className={i === 0 ? "md:row-span-2" : ""}>
          <figure>
            <div className={`relative overflow-hidden bg-black ${i === 0 ? "aspect-[4/3] md:aspect-[6/5]" : "aspect-[16/10]"}`}>
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
  );
}
