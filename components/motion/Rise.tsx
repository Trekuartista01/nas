"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { MOTION } from "@/lib/motion";

/**
 * Fade + rise (or slide in from the left) when scrolled into view, once.
 * `onLoad`: play on mount instead (hero). `mask`: rise from behind an overflow mask, no fade.
 * The trigger sits on the outer box: a masked child is clipped, so it would never "enter view".
 */
export default function Rise({
  children,
  className = "",
  delay = 0,
  from = "below",
  onLoad = false,
  duration = MOTION.text,
  mask = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: "below" | "left";
  onLoad?: boolean;
  duration?: number;
  mask?: boolean;
}) {
  const hidden = mask ? { y: "105%" } : from === "left" ? { opacity: 0, x: -80 } : { opacity: 0, y: MOTION.rise };
  const shown = { ...(mask ? { y: "0%" } : { opacity: 1, x: 0, y: 0 }), transition: { duration, ease: MOTION.ease, delay } };
  const trigger = onLoad ? { animate: "shown" } : { whileInView: "shown", viewport: { once: true, amount: MOTION.amount } };
  return (
    <motion.div className={`${mask ? "overflow-hidden" : ""} ${className}`} initial="hidden" {...trigger}>
      <motion.div data-anim variants={{ hidden, shown }}>
        {children}
      </motion.div>
    </motion.div>
  );
}
