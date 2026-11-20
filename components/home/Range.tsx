"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Lines from "@/components/motion/Lines";
import Rise from "@/components/motion/Rise";
import { useMedia, usePinnable } from "@/components/motion/useMotionScale";
import DarkModelCard, { SeeAllCard } from "@/components/nas/DarkModelCard";
import { BlockButton } from "@/components/ui/Buttons";
import type { Model, VehicleType } from "@/data/models";
import { MOTION } from "@/lib/motion";

type Cat = "all" | "scooter" | "sport" | "offroad";

/** Tabs and the vehicle types in each (category = the model's `type`). */
const TABS: { id: Cat; label: string; types: VehicleType[] }[] = [
  { id: "all", label: "All", types: ["scooter", "sport", "dirt", "atv"] },
  { id: "scooter", label: "Scooters", types: ["scooter"] },
  { id: "sport", label: "Sport Line", types: ["sport"] },
  { id: "offroad", label: "Off-road", types: ["dirt", "atv"] },
];

const pad = (n: number) => String(n).padStart(2, "0");
// Layout effects only run in the browser; fall back to useEffect during the server render.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * THE RANGE (dark). Heading, intro, CTA, category tabs and a "01 / 06" counter on the left; the
 * model cards in a row, closed by a "See all models" card.
 * - Desktop (≥ 1024px): the section pins and scrolling moves the row sideways (scrubbed), with a
 *   red progress line. The section is exactly as tall as the sideways distance + one screen.
 * - Below 1024px: a swipe carousel (scroll-snap), cards ~85% wide so the next one peeks in.
 * - Reduced motion on desktop: no pin, the cards sit in a grid.
 * Switching tabs fades the cards out and in and returns the row to its start.
 */
export default function Range({ models }: { models: Model[] }) {
  const [cat, setCat] = useState<Cat>("all");
  const pinnable = usePinnable();
  const desktop = useMedia("(min-width: 1024px)");
  const list = models.filter((m) => TABS.find((t) => t.id === cat)!.types.includes(m.type));
  const n = list.length;

  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  // Callback ref: the row element is replaced on every tab change (AnimatePresence), so measure the current one.
  const [track, setTrack] = useState<HTMLDivElement | null>(null);

  // Sideways distance of the pinned row (track width beyond its window).
  const [distance, setDistance] = useState(0);
  useIsoLayoutEffect(() => {
    const vp = viewport.current;
    if (!pinnable || !track || !vp) return;
    const measure = () => setDistance(Math.max(0, track.scrollWidth - vp.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(vp);
    return () => ro.disconnect();
  }, [pinnable, track]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, MOTION.scrub);
  const x = useTransform(smooth, (v) => (pinnable ? -v * distance : 0));

  // Counter + progress line: from the pin progress on desktop, from the swipe position below.
  const [active, setActive] = useState(1);
  const [fill, setFill] = useState(0);
  useMotionValueEvent(smooth, "change", (v) => {
    if (!pinnable) return;
    setFill(v);
    setActive(Math.min(n, Math.max(1, Math.round(v * Math.max(n - 1, 0)) + 1)));
  });
  const onSwipe = useCallback(() => {
    const el = viewport.current;
    if (!el || pinnable) return;
    const max = el.scrollWidth - el.clientWidth;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : el.clientWidth;
    setFill(max > 0 ? el.scrollLeft / max : 0);
    setActive(Math.min(n, Math.round(el.scrollLeft / step) + 1));
  }, [n, pinnable]);

  const pick = (id: Cat) => {
    if (id === cat) return;
    setCat(id);
    setActive(1);
    setFill(0);
    if (viewport.current) viewport.current.scrollLeft = 0;
    // Back to the start of the row: on desktop that means the top of the pinned section.
    const top = section.current ? section.current.getBoundingClientRect().top + window.scrollY : 0;
    if (pinnable && window.scrollY > top) window.scrollTo({ top, behavior: "instant" });
  };

  const grid = desktop && !pinnable; // reduced motion on desktop
  const cardSize = grid
    ? "aspect-[520/620] w-full"
    : "h-[min(620px,calc(100svh-260px))] w-[min(520px,36vw)] shrink-0 max-lg:aspect-[4/5] max-lg:h-auto max-lg:w-[85%] max-lg:snap-start";

  return (
    <section
      ref={section}
      id="range"
      aria-label="The Range"
      className="relative scroll-mt-20 bg-ink"
      style={pinnable ? { height: `calc(100svh + ${distance}px)` } : undefined}
    >
      <div className={pinnable ? "sticky top-0 flex h-svh items-center overflow-hidden" : "py-[clamp(90px,10vw,140px)]"}>
        <div className={`container-moto flex w-full gap-10 ${pinnable ? "items-center pt-[72px]" : "flex-col"} ${grid ? "" : "lg:flex-row lg:items-center"}`}>
          {/* ───── Left: heading, intro, tabs, counter ───── */}
          <div className={`shrink-0 ${pinnable || (!grid && desktop) ? "w-[clamp(300px,27vw,420px)]" : ""}`}>
            <Lines
              className="headline text-[clamp(48px,5.4vw,92px)]"
              lines={[
                "THE",
                <span key="range">
                  RANGE<span className="text-red">.</span>
                </span>,
              ]}
            />
            <Rise delay={0.2} className="mt-6 max-w-[360px]">
              <p className="text-[17px] leading-[1.6] text-body">From the city to beyond the borders. Choose your NAS.</p>
              <BlockButton href="/modelet" marks={false} className="mt-7">
                See the models
              </BlockButton>
            </Rise>

            <Rise delay={0.3} className="mt-9">
              <div role="group" aria-label="Filtro modelet" className="flex flex-wrap gap-2">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={t.id === cat}
                    onClick={() => pick(t.id)}
                    className={`h-10 cursor-pointer border px-4 text-[14px] transition-colors duration-300 ${
                      t.id === cat ? "border-red bg-red text-white" : "border-line-3 text-light hover:border-[#555]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {/* Counter + progress line */}
              <div aria-hidden className="mt-8 flex items-center gap-4 text-[13px] tracking-[0.14em]">
                <span className="text-white">{pad(n ? active : 0)}</span>
                <span className="relative h-px w-[clamp(120px,12vw,180px)] bg-line-3">
                  <span className="absolute inset-0 origin-left bg-red" style={{ transform: `scaleX(${n > 1 ? fill : n ? 1 : 0})` }} />
                </span>
                <span className="text-faint">{pad(n)}</span>
              </div>
            </Rise>
          </div>

          {/* ───── Right: the cards ───── */}
          <div
            ref={viewport}
            onScroll={onSwipe}
            className={
              grid
                ? "w-full"
                : `min-w-0 flex-1 ${pinnable ? "overflow-hidden" : "-mx-4 snap-x snap-mandatory overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden"}`
            }
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={cat}
                ref={setTrack}
                style={{ x }}
                className={grid ? "grid grid-cols-3 gap-4" : "flex w-max gap-4 max-lg:w-full"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: MOTION.micro, ease: MOTION.ease }}
              >
                {list.map((m, i) => (
                  <motion.div
                    key={m.slug}
                    data-card
                    data-anim
                    className={`flex ${cardSize}`}
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: MOTION.image, ease: MOTION.ease, delay: Math.min(i, 5) * MOTION.rangeStagger }}
                  >
                    <DarkModelCard model={m} index={i} cut className="size-full" />
                  </motion.div>
                ))}
                <div data-card className={`flex ${cardSize}`}>
                  <SeeAllCard cut className="size-full" label={n ? "See all models" : "Coming soon. See all models"} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
