"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";

/** One headline line, wiped in left → right over its slice of the scroll progress (final CTA sections). */
export default function WipeLine({
  progress,
  range,
  className,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  className: string;
  children: ReactNode;
}) {
  const p = useTransform(progress, range, [0, 1], { clamp: true });
  const clipPath = useTransform(p, (v) => `inset(-0.1em ${(1 - v) * 100}% -0.1em 0)`);
  const x = useTransform(p, [0, 1], [-24, 0]);
  return (
    <motion.span style={{ clipPath, x }} className={`block will-change-[clip-path,transform] ${className}`}>
      {children}
    </motion.span>
  );
}
