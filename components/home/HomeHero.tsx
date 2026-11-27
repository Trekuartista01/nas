"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Lines from "@/components/motion/Lines";
import Rise from "@/components/motion/Rise";
import { useParallaxScale } from "@/components/motion/useMotionScale";
import { BlockButton } from "@/components/ui/Buttons";
import T from "@/components/i18n/T";
import { MOTION } from "@/lib/motion";
import type { HeroVideo } from "@/lib/data/catalog";

/**
 * Hero (NAS homepage design): full-bleed hero video, "BORN TO ROAR.", intro and CTA.
 * Load: video settles from 1.25 → 1, heading lines rise from their masks, then intro + CTA.
 * Scroll: video drifts at ~35% of scroll speed, heading moves up faster and fades out.
 */
/** `heroVideo`: video + poster, loaded on the server (lib/data/catalog.ts). */
export default function HomeHero({ heroVideo }: { heroVideo: HeroVideo }) {
  const ref = useRef<HTMLElement>(null);
  const k = useParallaxScale();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", `${35 * k}%`]);
  const headY = useTransform(scrollYProgress, [0, 1], ["0%", `${-30 * k}%`]);
  const headOpacity = useTransform(scrollYProgress, [0, 0.75], [1, k ? 0 : 1]);

  return (
    <section
      ref={ref}
      id="top"
      data-hero-under-nav
      className="relative -mt-[76px] flex h-svh max-h-[1080px] min-h-[640px] items-end overflow-hidden bg-ink lg:-mt-20"
    >
      <motion.div aria-hidden style={{ y: imageY }} className="absolute inset-0">
        {/* Hero video (Admin → Banneri; falls back to public/videos/hero-video.mp4). Muted, looping, inline. */}
        <motion.video
          data-anim
          src={heroVideo.src}
          poster={heroVideo.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 size-full object-cover"
          initial={{ scale: 1.25 }}
          animate={{ scale: 1 }}
          transition={{ duration: MOTION.heroImage, ease: MOTION.ease }}
        />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,.7),transparent_22%),linear-gradient(90deg,rgba(10,10,10,.55),transparent_55%),linear-gradient(0deg,rgba(10,10,10,.9),transparent_45%)]" />

      <div className="container-moto relative flex w-full flex-wrap items-end justify-between gap-x-10 gap-y-8 pb-16 lg:pb-20">
        <motion.div style={{ y: headY, opacity: headOpacity }}>
          <Lines
            as="h1"
            onLoad
            delay={0.3}
            className="headline text-[clamp(40px,5.6vw,106px)] leading-[0.92]"
            lines={[
              "BORN",
              <span key="roar">
                TO <span className="text-red">ROAR.</span>
              </span>,
            ]}
          />
        </motion.div>
        <div className="max-w-[340px] pb-1">
          <Rise onLoad delay={0.75}>
            <p className="text-[17px] leading-[1.6] text-body">
              <T
                sq="Ndërtuar për rrugën. Një markë moderne motorësh me rrënjë britanike, e projektuar për ata që prijnë, jo për ata që ndjekin."
                en="Built for the road. A modern motorcycle brand with British roots, engineered for those who lead, not follow."
              />
            </p>
          </Rise>
          <Rise onLoad delay={0.9} className="mt-7">
            {/* English in both languages (client, Nov 2026), like the headings. */}
            <BlockButton href="#range">Explore the range</BlockButton>
          </Rise>
        </div>
      </div>
    </section>
  );
}
