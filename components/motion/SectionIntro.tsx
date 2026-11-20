"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { MOTION } from "@/lib/motion";

/**
 * Section backdrop that wipes up from the bottom edge as the section arrives (e.g. the white
 * Range after the dark panels). The trigger is the unclipped outer box: a fully clipped layer
 * never counts as "in view".
 */
export function WipeIn({ children, className = "", layerClassName }: { children: ReactNode; className?: string; layerClassName: string }) {
  return (
    <motion.div className={`relative ${className}`} initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.08 }}>
      <motion.div
        data-anim
        aria-hidden
        className={`absolute inset-0 ${layerClassName}`}
        variants={{
          hidden: { clipPath: "inset(100% 0 0 0)" },
          shown: { clipPath: "inset(0% 0 0 0)", transition: { duration: MOTION.wipeDuration, ease: MOTION.wipe } },
        }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

/** 1px divider at the top of a section that draws from left to right when it comes into view. */
export function SectionLine({ className = "bg-line-3" }: { className?: string }) {
  return (
    <motion.span
      data-anim
      aria-hidden
      className={`block h-px origin-left ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 1 }}
      transition={{ duration: MOTION.wipeDuration, ease: MOTION.wipe }}
    />
  );
}
