"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import T from "@/components/i18n/T";
import Rise from "@/components/motion/Rise";
import { useParallaxScale } from "@/components/motion/useMotionScale";
import type { Copy } from "@/lib/i18n";
import { MOTION } from "@/lib/motion";

export type HoverColumn = { title: string; text: Copy; image: string };

/**
 * Three full-height photo columns side by side (Iron / Light / Concrete on /sport-line, Lifestyle / Speed /
 * Freedom on the homepage). The titles rise from their masks left to right; the photos drift with the scroll.
 * Hover (desktop): the column widens, its photo zooms in and the red line under the title runs full width,
 * while the other columns go grey and dim. Stacked on phones.
 *   variant "tags": short uppercase tags under the title; the photo fills the top of the column only
 *                   (crops that stop above baked-in text), fading into the dark base.
 *   variant "body": a numbered column with a paragraph under the title; the photo fills the column.
 */
export default function HoverColumns({
  items,
  label,
  variant,
  heading = "h3",
}: {
  items: readonly HoverColumn[];
  label: string;
  variant: "tags" | "body";
  heading?: "h2" | "h3";
}) {
  const ref = useRef<HTMLElement>(null);
  const k = useParallaxScale();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-8 * k}%`, `${8 * k}%`]);
  const body = variant === "body";
  const H = heading;

  return (
    <section ref={ref} aria-label={label} className="bg-ink py-12">
      <div
        className={`group/row flex flex-col md:flex-row ${body ? "md:h-[clamp(480px,48vw,720px)]" : "md:h-[clamp(420px,43vw,640px)]"}`}
      >
        {items.map((m, i) => (
          <div
            key={m.title}
            className="group relative h-[clamp(420px,110vw,560px)] overflow-hidden bg-[#0e0e0e] transition-[flex-grow,filter,opacity] duration-700 ease-moto md:h-auto md:flex-1 lg:hover:grow-[1.5] md:group-hover/row:opacity-55 md:group-hover/row:grayscale md:hover:!opacity-100 md:hover:!grayscale-0"
          >
            <motion.div
              aria-hidden
              style={{ y }}
              className={`absolute inset-x-0 -top-[8%] ${body ? "h-[116%]" : "h-[92%]"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.image}
                alt=""
                loading="lazy"
                className={`size-full object-cover transition-transform duration-[1.2s] ease-nas group-hover:scale-[1.06] ${
                  body ? "" : "[mask-image:linear-gradient(180deg,#000_70%,transparent)]"
                }`}
              />
            </motion.div>
            <div
              aria-hidden
              className={`absolute inset-0 ${
                body
                  ? "bg-[linear-gradient(0deg,rgba(10,10,10,.9),rgba(10,10,10,.35)_50%,rgba(10,10,10,.15))]"
                  : "bg-[linear-gradient(0deg,rgba(10,10,10,.75),transparent_45%)]"
              }`}
            />

            {body && (
              <Rise className="absolute left-[clamp(24px,3.4vw,48px)] top-[clamp(28px,3.4vw,48px)]">
                <span className="text-[13px] font-bold tracking-[0.2em] text-red">
                  {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                </span>
              </Rise>
            )}

            <div className="absolute inset-x-[clamp(24px,3.4vw,48px)] bottom-[clamp(40px,4.2vw,60px)]">
              <Rise mask delay={i * MOTION.lineStagger}>
                <H
                  className={`headline whitespace-nowrap ${
                    body ? "text-[clamp(36px,3.3vw,54px)]" : "text-[clamp(40px,3.8vw,60px)]"
                  }`}
                >
                  {m.title}
                </H>
              </Rise>
              <div
                aria-hidden
                className="mt-3 h-[3px] w-full origin-left scale-x-[0.18] bg-red transition-transform duration-700 ease-moto group-hover:scale-x-100"
              />
              <Rise delay={0.2 + i * MOTION.lineStagger} className="mt-4">
                {body ? (
                  <p className="max-w-[400px] text-[clamp(15px,1.1vw,17px)] leading-[1.6] text-light">
                    <T {...m.text} />
                  </p>
                ) : (
                  <p className="text-[13px] uppercase tracking-[0.12em] text-body">
                    <T {...m.text} />
                  </p>
                )}
              </Rise>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
