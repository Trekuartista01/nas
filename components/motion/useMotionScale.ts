"use client";

import { useEffect, useState } from "react";
import { MOBILE_PARALLAX } from "@/lib/motion";

/** True below 768px (no pinning there). False during the server render. */
export function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

/** Multiplier for scroll-linked movement: 0 with reduced motion, ½ on phones, 1 otherwise. */
export function useParallaxScale() {
  const reduce = useReducedMotionSafe();
  const mobile = useIsMobile();
  return reduce ? 0 : mobile ? MOBILE_PARALLAX : 1;
}

/** Whether a media query matches (false during the server render). */
export function useMedia(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return match;
}

/** Desktop (≥ 1024px) without reduced motion: the screens where sections pin and scrub. */
export function usePinnable() {
  const reduce = useReducedMotionSafe();
  return useMedia("(min-width: 1024px)") && !reduce;
}

/**
 * prefers-reduced-motion, hydration-safe: false on the server AND on the first client render, then
 * the real value. (framer-motion's useReducedMotion reads it during the first render, so markup
 * that depends on it differs from the server HTML and React reports a hydration mismatch.)
 */
export function useReducedMotionSafe() {
  return useMedia("(prefers-reduced-motion: reduce)");
}
