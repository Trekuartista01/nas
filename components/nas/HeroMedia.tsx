"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useParallaxScale } from "@/components/motion/useMotionScale";
import { MOTION } from "@/lib/motion";

/**
 * Full-bleed hero photo for the NAS pages: settles from 1.2 → 1 on load and drifts down at ~30%
 * of the scroll speed. `overlay`: CSS background for the darkening layer on top.
 */
export default function HeroMedia({ src, overlay, position = "50% 50%" }: { src: string; overlay: string; position?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const k = useParallaxScale();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${30 * k}%`]);
  return (
    <div ref={ref} aria-hidden className="absolute inset-0 overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <motion.img
          data-anim
          src={src}
          alt=""
          className="size-full object-cover"
          style={{ objectPosition: position }}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: MOTION.heroImage, ease: MOTION.ease }}
        />
      </motion.div>
      <div className="absolute inset-0" style={{ background: overlay }} />
    </div>
  );
}
