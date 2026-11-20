"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Rise from "@/components/motion/Rise";
import { useParallaxScale } from "@/components/motion/useMotionScale";
import { NAS_HOME } from "@/data/nas-home";
import { MOTION } from "@/lib/motion";

/**
 * Iron / Light / Concrete: three full-height columns. The words rise from their masks left to
 * right; the photos drift with the scroll.
 * Hover (desktop, same feel as the old Find your vehicle cards): the column widens, its photo
 * zooms in and the red line under the word runs full width, while the other columns go grey
 * and dim. The photos only fill the top of each column (TEMP crops that stop above the design's
 * baked-in text), fading into the dark base.
 */
export default function Materials() {
  const ref = useRef<HTMLElement>(null);
  const k = useParallaxScale();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-8 * k}%`, `${8 * k}%`]);

  return (
    <section ref={ref} aria-label="Materialet" className="bg-ink py-12">
      <div className="group/row flex flex-col md:h-[clamp(420px,43vw,640px)] md:flex-row">
        {NAS_HOME.materials.map((m, i) => (
          <div
            key={m.title}
            className="group relative h-[clamp(420px,110vw,560px)] overflow-hidden bg-[#0e0e0e] transition-[flex-grow,filter,opacity] duration-700 ease-moto md:h-auto md:flex-1 lg:hover:grow-[1.5] md:group-hover/row:opacity-55 md:group-hover/row:grayscale md:hover:!opacity-100 md:hover:!grayscale-0"
          >
            <motion.div aria-hidden style={{ y }} className="absolute inset-x-0 -top-[8%] h-[92%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.image}
                alt=""
                loading="lazy"
                className="size-full object-cover transition-transform duration-[1.2s] ease-nas [mask-image:linear-gradient(180deg,#000_70%,transparent)] group-hover:scale-[1.06]"
              />
            </motion.div>
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,10,10,.75),transparent_45%)]" />

            <div className="absolute inset-x-[clamp(24px,3.4vw,48px)] bottom-[clamp(40px,4.2vw,60px)]">
              <Rise mask delay={i * MOTION.lineStagger}>
                <h3 className="headline whitespace-nowrap text-[clamp(40px,3.8vw,60px)]">{m.title}</h3>
              </Rise>
              <div aria-hidden className="mt-3 h-[3px] w-full origin-left scale-x-[0.18] bg-red transition-transform duration-700 ease-moto group-hover:scale-x-100" />
              <Rise delay={0.2 + i * MOTION.lineStagger} className="mt-4">
                <p className="text-[13px] uppercase tracking-[0.12em] text-body">{m.tags}</p>
              </Rise>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
