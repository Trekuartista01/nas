"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { MOTION } from "@/lib/motion";

type Tag = "h1" | "h2" | "h3" | "p" | "div";

/**
 * Heading revealed line by line: each line sits in an overflow mask and its text rises from
 * 105% below. `onLoad`: play on mount (hero) instead of when scrolled into view.
 * Lines are written out by hand (no runtime text splitting), so line breaks match the design.
 */
export default function Lines({
  lines,
  as = "h2",
  className = "",
  lineClassName = "",
  delay = 0,
  onLoad = false,
}: {
  lines: ReactNode[];
  as?: Tag;
  className?: string;
  /** Classes for every line, or one entry per line (e.g. colours). */
  lineClassName?: string | string[];
  delay?: number;
  onLoad?: boolean;
}) {
  const Comp = motion[as];
  const trigger = onLoad ? { animate: "shown" } : { whileInView: "shown", viewport: { once: true, amount: MOTION.amount } };
  return (
    <Comp className={className} initial="hidden" {...trigger} transition={{ staggerChildren: MOTION.lineStagger, delayChildren: delay }}>
      {lines.map((line, i) => (
        // pb/-mb keep descenders and the red full stop inside the mask.
        <span key={i} className="-mb-[0.08em] block overflow-hidden pb-[0.08em]">
          <motion.span
            data-anim
            className={`block ${Array.isArray(lineClassName) ? (lineClassName[i] ?? "") : lineClassName}`}
            variants={{ hidden: { y: "105%" }, shown: { y: "0%", transition: { duration: MOTION.text, ease: MOTION.ease } } }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Comp>
  );
}
