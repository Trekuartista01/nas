/**
 * One place for the homepage motion timings (NAS homepage brief, Nov 2026).
 * Feel: heavy and mechanical. Fast out, long ease into place; no bounce, no spin.
 * Tweak here; every homepage section reads these values.
 */
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
