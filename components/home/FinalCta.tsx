"use client";

import { useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import WipeLine from "@/components/motion/WipeLine";
import { SlashButton } from "@/components/ui/Buttons";
import Reveal from "@/components/ui/Reveal";

/** The headline steps down in size: first line biggest, then middle, then smallest. */
const LINES: { text: React.ReactNode; size: string; range: [number, number] }[] = [
  { text: "YOUR NEXT", size: "text-[clamp(56px,8.6vw,156px)]", range: [0, 0.6] },
  { text: "RIDE STARTS", size: "text-[clamp(40px,6vw,108px)]", range: [0.15, 0.8] },
  {
    text: (
      <span className="italic">
        HERE<span className="text-red">.</span>
      </span>
    ),
    size: "text-[clamp(30px,4vw,72px)]",
    range: [0.3, 1],
  },
];

export default function FinalCta() {
  const ref = useRef<HTMLHeadingElement>(null);
  // Short scroll range + stiff spring = a quick wipe that still never jumps with the wheel steps.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 92%", "start 62%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 30, mass: 0.4, restDelta: 0.0005 });

  return (
    <section className="relative overflow-hidden bg-ink">
      <div aria-hidden className="stripes-lg absolute inset-y-0 left-[50%] right-0 hidden lg:block" />
      <div className="container-moto relative py-36">
        <h2 ref={ref} className="headline leading-[0.92]">
          {LINES.map((line, i) => (
            <WipeLine key={i} progress={progress} range={line.range} className={line.size}>
              {line.text}
            </WipeLine>
          ))}
        </h2>
        <Reveal delay={0.05}>
          <p className="mb-9 mt-7 text-[17px] text-muted-2">Gjej makinën që të lëviz.</p>
        </Reveal>
        <Reveal delay={0.12}>
          <SlashButton href="/modelet">EKSPLORO MODELET →</SlashButton>
        </Reveal>
      </div>
    </section>
  );
}
