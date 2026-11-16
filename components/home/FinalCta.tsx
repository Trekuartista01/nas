"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SlashButton } from "@/components/ui/Buttons";

export default function FinalCta() {
  const ref = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 95%", "start 45%"] });
  const clipPath = useTransform(scrollYProgress, [0, 1], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);

  return (
    <section className="relative overflow-hidden bg-ink">
      <div
        aria-hidden
        className="stripes absolute -right-20 inset-y-0 hidden w-[48%] md:block"
        style={{ clipPath: "polygon(30% 0,100% 0,100% 100%,0 100%)" }}
      />
      <div className="container-moto relative py-36">
        <motion.h2 ref={ref} style={{ clipPath }} className="headline text-[clamp(52px,6.4vw,112px)] leading-[0.92]">
          YOUR NEXT
          <br />
          RIDE STARTS
          <br />
          <span className="italic">
            HERE<span className="text-red">.</span>
          </span>
        </motion.h2>
        <p className="mb-9 mt-7 text-[17px] text-muted-2">Gjej makinën që të lëviz.</p>
        <SlashButton href="/modelet">EKSPLORO MODELET →</SlashButton>
      </div>
    </section>
  );
}
