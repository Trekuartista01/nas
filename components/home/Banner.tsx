"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { SlashButton } from "@/components/ui/Buttons";
import { heroVideo } from "@/data/home";

const EASE = [0.2, 0.8, 0.2, 1] as const;

interface BannerProps {
  /** Video grade. The design used mono; the client asked for full colour. */
  grade?: "mono" | "color";
}


export default function Banner({ grade = "color" }: BannerProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [slide, setSlide] = useState(0);
  const slides = heroVideo.slides;

  // Keep the active progress bar in sync with the shot that is on screen.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    el.muted = true;
    el.play().catch(() => {});
    let raf = 0;
    const tick = () => {
      const t = el.currentTime;
      let i = 0;
      for (let k = 0; k < slides.length; k++) if (t >= slides[k].start) i = k;
      setSlide((prev) => (prev === i ? prev : i));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [slides]);

  const goTo = useCallback(
    (i: number) => {
      const el = video.current;
      if (!el) return;
      el.currentTime = slides[i].start + 0.02;
      el.play().catch(() => {});
    },
    [slides],
  );

  const shotLength = (i: number) => (slides[i + 1]?.start ?? heroVideo.duration) - slides[i].start;

  return (
    <section id="top" className="relative flex min-h-[min(820px,100svh)] items-end overflow-hidden md:min-h-[820px]">
      <video
        ref={video}
        src={heroVideo.src}
        poster={heroVideo.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 size-full object-cover transition-[filter] duration-600"
        style={{
          filter: grade === "mono" ? "grayscale(1) contrast(1.15) brightness(.75)" : "saturate(1.05) brightness(.92)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(10,10,10,.6) 0%, rgba(10,10,10,.15) 45%, transparent 100%), linear-gradient(0deg, rgba(10,10,10,.85) 0%, transparent 35%)",
        }}
      />

      <div className="container-moto relative flex flex-wrap items-end justify-between gap-10 pb-16">
        <div>
          <h1 className="wide text-[clamp(28px,3.1vw,46px)] font-black leading-none tracking-[-0.01em]">
            {["BORN TO ROAR", "BUILT FOR THE ROAD"].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.04em]">
                <motion.span
                  className="inline-block"
                  initial={{ y: "105%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, ease: EASE, delay: 0.15 + i * 0.15 }}
                >
                  {line}
                  <span className="text-red">.</span>
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
            className="mt-3 text-[clamp(13px,1vw,15px)] leading-[1.35] text-muted-2"
          >
            From city streets to untamed terrain.
            <br />
            Find your next ride at Moto Shpati.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
            className="mt-7"
          >
            <SlashButton href="/modelet" slashes>
              EKSPLORO MODELET
            </SlashButton>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
          role="group"
          aria-label="Slajdet"
          className="mb-3 flex gap-2.5"
        >
          {slides.map((s, i) => {
            const active = i === slide;
            return (
              <button
                key={s.start}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Slajdi ${i + 1}: ${s.label}`}
                aria-current={active}
                className={`relative h-[3px] w-14 before:absolute before:-inset-x-1 before:-inset-y-5 before:content-[''] ${
                  active ? "bg-red/35" : "bg-white/35 hover:bg-white/70"
                }`}
              >
                {active && (
                  <i
                    key={`${i}-${slide}`}
                    className="bar-fill absolute inset-0 block origin-left bg-red"
                    style={{ animationDuration: `${shotLength(i).toFixed(2)}s` }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
