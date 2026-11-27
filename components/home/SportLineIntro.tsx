"use client";

import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { preload } from "react-dom";
import { useT } from "@/components/i18n/lang";
import { setNavClear } from "@/components/motion/navClear";
import { useMedia, useReducedMotionSafe } from "@/components/motion/useMotionScale";
import { siteMedia } from "@/lib/supabase/config";

/**
 * Sport Line intro on the homepage (Nov 2026 brief; replaced the "diagonal opens" SportIntro.tsx, kept unused).
 * A 240vh section with a sticky 100vh stage: "SPORT" (behind) and outlined "LINE." (in front) around a centre
 * image built from 9 vertical strips, five photo tiles around it, a red glow from the top (no scroll cue, removed Nov 2026). Scrolling pushes the
 * words out sideways, flies the tiles off, peels the strips away one by one and shrinks the glow, so the
 * screen is black when the section ends and the logo → video scene (SportLine) comes in.
 *   p = progress × 0.68 (the timeline below runs 0 → 0.68), easeInOutCubic; transform + opacity only.
 *   < 820px: no side tiles, centre image 72vw. Reduced motion: the first frame, 100vh, no pin.
 * Images (scripts/sport-intro-images.mjs): the rider crop and the helmet; headlight / glove / wheel are CSS
 * crops of the full night shot; the bottom-left tile is the Lifestyle photo.
 * The header goes transparent while the stage covers the screen (setNavClear).
 *
 * Hand-off to the logo scene (≥ 768px, motion on): SportLine is pulled up 100vh under this section
 * (`md:motion-safe:-mt-[100vh]`), so its pinned logo screen is already in place below this stage when the
 * timeline ends. At progress 1 this stage hides and the logo pops in (LogoFlashVideo `pop`); scrolling back
 * shows the stage again. No empty black screen between the two.
 */
const RED = "#E30613";
const RIDER = siteMedia("/nas-images/web/sport-intro-rider.webp");
const NIGHT = siteMedia("/nas-images/web/sport-line-night-1280.webp");
const HELMET = siteMedia("/nas-images/web/sport-intro-helmet.webp");
const LIFESTYLE = siteMedia("/nas-images/web/lifestyle-tank.webp");

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const seg = (p: number, a: number, b: number) => ease(clamp01((p - a) / (b - a)));

/** Background positions that make the 9 strips one continuous image (background-size 1080% 100%). */
const STRIP_X = ["9.18%", "19.39%", "29.59%", "39.80%", "50%", "60.20%", "70.41%", "80.61%", "90.82%"];
/** The first three strips are "motion blurred". */
const STRIP_FX: { filter?: string; base: number }[] = [
  { filter: "blur(3px) brightness(.45)", base: -18 },
  { filter: "blur(2px) brightness(.55)", base: 10 },
  { filter: "blur(1px) brightness(.7)", base: -6 },
];

type Tile = {
  key: string;
  box: CSSProperties;
  fly: { dx: number; dy: number; rot: number; a: number; b: number };
  look: CSSProperties;
  img?: string;
  tab?: boolean;
};
const bordered: CSSProperties = { border: "1px solid rgba(255,255,255,.14)" };
const TILES: Tile[] = [
  {
    key: "helmet",
    box: { right: "5.5%", top: "9%", width: "14%", aspectRatio: "3/4" },
    fly: { dx: 18, dy: -40, rot: 6, a: 0.05, b: 0.45 },
    look: { ...bordered, filter: "grayscale(1) brightness(.8)" },
    img: HELMET,
  },
  {
    key: "headlight",
    box: { right: "21%", top: "39%", width: "11%", aspectRatio: "4/3" },
    fly: { dx: 25, dy: -12, rot: -4, a: 0.1, b: 0.5 },
    look: { outline: `2px solid ${RED}`, outlineOffset: 8, background: `url(${NIGHT}) no-repeat 42.2% 40.9% / 380% 285.2%` },
  },
  {
    key: "glove",
    box: { right: "5.5%", bottom: "6%", width: "11%", aspectRatio: "255/220" },
    fly: { dx: 20, dy: 40, rot: 5, a: 0.08, b: 0.5 },
    look: { ...bordered, filter: "grayscale(1)", background: `url(${NIGHT}) no-repeat 65.6% 25.9% / 506.7% 330.2%` },
  },
  {
    key: "detail",
    box: { left: "5.5%", bottom: "10%", width: "14%", aspectRatio: "3/4" },
    fly: { dx: -20, dy: 40, rot: -6, a: 0.05, b: 0.45 },
    look: { ...bordered, filter: "grayscale(1) brightness(.85)" },
    img: LIFESTYLE,
  },
  {
    key: "wheel",
    box: { left: "21%", top: "46%", width: "11.5%", aspectRatio: "16/17" },
    fly: { dx: -25, dy: 10, rot: 4, a: 0.1, b: 0.5 },
    look: { background: `url(${NIGHT}) no-repeat 29.4% 93.1% / 440% 232.9%` },
    tab: true,
  },
];

export default function SportLineIntro() {
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const t = useT();
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scrolled = useTransform(scrollYProgress, (v) => v * 0.68);
  const still = useMotionValue(0);
  const p = reduce ? still : scrolled;
  const wide = useMedia("(min-width: 768px)");
  const handoff = wide && !reduce;
  const [done, setDone] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => setDone(v >= 0.999));
  const hidden = handoff && done;
  const hiddenRef = useRef(hidden);
  const recheck = useRef<() => void>(undefined);
  useEffect(() => {
    hiddenRef.current = hidden;
    // Re-check the header now: the scroll that flipped `hidden` was handled before this render.
    recheck.current?.();
  }, [hidden]);

  preload(RIDER, { as: "image" });

  const fadeTop = useTransform(p, (v) => 1 - seg(v, 0, 0.08)); // eyebrow
  const words = useTransform(p, (v) => seg(v, 0.05, 0.5));
  const sportX = useTransform(words, (e) => `${-60 * e}vw`);
  const lineX = useTransform(words, (e) => `${60 * e}vw`);
  const wordsOpacity = useTransform(words, (e) => 1 - 0.8 * e);
  const shadow = useTransform(p, (v) => 1 - seg(v, 0.15, 0.4));
  const glowT = useTransform(p, (v) => seg(v, 0.3, 0.68));
  const glow = useTransform(glowT, (e) => 1 - 0.6 * e);
  // Also fades (to .12): scaled alone it shrinks to a red blob mid-screen instead of leaving the screen black.
  const glowOpacity = useTransform(glowT, (e) => 1 - 0.88 * e);

  // Transparent header while the stage fills the screen.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const { top, bottom } = el.getBoundingClientRect();
      setNavClear("sport-intro", !hiddenRef.current && top <= 1 && bottom >= window.innerHeight - 1);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    recheck.current = update;
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      setNavClear("sport-intro", false);
    };
  }, []);

  const word = "absolute whitespace-nowrap text-[clamp(84px,16.5vw,250px)] font-extrabold uppercase leading-[.85] tracking-[-0.02em]";

  return (
    <section ref={ref} id="sport" aria-labelledby="sport-title" className={`relative z-[1] ${reduce ? "bg-[#070707]" : "h-[240vh]"}`}>
      <div
        ref={stage}
        style={{ visibility: hidden ? "hidden" : undefined }}
        className={`top-0 h-screen min-h-[600px] overflow-hidden bg-[#070707] ${reduce ? "relative" : "sticky"}`}
      >
        {/* Red glow from the top centre, and the floor reflection. */}
        <motion.div
          aria-hidden
          style={{ scale: glow, opacity: glowOpacity, transformOrigin: "50% 80%" }}
          className="pointer-events-none absolute left-[-5%] top-[-38%] h-[95%] w-[110%] bg-[radial-gradient(ellipse_at_center,#C4000F_0%,rgba(120,0,8,.4)_36%,transparent_70%)]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-[linear-gradient(0deg,rgba(227,6,19,.12),transparent)]" />

        {/* Eyebrow (below the header bar, which sits over this stage). */}
        <motion.p
          aria-hidden
          style={{ opacity: fadeTop }}
          className="absolute left-[4.5%] top-[clamp(96px,12vh,112px)] z-[4] flex items-center gap-4 text-[12px] font-bold tracking-[.3em] text-white"
        >
          <span className="block h-[2px] w-9" style={{ background: RED }} />
          NAS — THE PERFORMANCE LINE
        </motion.p>

        {/* The heading: "SPORT" behind the centre image, "LINE." in front of it. */}
        <h2 id="sport-title" aria-label="Sport Line" className="m-0">
          <motion.span
            aria-hidden
            style={{ x: sportX, opacity: wordsOpacity }}
            className={`${word} left-[4.5%] top-[max(13%,140px)] z-[1] text-white`}
          >
            SPORT
          </motion.span>
          <motion.span
            aria-hidden
            style={{ x: lineX, opacity: wordsOpacity, WebkitTextStroke: `2px ${RED}` }}
            className={`${word} bottom-[13%] right-[4.5%] z-[3] text-transparent`}
          >
            LINE<span style={{ color: RED }}>.</span>
          </motion.span>
        </h2>

        {/* Five photo tiles (desktop only). */}
        {TILES.map((tile) => (
          <FlyTile key={tile.key} tile={tile} p={p} />
        ))}

        {/* Centre image: 9 strips that together form one picture, peeled away one after another. */}
        <div
          role="img"
          aria-label={t("Motoristi me NAS ADV 125 në shpejtësi natën", "Rider on a NAS ADV 125 at speed at night")}
          className="absolute left-1/2 top-1/2 z-[2] aspect-[540/620] w-[min(34vw,500px)] -translate-x-1/2 -translate-y-[47%] max-[819px]:w-[72vw]"
        >
          <motion.div aria-hidden style={{ opacity: shadow }} className="absolute inset-0 shadow-[0_50px_140px_rgba(227,6,19,.4)]" />
          <div aria-hidden className="relative flex size-full">
            {STRIP_X.map((x, i) => (
              <Strip key={x} i={i} x={x} p={p} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

function Strip({ i, x, p }: { i: number; x: string; p: MotionValue<number> }) {
  const fx = STRIP_FX[i];
  const base = fx?.base ?? 0;
  const dir = i % 2 === 0 ? -1 : 1;
  const tt = useTransform(p, (v) => seg(v, 0.15 + i * 0.025, 0.45 + i * 0.025));
  const transform = useTransform(tt, (e) => `translateY(calc(${base}px + ${dir * e * 120}%))`);
  const opacity = useTransform(tt, (e) => 1 - e);
  return (
    <motion.div
      style={{
        transform,
        opacity,
        filter: fx?.filter,
        backgroundImage: `url(${RIDER})`,
        backgroundSize: "1080% 100%",
        backgroundPosition: `${x} 50%`,
      }}
      className="h-full flex-1"
    />
  );
}

function FlyTile({ tile, p }: { tile: Tile; p: MotionValue<number> }) {
  const { dx, dy, rot, a, b } = tile.fly;
  const e = useTransform(p, (v) => seg(v, a, b));
  const transform = useTransform(e, (k) => `translate(${dx * k}vw, ${dy * k}vh) scale(${1 - 0.2 * k}) rotate(${rot * k}deg)`);
  const opacity = useTransform(e, (k) => 1 - k);
  return (
    <motion.div aria-hidden style={{ ...tile.box, transform, opacity }} className="absolute z-[1] max-[819px]:hidden">
      <div className="relative size-full overflow-hidden" style={tile.look}>
        {tile.img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tile.img} alt="" loading="lazy" sizes="15vw" className="size-full object-cover" />
        )}
        {tile.tab && <span className="absolute left-0 top-0 block h-1 w-7" style={{ background: RED }} />}
      </div>
    </motion.div>
  );
}
