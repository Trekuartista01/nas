"use client";

import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import Rise from "@/components/motion/Rise";
import { useReducedMotionSafe } from "@/components/motion/useMotionScale";
import { NAS_HOME } from "@/data/nas-home";
import { MOTION } from "@/lib/motion";

const LINES = ["INSPIRED BY THE LION.", "COURAGE, POWER", "AND AUTHORITY."];
/** Final colour per line: everything ends white (client, Nov 2026). Words start dim and fill in. */
const FINAL = ["#ffffff", "#ffffff", "#ffffff"];
const DIM = "#4a4a4a";

/** Words per line, each with its position in the whole heading (for its slice of the scroll). */
const WORD_COUNT = LINES.reduce((sum, line) => sum + line.split(" ").length, 0);
const ROWS = LINES.map((line, l) => {
  const before = LINES.slice(0, l).reduce((sum, x) => sum + x.split(" ").length, 0);
  const words = line.split(" ");
  return words.map((w, i) => ({ text: i < words.length - 1 ? `${w} ` : w, index: before + i }));
});

/**
 * "Inspired by the lion." The lion slides in from the left; the heading fills in word by word
 * as the section scrolls through the screen (scrubbed: scrolling back empties it again).
 */
export default function Statement() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotionSafe();
  // Fill spans from entering the screen until the section is just below centre (a short stretch, so it
  // fills quickly), smoothed by a spring.
  const { scrollYProgress: raw } = useScroll({ target: ref, offset: ["start 88%", "center 58%"] });
  const scrollYProgress = useSpring(raw, { stiffness: 150, damping: 32, mass: 0.6, restDelta: 0.0005 });

  return (
    <section ref={ref} className="bg-ink">
      <div className="container-moto flex items-center justify-center gap-[clamp(24px,4vw,72px)] py-[clamp(80px,9vw,150px)]">
        <Rise from="left" duration={MOTION.image + 0.25} className="w-[clamp(72px,8.4vw,124px)] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={NAS_HOME.lion} alt="" width={128} height={154} className="h-auto w-full mix-blend-lighten" />
        </Rise>
        <Rise delay={0.15} duration={MOTION.text}>
          <h2 aria-label={LINES.join(" ")} className="headline text-[clamp(28px,4.4vw,72px)] leading-[1.02]">
            {ROWS.map((row, l) => (
              <span key={l} aria-hidden className="block">
                {row.map((w) => (
                  <Word key={w.index} progress={scrollYProgress} from={w.index / WORD_COUNT} to={(w.index + 1) / WORD_COUNT} color={FINAL[l]} still={!!reduce}>
                    {w.text}
                  </Word>
                ))}
              </span>
            ))}
          </h2>
        </Rise>
      </div>
    </section>
  );
}

function Word({
  progress,
  from,
  to,
  color,
  still,
  children,
}: {
  progress: MotionValue<number>;
  from: number;
  to: number;
  color: string;
  still: boolean;
  children: React.ReactNode;
}) {
  const c = useTransform(progress, [from, to], still ? [color, color] : [DIM, color]);
  return <motion.span style={{ color: c }}>{children}</motion.span>;
}
