"use client";
import { siteMedia } from "@/lib/supabase/config";

import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useMedia, useReducedMotionSafe } from "@/components/motion/useMotionScale";
import { MOTION } from "@/lib/motion";

const LION = siteMedia("/nas-images/web/lion-emblem.png"); // transparent PNG, ink = opaque: used as the mask
const MASK = {
  WebkitMaskImage: `url(${LION})`,
  maskImage: `url(${LION})`,
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
} as const;

/** Max tilt (degrees) and how quickly the tilt follows the cursor (lerp per frame). */
const TILT = { max: 8, ease: 0.08 };

/**
 * The lion shield in chrome (dealer section only). The emblem PNG masks a chrome-gradient layer
 * plus two glint layers.
 * - Entrance: fade + scale 0.92 → 1, then one full glint sweep.
 * - Desktop (≥ 1024px, fine pointer): the chrome bands and a second glint move with the scroll, and
 *   the emblem tilts toward the cursor (perspective 1000px, max ±8°, lerped), the glint following the
 *   cursor's x a little; both ease back on mouse leave.
 * - Phones: entrance + one glint only. Reduced motion: static chrome, no glint, no tilt.
 */
export default function ChromeLion({ className = "" }: { className?: string }) {
  const reduce = useReducedMotionSafe();
  const desktop = useMedia("(min-width: 1024px) and (pointer: fine)");
  const live = desktop && !reduce;

  const wrap = useRef<HTMLDivElement>(null);
  const tiltEl = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  // Scroll-linked light.
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start end", "end start"] });
  const mouseX = useMotionValue(0); // -1 … 1, eased
  const bands = useTransform(scrollYProgress, (v) => `${live ? v * 100 : 30}% 0`);
  const sweep = useTransform(() => {
    if (!live) return "100% 0";
    const base = 100 - Math.min(1, Math.max(0, (scrollYProgress.get() - 0.15) / 0.7)) * 100;
    return `${base - mouseX.get() * 18}% 0`;
  });

  // Tilt toward the cursor, lerped in rAF; resets smoothly on leave.
  useEffect(() => {
    const el = wrap.current;
    const card = tiltEl.current;
    if (!live || !el || !card) return;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = 0;
    const tick = () => {
      cur.x += (target.x - cur.x) * TILT.ease;
      cur.y += (target.y - cur.y) * TILT.ease;
      card.style.transform = `rotateX(${(-cur.y * TILT.max).toFixed(2)}deg) rotateY(${(cur.x * TILT.max).toFixed(2)}deg)`;
      mouseX.set(cur.x);
      raf = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      target.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      kick();
    };
    const leave = () => {
      target.x = 0;
      target.y = 0;
      kick();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      card.style.transform = "";
    };
  }, [live, mouseX]);

  return (
    <motion.div
      ref={wrap}
      data-anim
      className={`[perspective:1000px] ${className}`}
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: MOTION.image, ease: MOTION.ease }}
      onAnimationComplete={() => setEntered(true)}
    >
      <div ref={tiltEl} className="relative aspect-[760/922] w-full will-change-transform [transform-style:preserve-3d]">
        <div role="img" aria-label="NAS: emblema e luanit" style={MASK} className="absolute inset-0">
          <motion.div style={{ backgroundPosition: bands }} className="chrome absolute inset-0" />
          {/* Scroll / cursor-linked glint (desktop) */}
          <motion.div style={{ backgroundPosition: sweep }} className={`glint absolute inset-0 ${live ? "" : "hidden"}`} />
          {/* One sweep after the entrance */}
          <div className={`glint absolute inset-0 ${entered ? "animate-[glint-sweep_1.1s_cubic-bezier(.7,0,.2,1)_both]" : ""}`} />
        </div>
      </div>
    </motion.div>
  );
}
