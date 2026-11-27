/**
 * One place for the homepage motion timings (NAS homepage brief, Nov 2026).
 * Feel: heavy and mechanical. Fast out, long ease into place; no bounce, no spin.
 * Tweak here; every homepage section reads these values.
 */
import { siteMedia } from "@/lib/supabase/config";
export const MOTION = {
  /** Default ease: fast out, long settle (≈ GSAP power3/expo.out). */
  ease: [0.2, 0.7, 0.1, 1] as [number, number, number, number],
  /** Section wipes (≈ power4.inOut). */
  wipe: [0.7, 0, 0.2, 1] as [number, number, number, number],
  /** Durations in seconds. */
  text: 1,
  image: 1.3,
  wipeDuration: 1.4,
  micro: 0.3,
  heroImage: 2.4,
  /** Stagger between heading lines / cards / form fields. */
  lineStagger: 0.12,
  cardStagger: 0.1,
  fieldStagger: 0.08,
  /** Rise distance for fade + rise reveals (px). */
  rise: 30,
  /** Share of an element that must be on screen before it reveals. */
  amount: 0.15,
  /** Range cards stagger in this far apart. */
  rangeStagger: 0.08,
  /** Smoothing on scroll-scrubbed motion (≈ ScrollTrigger scrub: 1): a stiff spring, no overshoot. */
  scrub: { stiffness: 140, damping: 32, mass: 0.6, restDelta: 0.0005 },
} as const;

/**
 * Footer reveal: it starts moving only in the last `start` px of the page (later = starts later) and
 * travels `max` px, settling at 0 at the very bottom. Was 741px (0.675 × scroll speed) before Nov 2026.
 */
export const FOOTER_REVEAL = { start: 560, max: 500 } as const;

/** Phones get half the parallax travel. */
export const MOBILE_PARALLAX = 0.5;

/**
 * Sport Line "lights behind the logo" (homepage #sport-line, components/nas/LogoBacklight.tsx).
 * The stages read one progress value from 0 to 1: scroll on screens ≥ 768px (pinned), a timed run
 * on phones, fixed at 1 with reduced motion. Timeline numbers are shares of that progress.
 * The light flash itself is time-based (ms), fired when progress crosses `timeline.lightsOn`.
 */
export const SPORT_BACKLIGHT = {
  /** Scroll while pinned, in screen heights (the wrapper is this + 1 screen tall). */
  pinScreens: 2,
  /** Phones: the same sequence played once, in seconds. */
  mobileDuration: 2.5,
  colors: {
    bg: "#0C0C0C",
    red: "#EA2028",
    redCore: "#FF4A4A",
    white: "#FFFFFF",
    /** Edge of the LED shapes (hard white core → this). */
    ledEdge: "#E6F0FF",
    /** Thin light rim around the dark (silhouette) wordmark. */
    rim: "rgba(244,248,255,.55)",
  },
  timeline: {
    /** 0–20%: white wordmark settles in. */
    settle: [0, 0.2] as const,
    logoScale: [0.96, 1] as const,
    /** 20–35%: the S turns red and the red tail glow fades in. */
    red: [0.2, 0.35] as const,
    tailGlow: 0.8,
    /** The lights fire here (flash below); scrolling back above it switches them off. */
    lightsOn: 0.42,
    /** The front "rolls closer" (scale) across this range. */
    approach: [0.42, 0.6] as const,
    approachScale: [0.92, 1] as const,
    /** On the final "on": the white N+A fade to this under the dark silhouette, which settles at `silhouette`
     *  (below 1 so the lights show faintly through the letters); the red S settles at dimS. */
    dimNA: 0,
    silhouette: 0.72,
    dimS: 0.55,
    /** 60–80%: caption rises, lights breathe (± breathe). */
    caption: [0.6, 0.8] as const,
    breathe: 0.02,
    /** 80–100%: hold, then the pin releases. */
  },
  /** The light flash, in ms: DRLs on, then the eyes double-flash and stay on. */
  flash: {
    drlIn: 80,
    on1: 60,
    off1: 70,
    on2: 60,
    off2: 90,
    /** Bloom opacity on each flash peak, and the white wash over the stage (desktop only). */
    bloomPeak: 0.9,
    wash: 0.08,
    washMs: 120,
    /** How long the logo takes to dim once the lights are on for good. */
    dimMs: 120,
    /** Steady state afterwards: a slow 1 → min → 1 shimmer, period in seconds. */
    shimmerMin: 0.95,
    shimmerPeriod: 3,
  },
  /**
   * The sportsbike front (LED eyes, DRL slashes, centre intake light), drawn in a 600 × 80 box.
   * `width`: share of the wordmark width (phones scale with the wordmark); `y`: its centre, as a share of
   * the wordmark height. Shapes: FACE in LogoBacklight.tsx.
   */
  face: { width: 0.5, y: 0.7 },
  /** Bloom copies behind the lights (blur in px at the full 1100px wordmark; scales with it). */
  bloom: { tight: { blur: 8, opacity: 0.6 }, wide: { blur: 24, opacity: 0.25 } },
  /** Use the darkened Sport Line front photo behind the lights (the CSS-only version is the default). */
  photo: false,
  photoSrc: siteMedia("/nas-images/web/sportline-front.webp"),
} as const;

/**
 * Scroll stopper on the Sport Line detail video (components/motion/useScrollStop.ts), ≥ 768px without
 * reduced motion. When the video comes in, the page glides so it fills the screen and holds; the next
 * scroll gesture goes past it. Works scrolling down and back up.
 */
export const SCROLL_STOP = {
  /** Start the stop once the video's leading edge is this far into the screen (share of its height). */
  enter: 0.7,
  /** Ignore the last few px (so an already-aligned video doesn't trigger again). */
  edge: 4,
  /** Glide into place, ms. */
  snapMs: 700,
  /** Minimum time the video stays put, ms. */
  holdMs: 500,
  /** Input must be quiet this long before the next gesture counts (swallows trackpad momentum), ms. */
  quietMs: 220,
  /** Wheel deltas below this don't count as "one more scroll". */
  minDelta: 4,
} as const;

/** Sport Line detail video pin (≥ 768px, replaces the scroll stop above; SportLine.tsx). */
export const SPORT_VIDEO_PIN = {
  /** How long the video stays pinned full screen, in screen heights of scrolling (svh). */
  holdVh: 100,
} as const;

/**
 * Sport Line logo → red S → flash → video (components/nas/LogoFlashVideo.tsx; replaced the "lights behind
 * the logo", Nov 2026). ≥ 768px without reduced motion: one sticky full-screen scene; scroll progress only
 * picks the step, each step then plays at a fixed speed (one wheel notch / swipe past a point is enough),
 * scrolling back reverses it.
 */
export const SPORT_FLASH = {
  /** Scroll while pinned, in screen heights (the wrapper is this + 1 screen tall). */
  pinScreens: 1.1,
  /** Trigger points on the pinned progress (0 → 1): the S turns red, then the flash into the video. */
  steps: { red: 0.12, video: 0.38 },
  /** S white → red, and the caption rising in, seconds. */
  redDuration: 0.45,
  /** The logo punching toward the camera as it goes: scale and duration (s). */
  punch: { scale: 1.25, duration: 0.18 },
  /** White flash over the scene: peak opacity, time to the peak and total (s). */
  flash: { opacity: 0.9, peak: 0.12, total: 0.26 },
  /** Video coming in at the flash peak: start scale → 1 over this many seconds. */
  videoIn: { scale: 1.08, duration: 0.9 },
  /** Going back from the video to the logo, seconds. */
  back: 0.25,
  /** Phones: the S turns red when the logo is in view, then the flash this many seconds later. */
  mobileDelay: 0.8,
  colors: { bg: "#0C0C0C", red: "#EA2028", redCore: "#FF4A4A", white: "#FFFFFF" },
} as const;
