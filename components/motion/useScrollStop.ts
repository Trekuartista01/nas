"use client";

import { type RefObject, useEffect } from "react";
import { SCROLL_STOP } from "@/lib/motion";

type Phase = "idle" | "snapping" | "holding" | "armed";

const KEYS = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Space", "Home", "End"]);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Scroll stopper: when a full-screen element comes into view, the page glides so the element fills the
 * screen and holds there. Scrolling (wheel, trackpad, touch or keys) is swallowed until the gesture that
 * brought you there has died out (trackpad momentum included); the next gesture scrolls on normally.
 * Works in both directions. Settings: SCROLL_STOP in lib/motion.ts. Pass `enabled: false` to switch it off
 * (phones, reduced motion).
 */
export function useScrollStop(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let phase: Phase = "idle";
    let lastY = window.scrollY;
    let lastInput = 0; // time of the last swallowed wheel/touch event
    let holdUntil = 0;
    let raf = 0;
    let armTimer = 0;

    /** Glide (own rAF, so the CSS `scroll-behavior: smooth` can't stretch it) to the element's top. */
    const snap = () => {
      phase = "snapping";
      const from = window.scrollY;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / SCROLL_STOP.snapMs);
        // Target read every frame: late layout above (images, pinned sections) can move it mid-glide.
        const to = window.scrollY + el.getBoundingClientRect().top;
        window.scrollTo({ top: from + (to - from) * easeInOut(t), behavior: "instant" });
        if (t < 1) raf = requestAnimationFrame(step);
        else hold();
      };
      raf = requestAnimationFrame(step);
    };

    const hold = () => {
      phase = "holding";
      lastY = window.scrollY;
      holdUntil = performance.now() + SCROLL_STOP.holdMs;
      tryArm();
    };

    /** Arm once the minimum hold is over AND no input has arrived for `quietMs` (momentum has stopped). */
    const tryArm = () => {
      window.clearTimeout(armTimer);
      const now = performance.now();
      const wait = Math.max(holdUntil - now, lastInput + SCROLL_STOP.quietMs - now);
      if (wait <= 0) phase = "armed";
      else armTimer = window.setTimeout(tryArm, wait);
    };

    const release = () => {
      phase = "idle";
      lastY = window.scrollY;
    };

    /** Swallow input while snapping/holding; the first input once armed is let through and releases. */
    const gate = (e: Event) => {
      if (phase === "idle") return;
      if (phase === "armed") return release();
      e.preventDefault();
      lastInput = performance.now();
      if (phase === "holding") tryArm();
    };
    const onWheel = (e: WheelEvent) => {
      if (phase === "armed" && Math.abs(e.deltaY) < SCROLL_STOP.minDelta) return e.preventDefault();
      gate(e);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!KEYS.has(e.code)) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable]")) return;
      gate(e);
    };
    const onTouchStart = () => {
      if (phase === "armed") release();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (phase === "snapping" || phase === "holding") {
        e.preventDefault();
        lastInput = performance.now();
        if (phase === "holding") tryArm();
      }
    };

    /** Start a stop when the element is entering in the direction of travel. */
    const onScroll = () => {
      const y = window.scrollY;
      const dir = Math.sign(y - lastY);
      lastY = y;
      if (phase !== "idle" || dir === 0) return;
      const vh = window.innerHeight;
      const { top, bottom } = el.getBoundingClientRect();
      const e = SCROLL_STOP.edge;
      if (dir > 0 && top > e && top < vh * SCROLL_STOP.enter) snap();
      else if (dir < 0 && bottom < vh - e && bottom > vh * (1 - SCROLL_STOP.enter)) snap();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(armTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [ref, enabled]);
}
