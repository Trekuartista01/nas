"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import Lines from "@/components/motion/Lines";
import Rise from "@/components/motion/Rise";
import { useParallaxScale } from "@/components/motion/useMotionScale";
import { NAS_HOME } from "@/data/nas-home";
import { MOTION } from "@/lib/motion";

/**
 * Lifestyle / Speed / Freedom: full-screen panels that pin and stack. Each panel is sticky, so
 * the next one slides up over it; while it is being covered it shrinks to 0.92 and darkens
 * (scrubbed with the scroll). The photo inside drifts -10% → 10% (half as far on phones). With
 * reduced motion the panels simply stack, with the text reveals only.
 *
 * Progress maths: the wrapper is n screens tall and scrolls (n - 1) screens while pinned, so
 * `progress × (n - 1) - i` is 0 → 1 while panel i is being covered by panel i + 1.
 */
export default function VisionPanels() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const k = useParallaxScale();
  // Pinned on every screen size (phones too, Nov 2026); off only with reduced motion.
  const pin = k > 0;
  const n = NAS_HOME.panels.length;

  return (
    <div ref={ref} className="relative bg-ink">
      {NAS_HOME.panels.map((p, i) => (
        <Panel key={p.title} index={i} count={n} progress={scrollYProgress} pin={pin} k={k} {...p} />
      ))}
    </div>
  );
}

function Panel({
  index,
  count,
  progress,
  pin,
  k,
  title,
  text,
  image,
}: {
  index: number;
  count: number;
  progress: MotionValue<number>;
  pin: boolean;
  k: number;
  title: string;
  text: string;
  image: string;
}) {
  const last = index === count - 1;
  // 0 → 1 while this panel is covered by the next one.
  const covered = useTransform(progress, (v) => (pin && !last ? Math.min(Math.max(v * (count - 1) - index, 0), 1) : 0));
  const scale = useTransform(covered, [0, 1], [1, 0.92]);
  const shade = useTransform(covered, [0, 1], [0, 0.6]);
  // Photo drift: from the moment the panel starts entering (index - 1) until it is fully covered (index + 1).
  const imageY = useTransform(progress, (v) => {
    const t = Math.min(Math.max((v * (count - 1) - index + 1) / 2, 0), 1);
    return `${(-10 + 20 * t) * k}%`;
  });
  const num = `${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;

  return (
    <section aria-label={title} className={`relative h-svh min-h-[560px] overflow-hidden border-t border-line ${pin ? "sticky top-0" : ""}`}>
      <motion.div style={{ scale }} className="absolute inset-0 bg-ink will-change-transform">
        <motion.div aria-hidden style={{ y: imageY }} className="absolute inset-x-0 -inset-y-[12%]">
          {/* Intro: the photo settles from 1.15 → 1 as the panel arrives. */}
          <motion.img
            data-anim
            src={image}
            alt=""
            loading="lazy"
            className="size-full object-cover"
            initial={{ scale: 1.15 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: MOTION.heroImage, ease: MOTION.ease }}
          />
        </motion.div>
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,.75),rgba(10,10,10,.2)_55%,transparent),linear-gradient(0deg,rgba(10,10,10,.85),transparent_50%)]"
        />

        <div className="container-moto relative flex h-full flex-col justify-between pb-[clamp(56px,11vh,110px)] pt-[clamp(56px,11vh,100px)]">
          <Rise>
            <span className="text-[13px] font-bold tracking-[0.2em] text-red">{num}</span>
          </Rise>
          <div>
            <Lines as="h2" className="headline text-[clamp(52px,7.4vw,120px)]" lines={[title]} />
            <Rise delay={0.15} className="mt-6 max-w-[460px]">
              <p className="text-[clamp(16px,1.3vw,19px)] leading-[1.6] text-light">{text}</p>
            </Rise>
          </div>
        </div>

        <motion.div aria-hidden style={{ opacity: shade }} className="pointer-events-none absolute inset-0 bg-black" />
      </motion.div>
    </section>
  );
}
