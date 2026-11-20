"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { CategoryStats } from "@/components/home/VehicleCards";
import type { VehicleCategory } from "@/data/home";

const EASE = [0.2, 0.8, 0.2, 1] as const;
/** Scroll length per category, in screen heights. */
const PER_CATEGORY = 1.6;
/** The two red marks after the category name (design: "section i ri", 56×27). */
const MARKS = ["0,17 13,0 36,0 36,10 22,27 0,27", "33,18 46,0 56,0 56,10 42,27 33,27"];

/**
 * Find your vehicle as a pinned scroll story. The section sticks to the screen; scrolling
 * moves the bike across the frame from right to left, then hands over to the next category.
 *
 * Media per category (data/home.ts):
 * - `video`: a clip of the bike riding right → left. Scroll drives video.currentTime, so it
 *   plays forward and backward with the page. Encode it all-keyframe or it stutters:
 *   ffmpeg -i in.mp4 -an -c:v libx264 -g 1 -crf 22 -preset veryfast -movflags +faststart out.mp4
 * - otherwise the `cutout` slides right → left (works today, before the videos exist).
 */
export default function VehicleScroll({ items }: { items: VehicleCategory[]; stats: Record<string, CategoryStats> }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const n = items.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const [active, setActive] = useState(0);
  const local = useMotionValue(0); // 0 → 1 within the active category
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const seg = Math.min(Math.max(p, 0), 0.9999) * n;
    const i = Math.floor(seg);
    const t = seg - i;
    if (i !== active) setActive(i);
    local.set(t);
    const v = videos.current[i];
    if (v && v.readyState >= 1 && v.duration) v.currentTime = t * (v.duration - 0.05);
  });

  // Each new video starts at its first frame (the bike on the right).
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (v && i !== active && v.readyState >= 1) v.currentTime = i < active ? Math.max(0, v.duration - 0.05) : 0;
    });
  }, [active]);

  const bikeX = useTransform(local, [0, 1], reduce ? ["0%", "0%"] : ["58%", "-58%"]);
  const barScale = useTransform(local, [0, 1], [0, 1]);
  const item = items[active];
  const num = String(active + 1).padStart(2, "0");

  return (
    <section ref={ref} aria-label="Gjej mjetin tënd" className="relative" style={{ height: `${n * PER_CATEGORY * 100}svh` }}>
      {/* Design: "section i ri". Black side panel (number + category) | full-bleed media. */}
      <div className="sticky top-0 grid h-svh grid-rows-[auto_1fr] overflow-hidden bg-black lg:grid-cols-[26.5%_1fr] lg:grid-rows-1">
        {/* ───── Side panel ───── */}
        <div className="relative flex items-end justify-between gap-6 px-4 pb-6 pt-[92px] sm:px-6 lg:flex-col lg:items-start lg:px-[3.2%] lg:pb-[9vh] lg:pt-[max(150px,22vh)]">
          {/* Big number */}
          <div className="relative h-[1.1em] w-[2.4em] overflow-hidden text-[clamp(64px,17vh,170px)] leading-none lg:w-full">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={num}
                className="absolute left-0 top-0 block font-bold leading-[1.1] tracking-[-0.04em] text-[#3a3a3a]"
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                {num}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Category + red marks */}
          <div className="relative h-[2.2em] min-w-0 flex-1 overflow-hidden text-[clamp(20px,1.95vw,36px)] lg:w-full lg:flex-none">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={item.num}
                className="absolute bottom-0 left-0 pb-[0.8em]"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <Link href={item.href} className="group flex items-center gap-[0.72em] text-white hover:text-white">
                  <span className="relative whitespace-nowrap font-bold uppercase leading-none">
                    {item.title}
                    {/* short red underline */}
                    <span aria-hidden className="absolute -bottom-[0.75em] left-0 h-[2px] w-[1.25em] bg-red transition-[width] duration-300 group-hover:w-full" />
                  </span>
                  {/* Two red blocks traced from the design: top-left and bottom-right corners cut, the second interlocking with the first. */}
                  <svg aria-hidden viewBox="0 0 56 27" className="h-[1.04em] w-auto shrink-0 overflow-visible fill-red">
                    {MARKS.map((pts, k) => (
                      <polygon
                        key={k}
                        points={pts}
                        style={{ transitionDelay: `${k * 40}ms` }}
                        className="transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
                      />
                    ))}
                  </svg>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Divider: faint line, red part fills with this category's scroll progress */}
          <span aria-hidden className="absolute inset-y-0 right-0 hidden w-px bg-white/25 lg:block">
            <motion.span className="absolute inset-0 origin-bottom bg-red" style={{ scaleY: barScale }} />
          </span>
        </div>

        {/* ───── Media (full bleed) ───── */}
        <Link href={item.href} aria-label={`${item.title}: shiko modelet`} tabIndex={-1} className="relative block overflow-hidden bg-[#050505]">
          {/* Set for the cut-out fallback: dark shutter wall + floor shade */}
          <div aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(180deg,#0d0d0d_0_22px,#060606_22px_26px)] opacity-80" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[22%] bg-[linear-gradient(180deg,#070707,#030303)]" />
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(55%_60%_at_55%_45%,rgba(255,255,255,0.06),transparent_70%)]" />

          {items.map((c, i) =>
            c.video ? (
              <video
                key={c.num}
                ref={(el) => {
                  videos.current[i] = el;
                }}
                src={c.video}
                poster={c.poster}
                muted
                playsInline
                preload="auto"
                aria-hidden
                className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-0"}`}
              />
            ) : i === active && c.cutout ? (
              <motion.div key={c.num} className="absolute inset-x-[8%] bottom-[12%] top-[18%]" style={{ x: bikeX }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.cutout} alt="" className="size-full object-contain drop-shadow-[0_26px_30px_rgba(0,0,0,0.8)]" />
              </motion.div>
            ) : null,
          )}
        </Link>
      </div>
    </section>
  );
}
