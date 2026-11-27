"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import T from "@/components/i18n/T";
import { useT } from "@/components/i18n/lang";
import { setNavClear } from "@/components/motion/navClear";
import { siteMedia } from "@/lib/supabase/config";

/**
 * Sport Line intro, "diagonal opens" (Nov 2026). Opens the Sport Line; the logo → video scene (SportLine.tsx) follows.
 * A pinned section (--sl-length, 200vh) with a sticky stage: a narrow slanted window onto the night shot widens to full bleed
 * (a red sliver riding its right edge), the outlined "SPORT / LINE." grows and fades, then the real heading
 * and the link rise in at the bottom.
 *
 * Motion is CSS only where the browser has scroll-driven animations (view-timeline --sl, app/globals.css
 * "Sport Line intro"). Elsewhere (Firefox) the effect below sets the same values through custom properties.
 * Reduced motion, or no support and no script: no pin, full image, final block shown.
 * Images: scripts/sport-night-images.mjs makes the AVIF/WebP/JPG widths below from
 * public/nas-images/sport-line-night.jpg.
 */
const WIDTHS = [960, 1280, 1672] as const;
const srcset = (ext: "avif" | "webp" | "jpg") =>
  WIDTHS.map((w) => `${siteMedia(`/nas-images/web/sport-line-night-${w}.${ext}`)} ${w}w`).join(", ");

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function SportIntro() {
  const ref = useRef<HTMLElement>(null);
  const t = useT();

  // Fallback for browsers without animation-timeline: the section's scroll progress drives
  // --sl-w (window + sliver), --sl-t (stacked title) and --sl-f (final block), same ranges as the CSS.
  useEffect(() => {
    const el = ref.current;
    if (!el || CSS.supports("animation-timeline: --sl")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.add("sl-js");
    let raf = 0;
    const update = () => {
      raf = 0;
      const { top, height } = el.getBoundingClientRect();
      const range = height - window.innerHeight;
      const p = range > 0 ? clamp01(-top / range) : 1;
      el.style.setProperty("--sl-w", String(clamp01(p / 0.8)));
      el.style.setProperty("--sl-t", String(clamp01(p / 0.7)));
      el.style.setProperty("--sl-f", String(clamp01((p - 0.72) / 0.24)));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      el.classList.remove("sl-js");
    };
  }, []);

  // Header transparent while the full-screen stage covers the viewport, so the whole photo shows
  // (data-nav-clear on <html>, read by Header; same as the logo → video scene).
  useEffect(() => {
    const el = ref.current;
    const stage = el?.querySelector<HTMLElement>(".sl-stage");
    if (!el || !stage) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const { top, bottom } = stage.getBoundingClientRect();
      setNavClear("sport-intro", top <= 1 && bottom >= window.innerHeight - 1);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
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

  return (
    <section ref={ref} id="sport" aria-labelledby="sport-title" className="sl">
      <div className="sl-stage">
        {/* 1. Image window */}
        <picture className="sl-window">
          <source type="image/avif" srcSet={srcset("avif")} sizes="100vw" />
          <source type="image/webp" srcSet={srcset("webp")} sizes="100vw" />
          <img
            src={siteMedia("/nas-images/web/sport-line-night-1280.jpg")}
            srcSet={srcset("jpg")}
            sizes="100vw"
            alt={t(
              "Motoristi me skuterin sportiv NAS në shpejtësi natën, mbi rrugë të lagur, me drita të kuqe që lënë gjurmë pas tij",
              "A rider on the NAS sport scooter at speed at night on a wet road, red light trails behind",
            )}
            loading="eager"
            decoding="async"
            className="sl-img"
          />
        </picture>

        {/* 2. Red sliver, 3. scrim */}
        <div aria-hidden className="sl-sliver" />
        <div aria-hidden className="sl-scrim" />
        {/* Soft shade at the top so the transparent header stays readable over the photo. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent" />

        {/* 4. Label */}
        <p className="sl-label absolute left-0 right-0 top-[clamp(100px,13vh,132px)]">
          <span className="container-moto block max-[760px]:!px-5">
            <T sq="LINJA E PERFORMANCËS" en="THE PERFORMANCE LINE" />
          </span>
        </p>

        {/* 5. Stacked title (decorative; the h2 below is the heading) */}
        <div aria-hidden className="sl-stack">
          <span className="sl-outline block">SPORT</span>
          <span className="block">
            LINE<span className="sl-red">.</span>
          </span>
        </div>

        {/* 6. Final block */}
        <div className="sl-final">
          <div className="container-moto max-[760px]:!px-5">
            <h2 id="sport-title" className="sl-title">
              SPORT LINE<span className="sl-red">.</span>
            </h2>
            <div className="sl-row">
              <p className="sl-copy">
                <T sq="Në Sport Line, e kuqja është sinjali i performancës." en="In the Sport Line, red is the signal of performance." />
              </p>
              <Link href="/sport-line" className="sl-link">
                <T sq="SHIKO SPORT LINE" en="VIEW SPORT LINE" />
                <span aria-hidden className="sl-arrow">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
