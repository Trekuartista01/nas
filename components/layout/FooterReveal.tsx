"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { FOOTER_REVEAL } from "@/lib/motion";

/**
 * The site footer, revealed from behind the page: <main> sits above it (z-2, solid background)
 * and the footer is pulled up by 500px; it only starts moving in the last 560px of the page
 * (FOOTER_REVEAL in lib/motion.ts) and settles at exactly 0 at the very bottom. Transform only (GPU), throttled to one update per frame; re-runs
 * on resize and whenever the page height changes (route changes, images loading).
 * Reduced motion: no offset.
 *
 * It also publishes the reveal progress (0 → 1) once per frame, so nothing else needs a scroll
 * listener: the CSS variable `--footer-reveal` on <html> (chrome wordmark crossfade, chrome edge
 * glint), and `data-settled` on the footer once it reaches 0 (one final glint on the wordmark).
 * Reduced motion: progress is 1 (static chrome).
 */
export default function FooterReveal({ id, className = "", children }: { id?: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = ref.current;
    if (!footer) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const dist = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      const y = reduce.matches ? 0 : -FOOTER_REVEAL.max * Math.min(1, Math.max(0, dist) / FOOTER_REVEAL.start);
      footer.style.transform = y ? `translateY(${y}px)` : "none";
      const progress = reduce.matches ? 1 : 1 - Math.min(1, Math.max(0, dist) / FOOTER_REVEAL.start);
      document.documentElement.style.setProperty("--footer-reveal", progress.toFixed(4));
      if (progress >= 0.999) footer.dataset.settled = "true";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    reduce.addEventListener("change", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
      reduce.removeEventListener("change", schedule);
      ro.disconnect();
      document.documentElement.style.removeProperty("--footer-reveal");
    };
  }, []);

  return (
    <footer ref={ref} id={id} className={`relative z-[1] will-change-transform ${className}`}>
      {children}
    </footer>
  );
}
