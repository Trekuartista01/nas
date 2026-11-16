"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}

/** Fade up 48px → 0 when it enters the viewport, once (design: `.rv`). */
export default function Reveal({ children, className, delay = 0, id }: RevealProps) {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "0px 0px -8% 0px" });
  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
