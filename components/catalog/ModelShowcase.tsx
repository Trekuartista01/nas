"use client";

import { animate, AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { SlashButton } from "@/components/ui/Buttons";
import type { ModelShowcase as Showcase } from "@/data/model-showcase";
import { eur } from "@/lib/format";

export interface ShowcaseSpec {
  value: string;
  unit?: string;
  label: string;
}

interface Props {
  brand: string;
  name: string;
  /** Giant word behind the bike (the model name, e.g. "MAX-X 125"). */
  word: string;
  isNew?: boolean;
  /** The normal showroom photo. */
  photo?: string;
  showcase?: Showcase;
  /** Up to three short spec tiles (cc, licence, type). */
  specs: ShowcaseSpec[];
  monthly: number;
  price: number;
  /** Where the price block's button goes (the test-ride form on the same page). */
  ctaHref: string;
}

const EASE = [0.2, 0.8, 0.2, 1] as const;
/** Length of the intro curtain (seconds). Everything else starts after it. */
const INTRO = 1.5;
/** When the bike has landed (after the intro): callouts, flash and specs key off this. */
const LANDED = 0.85;

type View = { key: string; label: string; image?: string; cutout: boolean; spin?: boolean };

/**
 * Model page hero. A cut-out bike on a lit stage over a moving outlined word, with callouts,
 * colour swatches, angle/360 views and a price block that leads to the test ride.
 * Degrades on its own: without a cut-out it shows the photo with a soft fade and no callouts.
 */
export default function ModelShowcase({ brand, name, word, isNew = false, photo, showcase: s = {}, specs, monthly, price, ctaHref }: Props) {
  const reduce = useReducedMotion();
  // Intro plays on every visit (1.5s, click to skip). Off for reduced motion.
  const [introOn, setIntroOn] = useState(true);
  const t0 = reduce ? 0 : INTRO;
  const landed = t0 + LANDED;
  const stageRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start start", "end start"] });
  const wordX = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const bikeX = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const bikeY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  // ── Colours (swap the stage image) ──
  const colours = s.colours ?? [];
  const [colour, setColour] = useState(0);
  const colourImage = colours[colour]?.image;
  const colourMissing = colours.length > 0 && !colourImage;

  // ── Views: studio cut-out, showroom photo, 360 ──
  const views: View[] = [];
  if (s.cutout) views.push({ key: "studio", label: "Studio", image: colourImage ?? s.cutout, cutout: true });
  if (photo) views.push({ key: "foto", label: "Showroom", image: photo, cutout: false });
  if ((s.frames?.length ?? 0) >= 8) views.push({ key: "360", label: "360°", cutout: true, spin: true });
  if (views.length === 0) views.push({ key: "none", label: "Foto", cutout: false });
  const [viewIndex, setViewIndex] = useState(0);
  const view = views[Math.min(viewIndex, views.length - 1)];
  const onStudio = view.key === "studio";
  const aspect = view.cutout ? (s.aspect ?? 1.2) : 1.5;
  const showCallouts = onStudio && !colourMissing && (s.hotspots?.length ?? 0) > 0;

  const pickColour = (i: number) => {
    setColour(i);
    if (s.cutout) setViewIndex(0); // colours are shown on the studio view
  };

  return (
    <>
      {/* ───── Stage ───── */}
      <section ref={stageRef} className="relative overflow-hidden">
        {/* 7 · Intro curtain over the stage */}
        {introOn && !reduce && <Intro brand={brand} name={name} onDone={() => setIntroOn(false)} />}

        {/* 2 · Background word: filled dark, looping, drifting left as you scroll */}
        <motion.div aria-hidden style={{ x: reduce ? 0 : wordX }} className="pointer-events-none absolute inset-x-0 top-[60px] select-none sm:top-[70px] lg:top-[80px]">
          <div className="flex w-max animate-marquee motion-reduce:animate-none" style={{ animationDuration: "60s" }}>
            {[0, 1].map((half) => (
              <span
                key={half}
                className="whitespace-nowrap bg-gradient-to-b from-[#1d1d1d] to-[#0d0d0d] bg-clip-text pr-[0.4em] text-[110px] font-extrabold uppercase italic leading-none tracking-[-0.03em] text-transparent [-webkit-text-stroke:1px_#262626] sm:text-[170px] lg:text-[230px]"
              >
                {word}&nbsp;&nbsp;{word}&nbsp;&nbsp;{word}&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </motion.div>

        <div className="container-moto relative pb-6 pt-8 lg:pt-12">
          {/* 1 · Stage light behind the bike */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[44%] h-[70%] w-[min(1100px,95%)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(225,6,0,0.28),rgba(225,6,0,0.08)_55%,transparent)]"
          />

          <motion.div style={reduce ? undefined : { x: bikeX, y: bikeY }} className="relative mx-auto w-full max-w-[1080px]">
            <div
              className="relative mx-auto w-[94%] lg:w-[86%]"
              // Capped by the screen height too, so the name and price stay in the first view.
              style={{ aspectRatio: aspect, maxWidth: `calc((100svh - 330px) * ${aspect})`, minWidth: "min(94%, 320px)" }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${view.key}-${view.image ?? ""}`}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.01 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  {/* 7 · Entrance: slides in from the right out of a blur */}
                  <motion.div
                    className="size-full"
                    initial={reduce ? false : { x: 160, opacity: 0, filter: "blur(14px)" }}
                    animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.9, ease: EASE, delay: t0 + 0.1 }}
                  >
                    {view.spin && s.frames ? (
                      <Spinner frames={s.frames} alt={`${brand} ${name}, pamje 360°`} />
                    ) : view.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={view.image}
                        alt={`${brand} ${name}${colours[colour] ? `, ${colours[colour].name}` : ""}`}
                        className={`size-full transition-[opacity,filter] duration-500 ${onStudio && colourMissing ? "opacity-20 grayscale" : ""} ${view.cutout ? "object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]" : "object-cover [mask-image:linear-gradient(90deg,transparent,#000_14%,#000_86%,transparent),linear-gradient(180deg,transparent,#000_10%,#000_85%,transparent)] [mask-composite:intersect]"}`}
                        draggable={false}
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-xs tracking-[0.14em] text-[#6f6f6f]">[FOTO · {name}]</span>
                    )}
                  </motion.div>

                  {onStudio && colourMissing && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex items-center gap-3 border border-line-2 bg-ink/80 px-5 py-3 text-[12px] uppercase tracking-[0.12em] text-white/85 backdrop-blur">
                        <span className="size-4 rounded-full border border-white/40" style={{ backgroundColor: colours[colour].hex }} />
                        Foto në {colours[colour].name} vjen së shpejti
                      </span>
                    </span>
                  )}

                  {/* 7 · Headlight flash once the bike lands */}
                  {onStudio && s.headlight && !reduce && (
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute size-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.95),rgba(255,236,220,0.45)_40%,transparent)] mix-blend-screen"
                      style={{ left: `${s.headlight.x}%`, top: `${s.headlight.y}%` }}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: [0, 1, 0.25, 0.9, 0], scale: [0.4, 1.3, 1, 1.5, 1.8] }}
                      transition={{ duration: 0.9, delay: landed, times: [0, 0.2, 0.4, 0.6, 1] }}
                    />
                  )}

                  {/* 3 · Callouts pinned to the bike */}
                  {showCallouts && <Callouts hotspots={s.hotspots!} mask={view.image} delay={reduce ? 0 : landed + 0.2} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 1 · Floor shadow */}
            {view.cutout && (
              <div aria-hidden className="pointer-events-none relative mx-auto -mt-[3%] h-10 w-[70%]">
                <div className="absolute inset-0 rounded-[50%] bg-black/80 blur-xl" />
              </div>
            )}
          </motion.div>

          {isNew && (
            <span className="absolute right-4 top-6 bg-red px-3 py-1 text-[11px] font-semibold sm:right-6 lg:right-14 lg:top-10">E RE</span>
          )}

          {/* 4 · Angles / 360 */}
          {views.length > 1 && (
            <div role="tablist" aria-label="Pamjet" className="relative mt-4 flex justify-center gap-2 lg:absolute lg:bottom-8 lg:right-14 lg:mt-0">
              {views.map((v, i) => (
                <button
                  key={v.key}
                  type="button"
                  role="tab"
                  aria-selected={v.key === view.key}
                  onClick={() => setViewIndex(i)}
                  className={`group flex min-h-11 items-center gap-2 border px-2 py-1.5 text-[12px] uppercase transition-colors ${
                    v.key === view.key ? "border-red bg-red/10 text-white" : "border-line-2 bg-ink/60 text-muted hover:border-white hover:text-white"
                  }`}
                >
                  {v.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.image} alt="" className={`h-8 w-12 ${v.cutout ? "object-contain" : "object-cover"}`} />
                  )}
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ───── Name, colours, specs + price ───── */}
      <section className="container-moto pb-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <motion.div
              className="text-lg uppercase text-muted"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: t0 + 0.35, ease: EASE }}
            >
              {brand}
            </motion.div>
            {/* 7 · Title wipes in */}
            <motion.h1
              className="mt-1 text-[clamp(38px,4.6vw,64px)] font-extrabold uppercase leading-none tracking-[-0.03em]"
              initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 0.8, delay: t0 + 0.45, ease: EASE }}
            >
              {name}
              <span className="text-red">.</span>
            </motion.h1>
          </div>

          {/* 5 · Colour switcher */}
          {colours.length > 0 && (
            <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: t0 + 0.8 }}>
              <p className="mb-3 text-[13px] text-muted">
                Ngjyra: <span className="text-white/90">{colours[colour].name}</span>
              </p>
              <div role="radiogroup" aria-label="Ngjyra" className="flex gap-5">
                {colours.map((c, i) => (
                  <button
                    key={c.name}
                    type="button"
                    role="radio"
                    aria-checked={i === colour}
                    aria-label={c.name}
                    onClick={() => pickColour(i)}
                    className={`size-11 rounded-full border transition-shadow ${
                      i === colour ? "border-white shadow-[0_0_0_3px_var(--color-ink),0_0_0_4px_#fff]" : "border-[#555] hover:border-white"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* 6 + 7 · Specs stagger in; monthly in red, price + CTA last */}
        <motion.div
          className="mt-10 grid grid-cols-2 border border-line md:grid-cols-3 lg:grid-cols-[repeat(3,1fr)_1.15fr_1.6fr]"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: landed } } }}
        >
          {specs.slice(0, 3).map((sp) => (
            <Tile key={sp.label} className="border-b border-r border-line lg:border-b-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[clamp(26px,2.6vw,40px)] font-bold leading-none">{sp.value}</span>
                {sp.unit && <span className="text-lg font-semibold text-muted">{sp.unit}</span>}
              </div>
              <span className="text-[11px] uppercase text-muted">{sp.label}</span>
            </Tile>
          ))}

          <Tile className="border-b border-r border-line lg:border-b-0">
            <div className="flex items-baseline gap-1.5">
              <CountUp value={monthly} delay={landed + 0.3} className="text-[clamp(30px,3vw,46px)] font-extrabold leading-none text-red" />
              <span className="text-lg font-semibold text-red/80">/muaj</span>
            </div>
            <span className="text-[11px] uppercase text-muted">Me këste, nga</span>
          </Tile>

          <Tile className="col-span-2 flex-row! flex-wrap items-center justify-between gap-5 bg-surface md:col-span-2 lg:col-span-1">
            <div>
              <CountUp value={price} delay={landed + 0.4} className="block text-[clamp(30px,3vw,44px)] font-extrabold leading-none" />
              <span className="mt-1.5 block text-[10px] uppercase text-muted">Çmim demo · ose me këste</span>
            </div>
            <SlashButton href={ctaHref} size="sm">
              REZERVO TEST RIDE
            </SlashButton>
          </Tile>
        </motion.div>
      </section>
    </>
  );
}

function Tile({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
      className={`flex flex-col justify-center gap-1 px-6 py-5 lg:px-8 ${className}`}
    >
      {children}
    </motion.div>
  );
}

/** Counts from 0 up to the price once (€ de-DE format). Shows the final figure for reduced motion. */
function CountUp({ value, delay = 0, className = "" }: { value: number; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const controls = animate(0, value, { duration: 1.1, delay, ease: [0.16, 1, 0.3, 1], onUpdate: setShown });
    return () => controls.stop();
  }, [value, delay, reduce]);
  return (
    <span className={className}>
      <span className="sr-only">{eur(value)}</span>
      <span aria-hidden>{eur(reduce ? value : shown)}</span>
    </span>
  );
}

/**
 * Intro: the model name fills in over its outline with the /// marks,
 * then the curtain lifts off the stage. Decorative only (aria-hidden); a click skips it.
 */
function Intro({ brand, name, onDone }: { brand: string; name: string; onDone: () => void }) {
  return (
    <motion.div
      aria-hidden
      onClick={onDone}
      className="absolute inset-0 z-30 flex cursor-pointer items-center justify-center overflow-hidden bg-ink"
      initial={{ clipPath: "inset(0 0 0% 0)" }}
      animate={{ clipPath: "inset(0 0 100% 0)" }}
      transition={{ delay: INTRO - 0.5, duration: 0.55, ease: [0.7, 0, 0.2, 1] }}
      onAnimationComplete={onDone}
    >
      <div className="relative px-4 text-center">
        <motion.div
          className="text-sm font-semibold uppercase tracking-[0.4em] text-muted"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {brand}
        </motion.div>
        <div className="relative mt-2">
          <span className="block whitespace-nowrap text-[clamp(52px,10vw,170px)] font-extrabold uppercase italic leading-none tracking-[-0.03em] text-transparent [-webkit-text-stroke:1px_#3a3a3a]">
            {name}.
          </span>
          <motion.span
            className="absolute inset-0 block whitespace-nowrap text-[clamp(52px,10vw,170px)] font-extrabold uppercase italic leading-none tracking-[-0.03em]"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ delay: 0.3, duration: 0.55, ease: EASE }}
          >
            {name}
            <span className="text-red">.</span>
          </motion.span>
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.i
              key={i}
              className="block h-7 w-2.5 origin-bottom -skew-x-[24deg] bg-red"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.55 + i * 0.07, duration: 0.25, ease: EASE }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/** Seconds the light scan takes to cross the bike. */
const SWEEP = 1.1;

/**
 * Callouts pinned to the bike.
 * 1. A light scan sweeps across the bike (masked to the cut-out, so only the bike lights up)
 *    and switches each callout on as it passes: dot pops, line draws, label wipes in.
 * 2. Then they take turns: the active one goes red with a spinning ring every 2.4s.
 *    Hovering or focusing a callout picks it and pauses the cycle.
 * Labels are desktop only; dots and the scan show on every size.
 */
function Callouts({ hotspots, delay, mask }: { hotspots: NonNullable<Showcase["hotspots"]>; delay: number; mask?: string }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(-1);
  const paused = useRef(false);
  const n = hotspots.length;

  useEffect(() => {
    if (reduce) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      setActive(0);
      interval = setInterval(() => {
        if (!paused.current) setActive((a) => (a + 1) % n);
      }, 2400);
    }, (delay + SWEEP + 0.8) * 1000);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [delay, n, reduce]);

  const maskStyle: CSSProperties | undefined = mask
    ? { WebkitMaskImage: `url(${mask})`, maskImage: `url(${mask})`, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" }
    : undefined;

  return (
    <>
      {!reduce && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={maskStyle}>
          <motion.span
            className="absolute inset-y-0 w-[22%] mix-blend-screen bg-[linear-gradient(90deg,transparent,rgba(225,6,0,0.35)_40%,rgba(255,255,255,0.75)_50%,rgba(225,6,0,0.35)_60%,transparent)]"
            initial={{ left: "-25%" }}
            animate={{ left: "105%" }}
            transition={{ delay, duration: SWEEP, ease: [0.45, 0, 0.55, 1] }}
          />
        </div>
      )}

      <ul aria-label="Veçoritë" className="pointer-events-none absolute inset-0">
        {hotspots.map((h, i) => {
          const left = h.side === "left";
          const on = delay + SWEEP * Math.max(0, Math.min(1, (h.x + 36) / 130)); // when the scan's bright centre reaches it
          const isActive = i === active;
          const pick = () => {
            paused.current = true;
            setActive(i);
          };
          const release = () => {
            paused.current = false;
          };
          return (
            <li key={h.label} className="absolute" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
              {/* Dot: pops in, pings, grows with a spinning ring when active */}
              <motion.span
                className="absolute -left-1.5 -top-1.5 block size-3"
                initial={{ scale: 0 }}
                animate={{ scale: isActive ? 1.35 : 1 }}
                transition={reduce ? { duration: 0 } : { delay: active === -1 ? on : 0, type: "spring", stiffness: 420, damping: 16 }}
              >
                <span className="absolute inset-0 rounded-full bg-red shadow-[0_0_0_4px_rgba(225,6,0,0.25)]" />
                <span className="absolute inset-0 animate-ping rounded-full bg-red/60 motion-reduce:animate-none" />
                <span
                  className={`absolute -inset-2 rounded-full border border-dashed border-red transition-opacity duration-300 ${isActive ? "animate-spin opacity-100 [animation-duration:3s]" : "opacity-0"}`}
                />
              </motion.span>

              <div className="hidden lg:block">
                {/* Leader line draws out from the dot */}
                <motion.span
                  className={`absolute top-0 h-px transition-colors duration-300 ${left ? "right-0 origin-right" : "left-0 origin-left"} ${isActive ? "bg-red" : "bg-white/45"}`}
                  style={{ width: 110 }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={reduce ? { duration: 0 } : { delay: on + 0.1, duration: 0.4, ease: EASE }}
                />
                {/* Label wipes in, then nudges out and turns red while active */}
                <motion.button
                  type="button"
                  onMouseEnter={pick}
                  onMouseLeave={release}
                  onFocus={pick}
                  onBlur={release}
                  className={`pointer-events-auto absolute -top-3.5 whitespace-nowrap border-l-2 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.06em] backdrop-blur transition-colors duration-300 ${
                    left ? "right-[118px]" : "left-[118px]"
                  } ${isActive ? "border-white bg-red text-white" : "border-red bg-ink/85 text-white/85"}`}
                  initial={{ clipPath: left ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }}
                  animate={{ clipPath: "inset(0 0% 0 0%)", x: isActive ? (left ? -6 : 6) : 0 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { clipPath: { delay: on + 0.4, duration: 0.4, ease: EASE }, x: { type: "spring", stiffness: 300, damping: 20 } }
                  }
                >
                  {h.label}
                </motion.button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** Drag (or arrow keys) to turn the bike through its frames. Frames are preloaded. */
function Spinner({ frames, alt }: { frames: string[]; alt: string }) {
  const [frame, setFrame] = useState(0);
  const [hint, setHint] = useState(true);
  const drag = useRef<{ x: number; start: number; width: number } | null>(null);
  const n = frames.length;

  useEffect(() => {
    frames.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [frames]);

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, start: frame, width: e.currentTarget.clientWidth };
    setHint(false);
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const step = drag.current.width / n; // one full turn = drag across the whole image
    const delta = Math.round((drag.current.x - e.clientX) / step);
    setFrame((((drag.current.start + delta) % n) + n) % n);
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={alt}
      aria-valuemin={1}
      aria-valuemax={n}
      aria-valuenow={frame + 1}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setFrame((f) => (f - 1 + n) % n);
        if (e.key === "ArrowRight") setFrame((f) => (f + 1) % n);
      }}
      className="relative size-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={frames[frame]} alt="" draggable={false} className="size-full object-contain" />
      {hint && (
        <span className="absolute inset-x-0 bottom-2 text-center text-[12px] uppercase tracking-[0.14em] text-muted">↔ Tërhiq për ta rrotulluar</span>
      )}
    </div>
  );
}
