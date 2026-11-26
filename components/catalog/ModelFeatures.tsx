"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import Rise from "@/components/motion/Rise";
import { useParallaxScale } from "@/components/motion/useMotionScale";
import type { ModelFeature } from "@/data/model-details";
import { useT } from "@/components/i18n/lang";

/**
 * Feature strips on a model page, stacked like the homepage Lifestyle / Speed / Freedom panels
 * (VisionPanels): each panel is a sticky full screen, the next one slides up over it, and the one
 * being covered shrinks to 0.92 and darkens. The strip photos are very wide (about 4:1), so from
 * 768px the photo shows whole across the panel with a blurred copy of itself filling the screen
 * behind it; on phones it fills the panel (cropped). Reduced motion: the panels simply stack.
 *
 * Progress maths as in VisionPanels: n screens tall, (n - 1) screens of pinned scroll, so
 * `progress × (n - 1) - i` is 0 → 1 while panel i is being covered by panel i + 1.
 */
export default function ModelFeatures({ features }: { features: ModelFeature[] }) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const k = useParallaxScale();
  const pin = k > 0;
  if (features.length === 0) return null;

  return (
    <div ref={ref} aria-label={t("Veçoritë", "Features")} role="region" className="relative bg-ink">
      {features.map((f, i) => (
        <Panel key={f.title} feature={f} index={i} count={features.length} progress={scrollYProgress} pin={pin} k={k} />
      ))}
    </div>
  );
}

function Panel({
  feature: f,
  index,
  count,
  progress,
  pin,
  k,
}: {
  feature: ModelFeature;
  index: number;
  count: number;
  progress: MotionValue<number>;
  pin: boolean;
  k: number;
}) {
  const last = index === count - 1;
  const covered = useTransform(progress, (v) => (pin && !last ? Math.min(Math.max(v * (count - 1) - index, 0), 1) : 0));
  const scale = useTransform(covered, [0, 1], [1, 0.92]);
  const shade = useTransform(covered, [0, 1], [0, 0.6]);
  // Small drift of the strip while the panel arrives and leaves (half as far on phones).
  const y = useTransform(progress, (v) => {
    const t = Math.min(Math.max((v * (count - 1) - index + 1) / 2, 0), 1);
    return `${(-4 + 8 * t) * k}%`;
  });
  const num = `${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;

  const media = (className: string) =>
    f.video ? (
      <video src={f.video} poster={f.image} muted autoPlay loop playsInline preload="metadata" aria-hidden className={className} />
    ) : f.image ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={f.image} alt="" loading="lazy" draggable={false} className={className} />
    ) : null;

  return (
    <section aria-label={f.title} className={`relative h-svh min-h-[520px] overflow-hidden border-t border-line ${pin ? "sticky top-0" : ""}`}>
      <motion.div style={{ scale }} className="absolute inset-0 overflow-hidden bg-black will-change-transform">
        {/* Ambient fill: the same photo, blurred and dark (from 768px, where the strip shows whole). */}
        {f.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={f.image} alt="" aria-hidden loading="lazy" className="absolute inset-0 hidden size-full scale-125 object-cover opacity-50 blur-3xl md:block" />
        )}

        <motion.div style={{ y }} className="absolute inset-0 flex items-center">
          <div className="relative h-full w-full md:h-auto md:aspect-[4/1]">
            {media("absolute inset-0 size-full object-cover") ?? (
              <span className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#1c1c1c,#0b0b0b)] text-xs tracking-[0.14em] text-[#5f5f5f]">
                [FOTO · {f.title}]
              </span>
            )}
          </div>
        </motion.div>

        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,.75),transparent_40%),linear-gradient(180deg,rgba(0,0,0,.5),transparent_25%)]" />

        <div className="container-moto relative flex h-full flex-col justify-between pb-[clamp(40px,9vh,90px)] pt-[clamp(88px,14vh,130px)]">
          <Rise>
            <span className="text-[13px] font-bold tracking-[0.2em] text-red">{num}</span>
          </Rise>
          <Rise delay={0.1}>
            <h3 className="max-w-[760px] text-[clamp(22px,2.4vw,38px)] font-extrabold uppercase leading-[1.1] tracking-[-0.01em]">
              {f.title}
            </h3>
          </Rise>
        </div>

        <motion.div aria-hidden style={{ opacity: shade }} className="pointer-events-none absolute inset-0 bg-black" />
      </motion.div>
    </section>
  );
}
