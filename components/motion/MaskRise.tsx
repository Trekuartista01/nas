"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { MOTION } from "@/lib/motion";

/** Rises from below an overflow mask when it enters view (footer wordmark). */
export default function MaskRise({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={`overflow-hidden ${className}`} initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.3 }}>
      <motion.div
        data-anim
        variants={{ hidden: { y: "100%" }, shown: { y: "0%", transition: { duration: MOTION.image, ease: MOTION.ease } } }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
