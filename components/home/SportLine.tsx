"use client";

import LogoFlashVideo from "@/components/nas/LogoFlashVideo";

/**
 * SPORT LINE, after the intro (SportLineIntro.tsx). From 768px (motion on) it is pulled up 100vh under the intro,
 * so the pinned logo screen is already in place when the intro ends and the logo pops in there (no empty screen).
 * Logo → video (components/nas/LogoFlashVideo.tsx): the white wordmark on black; one scroll turns the
 * S red (caption rises), the next makes the logo punch out in a white flash and the detail video
 * (public/videos/sport-line.mp4) takes the screen. Pinned on ≥ 768px (SPORT_FLASH in lib/motion.ts),
 * timed on phones, static with reduced motion. (Replaced "lights behind the logo", Nov 2026.)
 * The pedestal shot that opened this section was removed (Nov 2026; the night shot in SportIntro replaced
 * it; the photo stays in data/nas-home.ts). The models block with "Explore Sport Line" went earlier.
 */
export default function SportLine() {
  return (
    <section id="sport-line" aria-label="Sport Line" className="relative scroll-mt-20 bg-ink md:motion-safe:-mt-[100vh]">
      <div className="pb-[clamp(70px,8vw,110px)]">
        <LogoFlashVideo caption={RED_S_LINE} />
      </div>
    </section>
  );
}

/** Big caption under the logo: a heading, so English in both languages. */
const RED_S_LINE = "In the Sport Line, red is the signal of performance.";
